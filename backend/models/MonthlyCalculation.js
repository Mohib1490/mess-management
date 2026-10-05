const mongoose = require('mongoose');

const monthlyCalculationSchema = new mongoose.Schema({
    month: {
        type: String,
        required: true
    },
    year: {
        type: Number,
        required: true
    },
    totalRent: {
        type: Number,
        default: 0
    },
    totalFoodCost: {
        type: Number,
        default: 0
    },
    totalDeduction: {
        type: Number,
        default: 0
    },
    totalUtilityCost: {
        type: Number,
        default: 0
    },
    cookSalary: {
        type: Number,
        default: 0
    },
    totalMeals: {
        type: Number,
        default: 0
    },
    totalGuestMeals: {
        type: Number,
        default: 0
    },
    mealRate: {
        type: Number,
        default: 0
    },
    activeMembers: {
        type: Number,
        default: 0
    },
    memberCalculations: [{
        member: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Member'
        },
        memberName: String,
        seatRent: Number,
        totalMeals: Number,
        guestMeals: Number,
        mealCost: Number,
        utilityShare: Number,
        cookSalaryShare: Number,
        totalExpense: Number,
        amountPaid: Number,
        advance: Number,
        balance: Number,
        status: {
            type: String,
            enum: ['paid', 'unpaid'],
            default: 'unpaid'
        }
    }],
    totalCollection: {
        type: Number,
        default: 0
    },
    totalExpense: {
        type: Number,
        default: 0
    },
    netBalance: {
        type: Number,
        default: 0
    },
    isFinalized: {
        type: Boolean,
        default: false
    },
    finalizedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Member'
    },
    finalizedAt: Date,
    notes: String
}, {
    timestamps: true
});

// Compound index
monthlyCalculationSchema.index({ month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('MonthlyCalculation', monthlyCalculationSchema);