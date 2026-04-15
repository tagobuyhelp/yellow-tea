import express from 'express';
import {
    // Dashboard
    getAdminDashboard,
    
    // Customers
    getAllCustomers,
    getCustomerById,
    updateCustomer,
    deleteCustomer,
    
    // Orders
    getAllOrders,
    getOrderById,
    updateOrderStatus,
    getOrderStats,
    
    // Products
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    getProductStats,
    
    // Logs
    getAdminLogs,
    
    // User Management
    updateUserRole,
    deleteUser,
    
    // Analytics
    getAnalytics,
    
    // System Operations
    getSystemHealth,
    clearCache,
    getAdminSettings
} from '../controllers/admin.controller.js';
import { isAuthenticated } from '../middlewares/auth.middleware.js';
import { restrictTo } from '../middlewares/role.middleware.js';
import { uploadMultiplePhotos } from '../middlewares/photoUpload.middleware.js';

const router = express.Router();

// All admin routes require authentication and admin role
router.use(isAuthenticated, restrictTo('admin'));

// ==================== DASHBOARD ====================
router.get('/dashboard', getAdminDashboard);

// ==================== CUSTOMERS (USERS) ====================
router.route('/customers')
    .get(getAllCustomers);

router.route('/customers/:id')
    .get(getCustomerById)
    .put(updateCustomer)
    .delete(deleteCustomer);

// ==================== ORDERS ====================
router.route('/orders')
    .get(getAllOrders);

router.route('/orders/stats')
    .get(getOrderStats);

router.route('/orders/:id')
    .get(getOrderById);

router.route('/orders/:id/status')
    .put(updateOrderStatus);

// ==================== PRODUCTS ====================
router.route('/products')
    .get(getAllProducts)
    .post(uploadMultiplePhotos, createProduct);

router.route('/products/stats')
    .get(getProductStats);

router.route('/products/:id')
    .get(getProductById)
    .put(uploadMultiplePhotos, updateProduct)
    .delete(deleteProduct);

// ==================== LOGS ====================
router.get('/logs', getAdminLogs);

// ==================== USER MANAGEMENT ====================
router.route('/users/:id/role')
    .put(updateUserRole);

router.route('/users/:id')
    .delete(deleteUser);

// ==================== ANALYTICS ====================
router.get('/analytics', getAnalytics);

// ==================== SETTINGS ====================
router.get('/settings', getAdminSettings);

// ==================== SYSTEM OPERATIONS ====================
router.get('/system/health', getSystemHealth);
router.post('/system/cache/clear', clearCache);

export default router; 