import { validationResult } from 'express-validator';
import { ApiError } from '../utils/apiError.js';

/**
 * Validate request based on express-validator rules
 */
export const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const message = errors.array().map(error => error.msg).join(', ');
        return next(new ApiError(400, message));
    }
    next();
};