const mongoose = require('mongoose');

const cookSalarySchema = new mongoose.Schema({
    cookName: {
        type: String,
        required: [true, 'Cook name is required'],
        trim: true,
        default: 'Khala'
    },
    phone: String,
    joinDate: Date,
    month: {
        type: String,
        required: [true, 'Month is required'],
        enum: ['January', 'February', 'March', 'April', 'May', 'June', 
               'July', 'August', 'September', 'October', 'November', 'December']
    },
    year: {
        type: Number,
        required: [true, 'Year is required']
    },
    baseSalary: {
        type: Number,
        required: [true, 'Base salary is required'],
        min: 0
    },
    bonus: {
        type: Number,
        default: 0,
        min: 0
    },
    overtime: {
        hours: { type: Number, default: 0 },
        rate: { type: Number, default: 0 },
        amount: { type: Number, default: 0 }
    },
    advance: {
        type: Number,
        default: 0,
        min: 0
    },
    deductions: {
        type: Number,
        default: 0,
        min: 0
    },
    totalSalary: {
        type: Number,
        default: 0
    },
    paidAmount: {
        type: Number,
        default: 0
    },
    dueAmount: {
        type: Number,
        default: 0
    },
    paymentHistory: [{
        amount: Number,
        date: Date,
        paymentMethod: {
            type: String,
            enum: ['cash', 'bkash', 'nagad', 'bank'],
            default: 'cash'
        },
        transactionId: String,
        paidBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Member'
        }
    }],
    status: {
        type: String,
        enum: ['paid', 'partial', 'due'],
        default: 'due'
    },
    notes: String
}, {
    timestamps: true
});

// Calculate salary details before saving
cookSalarySchema.pre('save', function() {
    this.overtime = this.overtime || { hours: 0, rate: 0, amount: 0 };
    this.overtime.hours = this.overtime.hours || 0;
    this.overtime.rate = this.overtime.rate || 0;
    this.overtime.amount = this.overtime.hours * this.overtime.rate;
    this.paymentHistory = this.paymentHistory || [];
    this.totalSalary = this.baseSalary + this.bonus + this.overtime.amount - this.deductions;
    this.paidAmount = this.paymentHistory.reduce((sum, payment) => sum + (payment.amount || 0), 0) + this.advance;
    this.dueAmount = this.totalSalary - this.paidAmount;
    
    if (this.dueAmount <= 0) {
        this.status = 'paid';
    } else if (this.paidAmount > 0) {
        this.status = 'partial';
    } else {
        this.status = 'due';
    }
});

// Compound index
cookSalarySchema.index({ cookName: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('CookSalary', cookSalarySchema);