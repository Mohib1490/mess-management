const express = require('express');
const router = express.Router();
const UtilityBill = require('../models/UtilityBill');
const { protectAny, writeAccess } = require('../middleware/authMiddleware');

const parseMonthValue = (value) => {
    if (!value) return null;

    const slashMatch = value.match(/^(\d{1,2})\/(\d{4})$/);
    if (slashMatch) {
        return {
            monthNum: parseInt(slashMatch[1], 10),
            yearNum: parseInt(slashMatch[2], 10)
        };
    }

    const dashMatch = value.match(/^(\d{4})-(\d{2})$/);
    if (dashMatch) {
        return {
            monthNum: parseInt(dashMatch[2], 10),
            yearNum: parseInt(dashMatch[1], 10)
        };
    }

    return null;
};

// Get all utility bills
router.get('/', async (req, res) => {
    try {
        const query = {};
        const { month } = req.query;

        if (month) {
            const parsedMonth = parseMonthValue(month);
            if (!parsedMonth) {
                return res.status(400).json({ message: 'Invalid month format' });
            }

            const monthName = new Date(parsedMonth.yearNum, parsedMonth.monthNum - 1, 1)
                .toLocaleString('default', { month: 'long' });
            query.month = monthName;
            query.year = parsedMonth.yearNum;
        }

        const utilityBills = await UtilityBill.find(query).sort({ year: -1, month: -1 });
        res.json(utilityBills);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get current month bill
router.get('/current-month', async (req, res) => {
    try {
        const month = new Date().toLocaleString('default', { month: 'long' });
        const year = new Date().getFullYear();
        const bill = await UtilityBill.findOne({ month, year });
        res.json(bill || { totalAmount: 0 });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Add utility bill
router.post('/', protectAny, writeAccess, async (req, res) => {
    try {
        const utilityBills = new UtilityBill(req.body);
        const savedBill = await utilityBills.save();
        res.status(201).json(savedBill);
    } catch (error) {
        console.error('Utility bill create error:', error);
        res.status(400).json({ message: error.message });
    }
});

// Update bill
router.put('/:id', protectAny, writeAccess, async (req, res) => {
    try {
        const utilityBills = await UtilityBill.findById(req.params.id);
        if (!utilityBills) {
            return res.status(404).json({ message: 'Utility bill not found' });
        }

        Object.assign(utilityBills, req.body);
        const savedBill = await utilityBills.save();
        res.json(savedBill);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete bill
router.delete('/:id', protectAny, writeAccess, async (req, res) => {
    try {
        const utilityBill = await UtilityBill.findByIdAndDelete(req.params.id);
        if (!utilityBill) {
            return res.status(404).json({ message: 'Utility bill not found' });
        }
        res.json({ message: 'Utility bill deleted successfully' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;