const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
  orderId: {
    type: Number,
    required: true,
  },
  userId: {
    type: Number,
    required: true,
  },
  items: {
    type: [
      {
        productId: { type: Number, required: true },
        quantity: { type: Number, required: true },
      },
    ],
    required: true,
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    required: true,
    enum: ["confirmed", "pending", "shipped", "delivered"],
  },
  timestamp: {
    type: Date,
    required: true,
    default: Date.now,
  },
});

const Order = mongoose.model("Order", OrderSchema);

module.exports = { Order };
