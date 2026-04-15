import mongoose from 'mongoose';
import User from '../models/user.model.js';
import uploadToCloudinary from '../utils/uploadToCloudinary.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { ApiError } from '../utils/apiError.js';
/**
 * @desc    Update user avatar
 * @route   PUT /api/v1/users/avatar
 * @access  Private
 */
export const updateAvatar = async (req, res, next) => {
    try {
        const userId = req.user.id;

        if (!req.file) {
            return next(new ApiError(400, 'Please upload an image'));
        }

        // Upload image to Cloudinary
        const result = await uploadToCloudinary(req.file, 'avatars');

        // Update user with new avatar URL
        const user = await User.findByIdAndUpdate(
            userId,
            { avatar: result.url },
            { new: true }
        ).select('-password -refresh_token');

        if (!user) {
            return next(new ApiError(404, 'User not found'));
        }

        res.status(200).json(
            new ApiResponse(200, user, 'Avatar updated successfully')
        );
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update user address
 * @route   PUT /api/v1/users/address
 * @access  Private
 */
export const updateAddress = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const {
            line1, city, state, pincode, country,
            is_default = false, address_type = 'shipping'
        } = req.body;

        const user = await User.findById(userId);

        if (!user) {
            return next(new ApiError(404, 'User not found'));
        }

        // Create new address object (map frontend fields to schema fields)
        const newAddress = {
            line1,
            city,
            state,
            pincode,
            country,
            is_default,
            address_type
        };

        // If this is set as default, unset any existing default of the same type
        if (is_default) {
            user.addresses.forEach(addr => {
                if (addr.address_type === address_type) {
                    addr.is_default = false;
                }
            });
        }

        // Add new address to array
        user.addresses.push(newAddress);

        // Save user with new address
        await user.save();

        res.status(200).json(
            new ApiResponse(200, user, 'Address added successfully')
        );
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Delete user address
 * @route   DELETE /api/v1/users/address/:addressId
 * @access  Private
 */
export const deleteAddress = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { addressId } = req.params;

        const user = await User.findById(userId);

        if (!user) {
            return next(new ApiError(404, 'User not found'));
        }

        // Find the address in the user's addresses array
        const addressIndex = user.addresses.findIndex(
            addr => addr._id.toString() === addressId
        );

        if (addressIndex === -1) {
            return next(new ApiError(404, 'Address not found'));
        }

        // Remove the address from the array
        user.addresses.splice(addressIndex, 1);

        // Save user with updated addresses
        await user.save();

        res.status(200).json(
            new ApiResponse(200, user, 'Address deleted successfully')
        );
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Set default address
 * @route   PUT /api/v1/users/address/:addressId/default
 * @access  Private
 */
export const setDefaultAddress = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { addressId } = req.params;
        const { address_type = 'shipping' } = req.body;

        const user = await User.findById(userId);

        if (!user) {
            return next(new ApiError(404, 'User not found'));
        }

        // Find the address to set as default
        const addressToDefault = user.addresses.find(
            addr => addr._id.toString() === addressId
        );

        if (!addressToDefault) {
            return next(new ApiError(404, 'Address not found'));
        }

        // Update address type if provided
        addressToDefault.address_type = address_type;

        // Set all addresses of the same type to non-default
        user.addresses.forEach(addr => {
            if (addr.address_type === address_type) {
                addr.is_default = false;
            }
        });

        // Set the selected address as default
        addressToDefault.is_default = true;

        // Save user with updated addresses
        await user.save();

        res.status(200).json(
            new ApiResponse(200, user, 'Default address updated successfully')
        );
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get user wishlist
 * @route   GET /api/v1/users/wishlist
 * @access  Private
 */
export const getWishlist = async (req, res, next) => {
    try {
        const userId = req.user.id;

        const user = await User.findById(userId)
            .populate('wishlist')
            .select('wishlist');

        if (!user) {
            return next(new ApiError(404, 'User not found'));
        }

        res.status(200).json(
            new ApiResponse(200, user.wishlist, 'Wishlist retrieved successfully')
        );
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Add product to wishlist
 * @route   POST /api/v1/users/wishlist
 * @access  Private
 */
export const addToWishlist = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { productId } = req.body;

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return next(new ApiError(400, 'Invalid product ID'));
        }

        // Add product to wishlist if not already there
        const user = await User.findByIdAndUpdate(
            userId,
            { $addToSet: { wishlist: productId } },
            { new: true }
        ).populate('wishlist');

        if (!user) {
            return next(new ApiError(404, 'User not found'));
        }

        res.status(200).json(
            new ApiResponse(200, user.wishlist, 'Product added to wishlist')
        );
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Remove product from wishlist
 * @route   DELETE /api/v1/users/wishlist/:productId
 * @access  Private
 */
export const removeFromWishlist = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { productId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return next(new ApiError(400, 'Invalid product ID'));
        }

        // Remove product from wishlist
        const user = await User.findByIdAndUpdate(
            userId,
            { $pull: { wishlist: productId } },
            { new: true }
        ).populate('wishlist');

        if (!user) {
            return next(new ApiError(404, 'User not found'));
        }

        res.status(200).json(
            new ApiResponse(200, user.wishlist, 'Product removed from wishlist')
        );
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Admin - Update user role
 * @route   PUT /api/v1/users/:id/role
 * @access  Private/Admin
 */
export const updateUserRole = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        // Validate role
        const validRoles = ['user', 'admin'];
        if (!validRoles.includes(role)) {
            return next(new ApiError(400, 'Invalid role'));
        }

        const user = await User.findByIdAndUpdate(
            id,
            { role },
            { new: true }
        ).select('-password -refresh_token');

        if (!user) {
            return next(new ApiError(404, 'User not found'));
        }

        res.status(200).json(
            new ApiResponse(200, user, 'User role updated successfully')
        );
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Admin - Delete user
 * @route   DELETE /api/v1/users/:id
 * @access  Private/Admin
 */
export const deleteUser = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Prevent admin from deleting themselves
        if (id === req.user.id) {
            return next(new ApiError(400, 'You cannot delete your own account'));
        }

        const user = await User.findByIdAndDelete(id);

        if (!user) {
            return next(new ApiError(404, 'User not found'));
        }

        res.status(200).json(
            new ApiResponse(200, null, 'User deleted successfully')
        );
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get user order history
 * @route   GET /api/v1/users/orders
 * @access  Private
 */
export const getUserOrders = async (req, res, next) => {
    try {
        const userId = req.user.id;

        // This assumes you have an Order model with a user field
        const orders = await mongoose.model('Order').find({ user: userId })
            .sort({ created_at: -1 });

        res.status(200).json(
            new ApiResponse(200, orders, 'User orders retrieved successfully')
        );
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get user dashboard data
 * @route   GET /api/v1/users/dashboard
 * @access  Private
 */
export const getUserDashboard = async (req, res, next) => {
    try {
        const userId = req.user.id;

        // Get user with selected fields
        const user = await User.findById(userId)
            .select('name email phone created_at addresses wishlist')
            .populate('wishlist', 'name price images slug');

        if (!user) {
            return next(new ApiError(404, 'User not found'));
        }

        // Get recent orders
        const recentOrders = await mongoose.model('Order').find({ user: userId })
            .sort({ created_at: -1 })
            .limit(5);

        // Get order count
        const orderCount = await mongoose.model('Order').countDocuments({ user: userId });

        // Prepare dashboard data
        const dashboardData = {
            user,
            recentOrders,
            stats: {
                totalOrders: orderCount,
                wishlistCount: user.wishlist.length,
                addressCount: user.addresses.length
            }
        };

        res.status(200).json(
            new ApiResponse(200, dashboardData, 'Dashboard data retrieved successfully')
        );
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update user password
 * @route   PUT /api/v1/users/password
 * @access  Private
 */
export const updatePassword = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return next(new ApiError(400, 'Please provide current and new password'));
        }

        // Get user with password
        const user = await User.findById(userId).select('+password');

        if (!user) {
            return next(new ApiError(404, 'User not found'));
        }

        // Check if current password is correct
        const isPasswordCorrect = await user.isPasswordCorrect(currentPassword);

        if (!isPasswordCorrect) {
            return next(new ApiError(401, 'Current password is incorrect'));
        }

        // Update password
        user.password = newPassword;
        await user.save();

        res.status(200).json(
            new ApiResponse(200, null, 'Password updated successfully')
        );
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get user notifications
 * @route   GET /api/v1/users/notifications
 * @access  Private
 */
export const getUserNotifications = async (req, res, next) => {
    try {
        const userId = req.user.id;

        const user = await User.findById(userId)
            .select('notifications')
            .populate('notifications.order', 'order_number total status');

        if (!user) {
            return next(new ApiError(404, 'User not found'));
        }

        res.status(200).json(
            new ApiResponse(200, user.notifications, 'Notifications retrieved successfully')
        );
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Mark notification as read
 * @route   PUT /api/v1/users/notifications/:notificationId
 * @access  Private
 */
export const markNotificationAsRead = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { notificationId } = req.params;

        const user = await User.findOneAndUpdate(
            {
                _id: userId,
                'notifications._id': notificationId
            },
            {
                $set: { 'notifications.$.read': true }
            },
            { new: true }
        ).select('notifications');

        if (!user) {
            return next(new ApiError(404, 'User or notification not found'));
        }

        res.status(200).json(
            new ApiResponse(200, user.notifications, 'Notification marked as read')
        );
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Delete notification
 * @route   DELETE /api/v1/users/notifications/:notificationId
 * @access  Private
 */
export const deleteNotification = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { notificationId } = req.params;

        const user = await User.findByIdAndUpdate(
            userId,
            { $pull: { notifications: { _id: notificationId } } },
            { new: true }
        ).select('notifications');

        if (!user) {
            return next(new ApiError(404, 'User not found'));
        }

        res.status(200).json(
            new ApiResponse(200, user.notifications, 'Notification deleted successfully')
        );
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update user email preferences
 * @route   PUT /api/v1/users/email-preferences
 * @access  Private
 */
export const updateEmailPreferences = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const {
            marketing = false,
            orderUpdates = true,
            productNews = false
        } = req.body;

        const user = await User.findByIdAndUpdate(
            userId,
            {
                email_preferences: {
                    marketing,
                    orderUpdates,
                    productNews
                }
            },
            { new: true }
        ).select('email_preferences');

        if (!user) {
            return next(new ApiError(404, 'User not found'));
        }

        res.status(200).json(
            new ApiResponse(200, user.email_preferences, 'Email preferences updated successfully')
        );
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get user by email (admin only)
 * @route   GET /api/v1/users/email/:email
 * @access  Private/Admin
 */
export const getUserByEmail = async (req, res, next) => {
    try {
        const { email } = req.params;

        const user = await User.findOne({ email }).select('-password -refresh_token');

        if (!user) {
            return next(new ApiError(404, 'User not found'));
        }

        res.status(200).json(
            new ApiResponse(200, user, 'User retrieved successfully')
        );
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Search users (admin only)
 * @route   GET /api/v1/users/search
 * @access  Private/Admin
 */
export const searchUsers = async (req, res, next) => {
    try {
        const { query } = req.query;

        if (!query) {
            return next(new ApiError(400, 'Search query is required'));
        }

        const users = await User.find({
            $or: [
                { name: { $regex: query, $options: 'i' } },
                { email: { $regex: query, $options: 'i' } },
                { phone: { $regex: query, $options: 'i' } }
            ]
        }).select('-password -refresh_token');

        res.status(200).json(
            new ApiResponse(200, users, 'Users search results')
        );
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get user stats (admin only)
 * @route   GET /api/v1/users/stats
 * @access  Private/Admin
 */
export const getUserStats = async (req, res, next) => {
    try {
        // Total users count
        const totalUsers = await User.countDocuments();

        // New users in last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const newUsers = await User.countDocuments({
            created_at: { $gte: thirtyDaysAgo }
        });

        // Users by role
        const usersByRole = await User.aggregate([
            {
                $group: {
                    _id: '$role',
                    count: { $sum: 1 }
                }
            }
        ]);

        // Format role data
        const roleData = {};
        usersByRole.forEach(item => {
            roleData[item._id] = item.count;
        });

        // Monthly user registration for the past year
        const twelveMonthsAgo = new Date();
        twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
        twelveMonthsAgo.setDate(1);
        twelveMonthsAgo.setHours(0, 0, 0, 0);

        const monthlyRegistrations = await User.aggregate([
            {
                $match: {
                    created_at: { $gte: twelveMonthsAgo }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$created_at' },
                        month: { $month: '$created_at' }
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: {
                    '_id.year': 1,
                    '_id.month': 1
                }
            }
        ]);

        // Format monthly data
        const monthlyData = [];
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        monthlyRegistrations.forEach(item => {
            monthlyData.push({
                month: months[item._id.month - 1],
                year: item._id.year,
                count: item.count
            });
        });

        res.status(200).json(
            new ApiResponse(200, {
                totalUsers,
                newUsers,
                roleData,
                monthlyData
            }, 'User statistics retrieved successfully')
        );
    } catch (error) {
        next(error);
    }
};