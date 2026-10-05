const express = require('express');
const router = express.Router();
const Member = require('../models/Member');
const { protectAny, writeAccess } = require('../middleware/authMiddleware');

// Get all members
router.get('/', async (req, res) => {
    try {
        const members = await Member.find();
        res.json(members);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Add member
router.post('/', protectAny, writeAccess, async (req, res) => {
    try {
        const member = new Member(req.body);
        const savedMember = await member.save();
        res.status(201).json(savedMember);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update member
router.put('/:id', protectAny, writeAccess, async (req, res) => {
    try {
        const member = await Member.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(member);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete member
router.delete('/:id', protectAny, writeAccess, async (req, res) => {
    try {
        await Member.findByIdAndDelete(req.params.id);
        res.json({ message: 'Member deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Toggle active status
router.patch('/:id/toggle-active', protectAny, writeAccess, async (req, res) => {
    try {
        const member = await Member.findById(req.params.id);
        if (!member) {
            return res.status(404).json({ message: 'Member not found' });
        }

        member.isActive = !member.isActive;
        member.leavingDate = member.isActive ? null : new Date();
        await member.save();
        res.json(member);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;