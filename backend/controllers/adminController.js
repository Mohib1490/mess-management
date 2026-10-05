const Admin = require('../models/Admin');
const Member = require('../models/Member');
const { generateToken } = require('../middleware/authMiddleware');
const { generateMemberToken } = require('../middleware/authMiddleware');

// @desc    Register admin
// @route   POST /api/admin/register
// @access  Public
const registerAdmin = async (req, res) => {
    try {
        const { name, email, password, phone, role } = req.body;

        // Check if admin exists
        const adminExists = await Admin.findOne({ email });
        if (adminExists) {
            return res.status(400).json({
                success: false,
                message: 'Admin already exists with this email'
            });
        }

        // Create admin
        const admin = await Admin.create({
            name,
            email,
            password,
            phone,
            role: role || 'admin'
        });

        if (admin) {
            res.status(201).json({
                success: true,
                data: {
                    _id: admin._id,
                    name: admin.name,
                    email: admin.email,
                    role: admin.role,
                    token: generateToken(admin._id)
                }
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// @desc    Login admin
// @route   POST /api/admin/login
// @access  Public
const loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check for admin email
        const admin = await Admin.findOne({ email });

        if (!admin) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Check if admin is active
        if (!admin.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Account is deactivated. Contact super admin.'
            });
        }

        // Check password
        const isMatch = await admin.matchPassword(password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Update last login
        admin.lastLogin = new Date();
        admin.loginHistory.push({
            ip: req.ip,
            userAgent: req.headers['user-agent'],
            timestamp: new Date()
        });
        await admin.save();

        res.json({
            success: true,
            data: {
                _id: admin._id,
                name: admin.name,
                email: admin.email,
                phone: admin.phone,
                role: admin.role,
                isActive: admin.isActive,
                lastLogin: admin.lastLogin,
                token: generateToken(admin._id)
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// @desc    Get admin profile
// @route   GET /api/admin/profile
// @access  Private
const getAdminProfile = async (req, res) => {
    try {
        const admin = await Admin.findById(req.admin._id).select('-password');

        if (admin) {
            res.json({
                success: true,
                data: admin
            });
        } else {
            res.status(404).json({
                success: false,
                message: 'Admin not found'
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// @desc    Update admin profile
// @route   PUT /api/admin/profile
// @access  Private
const updateAdminProfile = async (req, res) => {
    try {
        const admin = await Admin.findById(req.admin._id);

        if (admin) {
            admin.name = req.body.name || admin.name;
            admin.email = req.body.email || admin.email;
            admin.phone = req.body.phone || admin.phone;

            if (req.body.password) {
                admin.password = req.body.password;
            }

            const updatedAdmin = await admin.save();

            res.json({
                success: true,
                data: {
                    _id: updatedAdmin._id,
                    name: updatedAdmin.name,
                    email: updatedAdmin.email,
                    phone: updatedAdmin.phone,
                    role: updatedAdmin.role,
                    token: generateToken(updatedAdmin._id)
                }
            });
        } else {
            res.status(404).json({
                success: false,
                message: 'Admin not found'
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// @desc    Get all admins (Super Admin only)
// @route   GET /api/admin/all
// @access  Private/Super Admin
const getAllAdmins = async (req, res) => {
    try {
        const admins = await Admin.find({}).select('-password');
        res.json({
            success: true,
            count: admins.length,
            data: admins
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// @desc    Logout admin
// @route   POST /api/admin/logout
// @access  Private
const logoutAdmin = async (req, res) => {
    try {
        // In a real app, you might want to blacklist the token
        res.json({
            success: true,
            message: 'Logged out successfully'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

const loginMember = async (req, res) => {
    try {
        const { phone, password } = req.body;
        const member = await Member.findOne({ phone, isActive: true }).select('+password');

        if (!member || !member.password || !(await member.matchPassword(password))) {
            return res.status(401).json({ success: false, message: 'Invalid member ID or password' });
        }

        res.json({
            success: true,
            data: {
                _id: member._id,
                name: member.name,
                phone: member.phone,
                email: member.email,
                role: 'member',
                isActive: member.isActive,
                token: generateMemberToken(member._id)
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

module.exports = {
    registerAdmin,
    loginAdmin,
    getAdminProfile,
    updateAdminProfile,
    getAllAdmins,
    logoutAdmin
    ,loginMember
};