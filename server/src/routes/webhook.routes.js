import express from 'express';
import {
    handleRazorpayWebhook,
    testWebhook
} from '../controllers/webhook.controller.js';

const router = express.Router();

// Webhook routes (no authentication required, but signature verification is done)
router.post('/razorpay', handleRazorpayWebhook);
router.post('/test', testWebhook);

export default router; 