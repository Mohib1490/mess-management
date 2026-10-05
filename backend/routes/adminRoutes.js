const express = require('express');
const router = express.Router();
const {
    registerAdmin,
    loginAdmin,
    getAdminProfile,
    updateAdminProfile,
    getAllAdmins,
    logoutAdmin
    ,loginMember
} = require('../controllers/adminController');
const { protect, adminOnly, profileEditAccess } = require('../middleware/authMiddleware');

// Public routes
router.post('/register', registerAdmin);
router.post('/login', loginAdmin);
router.post('/member-login', loginMember);

// Protected routes
router.get('/profile', protect, getAdminProfile);
router.put('/profile', protect, profileEditAccess, updateAdminProfile);
router.post('/logout', protect, logoutAdmin);

// Super admin routes
router.get('/all', protect, adminOnly, getAllAdmins);

module.exports = router;