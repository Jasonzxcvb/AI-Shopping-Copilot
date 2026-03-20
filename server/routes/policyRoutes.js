const express = require('express');
const { getAllPolicies, getPolicyByTopic } = require('../services/policyService');

const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    success: true,
    data: {
      items: getAllPolicies(),
      total: getAllPolicies().length,
    },
  });
});

router.get('/:topic', (req, res) => {
  const policy = getPolicyByTopic(req.params.topic);

  if (!policy) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'POLICY_NOT_FOUND',
        message: 'Policy topic not found',
      },
    });
  }

  return res.json({
    success: true,
    data: {
      item: policy,
    },
  });
});

module.exports = router;
