import express from 'express';
import {
    createRazorpayOrder,
    verifyPayment,
    getPaymentStatus,
    processRefund,
    getPaymentMethods,
    getPaymentAnalytics
} from '../controllers/payment.controller.js';
import { protect, restrictTo } from '../middlewares/auth.middleware.js';
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();

// Public routes
router.get('/methods', getPaymentMethods);
router.get('/razorpay-key', (req, res) => {
    const keyId = process.env.RAZORPAY_KEY_ID;
    if (!keyId) {
        return res.status(500).json({
            status: 'error',
            statusCode: 500,
            message: 'Razorpay Key ID not configured',
        });
    }
    res.status(200).json({
        status: 'success',
        statusCode: 200,
        key: keyId
    });
});

// Test endpoint for debugging payment verification
router.post('/test-verify', (req, res) => {
    console.log('Test verification request body:', req.body);
    res.status(200).json({
        status: 'success',
        message: 'Test verification endpoint - request received',
        receivedData: req.body
    });
});

// Protected routes
router.use(protect);

// Payment processing routes
router.post('/create-order', createRazorpayOrder);
router.post('/verify', verifyPayment);
router.get('/status/:orderId', getPaymentStatus);

// Admin only routes
router.post('/refund', restrictTo('admin'), processRefund);
router.get('/analytics', restrictTo('admin'), getPaymentAnalytics);

export default router; 