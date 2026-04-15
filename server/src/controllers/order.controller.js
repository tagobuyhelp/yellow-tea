import Order from '../models/order.model.js';
import Product from '../models/product.model.js';
import User from '../models/user.model.js';
import { ApiError } from '../utils/apiError.js';
import { ApiResponse } from '../utils/apiResponse.js';
import mongoose from 'mongoose';
import { sendUserNotification } from '../utils/responseHandler.js';
import { createShiprocketOrder, checkCourierServiceability } from '../utils/shiprocket.js';

/**
 * @desc    Create new order
 * @route   POST /api/v1/orders
 * @access  Private
 */
export const createOrder = async (req, res, next) => {
    try {
        const {
            items,
            shippingAddress,
            paymentMethod,
            couponCode,
            customerName,
            customerEmail,
            customerPhone,
            billingAddress,
            subtotal,
            deliveryCharges,
            tax,
            total,
            deliveryOption,
            specialInstructions,
            newsletterSubscription,
            currency
        } = req.body;
        console.log(req.body);

        // Handle both 'items' and 'orderItems' for backward compatibility
        const orderItems = items || req.body.orderItems;

        if (!orderItems || orderItems.length === 0) {
            return next(new ApiError(400, 'No order items'));
        }

        // Process order items - handle both productId and direct item data
        const itemsPromises = orderItems.map(async (item) => {
            // If productId or product is provided, fetch product details
            const productId = item.productId || item.product;
            if (productId) {
                const product = await Product.findById(productId);
                if (!product) {
                    throw new ApiError(404, `Product not found: ${productId}`);
                }
                return {
                    name: product.name,
                    quantity: item.quantity,
                    image: product.images?.[0] || 'default-product-image.jpg',
                    price: product.price,
                    product: product._id
                };
            } else {
                // Use provided item data directly (when productId is null)
                const tempProductId = new mongoose.Types.ObjectId();
                return {
                    name: item.name,
                    quantity: item.quantity,
                    image: item.image || 'default-product-image.jpg',
                    price: item.price,
                    product: tempProductId
                };
            }
        });

        const orderItemsWithDetails = await Promise.all(itemsPromises);

        // Use provided totals or calculate them
        const itemsPrice = subtotal || orderItemsWithDetails.reduce(
            (acc, item) => acc + item.price * item.quantity,
            0
        );

        const shippingPrice = deliveryCharges || (itemsPrice > 500 ? 0 : 50);
        const taxPrice = tax || Number((0.05 * itemsPrice).toFixed(2));

        // Apply discount if coupon is provided
        let discountAmount = 0;
        if (couponCode) {
            // Fetch coupon from database and validate
            const coupon = await mongoose.model('Coupon').findOne({
                code: couponCode,
                isActive: true,
                expiryDate: { $gt: Date.now() }
            });

            if (coupon) {
                if (coupon.discountType === 'percentage') {
                    discountAmount = (coupon.discountValue / 100) * itemsPrice;
                } else {
                    discountAmount = coupon.discountValue;
                }

                // Cap discount at maximum allowed value if specified
                if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) {
                    discountAmount = coupon.maxDiscountAmount;
                }
            }
        }

        // Use provided total or calculate it
        const totalPrice = total || (itemsPrice + shippingPrice + taxPrice - discountAmount);

        // Generate order number (YT-YYYYMMDD-XXXX)
        const date = new Date();
        const dateStr = date.getFullYear().toString() +
            (date.getMonth() + 1).toString().padStart(2, '0') +
            date.getDate().toString().padStart(2, '0');

        const lastOrder = await Order.findOne().sort({ created_at: -1 });
        let orderCounter = 1;

        if (lastOrder && lastOrder.orderNumber) {
            const lastOrderNumber = lastOrder.orderNumber;
            const lastCounter = parseInt(lastOrderNumber.split('-')[2]);
            if (!isNaN(lastCounter)) {
                orderCounter = lastCounter + 1;
            }
        }

        const orderNumber = `YT-${dateStr}-${orderCounter.toString().padStart(4, '0')}`;

        // Map payment method to valid enum values
        const mapPaymentMethod = (method) => {
            const paymentMap = {
                'card': 'credit_card',
                'credit_card': 'credit_card',
                'debit_card': 'debit_card',
                'upi': 'upi',
                'cod': 'cod',
                'wallet': 'wallet',
                'razorpay': 'razorpay'
            };
            return paymentMap[method] || 'credit_card';
        };

        // Map address fields to match schema
        const mapAddress = (address) => {
            if (!address) return null;
            return {
                address: address.address || address.street || address.line1 || '',
                city: address.city || '',
                postalCode: address.postalCode || address.pincode || '',
                state: address.state || '',
                country: address.country || 'India',
                phone: address.phone || ''
            };
        };

        // Create order with additional fields from frontend
        const order = await Order.create({
            user: req.user.id,
            orderItems: orderItemsWithDetails,
            shippingAddress: mapAddress(shippingAddress),
            paymentMethod: mapPaymentMethod(paymentMethod),
            itemsPrice,
            shippingPrice,
            taxPrice,
            discountAmount,
            totalPrice,
            orderNumber,
            couponCode: couponCode || null,
            status: 'pending', // Use status instead of orderStatus
            notes: specialInstructions || null
        });

        // Helper to clean phone number for Shiprocket (10 digits, no country code)
        const cleanPhone = (phone) => {
            return (phone || '').replace(/\D/g, '').slice(-10);
        };

        // Shiprocket order creation
        try {
            const SHIPROCKET_PICKUP_LOCATION = process.env.SHIPROCKET_PICKUP_LOCATION || 'FAZIL NA';
            const shiprocketOrderPayload = {
                order_id: order._id.toString(),
                order_date: new Date().toISOString().slice(0, 19).replace('T', ' '),
                pickup_location: SHIPROCKET_PICKUP_LOCATION,
                billing_customer_name: req.user.name || customerName || 'Customer',
                billing_last_name: '',
                billing_address: order.shippingAddress.address,
                billing_city: order.shippingAddress.city,
                billing_pincode: order.shippingAddress.postalCode,
                billing_state: order.shippingAddress.state || '',
                billing_country: order.shippingAddress.country,
                billing_email: req.user.email || customerEmail || '',
                billing_phone: cleanPhone(order.shippingAddress.phone),
                shipping_is_billing: true,
                order_items: order.orderItems.map(item => ({
                    name: item.name,
                    sku: item.product.toString(),
                    units: item.quantity,
                    selling_price: item.price
                })),
                payment_method: order.paymentMethod === 'cod' ? 'COD' : 'Prepaid',
                sub_total: order.itemsPrice,
                length: 10,
                breadth: 10,
                height: 10,
                weight: 1
            };
            console.log('[Shiprocket] Creating order with payload:', JSON.stringify(shiprocketOrderPayload, null, 2));
            const shiprocketRes = await createShiprocketOrder(shiprocketOrderPayload);
            console.log('[Shiprocket] Order creation response:', JSON.stringify(shiprocketRes, null, 2));
            if (shiprocketRes && shiprocketRes.order_id && shiprocketRes.shipment_id) {
                order.shiprocketOrderId = shiprocketRes.order_id.toString();
                order.shiprocketShipmentId = shiprocketRes.shipment_id.toString();
                await order.save();
            }
        } catch (shipErr) {
            console.error('[Shiprocket] Order creation failed:', shipErr?.response?.data || shipErr.message);
        }

        // Update user with order reference
        await User.findByIdAndUpdate(req.user.id, {
            $push: { orders: order._id }
        });

        // Add notification for user
        await sendUserNotification(req.user.id, {
            type: 'order_placed',
            order: order._id
        }, { orderNumber, orderId: order._id });

        res.status(201).json(
            new ApiResponse(201, order, 'Order placed successfully')
        );
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get order by ID
 * @route   GET /api/v1/orders/:id
 * @access  Private
 */
export const getOrderById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const order = await Order.findById(id);

        if (!order) {
            return next(new ApiError(404, 'Order not found'));
        }

        // Check if the order belongs to the logged-in user or user is admin
        if (order.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return next(new ApiError(403, 'Not authorized to access this order'));
        }

        res.status(200).json(
            new ApiResponse(200, order, 'Order retrieved successfully')
        );
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get logged in user orders
 * @route   GET /api/v1/orders/my-orders
 * @access  Private
 */
export const getMyOrders = async (req, res, next) => {
    try {
        const orders = await Order.find({ user: req.user.id })
            .sort({ created_at: -1 });

        res.status(200).json(
            new ApiResponse(200, orders, 'User orders retrieved successfully')
        );
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get all orders (admin only)
 * @route   GET /api/v1/orders
 * @access  Private/Admin
 */
export const getAllOrders = async (req, res, next) => {
    try {
        // Pagination
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const skip = (page - 1) * limit;

        // Filtering
        const queryObj = { ...req.query };
        const excludedFields = ['page', 'sort', 'limit', 'fields'];
        excludedFields.forEach(field => delete queryObj[field]);

        // Advanced filtering
        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, match => `$${match}`);

        let query = Order.find(JSON.parse(queryStr));

        // Sorting
        if (req.query.sort) {
            const sortBy = req.query.sort.split(',').join(' ');
            query = query.sort(sortBy);
        } else {
            query = query.sort('-created_at');
        }

        // Execute query with pagination
        const orders = await query
            .skip(skip)
            .limit(limit)
            .populate('user', 'name email');

        // Get total count for pagination info
        const totalOrders = await Order.countDocuments(JSON.parse(queryStr));

        res.status(200).json(
            new ApiResponse(200, {
                orders,
                totalOrders,
                currentPage: page,
                totalPages: Math.ceil(totalOrders / limit),
                resultsPerPage: limit
            }, 'All orders retrieved successfully')
        );
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update order status
 * @route   PUT /api/v1/orders/:id/status
 * @access  Private/Admin
 */
export const updateOrderStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!status) {
            return next(new ApiError(400, 'Please provide order status'));
        }

        const validStatuses = ['processing', 'shipped', 'delivered', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return next(new ApiError(400, 'Invalid order status'));
        }

        const order = await Order.findById(id);

        if (!order) {
            return next(new ApiError(404, 'Order not found'));
        }

        // Update order status
        order.status = status;

        // If order is delivered, set deliveredAt date
        if (status === 'delivered') {
            order.deliveredAt = Date.now();
        }

        // If order is cancelled, handle refund logic if payment was made
        if (status === 'cancelled' && order.isPaid) {
            order.refundStatus = 'pending';
            // Additional refund logic would go here
        }

        await order.save();

        // Add notification for user
        await sendUserNotification(order.user, {
            type: `order_${status}`,
            order: order._id
        }, { orderNumber: order.orderNumber });

        res.status(200).json(
            new ApiResponse(200, order, `Order status updated to ${status}`)
        );
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update order to paid
 * @route   PUT /api/v1/orders/:id/pay
 * @access  Private
 */
export const updateOrderToPaid = async (req, res, next) => {
    try {
        const { id } = req.params;
        const {
            paymentId,
            paymentStatus,
            paymentMethod,
            paymentResult
        } = req.body;

        const order = await Order.findById(id);

        if (!order) {
            return next(new ApiError(404, 'Order not found'));
        }

        // Check if the order belongs to the logged-in user or user is admin
        if (order.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return next(new ApiError(403, 'Not authorized to update this order'));
        }

        // Update order payment details
        order.isPaid = true;
        order.paidAt = Date.now();
        order.paymentResult = {
            id: paymentId,
            status: paymentStatus,
            update_time: Date.now(),
            email_address: req.user.email,
            ...paymentResult
        };

        if (paymentMethod) {
            order.paymentMethod = paymentMethod;
        }

        const updatedOrder = await order.save();

        // Add notification for user
        await sendUserNotification(req.user.id, {
            type: 'payment_successful',
            order: order._id
        }, { orderNumber: order.orderNumber, method: order.paymentMethod });

        res.status(200).json(
            new ApiResponse(200, updatedOrder, 'Order payment updated successfully')
        );
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get order statistics (admin only)
 * @route   GET /api/v1/orders/stats
 * @access  Private/Admin
 */
export const getOrderStats = async (req, res, next) => {
    try {
        // Total orders
        const totalOrders = await Order.countDocuments();

        // Total sales amount
        const salesResult = await Order.aggregate([
            {
                $match: { isPaid: true }
            },
            {
                $group: {
                    _id: null,
                    totalSales: { $sum: '$totalPrice' }
                }
            }
        ]);

        const totalSales = salesResult.length > 0 ? salesResult[0].totalSales : 0;

        // Orders by status
        const ordersByStatus = await Order.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        // Monthly sales for the past year
        const monthlyOrders = await Order.aggregate([
            {
                $match: {
                    isPaid: true,
                    paidAt: { $gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) }
                }
            },
            {
                $group: {
                    _id: {
                        month: { $month: '$paidAt' },
                        year: { $year: '$paidAt' }
                    },
                    count: { $sum: 1 },
                    total: { $sum: '$totalPrice' }
                }
            },
            {
                $sort: { '_id.year': 1, '_id.month': 1 }
            }
        ]);

        // Top selling products
        const topProducts = await Order.aggregate([
            { $unwind: '$orderItems' },
            {
                $group: {
                    _id: '$orderItems.product',
                    name: { $first: '$orderItems.name' },
                    totalSold: { $sum: '$orderItems.quantity' },
                    totalRevenue: { $sum: { $multiply: ['$orderItems.price', '$orderItems.quantity'] } }
                }
            },
            { $sort: { totalSold: -1 } },
            { $limit: 5 }
        ]);

        // Recent orders
        const recentOrders = await Order.find()
            .sort({ created_at: -1 })
            .limit(5)
            .populate('user', 'name email');

        res.status(200).json(
            new ApiResponse(200, {
                totalOrders,
                totalSales,
                ordersByStatus,
                monthlyOrders,
                topProducts,
                recentOrders
            }, 'Order statistics retrieved successfully')
        );
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Cancel order
 * @route   PUT /api/v1/orders/:id/cancel
 * @access  Private
 */
export const cancelOrder = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;

        const order = await Order.findById(id);

        if (!order) {
            return next(new ApiError(404, 'Order not found'));
        }

        // Check if the order belongs to the logged-in user or user is admin
        if (order.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return next(new ApiError(403, 'Not authorized to cancel this order'));
        }

        // Check if order can be cancelled
        if (order.status === 'delivered') {
            return next(new ApiError(400, 'Cannot cancel a delivered order'));
        }

        if (order.status === 'cancelled') {
            return next(new ApiError(400, 'Order is already cancelled'));
        }

        // Update order status
        order.status = 'cancelled';
        order.cancellationReason = reason || 'No reason provided';
        order.cancelledAt = Date.now();

        // If order is paid, set refund status
        if (order.isPaid) {
            order.refundStatus = 'pending';
        }

        await order.save();

        // Add notification for user
        await sendUserNotification(order.user, {
            type: 'order_cancelled',
            order: order._id
        }, { orderNumber: order.orderNumber });

        // Add notification for admin
        const adminUsers = await User.find({ role: 'admin' });
        for (const admin of adminUsers) {
            await User.findByIdAndUpdate(admin._id, {
                $push: {
                    notifications: {
                        type: 'order_cancelled',
                        message: `Order ${order.orderNumber} has been cancelled by ${req.user.role === 'admin' ? 'admin' : 'customer'}.`,
                        order: order._id
                    }
                }
            });
        }

        res.status(200).json(
            new ApiResponse(200, order, 'Order cancelled successfully')
        );
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Process refund for cancelled order
 * @route   PUT /api/v1/orders/:id/refund
 * @access  Private/Admin
 */
export const processRefund = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { refundAmount, refundMethod, transactionId, notes } = req.body;

        const order = await Order.findById(id);

        if (!order) {
            return next(new ApiError(404, 'Order not found'));
        }

        // Check if order is cancelled and paid
        if (order.status !== 'cancelled') {
            return next(new ApiError(400, 'Only cancelled orders can be refunded'));
        }

        if (!order.isPaid) {
            return next(new ApiError(400, 'Order was not paid, no refund needed'));
        }

        if (order.refundStatus === 'completed') {
            return next(new ApiError(400, 'Refund has already been processed'));
        }

        // Process refund
        order.refundStatus = 'completed';
        order.refundDetails = {
            amount: refundAmount || order.totalPrice,
            method: refundMethod,
            transactionId,
            processedAt: Date.now(),
            processedBy: req.user.id,
            notes
        };

        await order.save();

        // Add notification for user
        await User.findByIdAndUpdate(order.user, {
            $push: {
                notifications: {
                    type: 'refund_processed',
                    message: `Refund for order ${order.orderNumber} has been processed.`,
                    order: order._id
                }
            }
        });

        res.status(200).json(
            new ApiResponse(200, order, 'Refund processed successfully')
        );
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Generate invoice for order
 * @route   GET /api/v1/orders/:id/invoice
 * @access  Private
 */
export const generateInvoice = async (req, res, next) => {
    try {
        const { id } = req.params;

        const order = await Order.findById(id)
            .populate('user', 'name email phone')
            .populate('orderItems.product', 'name slug');

        if (!order) {
            return next(new ApiError(404, 'Order not found'));
        }

        // Check if the order belongs to the logged-in user or user is admin
        if (order.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
            return next(new ApiError(403, 'Not authorized to access this order'));
        }



        // Generate invoice data
        const invoiceData = {
            order: {
                id: order._id,
                number: order.orderNumber,
                date: order.created_at,
                paymentDate: order.paidAt,
                paymentMethod: order.paymentMethod
            },
            customer: {
                name: order.user.name,
                email: order.user.email,
                phone: order.user.phone || 'N/A',
                address: order.shippingAddress
            },
            items: order.orderItems.map(item => ({
                name: item.name,
                quantity: item.quantity,
                price: item.price,
                total: item.price * item.quantity
            })),
            summary: {
                subtotal: order.itemsPrice,
                shipping: order.shippingPrice,
                tax: order.taxPrice,
                discount: order.discountAmount,
                total: order.totalPrice
            },
            company: {
                name: 'Yellow Tea',
                address: '123 Tea Garden, Darjeeling, India',
                email: 'support@yellowtea.com',
                phone: '+91 1234567890',
                website: 'www.yellowtea.com',
                gst: 'GSTIN12345678901'
            }
        };

        // In a real implementation, you would generate a PDF here
        // For now, we'll just return the invoice data
        res.status(200).json(
            new ApiResponse(200, invoiceData, 'Invoice data generated successfully')
        );
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Track order
 * @route   GET /api/v1/orders/:id/track
 * @access  Private
 */
export const trackOrder = async (req, res, next) => {
    try {
        const { id } = req.params;

        const order = await Order.findById(id);

        if (!order) {
            return next(new ApiError(404, 'Order not found'));
        }

        // Check if the order belongs to the logged-in user or user is admin
        if (order.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return next(new ApiError(403, 'Not authorized to track this order'));
        }

        // In a real implementation, you would fetch tracking info from a shipping API
        // For now, we'll create mock tracking data based on order status

        const trackingInfo = {
            orderNumber: order.orderNumber,
            status: order.status,
            timeline: [
                {
                    status: 'Order Placed',
                    date: order.created_at,
                    description: 'Your order has been placed successfully'
                }
            ]
        };

        if (order.isPaid) {
            trackingInfo.timeline.push({
                status: 'Payment Confirmed',
                date: order.paidAt,
                description: 'Payment has been received and confirmed'
            });
        }

        if (order.status === 'processing' || order.status === 'shipped' || order.status === 'delivered') {
            trackingInfo.timeline.push({
                status: 'Processing',
                date: new Date(order.created_at.getTime() + 1 * 60 * 60 * 1000), // 1 hour after order
                description: 'Your order is being processed and packed'
            });
        }

        if (order.status === 'shipped' || order.status === 'delivered') {
            trackingInfo.timeline.push({
                status: 'Shipped',
                date: order.shippedAt || new Date(order.created_at.getTime() + 24 * 60 * 60 * 1000), // 1 day after order
                description: 'Your order has been shipped',
                trackingNumber: order.trackingNumber || 'YT' + Math.random().toString(36).substring(2, 10).toUpperCase(),
                courier: order.courier || 'Yellow Tea Express'
            });
        }

        if (order.status === 'delivered') {
            trackingInfo.timeline.push({
                status: 'Delivered',
                date: order.deliveredAt,
                description: 'Your order has been delivered successfully'
            });
        }

        if (order.status === 'cancelled') {
            trackingInfo.timeline.push({
                status: 'Cancelled',
                date: order.cancelledAt || new Date(),
                description: `Order cancelled${order.cancellationReason ? ': ' + order.cancellationReason : ''}`,
            });
        }

        res.status(200).json(
            new ApiResponse(200, trackingInfo, 'Order tracking information retrieved successfully')
        );
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get order analytics for dashboard
 * @route   GET /api/v1/orders/analytics
 * @access  Private/Admin
 */
export const getOrderAnalytics = async (req, res, next) => {
    try {
        // Get date range from query params or default to last 30 days
        const endDate = new Date();
        const startDate = new Date(req.query.startDate || endDate.getTime() - 30 * 24 * 60 * 60 * 1000);

        // Daily orders and revenue for the period
        const dailyData = await Order.aggregate([
            {
                $match: {
                    created_at: { $gte: startDate, $lte: endDate }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: "$created_at" },
                        month: { $month: "$created_at" },
                        day: { $dayOfMonth: "$created_at" }
                    },
                    count: { $sum: 1 },
                    revenue: { $sum: { $cond: [{ $eq: ["$isPaid", true] }, "$totalPrice", 0] } },
                    averageOrderValue: { $avg: "$totalPrice" }
                }
            },
            {
                $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 }
            },
            {
                $project: {
                    _id: 0,
                    date: {
                        $dateFromParts: {
                            year: "$_id.year",
                            month: "$_id.month",
                            day: "$_id.day"
                        }
                    },
                    count: 1,
                    revenue: 1,
                    averageOrderValue: 1
                }
            }
        ]);

        // Conversion rate (orders / sessions)
        // This would typically come from analytics integration
        // For now, we'll use a placeholder calculation
        const totalSessions = await mongoose.model('Session').countDocuments({
            createdAt: { $gte: startDate, $lte: endDate }
        }).catch(() => 1000); // Default if Sessions model doesn't exist

        const totalOrders = await Order.countDocuments({
            created_at: { $gte: startDate, $lte: endDate }
        });

        const conversionRate = (totalOrders / (totalSessions || 1)) * 100;

        // Popular products by region
        const popularByRegion = await Order.aggregate([
            {
                $match: {
                    created_at: { $gte: startDate, $lte: endDate },
                    "shippingAddress.address": { $exists: true }
                }
            },
            { $unwind: "$orderItems" },
            {
                $group: {
                    _id: {
                        region: "$shippingAddress.city",
                        product: "$orderItems.product"
                    },
                    productName: { $first: "$orderItems.name" },
                    count: { $sum: "$orderItems.quantity" }
                }
            },
            {
                $sort: { count: -1 }
            },
            {
                $group: {
                    _id: "$_id.region",
                    products: {
                        $push: {
                            product: "$_id.product",
                            name: "$productName",
                            count: "$count"
                        }
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    region: "$_id",
                    topProducts: { $slice: ["$products", 3] }
                }
            }
        ]);

        // Payment method distribution
        const paymentMethods = await Order.aggregate([
            {
                $match: {
                    created_at: { $gte: startDate, $lte: endDate },
                    isPaid: true
                }
            },
            {
                $group: {
                    _id: "$paymentMethod",
                    count: { $sum: 1 },
                    total: { $sum: "$totalPrice" }
                }
            },
            {
                $project: {
                    _id: 0,
                    method: "$_id",
                    count: 1,
                    total: 1,
                    percentage: { $multiply: [{ $divide: ["$count", totalOrders] }, 100] }
                }
            }
        ]);

        // Return all analytics data
        res.status(200).json(
            new ApiResponse(200, {
                dailyData,
                conversionRate,
                popularByRegion,
                paymentMethods,
                summary: {
                    totalOrders,
                    totalRevenue: dailyData.reduce((sum, day) => sum + day.revenue, 0),
                    averageOrderValue: dailyData.reduce((sum, day) => sum + day.averageOrderValue, 0) / (dailyData.length || 1)
                }
            }, 'Order analytics retrieved successfully')
        );
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Export orders to CSV
 * @route   GET /api/v1/orders/export
 * @access  Private/Admin
 */
export const exportOrders = async (req, res, next) => {
    try {
        // Get date range from query params
        const startDate = req.query.startDate ? new Date(req.query.startDate) : new Date(0);
        const endDate = req.query.endDate ? new Date(req.query.endDate) : new Date();

        // Get orders within date range
        const orders = await Order.find({
            created_at: { $gte: startDate, $lte: endDate }
        }).populate('user', 'name email');

        // Format orders for CSV
        const csvData = orders.map(order => ({
            'Order ID': order._id,
            'Order Number': order.orderNumber,
            'Customer Name': order.user?.name || 'N/A',
            'Customer Email': order.user?.email || 'N/A',
            'Order Date': order.created_at.toISOString().split('T')[0],
            'Status': order.status,
            'Payment Status': order.isPaid ? 'Paid' : 'Not Paid',
            'Payment Method': order.paymentMethod || 'N/A',
            'Items Count': order.orderItems.length,
            'Items Price': order.itemsPrice,
            'Shipping Price': order.shippingPrice,
            'Tax': order.taxPrice,
            'Discount': order.discountAmount,
            'Total Price': order.totalPrice,
            'Shipping Address': `${order.shippingAddress.address}, ${order.shippingAddress.city}, ${order.shippingAddress.postalCode}, ${order.shippingAddress.country}`
        }));

        // In a real implementation, you would generate a CSV file
        // For now, we'll just return the data
        res.status(200).json(
            new ApiResponse(200, csvData, 'Orders exported successfully')
        );
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update shipping details
 * @route   PUT /api/v1/orders/:id/shipping
 * @access  Private/Admin
 */
export const updateShippingDetails = async (req, res, next) => {
    try {
        const { id } = req.params;
        const {
            trackingNumber,
            courier,
            estimatedDelivery,
            shippedAt
        } = req.body;

        const order = await Order.findById(id);

        if (!order) {
            return next(new ApiError(404, 'Order not found'));
        }

        // Update shipping details
        order.trackingNumber = trackingNumber;
        order.courier = courier;
        order.estimatedDelivery = estimatedDelivery ? new Date(estimatedDelivery) : undefined;

        // If shipped date is provided, update it and change status to shipped
        if (shippedAt) {
            order.shippedAt = new Date(shippedAt);
            order.status = 'shipped';
        }

        await order.save();

        // Add notification for user
        await sendUserNotification(order.user, {
            type: 'order_shipped',
            order: order._id
        }, { orderNumber: order.orderNumber, courier: order.courier, trackingNumber: order.trackingNumber });

        res.status(200).json(
            new ApiResponse(200, order, 'Shipping details updated successfully')
        );
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get order count by status
 * @route   GET /api/v1/orders/count-by-status
 * @access  Private/Admin
 */
export const getOrderCountByStatus = async (req, res, next) => {
    try {
        const counts = await Order.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0,
                    status: '$_id',
                    count: 1
                }
            }
        ]);

        // Ensure all statuses are represented
        const allStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
        const result = allStatuses.map(status => {
            const found = counts.find(item => item.status === status);
            return found || { status, count: 0 };
        });

        res.status(200).json(
            new ApiResponse(200, result, 'Order counts by status retrieved successfully')
        );
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Mark COD order as paid (admin/staff)
 * @route   PUT /api/v1/orders/:id/cod-paid
 * @access  Private/Admin
 */
export const markCodOrderAsPaid = async (req, res, next) => {
    try {
        const { id } = req.params;
        const order = await Order.findById(id);
        if (!order) {
            return next(new ApiError(404, 'Order not found'));
        }
        if (order.paymentMethod !== 'cod') {
            return next(new ApiError(400, 'Order is not a COD order'));
        }
        if (order.isPaid) {
            return next(new ApiError(400, 'Order is already marked as paid'));
        }
        order.isPaid = true;
        order.paidAt = Date.now();
        order.paymentResult = {
            id: 'COD',
            status: 'paid',
            update_time: Date.now(),
            email_address: order.user?.email || '',
            method: 'cod'
        };
        await order.save();
        await sendUserNotification(order.user, {
            type: 'payment_successful',
            order: order._id
        }, { orderNumber: order.orderNumber, method: 'cod' });
        res.status(200).json(new ApiResponse(200, order, 'COD order marked as paid'));
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Check Shiprocket courier serviceability and estimated delivery days
 * @route   POST /api/v1/orders/shiprocket-serviceability
 * @access  Public
 */
export const shiprocketServiceability = async (req, res, next) => {
    try {
        const { pickup_postcode, delivery_postcode, cod, weight } = req.body;
        if (!pickup_postcode || !delivery_postcode) {
            return res.status(400).json({ success: false, message: 'pickup_postcode and delivery_postcode are required' });
        }
        const result = await checkCourierServiceability({ pickup_postcode, delivery_postcode, cod, weight });
        res.status(200).json({ success: true, data: result, message: 'Serviceability checked successfully' });
    } catch (error) {
        next(error);
    }
};