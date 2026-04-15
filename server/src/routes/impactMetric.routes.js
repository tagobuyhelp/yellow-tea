import express from 'express';
import { 
    createImpactMetric,
    getAllImpactMetrics,
    getImpactMetricById,
    updateImpactMetric,
    deleteImpactMetric,
    getTotalImpact,
    getUserImpact,
    getProductImpact,
    getImpactDashboard,
    batchUpdateImpactMetrics,
    generateImpactReport,
    calculateEnvironmentalSavings,
    getRegionalDistribution
} from '../controllers/impactMetric.controller.js';
import { protect, restrictTo } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Public routes
router.get('/total', getTotalImpact);
router.get('/environmental-savings', calculateEnvironmentalSavings);
router.get('/dashboard', getImpactDashboard);
router.get('/product/:productId', getProductImpact);

// Protected routes (require authentication)
router.use(protect);

// User-specific routes
router.get('/user/:userId', getUserImpact);

// Admin-only routes
router.use(restrictTo('admin'));
router.route('/')
    .get(getAllImpactMetrics)
    .post(createImpactMetric);

router.route('/batch')
    .post(batchUpdateImpactMetrics);

router.get('/report', generateImpactReport);
router.get('/regional-distribution', getRegionalDistribution);

router.route('/:id')
    .get(getImpactMetricById)
    .put(updateImpactMetric)
    .delete(deleteImpactMetric);

export default router;