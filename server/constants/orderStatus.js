const ORDER_STATUS = Object.freeze({
  CONFIRMED: 'confirmed',
  PENDING: 'pending',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
});

const ORDER_STATUS_LABELS = Object.freeze({
  [ORDER_STATUS.CONFIRMED]: 'Confirmed',
  [ORDER_STATUS.PENDING]: 'Pending',
  [ORDER_STATUS.SHIPPED]: 'Shipped',
  [ORDER_STATUS.DELIVERED]: 'Delivered',
  [ORDER_STATUS.CANCELLED]: 'Cancelled',
});

const ORDER_STATUS_ALIASES = Object.freeze({
  confirmed: ORDER_STATUS.CONFIRMED,
  Confirmed: ORDER_STATUS.CONFIRMED,
  pending: ORDER_STATUS.PENDING,
  Pending: ORDER_STATUS.PENDING,
  shipped: ORDER_STATUS.SHIPPED,
  Shipped: ORDER_STATUS.SHIPPED,
  delivered: ORDER_STATUS.DELIVERED,
  Delivered: ORDER_STATUS.DELIVERED,
  cancelled: ORDER_STATUS.CANCELLED,
  Cancelled: ORDER_STATUS.CANCELLED,
  canceled: ORDER_STATUS.CANCELLED,
  Canceled: ORDER_STATUS.CANCELLED,
});

function normalizeOrderStatus(status) {
  if (typeof status !== 'string') {
    return null;
  }

  return ORDER_STATUS_ALIASES[status.trim()] || null;
}

function formatOrderStatus(status) {
  const normalizedStatus = normalizeOrderStatus(status);

  if (!normalizedStatus) {
    return status;
  }

  return ORDER_STATUS_LABELS[normalizedStatus];
}

function serializeOrder(order) {
  const plainOrder = typeof order.toObject === 'function' ? order.toObject() : { ...order };
  const normalizedStatus = normalizeOrderStatus(plainOrder.status);

  return {
    ...plainOrder,
    status: formatOrderStatus(plainOrder.status),
    statusCode: normalizedStatus || plainOrder.status,
  };
}

module.exports = {
  ORDER_STATUS,
  ORDER_STATUS_LABELS,
  normalizeOrderStatus,
  formatOrderStatus,
  serializeOrder,
};
