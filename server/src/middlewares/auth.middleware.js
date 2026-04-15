import jwt from 'jsonwebtoken';
import { promisify } from 'util';
import mongoose from 'mongoose';
import User from '../models/user.model.js';
import { ApiError } from '../utils/apiError.js';

/**
 * Middleware to protect routes - requires user to be logged in
 */
export const protect = async (req, res, next) => {
    try {
        // 1) Get token from headers
        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        } else if (req.cookies?.jwt) {
            token = req.cookies.jwt;
        }

        if (!token) {
            return next(new ApiError(401, 'You are not logged in. Please log in to get access.'));
        }

        // 2) Verify token
        const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

        // 3) Check if user still exists
        const currentUser = await User.findById(decoded.id);
        if (!currentUser) {
            return next(new ApiError(401, 'The user belonging to this token no longer exists.'));
        }

        // 4) Check if user changed password after the token was issued
        if (currentUser.changedPasswordAfter(decoded.iat)) {
            return next(new ApiError(401, 'User recently changed password. Please log in again.'));
        }

        // GRANT ACCESS TO PROTECTED ROUTE
        req.user = currentUser;
        res.locals.user = currentUser;
        next();
    } catch (error) {
        next(new ApiError(401, 'Not authorized to access this route'));
    }
};

/**
 * Alias for protect middleware to maintain backward compatibility
 */
export const isAuthenticated = protect;

/**
 * Middleware to restrict access to certain roles
 * @param  {...String} roles - Roles allowed to access the route
 */
export const restrictTo = (...roles) => {
    return (req, res, next) => {
        // roles is an array ['admin', 'lead-guide']
        if (!roles.includes(req.user.role)) {
            return next(new ApiError(403, 'You do not have permission to perform this action'));
        }
        next();
    };
};

/**
 * Middleware to check if user is logged in (for rendered pages, no errors)
 */
export const isLoggedIn = async (req, res, next) => {
    try {
        if (req.cookies.jwt) {
            // 1) Verify token
            const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);

            // 2) Check if user still exists
            const currentUser = await User.findById(decoded.id);
            if (!currentUser) {
                return next();
            }

            // 3) Check if user changed password after the token was issued
            if (currentUser.changedPasswordAfter(decoded.iat)) {
                return next();
            }

            // THERE IS A LOGGED IN USER
            res.locals.user = currentUser;
            req.user = currentUser;
            return next();
        }
        next();
    } catch (error) {
        next();
    }
};

/**
 * Middleware to check if user owns the resource or is admin
 * @param {String} modelName - Name of the model to check ownership
 * @param {String} paramName - Name of the parameter containing the resource ID
 */
export const checkOwnership = (modelName, paramName = 'id') => {
    return async (req, res, next) => {
        try {
            const Model = mongoose.model(modelName);
            const resourceId = req.params[paramName];
            
            const resource = await Model.findById(resourceId);
            
            if (!resource) {
                return next(new ApiError(404, `${modelName} not found`));
            }
            
            // Check if user is owner or admin
            const isOwner = resource.user && resource.user.toString() === req.user.id;
            const isAdmin = req.user.role === 'admin';
            
            if (!isOwner && !isAdmin) {
                return next(new ApiError(403, 'You do not have permission to perform this action'));
            }
            
            req.resource = resource;
            next();
        } catch (error) {
            next(error);
        }
    };
};