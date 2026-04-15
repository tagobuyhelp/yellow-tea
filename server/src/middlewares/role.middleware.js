import { ApiError } from '../utils/apiError.js';

/**
 * Middleware to restrict access to specific user roles
 * @param {...string} roles - Roles that are allowed to access the route
 * @returns {function} - Express middleware function
 */
export const restrictTo = (...roles) => {
    return (req, res, next) => {
        // Check if user exists and has a role
        if (!req.user || !req.user.role) {
            return next(new ApiError(403, 'You do not have permission to perform this action'));
        }
        
        // Check if user's role is in the allowed roles
        if (!roles.includes(req.user.role)) {
            return next(new ApiError(403, 'You do not have permission to perform this action'));
        }
        
        next();
    };
};