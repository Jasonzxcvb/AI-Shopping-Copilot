const { Product } = require('../models/Product');

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function buildProductSearchQuery(filters = {}) {
  const {
    keyword,
    brand,
    category,
    minPrice,
    maxPrice,
  } = filters;
  const query = {};

  if (keyword) {
    const keywordRegex = new RegExp(escapeRegex(keyword.trim()), 'i');
    query.$or = [
      { name: keywordRegex },
      { brand: keywordRegex },
      { category: keywordRegex },
      { description: keywordRegex },
    ];
  }

  if (brand) {
    query.brand = new RegExp(`^${escapeRegex(brand.trim())}$`, 'i');
  }

  if (category) {
    query.category = new RegExp(`^${escapeRegex(category.trim())}$`, 'i');
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    query.price = {};

    if (minPrice !== undefined) {
      query.price.$gte = Number(minPrice);
    }

    if (maxPrice !== undefined) {
      query.price.$lte = Number(maxPrice);
    }
  }

  return query;
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

  if (typeof category === 'string' && category.trim()) {
    sanitized.category = category.trim();
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
