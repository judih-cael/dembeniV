const express = require('express');
const router = express.Router();
const {
    registerUser,
    loginUser,
    getUserProfile,
    forgotPassword,
    verifyOtp,
    resetPassword,
    cleanupExpiredCodes
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const {
    forgotPasswordLimiter,
    resetPasswordLimiter,
    loginLimiter
} = require('../middleware/rateLimitMiddleware');
const uploadProfile = require('../middleware/uploadProfileMiddleware');

// Public routes
router.post('/register', uploadProfile.single('profileImage'), registerUser);
router.post('/login', loginLimiter, loginUser);

// Protected routes
router.get('/profile', protect, getUserProfile);

// Password reset flow (rate limited)
router.post('/forgot-password', forgotPasswordLimiter, forgotPassword);
router.post('/verify-otp',      resetPasswordLimiter,  verifyOtp);
router.post('/reset-password',  resetPasswordLimiter,  resetPassword);

// Admin/Cron utility
router.delete('/cleanup-expired', protect, cleanupExpiredCodes);

module.exports = router;
