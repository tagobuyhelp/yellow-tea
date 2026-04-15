import { ApiResponse } from '../utils/apiResponse.js';
import { ApiError } from '../utils/apiError.js';
import Order from '../models/order.model.js';
import Product from '../models/product.model.js';
import User from '../models/user.model.js';
import AdminLog from '../models/adminLog.model.js';
import slugify from 'slugify';
import uploadToCloudinary from '../utils/uploadToCloudinary.js';
import { sendUserNotification } from '../utils/responseHandler.js';
import mongoose from 'mongoose';

// ==================== DASHBOARD ====================
export const getAdminDashboard = async (req, res, next) => {
    try {
        // Get total counts
        const totalUsers = await User.countDocuments();
        const totalOrders = await Order.countDocuments();
        const totalProducts = await Product.countDocuments();

        // Get revenue data
        const revenueResult = await Order.aggregate([
            { $match: { isPaid: true } },
            { $group: { _id: null, totalRevenue: { $sum: '$totalPrice' } } }
        ]);
        const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

        // Get recent activity
        const recentOrders = await Order.find()
            .sort({ created_at: -1 })
            .limit(5)
            .populate('user', 'name email');

        const recentUsers = await User.find()
            .sort({ created_at: -1 })
            .limit(5)
            .select('name email created_at');

        // Get monthly stats for the last 6 months
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const monthlyStats = await Order.aggregate([
            { $match: { created_at: { $gte: sixMonthsAgo } } },
            {
                $group: {
                    _id: {
                        year: { $year: '$created_at' },
                        month: { $month: '$created_at' }
                    },
                    orders: { $sum: 1 },
                    revenue: { $sum: { $cond: [{ $eq: ['$isPaid', true] }, '$totalPrice', 0] } }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);

        // Get top selling products
        const topProducts = await Order.aggregate([
            { $unwind: '$orderItems' },
            {
                $group: {
                    _id: '$orderItems.product',
                    name: { $first: '$orderItems.name' },
                    totalSold: { $sum: '$orderItems.quantity' },
                    revenue: { $sum: { $multiply: ['$orderItems.price', '$orderItems.quantity'] } }
                }
            },
            { $sort: { totalSold: -1 } },
            { $limit: 5 }
        ]);

        // Get order status distribution
        const orderStatusDistribution = await Order.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);

        res.status(200).json(new ApiResponse(200, {
            overview: {
                totalUsers,
                totalOrders,
                totalProducts,
                totalRevenue
            },
            recentActivity: {
                orders: recentOrders,
                users: recentUsers
            },
            analytics: {
                monthlyStats,
                topProducts,
                orderStatusDistribution
            }
        }, 'Admin dashboard data retrieved successfully'));
    } catch (error) {
        next(error);
    }
};

// ==================== CUSTOMERS (USERS) ====================
export const getAllCustomers = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const skip = (page - 1) * limit;

        // Build query
        const queryObj = { ...req.query };
        const excludedFields = ['page', 'sort', 'limit', 'fields', 'search'];
        excludedFields.forEach(field => delete queryObj[field]);

        let query = User.find(queryObj);

        // Search functionality
        if (req.query.search) {
            query = query.find({
                $or: [
                    { name: { $regex: req.query.search, $options: 'i' } },
                    { email: { $regex: req.query.search, $options: 'i' } }
                ]
            });
        }

        // Sorting
        if (req.query.sort) {
            const sortBy = req.query.sort.split(',').join(' ');
            query = query.sort(sortBy);
        } else {
            query = query.sort('-created_at');
        }

        const users = await query.skip(skip).limit(limit).select('-password -refresh_token');
        const total = await User.countDocuments();

        res.status(200).json(new ApiResponse(200, {
            users,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        }, 'All customers retrieved successfully'));
    } catch (error) {
        next(error);
    }
};

export const getCustomerById = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id).select('-password -refresh_token');
        if (!user) return next(new ApiError(404, 'User not found'));

        // Get user's order history
        const userOrders = await Order.find({ user: req.params.id })
            .sort({ created_at: -1 })
            .limit(10);

        // Get user stats
        const orderStats = await Order.aggregate([
            { $match: { user: user._id } },
            {
                $group: {
                    _id: null,
                    totalOrders: { $sum: 1 },
                    totalSpent: { $sum: { $cond: [{ $eq: ['$isPaid', true] }, '$totalPrice', 0] } },
                    averageOrderValue: { $avg: '$totalPrice' }
                }
            }
        ]);

        res.status(200).json(new ApiResponse(200, {
            user,
            orders: userOrders,
            stats: orderStats[0] || { totalOrders: 0, totalSpent: 0, averageOrderValue: 0 }
        }, 'Customer details retrieved successfully'));
    } catch (error) {
        next(error);
    }
};

export const updateCustomer = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        // Remove sensitive fields from update
        delete updateData.password;
        delete updateData.refresh_token;

        const user = await User.findByIdAndUpdate(id, updateData, { new: true })
            .select('-password -refresh_token');

        if (!user) return next(new ApiError(404, 'User not found'));

        res.status(200).json(new ApiResponse(200, user, 'Customer updated successfully'));
    } catch (error) {
        next(error);
    }
};

export const deleteCustomer = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (id === req.user.id) {
            return next(new ApiError(400, 'You cannot delete your own account'));
        }

        const user = await User.findByIdAndDelete(id);
        if (!user) return next(new ApiError(404, 'User not found'));

        // Delete associated orders (optional - you might want to keep them for records)
        // await Order.deleteMany({ user: id });

        res.status(200).json(new ApiResponse(200, null, 'Customer deleted successfully'));
    } catch (error) {
        next(error);
    }
};

// ==================== ORDERS ====================
export const getAllOrders = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const skip = (page - 1) * limit;

        const queryObj = { ...req.query };
        const excludedFields = ['page', 'sort', 'limit', 'fields'];
        excludedFields.forEach(field => delete queryObj[field]);

        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, match => `$${match}`);

        let query = Order.find(JSON.parse(queryStr));

        if (req.query.sort) {
            const sortBy = req.query.sort.split(',').join(' ');
            query = query.sort(sortBy);
        } else {
            query = query.sort('-created_at');
        }

        const orders = await query.skip(skip).limit(limit)
            .populate('user', 'name email')
            .populate('orderItems.product', 'name images');

        const totalOrders = await Order.countDocuments(JSON.parse(queryStr));

        res.status(200).json(new ApiResponse(200, {
            orders,
            pagination: {
                total: totalOrders,
                page,
                limit,
                totalPages: Math.ceil(totalOrders / limit)
            }
        }, 'All orders retrieved successfully'));
    } catch (error) {
        next(error);
    }
};

export const getOrderById = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('user', 'name email phone')
            .populate('orderItems.product', 'name images slug');

        if (!order) return next(new ApiError(404, 'Order not found'));

        res.status(200).json(new ApiResponse(200, order, 'Order details retrieved successfully'));
    } catch (error) {
        next(error);
    }
};

export const updateOrderStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status, notes } = req.body;

        if (!status) {
            return next(new ApiError(400, 'Please provide order status'));
        }

        const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return next(new ApiError(400, 'Invalid order status'));
        }

        const order = await Order.findById(id);
        if (!order) return next(new ApiError(404, 'Order not found'));

        // Update order status
        order.status = status;
        if (notes) order.adminNotes = notes;

        // Set timestamps based on status
        if (status === 'delivered') {
            order.deliveredAt = Date.now();
        } else if (status === 'shipped') {
            order.shippedAt = Date.now();
        } else if (status === 'cancelled') {
            order.cancelledAt = Date.now();
        }

        await order.save();

        // Send notification to user
        await sendUserNotification(order.user, {
            type: `order_${status}`,
            order: order._id
        }, { orderNumber: order.orderNumber });

        res.status(200).json(new ApiResponse(200, order, `Order status updated to ${status}`));
    } catch (error) {
        next(error);
    }
};

export const getOrderStats = async (req, res, next) => {
    try {
        const totalOrders = await Order.countDocuments();
        const salesResult = await Order.aggregate([
            { $match: { isPaid: true } },
            { $group: { _id: null, totalSales: { $sum: '$totalPrice' } } }
        ]);
        const totalSales = salesResult.length > 0 ? salesResult[0].totalSales : 0;

        const ordersByStatus = await Order.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);

        const monthlyOrders = await Order.aggregate([
            { $match: { isPaid: true, paidAt: { $gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) } } },
            { $group: { _id: { month: { $month: '$paidAt' }, year: { $year: '$paidAt' } }, count: { $sum: 1 }, total: { $sum: '$totalPrice' } } },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);

        const topProducts = await Order.aggregate([
            { $unwind: '$orderItems' },
            { $group: { _id: '$orderItems.product', name: { $first: '$orderItems.name' }, totalSold: { $sum: '$orderItems.quantity' }, totalRevenue: { $sum: { $multiply: ['$orderItems.price', '$orderItems.quantity'] } } } },
            { $sort: { totalSold: -1 } },
            { $limit: 5 }
        ]);

        const recentOrders = await Order.find().sort({ created_at: -1 }).limit(5).populate('user', 'name email');

        res.status(200).json(new ApiResponse(200, {
            totalOrders,
            totalSales,
            ordersByStatus,
            monthlyOrders,
            topProducts,
            recentOrders
        }, 'Order statistics retrieved successfully'));
    } catch (error) {
        next(error);
    }
};

// ==================== PRODUCTS ====================
export const getAllProducts = async (req, res, next) => {
    try {
        const queryObj = { ...req.query };
        const excludedFields = ['page', 'sort', 'limit', 'fields', 'search'];
        excludedFields.forEach(field => delete queryObj[field]);

        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, match => `${match}`);

        let query = Product.find(JSON.parse(queryStr));

        if (req.query.search) {
            query = query.find({ $text: { $search: req.query.search } });
        }

        if (req.query.sort) {
            const sortBy = req.query.sort.split(',').join(' ');
            query = query.sort(sortBy);
        } else {
            query = query.sort('-created_at');
        }

        if (req.query.fields) {
            const fields = req.query.fields.split(',').join(' ');
            query = query.select(fields);
        } else {
            query = query.select('-__v');
        }

        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const skip = (page - 1) * limit;

        query = query.skip(skip).limit(limit);
        const products = await query;
        const totalProducts = await Product.countDocuments(JSON.parse(queryStr));

        // Ensure all products have _id and id fields
        const productsWithIds = products.map(product => {
            const productObj = product.toObject ? product.toObject() : product;
            return {
                ...productObj,
                _id: productObj._id || product._id,
                id: productObj._id || product._id || productObj.id || product.id
            };
        });

        res.status(200).json(new ApiResponse(200, {
            products: productsWithIds,
            pagination: {
                total: totalProducts,
                page,
                limit,
                totalPages: Math.ceil(totalProducts / limit)
            }
        }, 'Products retrieved successfully'));
    } catch (error) {
        next(error);
    }
};

export const getProductById = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return next(new ApiError(404, 'Product not found'));

        res.status(200).json(new ApiResponse(200, product, 'Product details retrieved successfully'));
    } catch (error) {
        next(error);
    }
};

export const createProduct = async (req, res, next) => {
    try {
        const { name } = req.body;

        const existingProduct = await Product.findOne({ name });
        if (existingProduct) {
            return next(new ApiError(400, 'Product with this name already exists'));
        }

        req.body.slug = slugify(name, { lower: true });

        if (req.files && req.files.length > 0) {
            console.log('Files received for create:', req.files.length);
            console.log('File details for create:', req.files.map(f => ({ originalname: f.originalname, path: f.path })));

            const imagePromises = req.files.map(file => uploadToCloudinary(file, 'products'));
            const uploadedImages = await Promise.all(imagePromises);
            req.body.images = uploadedImages.map(img => img.url);

            console.log('Created product images:', req.body.images);
        }

        const product = await Product.create(req.body);

        res.status(201).json(new ApiResponse(201, product, 'Product created successfully'));
    } catch (error) {
        next(error);
    }
};

export const updateProduct = async (req, res, next) => {
    try {
        const { id } = req.params;
        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return next(new ApiError(400, 'Invalid product ID'));
        }
        const updateData = req.body;
        console.log('Original updateData:', JSON.stringify(updateData, null, 2));
        console.log('req.files:', req.files ? req.files.length : 'No files');
        if (req.files && req.files.length > 0) {
            console.log('req.files structure:', req.files.map(f => ({
                fieldname: f.fieldname,
                originalname: f.originalname,
                encoding: f.encoding,
                mimetype: f.mimetype,
                size: f.size,
                destination: f.destination,
                filename: f.filename,
                path: f.path
            })));
        }

        // Comprehensive data sanitization
        const sanitizeData = (obj) => {
            if (!obj || typeof obj !== 'object') return obj;

            // If it's an array, preserve it as an array
            if (Array.isArray(obj)) {
                return obj.map(item => sanitizeData(item));
            }

            const sanitized = {};
            for (const [key, value] of Object.entries(obj)) {
                if (value === "" || value === '""' || value === '""""') {
                    sanitized[key] = undefined;
                } else if (Array.isArray(value)) {
                    // Preserve arrays as arrays
                    sanitized[key] = value.map(item => sanitizeData(item));
                } else if (typeof value === 'object' && value !== null) {
                    sanitized[key] = sanitizeData(value);
                } else if (typeof value === 'string' && !isNaN(value) && value.trim() !== '') {
                    // Try to convert string numbers to actual numbers
                    const num = Number(value);
                    sanitized[key] = isNaN(num) ? value : num;
                } else {
                    sanitized[key] = value;
                }
            }
            return sanitized;
        };

        // Handle array fields specifically
        const sanitizeArrays = (data) => {
            const arrayFields = ['type', 'badges', 'taste_notes', 'tags', 'images'];
            const sanitized = { ...data };

            for (const field of arrayFields) {
                if (sanitized[field]) {
                    // If it's a string that looks like an array, try to parse it
                    if (typeof sanitized[field] === 'string') {
                        console.log(`Processing array field ${field}:`, sanitized[field]);

                        try {
                            // First, try to parse as JSON
                            const parsed = JSON.parse(sanitized[field]);
                            if (Array.isArray(parsed)) {
                                sanitized[field] = parsed;
                                console.log(`Successfully parsed ${field} as JSON array:`, parsed);
                                continue;
                            }
                        } catch (error) {
                            console.log(`JSON parse failed for ${field}:`, error.message);
                        }

                        // Try to extract from malformed string format
                        try {
                            // Handle the specific format: "[ { '0': 'Black', '1': 'Masala' } ]"
                            const match = sanitized[field].match(/\[\s*\{\s*'([^']+)':\s*'([^']+)'(?:,\s*'([^']+)':\s*'([^']+)')?\s*\}\s*\]/);
                            if (match) {
                                const items = [];
                                for (let i = 2; i < match.length; i += 2) {
                                    if (match[i]) {
                                        items.push(match[i]);
                                    }
                                }
                                sanitized[field] = items;
                                console.log(`Successfully extracted ${field} from malformed string:`, items);
                                continue;
                            }
                        } catch (e) {
                            console.log(`Regex extraction failed for ${field}:`, e.message);
                        }

                        // Try alternative regex pattern
                        try {
                            const objectMatch = sanitized[field].match(/\{([^}]+)\}/);
                            if (objectMatch) {
                                const objContent = objectMatch[1];
                                const items = [];
                                const pairs = objContent.split(',').map(s => s.trim());
                                for (const pair of pairs) {
                                    const colonIndex = pair.indexOf(':');
                                    if (colonIndex > 0) {
                                        const value = pair.substring(colonIndex + 1).trim().replace(/['"]/g, '');
                                        if (value) {
                                            items.push(value);
                                        }
                                    }
                                }
                                if (items.length > 0) {
                                    sanitized[field] = items;
                                    console.log(`Successfully extracted ${field} using alternative method:`, items);
                                    continue;
                                }
                            }
                        } catch (e) {
                            console.log(`Alternative extraction failed for ${field}:`, e.message);
                        }

                        // If all parsing fails, set to undefined
                        console.log(`All parsing methods failed for ${field}, setting to undefined`);
                        sanitized[field] = undefined;
                    }
                    // If it's already an array, handle it properly
                    else if (Array.isArray(sanitized[field])) {
                        // For images field, preserve file objects and URLs, convert others to strings
                        if (field === 'images') {
                            sanitized[field] = sanitized[field].map(item => {
                                // If it's a file object (has path property), keep it as is
                                if (item && typeof item === 'object' && item.path) {
                                    return item;
                                }
                                // If it's already a string (URL), keep it as is
                                if (typeof item === 'string') {
                                    return item;
                                }
                                // If it's an empty object or any other object, remove it
                                if (item && typeof item === 'object') {
                                    console.log('Removing invalid image object:', item);
                                    return null;
                                }
                                // Otherwise, convert to string
                                return String(item);
                            }).filter(item => item !== null); // Remove null items
                        } else {
                            // For other array fields, ensure they contain only strings
                            sanitized[field] = sanitized[field].map(item =>
                                typeof item === 'string' ? item : String(item)
                            );
                        }
                    }
                }
            }

            return sanitized;
        };

        // Sanitize the entire update data
        const sanitizedData = sanitizeData(updateData);
        console.log('After sanitizeData:', JSON.stringify(sanitizedData, null, 2));

        // Handle array fields specifically
        const finalSanitizedData = sanitizeArrays(sanitizedData);
        console.log('After sanitizeArrays:', JSON.stringify(finalSanitizedData, null, 2));

        // Handle specific date fields
        if (finalSanitizedData.origin && finalSanitizedData.origin.harvest_date) {
            if (finalSanitizedData.origin.harvest_date === "" || finalSanitizedData.origin.harvest_date === '""') {
                finalSanitizedData.origin.harvest_date = undefined;
            } else {
                try {
                    finalSanitizedData.origin.harvest_date = new Date(finalSanitizedData.origin.harvest_date);
                } catch (error) {
                    finalSanitizedData.origin.harvest_date = undefined;
                }
            }
        }

        // Handle specific number fields
        if (finalSanitizedData.origin && finalSanitizedData.origin.elevation_ft) {
            if (finalSanitizedData.origin.elevation_ft === "" || finalSanitizedData.origin.elevation_ft === '""') {
                finalSanitizedData.origin.elevation_ft = undefined;
            } else {
                const num = Number(finalSanitizedData.origin.elevation_ft);
                finalSanitizedData.origin.elevation_ft = isNaN(num) ? undefined : num;
            }
        }

        if (finalSanitizedData.brewing && finalSanitizedData.brewing.temperature_c) {
            if (finalSanitizedData.brewing.temperature_c === "" || finalSanitizedData.brewing.temperature_c === '""') {
                finalSanitizedData.brewing.temperature_c = undefined;
            } else {
                const num = Number(finalSanitizedData.brewing.temperature_c);
                finalSanitizedData.brewing.temperature_c = isNaN(num) ? undefined : num;
            }
        }

        if (finalSanitizedData.brewing && finalSanitizedData.brewing.time_min) {
            if (finalSanitizedData.brewing.time_min === "" || finalSanitizedData.brewing.time_min === '""') {
                finalSanitizedData.brewing.time_min = undefined;
            } else {
                const num = Number(finalSanitizedData.brewing.time_min);
                finalSanitizedData.brewing.time_min = isNaN(num) ? undefined : num;
            }
        }

        if (finalSanitizedData.scan_to_brew && finalSanitizedData.scan_to_brew.timer_seconds) {
            if (finalSanitizedData.scan_to_brew.timer_seconds === "" || finalSanitizedData.scan_to_brew.timer_seconds === '""') {
                finalSanitizedData.scan_to_brew.timer_seconds = undefined;
            } else {
                const num = Number(finalSanitizedData.scan_to_brew.timer_seconds);
                finalSanitizedData.scan_to_brew.timer_seconds = isNaN(num) ? undefined : num;
            }
        }

        // Handle price field
        if (finalSanitizedData.price) {
            if (finalSanitizedData.price === "" || finalSanitizedData.price === '""') {
                finalSanitizedData.price = undefined;
            } else {
                const num = Number(finalSanitizedData.price);
                finalSanitizedData.price = isNaN(num) ? undefined : num;
            }
        }

        // Handle rating field
        if (finalSanitizedData.rating) {
            if (finalSanitizedData.rating === "" || finalSanitizedData.rating === '""') {
                finalSanitizedData.rating = undefined;
            } else {
                const num = Number(finalSanitizedData.rating);
                finalSanitizedData.rating = isNaN(num) ? undefined : num;
            }
        }

        // Handle reviewCount field
        if (finalSanitizedData.reviewCount) {
            if (finalSanitizedData.reviewCount === "" || finalSanitizedData.reviewCount === '""') {
                finalSanitizedData.reviewCount = undefined;
            } else {
                const num = Number(finalSanitizedData.reviewCount);
                finalSanitizedData.reviewCount = isNaN(num) ? undefined : num;
            }
        }

        if (finalSanitizedData.name) {
            finalSanitizedData.slug = slugify(finalSanitizedData.name, { lower: true });
        }

        if (req.files && req.files.length > 0) {
            console.log('Files received:', req.files.length);
            console.log('File details:', req.files.map(f => ({
                originalname: f.originalname,
                path: f.path,
                mimetype: f.mimetype,
                size: f.size,
                fieldname: f.fieldname
            })));

            const imagePromises = req.files.map(file => uploadToCloudinary(file, 'products'));
            const uploadedImages = await Promise.all(imagePromises);
            const newImageUrls = uploadedImages.map(img => img.url);

            console.log('Uploaded image URLs:', newImageUrls);

            // If images already exist, append new ones; otherwise, set to new images
            if (finalSanitizedData.images && Array.isArray(finalSanitizedData.images)) {
                // Filter out any non-string items (like file objects) and append new URLs
                const existingUrls = finalSanitizedData.images.filter(item => typeof item === 'string');
                finalSanitizedData.images = [...existingUrls, ...newImageUrls];
                console.log('Combined images:', finalSanitizedData.images);
            } else {
                finalSanitizedData.images = newImageUrls;
                console.log('Set new images:', finalSanitizedData.images);
            }
        } else {
            console.log('No files received in req.files');
            // If no files but images array contains objects, clean them up
            if (finalSanitizedData.images && Array.isArray(finalSanitizedData.images)) {
                finalSanitizedData.images = finalSanitizedData.images.filter(item =>
                    typeof item === 'string' && item.trim() !== ''
                );
                console.log('Cleaned images array (no files):', finalSanitizedData.images);
            }
        }

        console.log('Final data being sent to database:', JSON.stringify(finalSanitizedData, null, 2));
        const product = await Product.findByIdAndUpdate(id, finalSanitizedData, { new: true });
        if (!product) return next(new ApiError(404, 'Product not found'));

        res.status(200).json(new ApiResponse(200, product, 'Product updated successfully'));
    } catch (error) {
        next(error);
    }
};

export const deleteProduct = async (req, res, next) => {
    try {
        const { id } = req.params;

        const product = await Product.findByIdAndDelete(id);
        if (!product) return next(new ApiError(404, 'Product not found'));

        res.status(200).json(new ApiResponse(200, null, 'Product deleted successfully'));
    } catch (error) {
        next(error);
    }
};

export const getProductStats = async (req, res, next) => {
    try {
        const totalProducts = await Product.countDocuments();

        const productsByCategory = await Product.aggregate([
            { $group: { _id: '$category', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        const productsByType = await Product.aggregate([
            { $unwind: '$type' },
            { $group: { _id: '$type', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        const avgPrice = await Product.aggregate([
            { $group: { _id: null, avgPrice: { $avg: '$price' } } }
        ]);

        const lowStockProducts = await Product.find({ stock: { $lt: 10 } }).limit(10);

        res.status(200).json(new ApiResponse(200, {
            totalProducts,
            productsByCategory,
            productsByType,
            averagePrice: avgPrice.length > 0 ? avgPrice[0].avgPrice : 0,
            lowStockProducts
        }, 'Product statistics retrieved successfully'));
    } catch (error) {
        next(error);
    }
};

// ==================== LOGS ====================
export const getAdminLogs = async (req, res, next) => {
    try {
        const queryObj = { ...req.query };
        const excludedFields = ['page', 'sort', 'limit', 'fields'];
        excludedFields.forEach(field => delete queryObj[field]);

        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `${match}`);

        let query = AdminLog.find(JSON.parse(queryStr));
        query = query.populate('admin_id', 'name email');

        if (req.query.sort) {
            const sortBy = req.query.sort.split(',').join(' ');
            query = query.sort(sortBy);
        } else {
            query = query.sort('-timestamp');
        }

        if (req.query.fields) {
            const fields = req.query.fields.split(',').join(' ');
            query = query.select(fields);
        } else {
            query = query.select('-__v');
        }

        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 20;
        const skip = (page - 1) * limit;

        query = query.skip(skip).limit(limit);
        const logs = await query;
        const total = await AdminLog.countDocuments(JSON.parse(queryStr));

        res.status(200).json(new ApiResponse(200, {
            logs,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            }
        }, 'Admin logs retrieved successfully'));
    } catch (error) {
        next(error);
    }
};

// ==================== USER MANAGEMENT ====================
export const updateUserRole = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        const validRoles = ['user', 'admin'];
        if (!validRoles.includes(role)) {
            return next(new ApiError(400, 'Invalid role'));
        }

        const user = await User.findByIdAndUpdate(id, { role }, { new: true })
            .select('-password -refresh_token');

        if (!user) return next(new ApiError(404, 'User not found'));

        res.status(200).json(new ApiResponse(200, user, 'User role updated successfully'));
    } catch (error) {
        next(error);
    }
};

export const deleteUser = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (id === req.user.id) {
            return next(new ApiError(400, 'You cannot delete your own account'));
        }

        const user = await User.findByIdAndDelete(id);
        if (!user) return next(new ApiError(404, 'User not found'));

        res.status(200).json(new ApiResponse(200, null, 'User deleted successfully'));
    } catch (error) {
        next(error);
    }
};

// ==================== ANALYTICS ====================
export const getAnalytics = async (req, res, next) => {
    try {
        const { period = '30' } = req.query;
        const days = parseInt(period);

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        // User analytics
        const newUsers = await User.countDocuments({ created_at: { $gte: startDate } });
        const totalUsers = await User.countDocuments();

        // Order analytics
        const newOrders = await Order.countDocuments({ created_at: { $gte: startDate } });
        const totalOrders = await Order.countDocuments();

        // Revenue analytics
        const revenueResult = await Order.aggregate([
            { $match: { isPaid: true, paidAt: { $gte: startDate } } },
            { $group: { _id: null, revenue: { $sum: '$totalPrice' } } }
        ]);
        const periodRevenue = revenueResult.length > 0 ? revenueResult[0].revenue : 0;

        const totalRevenueResult = await Order.aggregate([
            { $match: { isPaid: true } },
            { $group: { _id: null, revenue: { $sum: '$totalPrice' } } }
        ]);
        const totalRevenue = totalRevenueResult.length > 0 ? totalRevenueResult[0].revenue : 0;

        // Daily stats for the period
        const dailyStats = await Order.aggregate([
            { $match: { created_at: { $gte: startDate } } },
            {
                $group: {
                    _id: {
                        year: { $year: '$created_at' },
                        month: { $month: '$created_at' },
                        day: { $dayOfMonth: '$created_at' }
                    },
                    orders: { $sum: 1 },
                    revenue: { $sum: { $cond: [{ $eq: ['$isPaid', true] }, '$totalPrice', 0] } }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
        ]);

        res.status(200).json(new ApiResponse(200, {
            period: `${days} days`,
            users: { new: newUsers, total: totalUsers },
            orders: { new: newOrders, total: totalOrders },
            revenue: { period: periodRevenue, total: totalRevenue },
            dailyStats
        }, 'Analytics data retrieved successfully'));
    } catch (error) {
        next(error);
    }
};

// ==================== SYSTEM OPERATIONS ====================
export const getSystemHealth = async (req, res, next) => {
    try {
        // Database connection status
        const dbStatus = 'connected'; // You can add actual DB health check

        // Get system stats
        const stats = {
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            nodeVersion: process.version,
            platform: process.platform
        };

        res.status(200).json(new ApiResponse(200, {
            status: 'healthy',
            database: dbStatus,
            stats
        }, 'System health check completed'));
    } catch (error) {
        next(error);
    }
};

export const clearCache = async (req, res, next) => {
    try {
        // Add cache clearing logic here if you have any caching system
        res.status(200).json(new ApiResponse(200, null, 'Cache cleared successfully'));
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get admin settings (chargeDelivery, chargeGST)
 * @route   GET /api/v1/admin/settings
 * @access  Admin
 */
export const getAdminSettings = async (req, res, next) => {
    try {
        // You can later fetch these from DB or env, for now hardcode
        const settings = {
            chargeDelivery: false,
            chargeGST: true,
            pickupPincode: '741165'
        };
        res.status(200).json(settings);
    } catch (error) {
        next(error);
    }
}; 