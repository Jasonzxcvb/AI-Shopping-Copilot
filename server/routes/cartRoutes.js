const express = require('express');
const router = express.Router();
const { Cart } = require('../models/Cart');

// Get cart for a user
router.get('/:userId', async (req, res) => {
    try {
        const cart = await Cart.findOne({ userId: req.params.userId });
        if (!cart) return res.status(404).json({ error: 'Cart not found' });
        res.json(cart);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add item to cart
router.post('/', async (req, res) => {
    try {
        const { userId, items } = req.body;
        const cart = await Cart.findOneAndUpdate(
            { userId },
            { $push: { items: { $each: items } } },
            { new: true, upsert: true }
        );
        res.status(201).json(cart);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Update item quantity in cart
router.put('/:userId/:productId', async (req, res) => {
    try {
        const { quantity } = req.body;
        const cart = await Cart.findOneAndUpdate(
            { userId: req.params.userId, 'items.productId': req.params.productId },
            { $set: { 'items.$.quantity': quantity } },
            { new: true }
        );
        res.json(cart);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Remove item from cart
router.delete('/:userId/:productId', async (req, res) => {
    try {
        const cart = await Cart.findOneAndUpdate(
            { userId: req.params.userId },
            { $pull: { items: { productId: req.params.productId } } },
            { new: true }
        );
        res.json(cart);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
