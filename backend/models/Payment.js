const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    member: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Member',
        required: true
    },
    amount: {
        type: Number,
        required: [true, 'Amount is required'],
        min: 0
    },
    paymentType: {
        type: String,
        enum: ['monthly_rent', 'food_contribution', 'utility_contribution', 'advance', 'other'],
        required: true
    },
    paymentMethod: {
        type: String,
        enum: ['cash', 'bkash', 'nagad', 'bank_transfer'],
        default: 'cash'
    },
    transactionId: String,
    month: String,
    year: Number,
    date: {
        type: Date,
        default: Date.now
    },
    receivedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Member'
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'completed'
    },
    notes: String
}, {
    timestamps: true
});

module.exports = mongoose.model('Payment', paymentSchema);