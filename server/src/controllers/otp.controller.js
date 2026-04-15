import User from '../models/user.model.js';
import { ApiError } from '../utils/apiError.js';
import { ApiResponse } from '../utils/apiResponse.js';

/**
 * @desc    Send OTP to phone number
 * @route   POST /api/v1/auth/send-otp
 * @access  Public
 */
export const sendOTP = async (req, res, next) => {
    return res.status(400).json(
        new ApiResponse(400, null, 'OTP sending is not supported by this server.')
    );
};

/**
 * @desc    Verify OTP and login/register user
 * @route   POST /api/v1/auth/verify-otp
 * @access  Public
 */
export const verifyOTP = async (req, res, next) => {
    return res.status(501).json(
        new ApiResponse(501, null, 'OTP verification is disabled.')
    );
};

/**
 * @desc    Link phone number to existing account
 * @route   POST /api/v1/auth/link-phone
 * @access  Private
 */
export const linkPhoneToAccount = async (req, res, next) => {
    return res.status(501).json(
        new ApiResponse(501, null, 'Phone linking is disabled.')
    );
};