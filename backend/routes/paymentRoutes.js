const express = require('express');
const router = express.Router();
const Payment = require('../models/Payment');
const { protectAny, writeAccess } = require('../middleware/authMiddleware');

// Get all payments
router.get('/', async (req, res) => {
    try {
        const payments = await Payment.find().populate('member', 'name').sort({ date: -1 });
        res.json(payments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Add payment
router.post('/', protectAny, writeAccess, async (req, res) => {
    try {
        const payment = new Payment(req.body);
        const savedPayment = await payment.save();
        res.status(201).json(savedPayment);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;