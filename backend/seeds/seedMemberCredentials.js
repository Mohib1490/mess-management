const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Member = require('../models/Member');

dotenv.config();

const seedMemberCredentials = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const members = await Member.find({ isActive: true }).select('+password');

        for (const member of members) {
            const password = `Mess@${member.phone.slice(-4)}`;
            member.password = password;
            await member.save();
            console.log(`${member.name}: ID ${member.phone}, password ${password}`);
        }

        console.log(`Created credentials for ${members.length} active members.`);
        process.exit(0);
    } catch (error) {
        console.error('Failed to create member credentials:', error);
        process.exit(1);
    }
};

seedMemberCredentials();
