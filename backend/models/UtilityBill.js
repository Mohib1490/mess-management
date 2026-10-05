const mongoose = require('mongoose');

const utilityBillSchema = new mongoose.Schema({
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
    electricityBill: {
        type: Number,
        default: 0,
        min: 0
    },
    gasBill: {
        type: Number,
        default: 0,
        min: 0
    },
    waterBill: {
        type: Number,
        default: 0,
        min: 0
    },
    internetBill: {
        type: Number,
        default: 0,
        min: 0
    },
    garbageBill: {
        type: Number,
        default: 0,
        min: 0
    },
    otherUtilities: {
        type: Number,
        default: 0,
        min: 0
    },
    totalAmount: {
        type: Number,
        default: 0
    },
    billDetails: {
        electricity: {
            meterReading: Number,
            unitConsumed: Number,
            ratePerUnit: Number,
            dueDate: Date
        },
        gas: {
            meterReading: Number,
            dueDate: Date
        },
        water: {
            meterReading: Number,
            dueDate: Date
        }
    },
    paidBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Member'
    },
    paymentDate: Date,
    isPaid: {
        type: Boolean,
        default: false
    },
    receiptNumber: String,
    notes: String
}, {
    timestamps: true
});

// Instance method to calculate total
utilityBillSchema.methods.calculateTotal = function() {
    this.totalAmount = this.electricityBill + this.gasBill + this.waterBill + 
                       this.internetBill + this.garbageBill + this.otherUtilities;
    return this.totalAmount;
};

// Calculate total before saving
utilityBillSchema.pre('save', function() {
    this.totalAmount = this.electricityBill + this.gasBill + this.waterBill + 
                       this.internetBill + this.garbageBill + this.otherUtilities;
});
// Compound index to ensure unique month/year combination
utilityBillSchema.index({ month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('UtilityBill', utilityBillSchema);