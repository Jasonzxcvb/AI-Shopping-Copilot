const POLICIES = [
  {
    topic: 'returns',
    title: 'Returns and Refunds',
    summary: 'Most products can be returned within 30 days of delivery in original condition.',
    details: [
      'Returns are accepted within 30 days of delivery.',
      'Items should be in original condition with accessories and packaging.',
      'Refunds are issued to the original payment method after inspection.',
    ],
    keywords: ['return', 'refund', 'exchange', 'replacement'],
  },
  {
    topic: 'shipping',
    title: 'Shipping',
    summary: 'Standard shipping usually arrives within 3 to 7 business days.',
    details: [
      'Standard shipping generally takes 3 to 7 business days.',
      'Expedited shipping options may be available at checkout.',
      'Tracking information is provided after the order is processed.',
    ],
    keywords: ['shipping', 'delivery', 'tracking', 'carrier'],
  },
  {
    topic: 'payment',
    title: 'Payment',
    summary: 'The store supports major cards and approved payment methods shown during checkout.',
    details: [
      'Major card payments are supported during checkout.',
      'Payment must be authorized before an order is confirmed.',
      'Failed or declined transactions should be retried with a valid payment method.',
    ],
    keywords: ['payment', 'card', 'checkout', 'billing'],
  },
];

module.exports = {
  POLICIES,
};
