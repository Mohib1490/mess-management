const mongoose = require('mongoose');

const mealSchema = new mongoose.Schema({
    member: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Member',
        required: [true, 'Member is required']
    },
    date: {
        type: Date,
        required: [true, 'Date is required']
    },
    meals: {
        breakfast: { type: Number, default: 0, min: 0, max: 0.5 },
        lunch: { type: Number, default: 0, min: 0, max: 2 },
        dinner: { type: Number, default: 0, min: 0, max: 2 }
    },
    guestMeals: {
        breakfast: { type: Number, default: 0 },
        lunch: { type: Number, default: 0 },
        dinner: { type: Number, default: 0 }
    },
    totalMeals: {
        type: Number,
        default: 0
    },
    totalGuestMeals: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['on', 'off'],
        default: 'on'
    },
    lockedMeals: {
        type: [String],
        enum: ['breakfast', 'lunch', 'dinner'],
        default: []
    },
    notes: String,
    month: String,
    year: Number
}, {
    timestamps: true
});

// Calculate total meals before saving
mealSchema.pre('save', function() {
    this.meals = this.meals || { breakfast: 0, lunch: 0, dinner: 0 };
    this.guestMeals = this.guestMeals || { breakfast: 0, lunch: 0, dinner: 0 };
    
    this.totalMeals = (this.meals.breakfast || 0) + (this.meals.lunch || 0) + (this.meals.dinner || 0);
    this.totalGuestMeals = (this.guestMeals.breakfast || 0) + (this.guestMeals.lunch || 0) + (this.guestMeals.dinner || 0);
    
    const date = new Date(this.date);
    this.month = date.toLocaleString('default', { month: 'long' });
    this.year = date.getFullYear();
});

// Compound index to ensure one meal entry per member per day
mealSchema.index({ member: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Meal', mealSchema);