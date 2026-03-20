const { getAllPolicies } = require('./policyService');

const INTENTS = Object.freeze({
  SEARCH_PRODUCTS: 'search_products',
  COMPARE_PRODUCTS: 'compare_products',
  ANSWER_POLICY_QUESTION: 'answer_policy_question',
  CHECK_ORDER_STATUS: 'check_order_status',
  FALLBACK: 'fallback',
});

const KNOWN_BRANDS = ['Dell', 'HP', 'Apple', 'Lenovo', 'Acer', 'Asus', 'Samsung', 'Logitech'];
const KNOWN_CATEGORIES = ['laptops', 'desktops', 'monitors', 'accessories'];

function extractPriceRange(message) {
  const text = message.toLowerCase();
  let minPrice;
  let maxPrice;

  const underMatch = text.match(/(?:under|below|less than|max(?:imum)?(?: price)?)[^\d]*(\d+(?:\.\d+)?)/i);
  const overMatch = text.match(/(?:over|above|more than|min(?:imum)?(?: price)?)[^\d]*(\d+(?:\.\d+)?)/i);
  const betweenMatch = text.match(/between[^\d]*(\d+(?:\.\d+)?)[^\d]+(\d+(?:\.\d+)?)/i);

  if (betweenMatch) {
    minPrice = Number(betweenMatch[1]);
    maxPrice = Number(betweenMatch[2]);
  } else {
    if (underMatch) {
      maxPrice = Number(underMatch[1]);
    }

    if (overMatch) {
      minPrice = Number(overMatch[1]);
    }
  }

  return {
    minPrice: Number.isNaN(minPrice) ? undefined : minPrice,
    maxPrice: Number.isNaN(maxPrice) ? undefined : maxPrice,
  };
}

function extractKnownValue(message, values) {
  const lowerMessage = message.toLowerCase();
  return values.find((value) => lowerMessage.includes(value.toLowerCase())) || null;
}

function extractKeyword(message, brand, category) {
  let cleaned = message
    .replace(/compare|versus|vs\.?|show|find|search|looking for|looking|need|want|products?|items?|policy|policies|return|shipping|payment|order|status|check|tell me|what is|what's/gi, ' ')
    .replace(/under[^\d]*\d+(?:\.\d+)?/gi, ' ')
    .replace(/below[^\d]*\d+(?:\.\d+)?/gi, ' ')
    .replace(/over[^\d]*\d+(?:\.\d+)?/gi, ' ')
    .replace(/above[^\d]*\d+(?:\.\d+)?/gi, ' ')
    .replace(/between[^\d]*\d+(?:\.\d+)?[^\d]+\d+(?:\.\d+)?/gi, ' ')
    .replace(/\b(a|an|the|my)\b/gi, ' ');

  if (brand) {
    const brandRegex = new RegExp(brand, 'ig');
    cleaned = cleaned.replace(brandRegex, ' ');
  }

  if (category) {
    const categoryRegex = new RegExp(category, 'ig');
    cleaned = cleaned.replace(categoryRegex, ' ');
  }

  cleaned = cleaned
    .replace(/\s+/g, ' ')
    .trim();

  return cleaned || '';
}

function detectIntent(message = '') {
  const text = String(message).toLowerCase();

  if (/(compare|comparison|vs\.?|versus)/.test(text)) {
    return INTENTS.COMPARE_PRODUCTS;
  }

  if (/(return|refund|shipping|delivery|payment|billing|policy|policies)/.test(text)) {
    return INTENTS.ANSWER_POLICY_QUESTION;
  }

  if (/(order|tracking|track|shipment status|where is my order|order status)/.test(text)) {
    return INTENTS.CHECK_ORDER_STATUS;
  }

  if (/(find|search|show|looking for|recommend|recommendation|under \$?\d+|below \$?\d+|laptop|desktop|monitor|accessory|brand)/.test(text)) {
    return INTENTS.SEARCH_PRODUCTS;
  }

  return INTENTS.FALLBACK;
}

function extractSearchFilters(message = '') {
  const brand = extractKnownValue(message, KNOWN_BRANDS);
  const category = extractKnownValue(message, KNOWN_CATEGORIES);
  const { minPrice, maxPrice } = extractPriceRange(message);
  const keyword = extractKeyword(message, brand, category);

  return {
    keyword: keyword || undefined,
    brand: brand || undefined,
    category: category || undefined,
    minPrice,
    maxPrice,
  };
}

function detectPolicyTopic(message = '') {
  const lowerMessage = message.toLowerCase();
  const policies = getAllPolicies();

  for (const policy of policies) {
    if (lowerMessage.includes(policy.topic)) {
      return policy.topic;
    }

    if (policy.keywords.some((keyword) => lowerMessage.includes(keyword))) {
      return policy.topic;
    }
  }

  return null;
}

module.exports = {
  INTENTS,
  detectIntent,
  extractSearchFilters,
  detectPolicyTopic,
};
