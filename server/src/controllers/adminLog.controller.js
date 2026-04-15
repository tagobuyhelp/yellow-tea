import mongoose from 'mongoose';
import AdminLog from '../models/adminLog.model.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { ApiError } from '../utils/apiError.js';

/**
 * @desc    Get all admin logs with pagination and filtering
 * @route   GET /api/v1/admin/logs
 * @access  Private/Admin
 */
export const getAllLogs = async (req, res, next) => {
    try {
        // Build query
        const queryObj = { ...req.query };
        
        // Fields to exclude from filtering
        const excludedFields = ['page', 'sort', 'limit', 'fields'];
        excludedFields.forEach(field => delete queryObj[field]);

        // Advanced filtering
        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `${match}`);
        
        let query = AdminLog.find(JSON.parse(queryStr));

        // Populate admin details
        query = query.populate('admin_id', 'name email');

        // Sorting
        if (req.query.sort) {
            const sortBy = req.query.sort.split(',').join(' ');
            query = query.sort(sortBy);
        } else {
            query = query.sort('-timestamp');
        }

        // Field limiting
        if (req.query.fields) {
            const fields = req.query.fields.split(',').join(' ');
            query = query.select(fields);
        } else {
            query = query.select('-__v');
        }

        // Pagination
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 20;
        const skip = (page - 1) * limit;

        query = query.skip(skip).limit(limit);

        // Execute query
        const logs = await query;
        
        // Get total count for pagination
        const total = await AdminLog.countDocuments(JSON.parse(queryStr));

        res.status(200).json(
            new ApiResponse(200, {
                logs,
                pagination: {
                    total,
                    page,
                    limit,
                    pages: Math.ceil(total / limit)
                }
            }, 'Admin logs retrieved successfully')
        );
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get logs by admin ID
 * @route   GET /api/v1/admin/logs/admin/:adminId
 * @access  Private/Admin
 */
export const getLogsByAdmin = async (req, res, next) => {
    try {
        const { adminId } = req.params;
        const limit = parseInt(req.query.limit, 10) || 100;
        
        // Validate admin ID
        if (!mongoose.Types.ObjectId.isValid(adminId)) {
            return next(new ApiError(400, 'Invalid admin ID'));
        }
        
        const logs = await AdminLog.getLogsByAdmin(adminId, limit);
        
        res.status(200).json(
            new ApiResponse(200, logs, 'Admin logs retrieved successfully')
        );
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get logs by action type
 * @route   GET /api/v1/admin/logs/action/:actionType
 * @access  Private/Admin
 */
export const getLogsByActionType = async (req, res, next) => {
    try {
        const { actionType } = req.params;
        const limit = parseInt(req.query.limit, 10) || 100;
        
        // Validate action type
        const validActionTypes = [
            'CREATE_PRODUCT', 'UPDATE_PRODUCT', 'DELETE_PRODUCT',
            'CREATE_USER', 'UPDATE_USER', 'DELETE_USER',
            'UPDATE_ORDER', 'DELETE_ORDER',
            'SYSTEM_CONFIG', 'LOGIN', 'LOGOUT',
            'OTHER'
        ];
        
        if (!validActionTypes.includes(actionType)) {
            return next(new ApiError(400, 'Invalid action type'));
        }
        
        const logs = await AdminLog.getLogsByActionType(actionType, limit);
        
        res.status(200).json(
            new ApiResponse(200, logs, 'Admin logs retrieved successfully')
        );
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get logs by target collection
 * @route   GET /api/v1/admin/logs/collection/:collection
 * @access  Private/Admin
 */
export const getLogsByCollection = async (req, res, next) => {
    try {
        const { collection } = req.params;
        const limit = parseInt(req.query.limit, 10) || 100;
        
        // Validate collection
        const validCollections = ['products', 'users', 'orders', 'system', 'auth', 'other'];
        
        if (!validCollections.includes(collection)) {
            return next(new ApiError(400, 'Invalid collection'));
        }
        
        const logs = await AdminLog.getLogsByCollection(collection, limit);
        
        res.status(200).json(
            new ApiResponse(200, logs, 'Admin logs retrieved successfully')
        );
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get logs by target ID
 * @route   GET /api/v1/admin/logs/target/:targetId
 * @access  Private/Admin
 */
export const getLogsByTargetId = async (req, res, next) => {
    try {
        const { targetId } = req.params;
        const limit = parseInt(req.query.limit, 10) || 100;
        
        // Validate target ID
        if (!mongoose.Types.ObjectId.isValid(targetId)) {
            return next(new ApiError(400, 'Invalid target ID'));
        }
        
        const logs = await AdminLog.getLogsByTargetId(targetId, limit);
        
        res.status(200).json(
            new ApiResponse(200, logs, 'Admin logs retrieved successfully')
        );
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get logs by date range
 * @route   GET /api/v1/admin/logs/date-range
 * @access  Private/Admin
 */
export const getLogsByDateRange = async (req, res, next) => {
    try {
        const { startDate, endDate } = req.query;
        const limit = parseInt(req.query.limit, 10) || 100;
        
        // Validate dates
        if (!startDate || !endDate) {
            return next(new ApiError(400, 'Start date and end date are required'));
        }
        
        // Validate date format
        const isValidDate = (dateStr) => !isNaN(new Date(dateStr).getTime());
        
        if (!isValidDate(startDate) || !isValidDate(endDate)) {
            return next(new ApiError(400, 'Invalid date format. Use YYYY-MM-DD'));
        }
        
        const logs = await AdminLog.getLogsByDateRange(startDate, endDate, limit);
        
        res.status(200).json(
            new ApiResponse(200, logs, 'Admin logs retrieved successfully')
        );
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get activity summary
 * @route   GET /api/v1/admin/logs/activity-summary
 * @access  Private/Admin
 */
export const getActivitySummary = async (req, res, next) => {
    try {
        const days = parseInt(req.query.days, 10) || 30;
        
        // Limit to reasonable range
        if (days < 1 || days > 365) {
            return next(new ApiError(400, 'Days parameter must be between 1 and 365'));
        }
        
        const summary = await AdminLog.getActivitySummary(days);
        
        // Transform data for easier frontend consumption
        const formattedSummary = {};
        
        summary.forEach(item => {
            const { day, action } = item._id;
            
            if (!formattedSummary[day]) {
                formattedSummary[day] = {};
            }
            
            formattedSummary[day][action] = item.count;
        });
        
        res.status(200).json(
            new ApiResponse(200, {
                days,
                summary: formattedSummary
            }, 'Activity summary retrieved successfully')
        );
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Create a new log entry
 * @route   POST /api/v1/admin/logs
 * @access  Private/Admin
 */
export const createLog = async (req, res, next) => {
    try {
        const { actionType, targetCollection, targetId, details } = req.body;
        
        // Validate required fields
        if (!actionType || !targetCollection || !details) {
            return next(new ApiError(400, 'Action type, target collection, and details are required'));
        }
        
        // Create log entry
        const log = await AdminLog.createLog(
            req.user.id, // Current admin user
            actionType,
            targetCollection,
            targetId || null,
            details,
            req
        );
        
        res.status(201).json(
            new ApiResponse(201, log, 'Admin log created successfully')
        );
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get admin activity dashboard data
 * @route   GET /api/v1/admin/logs/dashboard
 * @access  Private/Admin
 */
export const getDashboardData = async (req, res, next) => {
    try {
        // Get recent activity (last 24 hours)
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        const recentActivity = await AdminLog.find({
            timestamp: { $gte: yesterday }
        })
            .sort('-timestamp')
            .limit(10)
            .populate('admin_id', 'name email');
        
        // Get activity counts by type (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const activityCounts = await AdminLog.aggregate([
            {
                $match: {
                    timestamp: { $gte: thirtyDaysAgo }
                }
            },
            {
                $group: {
                    _id: '$action_type',
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { count: -1 }
            }
        ]);
        
        // Get top active admins (last 30 days)
        const topAdmins = await AdminLog.aggregate([
            {
                $match: {
                    timestamp: { $gte: thirtyDaysAgo }
                }
            },
            {
                $group: {
                    _id: '$admin_id',
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { count: -1 }
            },
            {
                $limit: 5
            },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'admin'
                }
            },
            {
                $unwind: '$admin'
            },
            {
                $project: {
                    _id: 1,
                    count: 1,
                    name: '$admin.name',
                    email: '$admin.email'
                }
            }
        ]);

        res.status(200).json(
            new ApiResponse(200, {
                recentActivity,
                activityCounts,
                topAdmins
            }, 'Admin activity dashboard data retrieved successfully')
        );
    } catch (error) {
        next(error);
    }
};