import admin from '../config/firebase.config.js';
import User from '../models/user.model.js';
import { ApiError } from '../utils/apiError.js';
import { ApiResponse } from '../utils/apiResponse.js';

/**
 * @desc    Send OTP to phone number
 * @route   POST /api/v1/auth/send-otp
 * @access  Public
 */
export const sendOTP = async (req, res, next) => {
    // The backend does not send OTPs. Use Firebase Auth client SDK on the frontend/mobile app to send OTP.
    return res.status(400).json(
        new ApiResponse(400, null, 'Send OTP using Firebase Auth client SDK on the frontend.')
    );
};

/**
 * @desc    Verify OTP and login/register user
 * @route   POST /api/v1/auth/verify-otp
 * @access  Public
 */
export const verifyOTP = async (req, res, next) => {
    try {
        const { idToken } = req.body;
        if (!idToken) {
            return next(new ApiError(400, 'Firebase ID token is required'));
        }
        // Verify the ID token with Firebase Admin SDK
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const phoneNumber = decodedToken.phone_number;
        if (!phoneNumber) {
            return next(new ApiError(400, 'Invalid ID token: phone number not found'));
        }
        // Check if user exists
        let user = await User.findOne({ phoneNumber });
        if (!user) {
            // Create new user if not exists
            user = await User.create({
                phoneNumber,
                isPhoneVerified: true
            });
        } else {
            // Update phone verification status
            user.isPhoneVerified = true;
            await user.save();
        }
        // Generate token and send response (using your existing method)
        const { createSendToken } = await import('./auth.controller.js');
        createSendToken(user, 200, res);
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Link phone number to existing account
 * @route   POST /api/v1/auth/link-phone
 * @access  Private
 */
export const linkPhoneToAccount = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { idToken } = req.body;
        if (!idToken) {
            return next(new ApiError(400, 'Firebase ID token is required'));
        }
        // Verify the ID token with Firebase Admin SDK
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const phoneNumber = decodedToken.phone_number;
        if (!phoneNumber) {
            return next(new ApiError(400, 'Invalid ID token: phone number not found'));
        }
        // Check if phone number is already used by another account
        const existingUser = await User.findOne({ phoneNumber });
        if (existingUser && existingUser._id.toString() !== userId) {
            return next(new ApiError(400, 'Phone number is already linked to another account'));
        }
        // Update user
        const user = await User.findByIdAndUpdate(
            userId,
            {
                phoneNumber,
                isPhoneVerified: true
            },
            { new: true }
        );
        if (!user) {
            return next(new ApiError(404, 'User not found'));
        }
        res.status(200).json(
            new ApiResponse(200, user, 'Phone number linked successfully')
        );
    } catch (error) {
        next(error);
    }
};