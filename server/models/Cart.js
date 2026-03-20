const mongoose = require("mongoose");

const CartSchema = new mongoose.Schema({
    cartId: {
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
    subtotal: {
        type: Number,
        required: true,
    },
});

const Cart = mongoose.model("Cart", CartSchema);

module.exports = { Cart };
