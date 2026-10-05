const mongoose = require('mongoose');

const foodCostSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: [true, 'Date is required'],
        default: Date.now
    },
    market: {
        type: String,
        default: 'Local Market'
    },
    items: [{
        category: {
            type: String,
            enum: ['rice', 'vegetable', 'fish', 'chicken', 'beef', 'mutton', 
                   'eggs', 'spices', 'oil', 'dal', 'other'],
            required: true
        },
        itemName: {
            type: String,
            required: true
        },
        quantity: {
            type: Number,
            required: true
        },
        unit: {
            type: String,
            enum: ['kg', 'gram', 'piece', 'packet', 'liter', 'dozen', 'bundle', 'other'],
            default: 'kg'
        },
        pricePerUnit: {
            type: Number,
            required: true
        },
        totalPrice: {
            type: Number,
            required: true
        }
    }],
    totalCost: {
        type: Number,
        required: true,
        default: 0
    },
    deduction: {
        type: Number,
        required: true,
        default: 0,
        min: 0
    },
    boughtBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Member',
        required: true
    },
    receiptImage: String,
    isVerified: {
        type: Boolean,
        default: false
    },
    verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Member'
    },
    month: String,
    year: Number,
    notes: String
}, {
    timestamps: true
});

const calculateTotals = function() {
    const items = Array.isArray(this.items) ? this.items : [];
    this.totalCost = items.reduce((sum, item) => sum + Number(item.totalPrice || 0), 0);
    this.deduction = Number(this.deduction || 0);

    const date = this.date ? new Date(this.date) : new Date();
    this.month = date.toLocaleString('default', { month: 'long' });
    this.year = date.getFullYear();
};

// Calculate totals before validation so required fields are available
foodCostSchema.pre('validate', function() {
    calculateTotals.call(this);
});

// Calculate totals before saving
foodCostSchema.pre('save', function() {
    calculateTotals.call(this);
});

module.exports = mongoose.model('FoodCost', foodCostSchema);