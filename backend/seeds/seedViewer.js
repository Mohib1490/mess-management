const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');

dotenv.config();

const seedViewer = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        let viewer = await Admin.findOne({ email: 'viewer@mess.com' });
        if (!viewer) {
            viewer = new Admin({ email: 'viewer@mess.com' });
        }
        viewer.name = 'Mess Viewer';
        viewer.password = await bcrypt.hash('viewer123', 10);
        viewer.phone = '01700000002';
        viewer.role = 'viewer';
        viewer.isActive = true;
        await Admin.updateOne({ email: viewer.email }, {
            $set: {
                name: viewer.name,
                password: viewer.password,
                phone: viewer.phone,
                role: viewer.role,
                isActive: viewer.isActive
            }
        }, { upsert: true });
        console.log(`Read-only viewer ready: ${viewer.email} / viewer123`);
        await mongoose.disconnect();
    } catch (error) {
        console.error('Failed to create viewer:', error);
        process.exit(1);
    }
};

seedViewer();
