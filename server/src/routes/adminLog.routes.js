import express from 'express';
import {
    getAllLogs,
    getLogsByAdmin,
    getLogsByActionType,
    getLogsByCollection,
    getLogsByTargetId,
    getLogsByDateRange,
    getActivitySummary,
    createLog,
    getDashboardData
} from '../controllers/adminLog.controller.js';
import { isAuthenticated } from '../middlewares/auth.middleware.js';
import { restrictTo } from '../middlewares/role.middleware.js';

const router = express.Router();

// All routes require authentication and admin role
router.use(isAuthenticated, restrictTo('admin', 'super-admin'));

// Dashboard data
router.get('/dashboard', getDashboardData);

// Activity summary
router.get('/activity-summary', getActivitySummary);

// Filtered logs
router.get('/admin/:adminId', getLogsByAdmin);
router.get('/action/:actionType', getLogsByActionType);
router.get('/collection/:collection', getLogsByCollection);
router.get('/target/:targetId', getLogsByTargetId);
router.get('/date-range', getLogsByDateRange);

// Create log entry
router.post('/', createLog);

// Get all logs (with pagination and filtering)
router.get('/', getAllLogs);

export default router;