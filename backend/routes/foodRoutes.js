const express = require('express');
const router = express.Router();
const FoodCost = require('../models/FoodCost');
const Member = require('../models/Member');
const { protectAny, writeAccess } = require('../middleware/authMiddleware');
const { isMemberActiveInMonth } = require('../utils/memberActivity');

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

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const formatDateKey = (date) => {
    const d = date instanceof Date ? new Date(date) : new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const parseUserNames = (value) => {
    if (!value) return [];
    return value
        .split(',')
        .map((name) => name.trim())
        .filter(Boolean);
};

// Get all food costs
router.get('/', async (req, res) => {
    try {
        const { month, userName } = req.query;
        const query = {};

        if (month) {
            const parsedMonth = parseMonthValue(month);
            if (!parsedMonth) {
                return res.status(400).json({ message: 'Invalid month format' });
            }

            const { monthNum, yearNum } = parsedMonth;
            query.month = new Date(yearNum, monthNum - 1, 1).toLocaleString('default', { month: 'long' });
            query.year = yearNum;
        }

        if (userName) {
            const names = parseUserNames(userName);
            if (names.length > 0) {
                const regexList = names.map((name) => new RegExp(`^${escapeRegex(name)}$`, 'i'));
                const members = await Member.find({ name: { $in: regexList } }).select('_id');
                const memberIds = members.map((member) => member._id);
                if (memberIds.length === 0) {
                    return res.json([]);
                }
                query.boughtBy = { $in: memberIds };
            }
        }

        const costs = await FoodCost.find(query).sort({ date: -1 }).populate('boughtBy', 'name');
        res.json(costs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get current month food costs
router.get('/current-month', async (req, res) => {
    try {
        const month = new Date().toLocaleString('default', { month: 'long' });
        const year = new Date().getFullYear();
        const costs = await FoodCost.find({ month, year });
        const totalCost = costs.reduce((sum, cost) => sum + (cost.totalCost || 0) - (cost.deduction || 0), 0);
        res.json({ totalCost, costs });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get month report for food costs by member
router.get('/month-report', async (req, res) => {
    try {
        const { month, year, userName } = req.query;
        const monthParam = month || year;
        const parsedMonth = parseMonthValue(monthParam);

        if (!parsedMonth) {
            return res.status(400).json({ message: 'Invalid month or year' });
        }

        const { monthNum, yearNum } = parsedMonth;
        const monthName = new Date(yearNum, monthNum - 1, 1).toLocaleString('default', { month: 'long' });
        const costs = await FoodCost.find({ month: monthName, year: yearNum }).populate('boughtBy', 'name');

        let matchingMembers;
        let selectedMemberIds = [];

        if (userName) {
            const names = parseUserNames(userName);
            const regexList = names.map((name) => new RegExp(`^${escapeRegex(name)}$`, 'i'));
            matchingMembers = await Member.find({ name: { $in: regexList } })
                .select('name joinDate leavingDate isActive');
        } else {
            matchingMembers = await Member.find().select('name joinDate leavingDate isActive');
        }

        const firstDay = new Date(yearNum, monthNum - 1, 1);
        const members = matchingMembers
            .filter((member) => isMemberActiveInMonth(member, firstDay))
            .sort((a, b) => a.name.localeCompare(b.name));
        selectedMemberIds = members.map((member) => member._id.toString());
        const activeMemberIds = new Set(selectedMemberIds);
        const lastDay = new Date(yearNum, monthNum, 0);
        const dates = [];
        const rows = {};
        const totals = {};

        members.forEach((member) => {
            totals[member._id] = 0;
        });

        for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 1)) {
            const dateKey = formatDateKey(d);
            dates.push({
                key: dateKey,
                label: new Date(d).toLocaleDateString('en-GB')
            });
            rows[dateKey] = {};
        }

        costs.forEach((cost) => {
            const dateKey = formatDateKey(cost.date);
            const memberId = cost.boughtBy?._id?.toString() || cost.boughtBy?.toString();
            const costValue = (cost.totalCost || 0) - (cost.deduction || 0);

            if (!activeMemberIds.has(memberId)) {
                return;
            }

            if (!rows[dateKey]) {
                rows[dateKey] = {};
            }
            rows[dateKey][memberId] = (rows[dateKey][memberId] || 0) + costValue;
            totals[memberId] = (totals[memberId] || 0) + costValue;
        });

        res.json({
            monthName,
            year: yearNum,
            dates,
            members,
            rows,
            totals
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Add food cost
router.post('/', protectAny, writeAccess, async (req, res) => {
    try {
        const foodCost = new FoodCost(req.body);
        const savedCost = await foodCost.save();
        res.status(201).json(savedCost);
    } catch (error) {
        console.error('Food cost save failed:', error);
        const message = error?.message || 'Failed to add food cost';
        res.status(400).json({ message });
    }
});

// Update food cost
router.put('/:id', protectAny, writeAccess, async (req, res) => {
    try {
        const foodCost = await FoodCost.findById(req.params.id);
        if (!foodCost) {
            return res.status(404).json({ message: 'Food cost not found' });
        }

        Object.assign(foodCost, req.body);
        const updatedCost = await foodCost.save();
        res.json(updatedCost);
    } catch (error) {
        console.error('Food cost update failed:', error);
        const message = error?.message || 'Failed to update food cost';
        res.status(400).json({ message });
    }
});

// Delete food cost
router.delete('/:id', protectAny, writeAccess, async (req, res) => {
    try {
        await FoodCost.findByIdAndDelete(req.params.id);
        res.json({ message: 'Food cost deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;