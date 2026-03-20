const express = require('express');
const router = express.Router();
const { Order } = require('../models/Order');

// Get all orders for a user
router.get('/:userId', async (req, res) => {
    try {
        const userId = Number(req.params.userId); // Convert userId to a Number
        if (isNaN(userId)) {
            return res.status(400).json({ message: 'Invalid userId format' });
        }

        const orders = await Order.find({ userId });
        if (!orders) {
            return res.status(404).json({ message: 'No orders found for this user' });
        }

        res.json(orders);
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get all orders (Admin only)
router.get('/', async (req, res) => {
    try {
        const orders = await Order.find();
        res.json(orders);
    } catch (err) {
        console.error('Error fetching orders:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Create a new order
router.post('/', async (req, res) => {
    try {
        // Log the incoming request body
        console.log('Received Order Data:', req.body);

        // Extract fields from the request body
        const { orderId, userId, items, totalAmount, status, timestamp } = req.body;

        // Log individual fields for debugging
        console.log('Order ID:', orderId);
        console.log('User ID:', userId);
        console.log('Items:', items);
        console.log('Total Amount:', totalAmount);
        console.log('Status:', status);
        console.log('Timestamp:', timestamp);

        // Validate required fields
        if (!orderId || !userId || !items || !totalAmount || !status || !timestamp) {
            console.error('Validation Failed: Missing required fields');
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Create a new order
        const newOrder = new Order(req.body);
        const savedOrder = await newOrder.save();

        // Log the saved order details
        console.log('Order Saved Successfully:', savedOrder);

        res.status(201).json(savedOrder);
    } catch (err) {
        console.error('Error Creating Order:', err);
        res.status(500).json({ message: 'Server error' });
    }
});


// Update order status by orderId
router.put('/:orderId', async (req, res) => {
    try {
        const orderId = Number(req.params.orderId); // Convert to Number
        const { status } = req.body;

        console.log(`Status (from body): ${status}`);

        // Validate orderId
        if (isNaN(orderId)) {
            console.error('Invalid orderId format:', req.params.orderId);
            return res.status(400).json({ message: 'Invalid orderId format' });
        }

        // Validate status
        const allowedStatuses = ['Pending', 'Shipped', 'Delivered', 'Cancelled', 'Confirmed'];
        if (!allowedStatuses.includes(status)) {
            console.error('Invalid status value:', status);
            return res.status(400).json({ message: 'Invalid status value' });
        }

        // Find and update the order
        const updatedOrder = await Order.findOneAndUpdate(
            { orderId },
            { status },
            { new: true }
        );

        // Log the result of the query
        if (!updatedOrder) {
            console.error('Order not found for orderId:', orderId);
            return res.status(404).json({ message: 'Order not found' });
        }

        console.log('Order successfully updated:', updatedOrder);
        res.json(updatedOrder);
    } catch (err) {
        console.error('Error during order update:', err);
        res.status(500).json({ message: 'Server error' });
    }
});



module.exports = router;
