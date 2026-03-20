function createAiResponse({
  success = true,
  reply = null,
  intent = null,
  products = [],
  comparison = null,
  actions = [],
  sources = [],
  context = {},
  error = null,
  meta = {},
} = {}) {
  return {
    success,
    data: {
      reply,
      intent,
      products,
      comparison,
      actions,
      sources,
      context,
    },
    error,
    meta: {
      timestamp: new Date().toISOString(),
      ...meta,
    },
  };
}

module.exports = {
  createAiResponse,
};
