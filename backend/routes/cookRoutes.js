const express = require('express');
const router = express.Router();
const CookSalary = require('../models/CookSalary');
const { protectAny, writeAccess } = require('../middleware/authMiddleware');

const handleCookSalaryError = (error, res) => {
    if (error.code === 11000) {
        return res.status(400).json({ message: 'A salary record for this cook and month already exists.' });
    }
    return res.status(400).json({ message: error.message });
};

// Get all salaries
router.get('/', async (req, res) => {
    try {
        const { month, year } = req.query;
        const query = {};

        if (month || year) {
            const monthNum = Number(month);
            const yearNum = Number(year);
            if (!month || !year || !Number.isInteger(monthNum) || monthNum < 1 || monthNum > 12 || !Number.isInteger(yearNum)) {
                return res.status(400).json({ message: 'A valid month and year are required' });
            }

            query.month = new Date(yearNum, monthNum - 1, 1).toLocaleString('default', { month: 'long' });
            query.year = yearNum;
        }

        const salaries = await CookSalary.find(query).sort({ year: -1, month: -1 });
        res.json(salaries);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get current month salary
router.get('/current-month', async (req, res) => {
    try {
        const month = new Date().toLocaleString('default', { month: 'long' });
        const year = new Date().getFullYear();
        const salary = await CookSalary.findOne({ month, year });
        res.json(salary || { totalSalary: 0 });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Add salary
router.post('/', protectAny, writeAccess, async (req, res) => {
    try {
        const salary = new CookSalary(req.body);
        const savedSalary = await salary.save();
        res.status(201).json(savedSalary);
    } catch (error) {
        handleCookSalaryError(error, res);
    }
});

// Update salary
router.put('/:id', protectAny, writeAccess, async (req, res) => {
    try {
        const salary = await CookSalary.findById(req.params.id);
        if (!salary) {
            return res.status(404).json({ message: 'Salary record not found' });
        }

        salary.cookName = req.body.cookName;
        salary.phone = req.body.phone || salary.phone;
        salary.joinDate = req.body.joinDate || salary.joinDate;
        salary.month = req.body.month;
        salary.year = req.body.year;
        salary.baseSalary = req.body.baseSalary;
        salary.bonus = req.body.bonus;
        salary.advance = req.body.advance;
        salary.deductions = req.body.deductions;
        salary.overtime = req.body.overtime || salary.overtime;
        salary.notes = req.body.notes || salary.notes;

        const updatedSalary = await salary.save();
        res.json(updatedSalary);
    } catch (error) {
        handleCookSalaryError(error, res);
    }
});

// Delete salary
router.delete('/:id', protectAny, writeAccess, async (req, res) => {
    try {
        const salary = await CookSalary.findByIdAndDelete(req.params.id);
        if (!salary) {
            return res.status(404).json({ message: 'Salary record not found' });
        }
        res.json({ message: 'Salary deleted successfully' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Add payment
router.post('/:id/payment', protectAny, writeAccess, async (req, res) => {
    try {
        const salary = await CookSalary.findById(req.params.id);
        salary.paymentHistory.push({
            amount: req.body.amount,
            date: new Date(),
            paymentMethod: req.body.paymentMethod || 'cash'
        });
        salary.paidAmount += req.body.amount;
        await salary.save();
        res.json(salary);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;