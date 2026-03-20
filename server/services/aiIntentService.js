const { getAllPolicies } = require('./policyService');

const INTENTS = Object.freeze({
  SEARCH_PRODUCTS: 'search_products',
  COMPARE_PRODUCTS: 'compare_products',
  ANSWER_POLICY_QUESTION: 'answer_policy_question',
  CHECK_ORDER_STATUS: 'check_order_status',
  FALLBACK: 'fallback',
});

const KNOWN_BRANDS = ['Dell', 'HP', 'Apple', 'Lenovo', 'Acer', 'Asus', 'Samsung', 'Logitech'];
const CATEGORY_ALIASES = Object.freeze({
  laptop: 'laptops',
  laptops: 'laptops',
  desktop: 'desktops',
  desktops: 'desktops',
  monitor: 'monitors',
  monitors: 'monitors',
  accessory: 'accessories',
  accessories: 'accessories',
});
const CATEGORY_TERMS = Object.keys(CATEGORY_ALIASES).join('|');
const FILLER_WORDS = new Set([
  'a',
  'an',
  'the',
  'me',
  'my',
  'please',
  'show',
  'find',
  'search',
  'looking',
  'look',
  'for',
  'need',
  'want',
  'give',
  'products',
  'product',
  'items',
  'item',
  'price',
  'prices',
  'that',
  'is',
  'with',
  'of',
  'to',
  'than',
  'dollar',
  'dollars',
]);

function extractPriceRange(message) {
  const text = message.toLowerCase();
  let minPrice;
  let maxPrice;

  const underMatch = text.match(/(?:under|below|less than|at most|max(?:imum)?(?: price)?)[^\d]*(\d+(?:\.\d+)?)/i);
  const overMatch = text.match(/(?:over|above|more than|greater than|higher than|at least|min(?:imum)?(?: price)?)[^\d]*(\d+(?:\.\d+)?)/i);
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

function extractCategory(message = '') {
  const lowerMessage = message.toLowerCase();
  const matchedAlias = Object.keys(CATEGORY_ALIASES).find((alias) => {
    const regex = new RegExp(`\\b${alias}\\b`, 'i');
    return regex.test(lowerMessage);
  });

  return matchedAlias ? CATEGORY_ALIASES[matchedAlias] : null;
}

function extractKeyword(message, brand, category) {
  let cleaned = message.toLowerCase()
    .replace(/compare|comparison|versus|vs\.?|show|find|search|looking for|looking|need|want|give|recommend|recommendation/gi, ' ')
    .replace(/products?|items?/gi, ' ')
    .replace(/under[^\d]*\d+(?:\.\d+)?/gi, ' ')
    .replace(/below[^\d]*\d+(?:\.\d+)?/gi, ' ')
    .replace(/less than[^\d]*\d+(?:\.\d+)?/gi, ' ')
    .replace(/over[^\d]*\d+(?:\.\d+)?/gi, ' ')
    .replace(/above[^\d]*\d+(?:\.\d+)?/gi, ' ')
    .replace(/more than[^\d]*\d+(?:\.\d+)?/gi, ' ')
    .replace(/greater than[^\d]*\d+(?:\.\d+)?/gi, ' ')
    .replace(/higher than[^\d]*\d+(?:\.\d+)?/gi, ' ')
    .replace(/between[^\d]*\d+(?:\.\d+)?[^\d]+\d+(?:\.\d+)?/gi, ' ')
    .replace(/\b(a|an|the|my|me|please|price|prices|dollar|dollars|that|is|with|for)\b/gi, ' ');

  if (brand) {
    cleaned = cleaned.replace(new RegExp(brand, 'ig'), ' ');
  }

  if (category) {
    cleaned = cleaned.replace(new RegExp(category, 'ig'), ' ');
    Object.entries(CATEGORY_ALIASES).forEach(([alias, normalizedCategory]) => {
      if (normalizedCategory === category) {
        cleaned = cleaned.replace(new RegExp(`\\b${alias}\\b`, 'ig'), ' ');
      }
    });
  }

  const tokens = cleaned
    .replace(/[^a-z0-9\s-]/gi, ' ')
    .split(/\s+/)
    .map((token) => token.trim())
    .filter((token) => token && !FILLER_WORDS.has(token));

  return tokens.join(' ');
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

  if (new RegExp(`(find|search|show|looking for|recommend|recommendation|under|below|less than|over|above|more than|greater than|higher than|brand|products?|${CATEGORY_TERMS})`, 'i').test(text)) {
    return INTENTS.SEARCH_PRODUCTS;
  }

  return INTENTS.FALLBACK;
}

function extractSearchFilters(message = '') {
  const brand = extractKnownValue(message, KNOWN_BRANDS);
  const category = extractCategory(message);
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
