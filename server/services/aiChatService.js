const { createAiResponse } = require('../helpers/aiResponse');
const { AI_SYSTEM_PROMPT, buildAiUserPrompt } = require('./aiPrompts');
const {
  INTENTS,
  detectIntent,
  extractSearchFilters,
  detectPolicyTopic,
} = require('./aiIntentService');
const { searchProducts, compareProducts, resolveComparisonProductIds } = require('./productService');
const { getPolicyByTopic, getAllPolicies } = require('./policyService');
const { getOrdersByUserId } = require('./orderService');

const DEFAULT_OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-5-mini';

function buildAction(type, label, payload = {}) {
  return { type, label, payload };
}

async function generateAiReply({ intent, message, payload }) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not configured');
  }

  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || DEFAULT_OPENAI_MODEL,
      instructions: AI_SYSTEM_PROMPT,
      input: buildAiUserPrompt({ intent, message, payload }),
      text: {
        format: {
          type: 'text',
        },
      },
    }),
  });

  const body = await response.json();

  if (!response.ok) {
    const errorMessage = body.error?.message || 'OpenAI request failed';
    throw new Error(errorMessage);
  }

  if (body.output_text) {
    return body.output_text;
  }

  const textParts = (body.output || [])
    .flatMap((item) => item.content || [])
    .filter((item) => item.type === 'output_text')
    .map((item) => item.text)
    .filter(Boolean);

  return textParts.join('\n').trim() || 'I found the relevant information, but could not format a full response.';
}

function buildFallbackReply(intent, payload) {
  switch (intent) {
    case INTENTS.SEARCH_PRODUCTS:
      if (payload.products.length === 0) {
        return 'I could not find matching products based on the current filters. Please try a different keyword, brand, category, or price range.';
      }

      return `I found ${payload.products.length} matching products. Here are the top results based on your request.`;
    case INTENTS.COMPARE_PRODUCTS:
      if (payload.comparison && payload.comparison.items.length > 0) {
        return 'Here is a structured comparison of the products you asked about.';
      }

      return 'I could not find enough products to compare. Please mention product IDs or more specific product names.';
    case INTENTS.ANSWER_POLICY_QUESTION:
      if (payload.policy) {
        return `${payload.policy.title}: ${payload.policy.summary}`;
      }

      return 'I could not match your question to a known policy yet. Please ask about returns, shipping, or payment.';
    case INTENTS.CHECK_ORDER_STATUS:
      if (payload.requiresUserId) {
        return 'I can help check order status, but I need your userId first.';
      }

      if (payload.orders && payload.orders.length > 0) {
        return `I found ${payload.orders.length} orders for this user and summarized the latest status information below.`;
      }

      return 'I could not find any orders for this user.';
    default:
      return 'I can help with product search, product comparison, policy questions, and order status checks.';
  }
}

async function safeGenerateReply({ intent, message, payload }) {
  try {
    return await generateAiReply({ intent, message, payload });
  } catch (error) {
    return buildFallbackReply(intent, payload);
  }
}

async function handleSearchProducts(message) {
  const filters = extractSearchFilters(message);
  const result = await searchProducts(filters);
  const topProducts = result.items.slice(0, 5);
  const payload = {
    message,
    filters: result.filters,
    total: result.total,
    products: topProducts.map((product) => ({
      productId: product.productId,
      name: product.name,
      brand: product.brand,
      category: product.category,
      price: product.price,
      stock: product.stock,
      description: product.description,
      specifications: product.specifications || {},
      imageUrl: product.imageUrl || null,
    })),
  };

  const reply = await safeGenerateReply({
    intent: INTENTS.SEARCH_PRODUCTS,
    message,
    payload,
  });

  return createAiResponse({
    reply,
    intent: INTENTS.SEARCH_PRODUCTS,
    products: payload.products,
    actions: topProducts.map((product) => buildAction('view_product', 'View product', { productId: product.productId })),
    sources: ['products'],
    context: {
      filters: result.filters,
      totalMatches: result.total,
      returnedCount: payload.products.length,
    },
    meta: {
      usedModel: process.env.OPENAI_MODEL || DEFAULT_OPENAI_MODEL,
    },
  });
}

async function handleCompareProducts(message) {
  const productIds = await resolveComparisonProductIds(message);
  const comparison = await compareProducts(productIds);
  const payload = {
    message,
    comparison,
  };

  const reply = await safeGenerateReply({
    intent: INTENTS.COMPARE_PRODUCTS,
    message,
    payload,
  });

  return createAiResponse({
    reply,
    intent: INTENTS.COMPARE_PRODUCTS,
    comparison,
    products: comparison.items,
    actions: comparison.items.map((product) => buildAction('view_product', 'View product', { productId: product.productId })),
    sources: ['products'],
    context: {
      requestedProductIds: comparison.requestedProductIds,
      missingProductIds: comparison.missingProductIds,
      foundCount: comparison.totalCompared,
    },
    meta: {
      usedModel: process.env.OPENAI_MODEL || DEFAULT_OPENAI_MODEL,
    },
  });
}

async function handlePolicyQuestion(message) {
  const topic = detectPolicyTopic(message);
  const policy = topic ? getPolicyByTopic(topic) : null;
  const payload = {
    message,
    availableTopics: getAllPolicies().map((item) => item.topic),
    policy,
  };

  const reply = await safeGenerateReply({
    intent: INTENTS.ANSWER_POLICY_QUESTION,
    message,
    payload,
  });

  return createAiResponse({
    reply,
    intent: INTENTS.ANSWER_POLICY_QUESTION,
    actions: policy ? [buildAction('open_policy', 'Open policy', { topic: policy.topic })] : [],
    sources: policy ? ['policies'] : [],
    context: {
      topic: policy?.topic || null,
      found: Boolean(policy),
      availableTopics: payload.availableTopics,
    },
    meta: {
      usedModel: process.env.OPENAI_MODEL || DEFAULT_OPENAI_MODEL,
    },
  });
}

async function handleOrderStatus(message, userId) {
  if (userId === undefined || userId === null || userId === '') {
    return createAiResponse({
      reply: 'I can help check order status, but I need your userId first.',
      intent: INTENTS.CHECK_ORDER_STATUS,
      actions: [buildAction('provide_user_id', 'Provide userId')],
      context: {
        requiresUserId: true,
      },
      meta: {
        usedModel: null,
      },
    });
  }

  const orders = await getOrdersByUserId(userId);
  const summarizedOrders = orders.slice(0, 5).map((order) => ({
    orderId: order.orderId,
    status: order.status,
    statusCode: order.statusCode,
    totalAmount: order.totalAmount,
    timestamp: order.timestamp,
    itemCount: Array.isArray(order.items) ? order.items.length : 0,
  }));
  const payload = {
    message,
    userId: Number(userId),
    orderCount: orders.length,
    orders: summarizedOrders,
  };
  const reply = await safeGenerateReply({
    intent: INTENTS.CHECK_ORDER_STATUS,
    message,
    payload,
  });

  return createAiResponse({
    reply,
    intent: INTENTS.CHECK_ORDER_STATUS,
    actions: summarizedOrders.map((order) => buildAction('view_order', 'View order', { orderId: order.orderId })),
    sources: ['orders'],
    context: {
      userId: Number(userId),
      orderCount: orders.length,
    },
    meta: {
      usedModel: process.env.OPENAI_MODEL || DEFAULT_OPENAI_MODEL,
    },
  });
}

async function handleFallback(message) {
  const payload = {
    message,
    supportedIntents: Object.values(INTENTS),
  };
  const reply = await safeGenerateReply({
    intent: INTENTS.FALLBACK,
    message,
    payload,
  });

  return createAiResponse({
    reply,
    intent: INTENTS.FALLBACK,
    context: {
      supportedIntents: payload.supportedIntents,
    },
    meta: {
      usedModel: process.env.OPENAI_MODEL || DEFAULT_OPENAI_MODEL,
    },
  });
}

async function handleAiChat({ message, userId, conversationId }) {
  const normalizedMessage = typeof message === 'string' ? message.trim() : '';

  if (!normalizedMessage) {
    return createAiResponse({
      success: false,
      error: {
        code: 'INVALID_MESSAGE',
        message: 'message is required',
      },
      context: {
        conversationId: conversationId || null,
      },
      meta: {
        usedModel: null,
      },
    });
  }

  const intent = detectIntent(normalizedMessage);

  try {
    switch (intent) {
      case INTENTS.SEARCH_PRODUCTS:
        return await handleSearchProducts(normalizedMessage);
      case INTENTS.COMPARE_PRODUCTS:
        return await handleCompareProducts(normalizedMessage);
      case INTENTS.ANSWER_POLICY_QUESTION:
        return await handlePolicyQuestion(normalizedMessage);
      case INTENTS.CHECK_ORDER_STATUS:
        return await handleOrderStatus(normalizedMessage, userId);
      default:
        return await handleFallback(normalizedMessage);
    }
  } catch (error) {
    return createAiResponse({
      success: false,
      reply: null,
      intent,
      error: {
        code: 'AI_CHAT_FAILED',
        message: error.message || 'AI chat request failed',
      },
      context: {
        conversationId: conversationId || null,
      },
      meta: {
        usedModel: process.env.OPENAI_MODEL || DEFAULT_OPENAI_MODEL,
      },
    });
  }
}

module.exports = {
  handleAiChat,
};
