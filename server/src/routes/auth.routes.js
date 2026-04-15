import express from 'express';
import {
    register,
    login,
    logout,
    verifyEmail,
    forgotPassword,
    resetPassword,
    updatePassword,
    getMe,
    updateMe,
    deleteMe
} from '../controllers/auth.controller.js';
import { protect, isAuthenticated } from '../middlewares/auth.middleware.js';
import { sendOTP, verifyOTP, linkPhoneToAccount } from '../controllers/otp.controller.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.get('/logout', logout);
router.get('/verify-email/:token', verifyEmail);
router.post('/forgot-password', forgotPassword);
router.patch('/reset-password/:token', resetPassword);


// OTP routes
router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);
router.post('/link-phone', isAuthenticated, linkPhoneToAccount);

// Protected routes
router.use(protect); // All routes below this middleware require authentication
router.get('/me', getMe);
router.patch('/update-me', updateMe);
router.patch('/update-password', updatePassword);
router.delete('/delete-me', deleteMe);

export default router;