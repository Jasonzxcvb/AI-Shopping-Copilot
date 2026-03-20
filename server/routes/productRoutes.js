const express = require('express');
const router = express.Router();
const axios = require('axios');
const { Product } = require('../models/Product');

// Get all products
router.get('/', async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/products', async (req, res) => {
    try {
        const products = await Product.find(); // Fetch all products
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get a specific product by ID
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findOne({ productId: req.params.id });
        if (!product) return res.status(404).json({ error: 'Product not found' });
        res.json(product);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create a new product (Admin only)
router.post('/', async (req, res) => {
    try {
        const newProduct = new Product(req.body);
        await newProduct.save();
        res.status(201).json(newProduct);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Update a product by ID (Admin only)
router.put('/:id', async (req, res) => {
    try {
        const updatedProduct = await Product.findOneAndUpdate(
            { productId: req.params.id },
            req.body,
            { new: true }
        );
        if (!updatedProduct) return res.status(404).json({ error: 'Product not found' });
        res.json(updatedProduct);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Delete a product by ID (Admin only)
router.delete('/:id', async (req, res) => {
    try {
        const deletedProduct = await Product.findOneAndDelete({ productId: req.params.id });
        if (!deletedProduct) return res.status(404).json({ error: 'Product not found' });
        res.json({ message: 'Product deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update stock for multiple products after purchase
router.patch('/update-stock', async (req, res) => {
    try {
        const updates = req.body.products; // Expecting an array of product updates
        const bulkOperations = updates.map((update) => ({
            updateOne: {
                filter: { productId: update.productId },
                update: { $inc: { stock: -update.quantity } }, // Decrease stock
            },
        }));

        // Perform bulk update
        await Product.bulkWrite(bulkOperations);

        res.status(200).json({ message: 'Stock updated successfully' });
    } catch (err) {
        console.error('Error updating stock:', err);
        res.status(500).json({ error: err.message });
    }
});


module.exports = router;
