const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const memberSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Member name is required'],
        trim: true
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        unique: true
    },
    email: {
        type: String,
        lowercase: true
    },
    password: {
        type: String,
        minlength: 8,
        select: false
    },
    nid: String,
    address: String,
    joinDate: {
        type: Date,
        required: [true, 'Join date is required'],
        default: Date.now
    },
    leavingDate: Date,
    seatRent: {
        type: Number,
        required: true,
        enum: [2060, 2740], // 6 members 2740, 1 member 2060
        default: 2740
    },
    seatType: {
        type: String,
        enum: ['regular', 'special'], // regular=2740, special=2060
        default: 'regular'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    totalPaid: {
        type: Number,
        default: 0
    },
    balance: {
        type: Number,
        default: 0
    },
    emergencyContact: {
        name: String,
        phone: String,
        relation: String
    }
}, {
    timestamps: true
});

memberSchema.pre('save', async function() {
    if (!this.isModified('password') || !this.password) {
        return;
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

memberSchema.methods.matchPassword = function(enteredPassword) {
    return bcrypt.compare(enteredPassword, this.password);
};

// Virtual for member duration
memberSchema.virtual('duration').get(function() {
    if (!this.leavingDate) {
        return Math.ceil((Date.now() - this.joinDate) / (1000 * 60 * 60 * 24));
    }
    return Math.ceil((this.leavingDate - this.joinDate) / (1000 * 60 * 60 * 24));
});

module.exports = mongoose.model('Member', memberSchema);