const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Admin = require('../models/Admin');

dotenv.config();

const seedAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        
        console.log('Connected to MongoDB');

        // Clear existing admins
        await Admin.deleteMany({});
        console.log('Cleared existing admins');

        // Create default admin
        const admin = await Admin.create({
            name: 'Mess Manager',
            email: 'admin@mess.com',
            password: 'admin123',
            phone: '01700000000',
            role: 'super_admin'
        });

        console.log('✅ Default admin created:');
        console.log('   Email: admin@mess.com');
        console.log('   Password: admin123');
        console.log('   Role: super_admin');

        // Create additional admin
        await Admin.create({
            name: 'Assistant Manager',
            email: 'manager@mess.com',
            password: 'manager123',
            phone: '01700000001',
            role: 'admin'
        });

        console.log('✅ Additional admin created:');
        console.log('   Email: manager@mess.com');
        console.log('   Password: manager123');
        console.log('   Role: admin');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding admin:', error);
        process.exit(1);
    }
};

seedAdmin();