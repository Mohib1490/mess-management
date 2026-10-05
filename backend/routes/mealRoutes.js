const express = require('express');
const router = express.Router();
const Meal = require('../models/Meal');
const Member = require('../models/Member');
const MonthlyCalculation = require('../models/MonthlyCalculation');
const { protectAny, writeAccess } = require('../middleware/authMiddleware');
const { isMemberActiveInMonth } = require('../utils/memberActivity');

const mealWriteAccess = (req, res, next) => {
    if (req.member || (req.admin && ['admin', 'super_admin'].includes(req.admin.role))) {
        return next();
    }
    return res.status(403).json({ message: 'Read-only access' });
};

const normalizeDate = (value) => {
    if (!value) return null;

    const date = value instanceof Date ? new Date(value) : new Date(value);
    if (Number.isNaN(date.getTime())) return null;

    date.setUTCHours(0, 0, 0, 0);
    return date;
};

const formatDateKey = (date) => {
    const d = date instanceof Date ? new Date(date) : new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// Get meals by date
router.get('/date/:date', protectAny, async (req, res) => {
    try {
        const normalizedDate = normalizeDate(req.params.date);
        if (!normalizedDate) {
            return res.status(400).json({ message: 'Invalid date' });
        }

        const filter = req.member ? { date: normalizedDate, member: req.member._id } : { date: normalizedDate };
        const meals = await Meal.find(filter).populate('member', 'name');
        res.json(meals);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get month report for all members
router.get('/month-report', async (req, res) => {
    try {
        const { month, year } = req.query;
        const monthNum = parseInt(month, 10);
        const yearNum = parseInt(year, 10);

        if (!month || !year || Number.isNaN(monthNum) || Number.isNaN(yearNum) || monthNum < 1 || monthNum > 12) {
            return res.status(400).json({ message: 'Invalid month or year' });
        }

        const monthName = new Date(yearNum, monthNum - 1, 1).toLocaleString('default', { month: 'long' });
        const meals = await Meal.find({ month: monthName, year: yearNum }).populate('member', 'name');
        const monthStart = new Date(yearNum, monthNum - 1, 1);
        const allMembers = await Member.find().select('name joinDate leavingDate isActive');
        const members = allMembers
            .filter((member) => isMemberActiveInMonth(member, monthStart))
            .sort((a, b) => a.name.localeCompare(b.name));
        const activeMemberIds = new Set(members.map((member) => member._id.toString()));
        const calculation = await MonthlyCalculation.findOne({ month: monthName, year: yearNum });

        const firstDay = monthStart;
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
        
        meals.forEach((meal) => {
            const dateKey = formatDateKey(meal.date);
            const memberId = meal.member?._id?.toString() || meal.member?.toString();
            const value = meal.totalMeals || 0;

            if (!activeMemberIds.has(memberId)) {
                return;
            }

            if (!rows[dateKey]) {
                rows[dateKey] = {};
            }
            rows[dateKey][memberId] = value;
            totals[memberId] = (totals[memberId] || 0) + value;
        });

        const totalMeals = Object.values(totals).reduce((sum, value) => sum + value, 0);

        res.json({
            monthName,
            year: yearNum,
            dates,
            members,
            rows,
            totals,
            totalMeals,
            mealRate: calculation?.mealRate || 0,
            totalExpense: calculation?.totalExpense || 0
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get current month stats
router.get('/current-month-stats', async (req, res) => {
    try {
        const month = new Date().toLocaleString('default', { month: 'long' });
        const year = new Date().getFullYear();
        const meals = await Meal.find({ month, year });
        const totalMeals = meals.reduce((sum, meal) => sum + meal.totalMeals, 0);
        res.json({ totalMeals, mealRate: 0 });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/today-stats', protectAny, async (req, res) => {
    try {
        const date = normalizeDate(new Date());
        const meals = await Meal.find({ date });
        res.json({
            breakfast: meals.reduce((sum, meal) => sum + (meal.meals?.breakfast || 0), 0),
            lunch: meals.reduce((sum, meal) => sum + (meal.meals?.lunch || 0), 0),
            dinner: meals.reduce((sum, meal) => sum + (meal.meals?.dinner || 0), 0)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Add/Update meal
router.post('/', protectAny, mealWriteAccess, async (req, res) => {
    try {
        const { member, date } = req.body;
        const normalizedDate = normalizeDate(date);

        if (!normalizedDate) {
            return res.status(400).json({ message: 'Invalid date' });
        }
        
        if (req.member && member !== req.member._id.toString()) {
            return res.status(403).json({ message: 'Members can only update their own meals' });
        }

        let meal = await Meal.findOne({ member, date: normalizedDate });
        
        if (meal) {
            if (req.member) {
                const submittedType = ['breakfast', 'lunch', 'dinner'].find((type) =>
                    req.body.meals && req.body.meals[type] !== meal.meals[type]
                );
                if (!submittedType || meal.lockedMeals.includes(submittedType)) {
                    return res.status(409).json({ message: 'This meal has already been submitted and cannot be changed' });
                }
                meal.meals[submittedType] = req.body.meals[submittedType];
                meal.lockedMeals.push(submittedType);
                await meal.save();
                return res.json(meal);
            }
            Object.assign(meal, { ...req.body, date: normalizedDate });
            await meal.save();
        } else {
            meal = new Meal({
                ...req.body,
                date: normalizedDate,
                lockedMeals: req.member
                    ? ['breakfast', 'lunch', 'dinner'].filter((type) => req.body.meals?.[type] !== undefined)
                    : []
            });
            await meal.save();
        }
        
        res.json(meal);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;