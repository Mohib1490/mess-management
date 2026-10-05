const express = require('express');
const router = express.Router();
const MonthlyCalculation = require('../models/MonthlyCalculation');
const Member = require('../models/Member');
const Meal = require('../models/Meal');
const FoodCost = require('../models/FoodCost');
const UtilityBill = require('../models/UtilityBill');
const CookSalary = require('../models/CookSalary');
const { protectAny, writeAccess } = require('../middleware/authMiddleware');
const { isMemberActiveInMonth } = require('../utils/memberActivity');

const normalizeStatus = (status) => {
    if (status === 'paid') return 'paid';
    if (status === 'due') return 'unpaid';
    return 'unpaid';
};

// Calculate values for a month
const calculateMonthlyValues = async (month, year) => {
    const monthNames = [
        'january', 'february', 'march', 'april', 'may', 'june',
        'july', 'august', 'september', 'october', 'november', 'december'
    ];
    const monthIndex = monthNames.indexOf(month.toLowerCase());
    if (monthIndex === -1) {
        throw new Error('Invalid month name provided');
    }

    const startDate = new Date(year, monthIndex, 1, 0, 0, 0, 0);
    const endDate = new Date(year, monthIndex + 1, 1, 0, 0, 0, 0);

    // Use only members active during the selected month
    const allMembers = await Member.find();
    const members = allMembers.filter((member) => isMemberActiveInMonth(member, startDate));
    
    // Get totals
    const meals = await Meal.find({ date: { $gte: startDate, $lt: endDate } });
    const foodCosts = await FoodCost.find();
    const utilities = await UtilityBill.find({ month, year });
    const cookSalaries = await CookSalary.findOne({ month, year });

    const totalFoodCost = foodCosts.reduce((sum, f) => sum + ((f.totalCost || 0) - (f.deduction || 0)), 0);
    const totalDeduction = foodCosts.reduce((sum, f) => sum + (f.deduction || 0), 0);
    const totalUtilityCost = utilities.reduce((sum, u) => sum + (u.totalAmount || 0), 0);
    const cookSalary = cookSalaries?.totalSalary || 0;
    const totalMeals = meals.reduce((sum, m) => sum + (m.totalMeals || 0), 0);
    const mealRate = totalMeals > 0 ? Math.round(totalFoodCost / totalMeals) : 0;
    const totalExpense = totalFoodCost + totalUtilityCost + cookSalary;
    const cookSalarySharePerMember = members.length > 0 ? Math.round(cookSalary / members.length) : 0;

    // Calculate per member
    const memberCalculations = members.map(member => {
        const memberMeals = meals.filter(m => m.member && m.member.toString() === member._id.toString());
        const totalMemberMeals = memberMeals.reduce((sum, m) => sum + (m.totalMeals || 0), 0);
        const mealCost = totalMemberMeals * mealRate;
        const utilityShare = members.length > 0 ? Math.round(totalUtilityCost / members.length) : 0;
        const totalExpenseForMember = member.seatRent + mealCost + utilityShare + cookSalarySharePerMember;
        const balance = 0;

        return {
            member: member._id,
            memberName: member.name,
            seatRent: member.seatRent,
            totalMeals: totalMemberMeals,
            guestMeals: 0,
            mealCost: mealCost,
            utilityShare: utilityShare,
            cookSalaryShare: cookSalarySharePerMember,
            totalExpense: totalExpenseForMember,
            amountPaid: 0,
            advance: 0,
            balance: balance,
            status: 'unpaid'
        };
    });

    return {
        month,
        year,
        totalRent: members.reduce((sum, m) => sum + m.seatRent, 0),
        totalFoodCost,
        totalDeduction,
        totalUtilityCost,
        cookSalary,
        totalMeals,
        totalGuestMeals: 0,
        mealRate,
        activeMembers: members.length,
        memberCalculations,
        totalCollection: 0,
        totalExpense,
        netBalance: 0,
        isFinalized: false
    };
};

// Get all calculations
router.get('/', async (req, res) => {
    try {
        const calculations = await MonthlyCalculation.find().sort({ year: -1, month: -1 });
        const normalized = calculations.map((calc) => {
            if (calc.memberCalculations && Array.isArray(calc.memberCalculations)) {
                calc.memberCalculations = calc.memberCalculations.map((item) => ({
                    ...item.toObject ? item.toObject() : item,
                    status: normalizeStatus(item.status)
                }));
            }
            return calc;
        });

        res.json(normalized);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get current month
router.get('/current-month', async (req, res) => {
    try {
        const month = new Date().toLocaleString('default', { month: 'long' });
        const year = new Date().getFullYear();
        let calc = await MonthlyCalculation.findOne({ month, year });
        const values = await calculateMonthlyValues(month, year);

        if (calc) {
            Object.assign(calc, values);
            await calc.save();
        } else {
            calc = new MonthlyCalculation(values);
            await calc.save();
        }

        res.json(calc || { totalMeals: 0, totalExpense: 0, mealRate: 0, memberCalculations: [] });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Preview a monthly report without saving changes
router.get('/preview', protectAny, async (req, res) => {
    try {
        if (!req.admin || !['viewer', 'manager', 'admin', 'super_admin'].includes(req.admin.role)) {
            return res.status(403).json({ message: 'Not authorized to view monthly reports' });
        }

        const { month, year } = req.query;
        const yearNum = Number(year);
        if (!month || !Number.isInteger(yearNum)) {
            return res.status(400).json({ message: 'A valid month and year are required' });
        }

        const savedCalculation = await MonthlyCalculation.findOne({ month, year: yearNum });
        const values = await calculateMonthlyValues(month, yearNum);
        const savedStatuses = new Map(
            (savedCalculation?.memberCalculations || []).map((item) => [
                item.member?.toString(),
                normalizeStatus(item.status)
            ])
        );

        res.json({
            ...values,
            ...(savedCalculation?._id ? { _id: savedCalculation._id } : {}),
            memberCalculations: values.memberCalculations.map((item) => ({
                ...item,
                status: savedStatuses.get(item.member.toString()) || item.status
            }))
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update member payment status for a report
router.patch('/:id/members/:memberId/status', protectAny, writeAccess, async (req, res) => {
    try {
        const { id, memberId } = req.params;
        const { status } = req.body;

        if (!['paid', 'unpaid'].includes(status)) {
            return res.status(400).json({ message: 'Status must be paid or unpaid' });
        }

        const calc = await MonthlyCalculation.findById(id);
        if (!calc) {
            return res.status(404).json({ message: 'Monthly calculation not found' });
        }

        const memberCalculation = calc.memberCalculations.find(
            (item) => item.member && item.member.toString() === memberId.toString()
        );

        if (!memberCalculation) {
            return res.status(404).json({ message: 'Member calculation not found' });
        }

        memberCalculation.status = normalizeStatus(status);
        await calc.save();

        res.json({
            success: true,
            memberCalculation
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Generate report
router.post('/generate', protectAny, writeAccess, async (req, res) => {
    try {
        const { month, year } = req.body;
        
        const values = await calculateMonthlyValues(month, year);
        let calc = await MonthlyCalculation.findOne({ month, year });
        
        if (calc) {
            Object.assign(calc, values);
            await calc.save();
        } else {
            calc = new MonthlyCalculation(values);
            await calc.save();
        }
        
        res.json(calc);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;
