const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');

dotenv.config();

const accounts = [
    { name: 'Mess Manager', email: 'admin@mess.com', password: 'admin123', phone: '01700000000', role: 'super_admin' },
    { name: 'Assistant Manager', email: 'manager@mess.com', password: 'manager123', phone: '01700000001', role: 'admin' },
    { name: 'Mess Viewer', email: 'viewer@mess.com', password: 'viewer123', phone: '01700000002', role: 'viewer' }
];

const seedAccounts = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        for (const account of accounts) {
            await Admin.updateOne(
                { email: account.email },
                { $set: { ...account, password: await bcrypt.hash(account.password, 10), isActive: true } },
                { upsert: true }
            );
            console.log(`${account.role}: ${account.email} / ${account.password}`);
        }
        await mongoose.disconnect();
    } catch (error) {
        console.error('Failed to seed accounts:', error);
        process.exit(1);
    }
};

seedAccounts();
