const express = require('express');
const { createAiResponse } = require('../helpers/aiResponse');
const { handleAiChat } = require('../services/aiChatService');

const router = express.Router();

router.get('/capabilities', (req, res) => {
  res.json(createAiResponse({
    reply: null,
    intent: 'capabilities',
    actions: [
      { type: 'search_products', status: 'planned' },
      { type: 'compare_products', status: 'planned' },
      { type: 'add_to_cart', status: 'planned' },
      { type: 'check_order_status', status: 'planned' },
      { type: 'answer_policy_question', status: 'planned' },
    ],
    context: {
      implemented: true,
      endpoint: '/api/ai/chat',
    },
    meta: {
      version: 'minimal-ai-orchestrator',
    },
  }));
});

router.post('/chat', async (req, res) => {
  try {
    const result = await handleAiChat(req.body || {});
    const statusCode = result.success ? 200 : 400;
    res.status(statusCode).json(result);
  } catch (error) {
    res.status(500).json(createAiResponse({
      success: false,
      error: {
        code: 'AI_CHAT_ROUTE_FAILED',
        message: error.message || 'AI chat route failed',
      },
      meta: {
        version: 'minimal-ai-orchestrator',
      },
    }));
  }
});

module.exports = router;
