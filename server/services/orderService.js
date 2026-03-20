const { Order } = require('../models/Order');
const { normalizeOrderStatus, serializeOrder } = require('../constants/orderStatus');

async function getOrdersByUserId(userId) {
  const numericUserId = Number(userId);

  if (Number.isNaN(numericUserId)) {
    throw new Error('Invalid userId format');
  }

  const orders = await Order.find({ userId: numericUserId }).sort({ timestamp: -1 });
  return orders.map((order) => serializeOrder(order));
}

async function getAllOrders() {
  const orders = await Order.find().sort({ timestamp: -1 });
  return orders.map((order) => serializeOrder(order));
}

async function createOrder(orderData) {
  const normalizedStatus = normalizeOrderStatus(orderData.status);

  if (!normalizedStatus) {
    throw new Error('Invalid status value');
  }

  const newOrder = new Order({
    ...orderData,
    status: normalizedStatus,
  });

  const savedOrder = await newOrder.save();
  return serializeOrder(savedOrder);
}

async function updateOrderStatus(orderId, status) {
  const numericOrderId = Number(orderId);
  const normalizedStatus = normalizeOrderStatus(status);

  if (Number.isNaN(numericOrderId)) {
    throw new Error('Invalid orderId format');
  }

  if (!normalizedStatus) {
    throw new Error('Invalid status value');
  }

  const updatedOrder = await Order.findOneAndUpdate(
    { orderId: numericOrderId },
    { status: normalizedStatus },
    { new: true }
  );

  if (!updatedOrder) {
    return null;
  }

  return serializeOrder(updatedOrder);
}

module.exports = {
  getOrdersByUserId,
  getAllOrders,
  createOrder,
  updateOrderStatus,
};
