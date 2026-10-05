const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const Member = require('../models/Member');

// Protect routes
const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Get admin from token
            req.admin = await Admin.findById(decoded.id).select('-password');

            if (!req.admin) {
                return res.status(401).json({
                    success: false,
                    message: 'Not authorized, admin not found'
                });
            }

            next();
        } catch (error) {
            console.error(error);
            res.status(401).json({
                success: false,
                message: 'Not authorized, token failed'
            });
        }
    }

    if (!token) {
        res.status(401).json({
            success: false,
            message: 'Not authorized, no token'
        });
    }
};

const protectAny = async (req, res, next) => {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: 'Not authorized, no token' });
    }

    try {
        const decoded = jwt.verify(header.split(' ')[1], process.env.JWT_SECRET);
        if (decoded.type === 'member') {
            req.member = await Member.findById(decoded.id).select('-password');
            if (!req.member || !req.member.isActive) {
                return res.status(401).json({ success: false, message: 'Member account is inactive or missing' });
            }
        } else {
            req.admin = await Admin.findById(decoded.id).select('-password');
            if (!req.admin || !req.admin.isActive) {
                return res.status(401).json({ success: false, message: 'Admin account is inactive or missing' });
            }
        }
        next();
    } catch (error) {
        console.error(error);
        return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
    }
};

// Admin only middleware
const adminOnly = (req, res, next) => {
    if (req.admin && (req.admin.role === 'admin' || req.admin.role === 'super_admin')) {
        next();
    } else {
        res.status(403).json({
            success: false,
            message: 'Not authorized as admin'
        });
    }
};

const writeAccess = (req, res, next) => {
    if (req.admin && ['admin', 'super_admin'].includes(req.admin.role)) {
        return next();
    }
    res.status(403).json({ success: false, message: 'Read-only access' });
};

const profileEditAccess = (req, res, next) => {
    if (req.admin && ['admin', 'super_admin', 'manager'].includes(req.admin.role)) {
        return next();
    }
    return res.status(403).json({ success: false, message: 'Read-only access' });
};

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });
};

const generateMemberToken = (id) => jwt.sign({ id, type: 'member' }, process.env.JWT_SECRET, {
    expiresIn: '30d'
});

module.exports = { protect, protectAny, adminOnly, writeAccess, profileEditAccess, generateToken, generateMemberToken };