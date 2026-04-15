import express from 'express';
import multer from 'multer';
import {
    updateAvatar,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    getWishlist,
    addToWishlist,
    removeFromWishlist,
    updateUserRole,
    deleteUser,
    getUserOrders,
    getUserDashboard,
    updatePassword,
    getUserNotifications,
    markNotificationAsRead,
    deleteNotification,
    updateEmailPreferences,
    getUserByEmail,
    searchUsers,
    getUserStats
} from '../controllers/user.controller.js';
import { isAuthenticated } from '../middlewares/auth.middleware.js';
import { restrictTo } from '../middlewares/role.middleware.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
    storage,
    limits: { fileSize: 2 * 1024 * 1024 } // 2MB limit for avatars
});

// User profile routes
router.route('/avatar')
    .put(isAuthenticated, upload.single('avatar'), updateAvatar);

router.route('/address')
    .put(isAuthenticated, updateAddress);

router.route('/address/:addressId')
    .delete(isAuthenticated, deleteAddress);

router.route('/address/:addressId/default')
    .put(isAuthenticated, setDefaultAddress);

router.route('/wishlist')
    .get(isAuthenticated, getWishlist)
    .post(isAuthenticated, addToWishlist);

router.route('/wishlist/:productId')
    .delete(isAuthenticated, removeFromWishlist);

router.route('/orders')
    .get(isAuthenticated, getUserOrders);

router.route('/dashboard')
    .get(isAuthenticated, getUserDashboard);

router.route('/password')
    .put(isAuthenticated, updatePassword);

router.route('/notifications')
    .get(isAuthenticated, getUserNotifications);

router.route('/notifications/:notificationId')
    .put(isAuthenticated, markNotificationAsRead)
    .delete(isAuthenticated, deleteNotification);

router.route('/email-preferences')
    .put(isAuthenticated, updateEmailPreferences);

// Admin routes
router.route('/stats')
    .get(isAuthenticated, restrictTo('admin'), getUserStats);

router.route('/search')
    .get(isAuthenticated, restrictTo('admin'), searchUsers);

router.route('/email/:email')
    .get(isAuthenticated, restrictTo('admin'), getUserByEmail);

router.route('/:id/role')
    .put(isAuthenticated, restrictTo('admin'), updateUserRole);

router.route('/:id')
    .delete(isAuthenticated, restrictTo('admin'), deleteUser);

export default router;