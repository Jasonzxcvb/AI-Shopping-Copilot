const { POLICIES } = require('../data/policies');

function getAllPolicies() {
  return POLICIES;
}

function getPolicyByTopic(topic) {
  if (!topic) {
    return null;
  }

  return POLICIES.find((policy) => policy.topic === String(topic).trim().toLowerCase()) || null;
}

module.exports = {
  getAllPolicies,
  getPolicyByTopic,
};
