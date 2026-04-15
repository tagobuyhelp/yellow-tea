import User from '../models/user.model.js';
import { ApiError } from '../utils/apiError.js';
import { ApiResponse } from '../utils/apiResponse.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { sendEmail } from '../utils/sendEmail.js';

// Generate JWT token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
};

// Create and send token response
const createSendToken = (user, statusCode, res) => {
    const token = generateToken(user._id);

    // Remove password from output
    user.password = undefined;

    // Set cookie options
    const cookieOptions = {
        expires: new Date(
            Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
        ),
        httpOnly: true
    };

    // Set secure flag in production
    if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

    // Send cookie
    res.cookie('jwt', token, cookieOptions);

    // Send response
    res.status(statusCode).json(
        new ApiResponse(statusCode, {
            user,
            token
        }, 'Success')
    );
};

/**
 * @desc    Register a new user
 * @route   POST /api/v1/auth/register
 * @access  Public
 */
export const register = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return next(new ApiError(400, 'Email already in use'));
        }

        // Create new user
        const user = await User.create({
            name,
            email,
            password
        });

        // Generate verification token
        const verificationToken = user.createEmailVerificationToken();
        await user.save({ validateBeforeSave: false });

        // Create verification URL
        const verificationURL = `${req.protocol}://${req.get('host')}/api/v1/auth/verify-email/${verificationToken}`;

        // Send verification email
        try {
            await sendEmail({
                email: user.email,
                subject: 'Email Verification',
                message: `Please verify your email by clicking on the following link: ${verificationURL}`
            });

            createSendToken(user, 201, res);
        } catch (error) {
            user.emailVerificationToken = undefined;
            user.emailVerificationExpires = undefined;
            await user.save({ validateBeforeSave: false });

            return next(new ApiError(500, 'Error sending verification email'));
        }
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Login user
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Check if email and password exist
        if (!email || !password) {
            return next(new ApiError(400, 'Please provide email and password'));
        }

        // Check if user exists and password is correct
        const user = await User.findOne({ email }).select('+password');

        if (!user || !(await user.isPasswordCorrect(password))) {
            return next(new ApiError(401, 'Incorrect email or password'));
        }

        // Generate token and send response
        createSendToken(user, 200, res);
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Logout user
 * @route   GET /api/v1/auth/logout
 * @access  Private
 */
export const logout = (req, res) => {
    res.cookie('jwt', 'loggedout', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    });

    res.status(200).json(
        new ApiResponse(200, null, 'Logged out successfully')
    );
};

/**
 * @desc    Verify email
 * @route   GET /api/v1/auth/verify-email/:token
 * @access  Public
 */
export const verifyEmail = async (req, res, next) => {
    try {
        const { token } = req.params;

        // Hash the token
        const hashedToken = crypto
            .createHash('sha256')
            .update(token)
            .digest('hex');

        // Find user with the token
        const user = await User.findOne({
            emailVerificationToken: hashedToken,
            emailVerificationExpires: { $gt: Date.now() }
        });

        if (!user) {
            return next(new ApiError(400, 'Token is invalid or has expired'));
        }

        // Update user
        user.isEmailVerified = true;
        user.emailVerificationToken = undefined;
        user.emailVerificationExpires = undefined;
        await user.save();

        res.status(200).json(
            new ApiResponse(200, null, 'Email verified successfully')
        );
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Forgot password
 * @route   POST /api/v1/auth/forgot-password
 * @access  Public
 */
export const forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;

        // Find user by email
        const user = await User.findOne({ email });

        if (!user) {
            return next(new ApiError(404, 'No user found with that email'));
        }

        // Generate reset token
        const resetToken = user.createPasswordResetToken();
        await user.save({ validateBeforeSave: false });

        // Create reset URL
        const resetURL = `${req.protocol}://${req.get('host')}/api/v1/auth/reset-password/${resetToken}`;

        // Send email
        try {
            await sendEmail({
                email: user.email,
                subject: 'Password Reset',
                message: `Forgot your password? Submit a request with your new password to: ${resetURL}`
            });

            res.status(200).json(
                new ApiResponse(200, null, 'Password reset token sent to email')
            );
        } catch (error) {
            user.passwordResetToken = undefined;
            user.passwordResetExpires = undefined;
            await user.save({ validateBeforeSave: false });

            return next(new ApiError(500, 'Error sending email'));
        }
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Reset password
 * @route   PATCH /api/v1/auth/reset-password/:token
 * @access  Public
 */
export const resetPassword = async (req, res, next) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        // Hash the token
        const hashedToken = crypto
            .createHash('sha256')
            .update(token)
            .digest('hex');

        // Find user with the token
        const user = await User.findOne({
            passwordResetToken: hashedToken,
            passwordResetExpires: { $gt: Date.now() }
        });

        if (!user) {
            return next(new ApiError(400, 'Token is invalid or has expired'));
        }

        // Update user
        user.password = password;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save();

        // Log the user in
        createSendToken(user, 200, res);
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update password
 * @route   PATCH /api/v1/auth/update-password
 * @access  Private
 */
export const updatePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;

        // Get user from collection
        const user = await User.findById(req.user.id).select('+password');

        // Check if current password is correct
        if (!(await user.isPasswordCorrect(currentPassword))) {
            return next(new ApiError(401, 'Current password is incorrect'));
        }

        // Update password
        user.password = newPassword;
        await user.save();

        // Log user in with new token
        createSendToken(user, 200, res);
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get current user
 * @route   GET /api/v1/auth/me
 * @access  Private
 */
export const getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);

        res.status(200).json(
            new ApiResponse(200, user, 'User details retrieved successfully')
        );
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update user details
 * @route   PATCH /api/v1/auth/update-me
 * @access  Private
 */
export const updateMe = async (req, res, next) => {
    try {
        // Check if user is trying to update password
        if (req.body.password) {
            return next(new ApiError(400, 'This route is not for password updates. Please use /update-password'));
        }

        // Filter unwanted fields
        const filteredBody = filterObj(req.body, 'name', 'email', 'phone');

        // Update user
        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            filteredBody,
            { new: true, runValidators: true }
        );

        res.status(200).json(
            new ApiResponse(200, updatedUser, 'User updated successfully')
        );
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Delete current user (set inactive)
 * @route   DELETE /api/v1/auth/delete-me
 * @access  Private
 */
export const deleteMe = async (req, res, next) => {
    try {
        await User.findByIdAndUpdate(req.user.id, { active: false });

        res.status(204).json(
            new ApiResponse(204, null, 'User deleted successfully')
        );
    } catch (error) {
        next(error);
    }
};

// Helper function to filter object
const filterObj = (obj, ...allowedFields) => {
    const newObj = {};
    Object.keys(obj).forEach(key => {
        if (allowedFields.includes(key)) newObj[key] = obj[key];
    });
    return newObj;
};