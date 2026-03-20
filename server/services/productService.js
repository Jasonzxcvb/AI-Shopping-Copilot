const { Product } = require('../models/Product');

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

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function normalizeCategory(category) {
  if (typeof category !== 'string') {
    return undefined;
  }

  return CATEGORY_ALIASES[category.trim().toLowerCase()] || category.trim();
}

function getCategorySearchTerms(category) {
  switch (category) {
    case 'laptops':
      return ['laptop', 'laptops'];
    case 'desktops':
      return ['desktop', 'desktops'];
    case 'monitors':
      return ['monitor', 'monitors'];
    case 'accessories':
      return ['accessory', 'accessories'];
    default:
      return [category];
  }
}

function buildCategoryCondition(category) {
  const normalizedCategory = normalizeCategory(category);

  if (!normalizedCategory) {
    return null;
  }

  const exactCategoryMatch = {
    category: new RegExp(`^${escapeRegex(normalizedCategory)}$`, 'i'),
  };
  const termConditions = getCategorySearchTerms(normalizedCategory).flatMap((term) => {
    const termRegex = new RegExp(`\\b${escapeRegex(term)}\\b`, 'i');

    return [
      { name: termRegex },
      { description: termRegex },
    ];
  });

  return {
    $or: [exactCategoryMatch, ...termConditions],
  };
}

function buildProductSearchQuery(filters = {}) {
  const {
    keyword,
    brand,
    category,
    minPrice,
    maxPrice,
  } = filters;
  const conditions = [];

  if (keyword) {
    const keywordRegex = new RegExp(escapeRegex(keyword.trim()), 'i');
    conditions.push({
      $or: [
        { name: keywordRegex },
        { brand: keywordRegex },
        { category: keywordRegex },
        { description: keywordRegex },
      ],
    });
  }

  if (brand) {
    conditions.push({
      brand: new RegExp(escapeRegex(brand.trim()), 'i'),
    });
  }

  if (category) {
    const categoryCondition = buildCategoryCondition(category);
    if (categoryCondition) {
      conditions.push(categoryCondition);
    }
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    const price = {};

    if (minPrice !== undefined) {
      price.$gte = Number(minPrice);
    }

    if (maxPrice !== undefined) {
      price.$lte = Number(maxPrice);
    }

    conditions.push({ price });
  }

  if (conditions.length === 0) {
    return {};
  }

  if (conditions.length === 1) {
    return conditions[0];
  }

  return { $and: conditions };
}

function sanitizeSearchFilters(rawFilters = {}) {
  const sanitized = {};
  const {
    keyword,
    brand,
    category,
    minPrice,
    maxPrice,
  } = rawFilters;

  if (typeof keyword === 'string' && keyword.trim()) {
    sanitized.keyword = keyword.trim();
  }

  if (typeof brand === 'string' && brand.trim()) {
    sanitized.brand = brand.trim();
  }

  const normalizedCategory = normalizeCategory(category);
  if (typeof normalizedCategory === 'string' && normalizedCategory.trim()) {
    sanitized.category = normalizedCategory.trim();
  }

  if (minPrice !== undefined && minPrice !== '') {
    const parsedMinPrice = Number(minPrice);
    if (!Number.isNaN(parsedMinPrice)) {
      sanitized.minPrice = parsedMinPrice;
    }
  }

  if (maxPrice !== undefined && maxPrice !== '') {
    const parsedMaxPrice = Number(maxPrice);
    if (!Number.isNaN(parsedMaxPrice)) {
      sanitized.maxPrice = parsedMaxPrice;
    }
  }

  return sanitized;
}

async function searchProducts(rawFilters = {}) {
  const filters = sanitizeSearchFilters(rawFilters);
  const query = buildProductSearchQuery(filters);
  const items = await Product.find(query).sort({ productId: 1 });

  return {
    filters,
    total: items.length,
    items,
  };
}

async function compareProducts(productIds = []) {
  const normalizedIds = [...new Set(
    productIds
      .map((productId) => Number(productId))
      .filter((productId) => !Number.isNaN(productId))
  )];

  const items = await Product.find({ productId: { $in: normalizedIds } }).sort({ productId: 1 });
  const foundIds = items.map((item) => item.productId);
  const missingProductIds = normalizedIds.filter((productId) => !foundIds.includes(productId));

  return {
    requestedProductIds: normalizedIds,
    foundProductIds: foundIds,
    missingProductIds,
    totalCompared: items.length,
    items: items.map((product) => ({
      productId: product.productId,
      name: product.name,
      brand: product.brand,
      category: product.category,
      price: product.price,
      stock: product.stock,
      specifications: product.specifications || {},
      description: product.description,
      imageUrl: product.imageUrl || null,
    })),
  };
}

async function resolveComparisonProductIds(message = '') {
  const numericIds = [...new Set(
    (message.match(/\b\d+\b/g) || [])
      .map((value) => Number(value))
      .filter((value) => !Number.isNaN(value))
  )];

  if (numericIds.length > 0) {
    return numericIds;
  }

  const allProducts = await Product.find().sort({ productId: 1 });
  const lowerMessage = message.toLowerCase();
  const matchedIds = allProducts
    .filter((product) => lowerMessage.includes(product.name.toLowerCase()))
    .map((product) => product.productId);

  return [...new Set(matchedIds)];
}

module.exports = {
  searchProducts,
  compareProducts,
  resolveComparisonProductIds,
};
