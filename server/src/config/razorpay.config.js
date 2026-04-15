import Razorpay from 'razorpay';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Razorpay instance
export const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Razorpay configuration constants
export const RAZORPAY_CONFIG = {
    currency: 'INR',
    name: 'Yellow Tea',
    description: 'Premium Tea Products',
    image: 'https://your-logo-url.com/logo.png', // Replace with your logo URL
    theme: {
        color: '#3399cc'
    }
};

// Validate Razorpay configuration
export const validateRazorpayConfig = () => {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
        throw new Error('Razorpay configuration is missing. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in your environment variables.');
    }
};

// Helper function to format amount for Razorpay (amount in paise)
export const formatAmountForRazorpay = (amount) => {
    return Math.round(amount * 100); // Convert to paise
};

// Helper function to format amount from Razorpay (amount in paise to rupees)
export const formatAmountFromRazorpay = (amount) => {
    return amount / 100; // Convert from paise to rupees
}; 