const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load env vars
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://mohib:mohib@cluster0.rk1ijvc.mongodb.net/mess';

mongoose.connect(MONGODB_URI)
.then(() => {
    console.log('✅ Successfully connected to MongoDB Atlas');
    console.log('📁 Database: bachelor-mess');
})
.catch((error) => {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
});

// Monitor database connection
mongoose.connection.on('connected', () => {
    console.log('🟢 Mongoose connected to MongoDB Atlas');
});

mongoose.connection.on('error', (err) => {
    console.log('🔴 Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('🟡 Mongoose disconnected');
});

// Import Routes
const memberRoutes = require('./routes/memberRoutes');
const utilityRoutes = require('./routes/utilityRoutes');
const foodRoutes = require('./routes/foodRoutes');
const cookRoutes = require('./routes/cookRoutes');
const mealRoutes = require('./routes/mealRoutes');
const calculationRoutes = require('./routes/calculationRoutes');
const paymentRoutes = require('./routes/paymentRoutes');


// Use Routes
app.use('/api/members', memberRoutes);
app.use('/api/utilities', utilityRoutes);
app.use('/api/food', foodRoutes);
app.use('/api/cook', cookRoutes);
app.use('/api/meals', mealRoutes);
app.use('/api/calculations', calculationRoutes);
app.use('/api/payments', paymentRoutes);

// Add this with other routes
app.use('/api/admin', require('./routes/adminRoutes'));



// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
        timestamp: new Date().toISOString()
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled server error:', err);
    res.status(500).json({
        success: false,
        message: err.message || 'Something went wrong!',
        error: err
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`📍 API URL: http://localhost:${PORT}/api`);
});