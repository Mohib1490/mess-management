const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Member = require('../models/Member');

dotenv.config();

const members = [
    // 6 members with 3000 Tk rent
    {
        name: 'Rahim Uddin',
        phone: '01711111111',
        email: 'rahim@email.com',
        joinDate: new Date('2024-01-01'),
        seatRent: 3000,
        seatType: 'regular',
        isActive: true
    },
    {
        name: 'Karim Mia',
        phone: '01722222222',
        email: 'karim@email.com',
        joinDate: new Date('2024-01-01'),
        seatRent: 3000,
        seatType: 'regular',
        isActive: true
    },
    {
        name: 'Jabbar Khan',
        phone: '01733333333',
        email: 'jabbar@email.com',
        joinDate: new Date('2024-01-15'),
        seatRent: 3000,
        seatType: 'regular',
        isActive: true
    },
    {
        name: 'Salam Ahmed',
        phone: '01744444444',
        email: 'salam@email.com',
        joinDate: new Date('2024-02-01'),
        seatRent: 3000,
        seatType: 'regular',
        isActive: true
    },
    {
        name: 'Rafiq Islam',
        phone: '01755555555',
        email: 'rafiq@email.com',
        joinDate: new Date('2024-02-15'),
        seatRent: 3000,
        seatType: 'regular',
        isActive: true
    },
    {
        name: 'Sohel Rana',
        phone: '01766666666',
        email: 'sohel@email.com',
        joinDate: new Date('2024-03-01'),
        seatRent: 3000,
        seatType: 'regular',
        isActive: true
    },
    // 1 member with 2000 Tk rent (special seat)
    {
        name: 'Masud Parvez',
        phone: '01777777777',
        email: 'masud@email.com',
        joinDate: new Date('2024-03-15'),
        seatRent: 2000,
        seatType: 'special',
        isActive: true
    }
];

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        
        console.log('Connected to MongoDB Atlas');
        
        // Clear existing members
        await Member.deleteMany({});
        console.log('Cleared existing members');
        
        // Insert new members
        const insertedMembers = await Member.insertMany(members);
        console.log(`✅ Successfully seeded ${insertedMembers.length} members`);
        console.log('📋 Member Details:');
        insertedMembers.forEach(member => {
            console.log(`  - ${member.name} (${member.phone}) - Rent: ${member.seatRent} Tk - Type: ${member.seatType}`);
        });
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
};

seedDB();