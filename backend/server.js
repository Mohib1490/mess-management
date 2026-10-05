const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

const allowedOrigins = (process.env.FRONTEND_URL || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

app.use(cors(allowedOrigins.length ? { origin: allowedOrigins } : undefined));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
    throw new Error('MONGODB_URI environment variable is required');
}

mongoose.connect(MONGODB_URI)
    .then(() => {
        console.log('✅ Successfully connected to MongoDB Atlas');
        console.log('📁 Database: bachelor-mess');
    })
    .catch((error) => {
        console.error('❌ MongoDB connection error:', error.message);
        process.exit(1);
    });

mongoose.connection.on('connected', () => {
    console.log('🟢 Mongoose connected to MongoDB Atlas');
});

mongoose.connection.on('error', (error) => {
    console.log('🔴 Mongoose connection error:', error);
});

mongoose.connection.on('disconnected', () => {
    console.log('🟡 Mongoose disconnected');
});

const memberRoutes = require('./routes/memberRoutes');
const utilityRoutes = require('./routes/utilityRoutes');
const foodRoutes = require('./routes/foodRoutes');
const cookRoutes = require('./routes/cookRoutes');
const mealRoutes = require('./routes/mealRoutes');
const calculationRoutes = require('./routes/calculationRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

app.use('/api/members', memberRoutes);
app.use('/api/utilities', utilityRoutes);
app.use('/api/food', foodRoutes);
app.use('/api/cook', cookRoutes);
app.use('/api/meals', mealRoutes);
app.use('/api/calculations', calculationRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', require('./routes/adminRoutes'));

app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
        timestamp: new Date().toISOString()
    });
});

app.use((error, req, res, next) => {
    console.error('Unhandled server error:', error);
    res.status(500).json({
        success: false,
        message: error.message || 'Something went wrong!',
        error
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`📍 API URL: listening on port ${PORT}`);
});
