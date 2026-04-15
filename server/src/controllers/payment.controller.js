import { razorpay, RAZORPAY_CONFIG, formatAmountForRazorpay, formatAmountFromRazorpay } from '../config/razorpay.config.js';
import Order from '../models/order.model.js';
import User from '../models/user.model.js';
import { ApiError } from '../utils/apiError.js';
import { ApiResponse } from '../utils/apiResponse.js';
import crypto from 'crypto';
import { sendUserNotification } from '../utils/responseHandler.js';

/**
 * @desc    Create Razorpay order
 * @route   POST /api/v1/payments/create-order
 * @access  Private
 */
export const createRazorpayOrder = async (req, res, next) => {
    try {
        const { orderId } = req.body;

        if (!orderId) {
            return next(new ApiError(400, 'Order ID is required'));
        }

        // Find the order
        const order = await Order.findById(orderId).populate('user', 'name email phone');

        if (!order) {
            return next(new ApiError(404, 'Order not found'));
        }

        // Check if the order belongs to the logged-in user
        if (order.user._id.toString() !== req.user.id) {
            return next(new ApiError(403, 'Not authorized to access this order'));
        }

        // Check if order is already paid
        if (order.isPaid) {
            return next(new ApiError(400, 'Order is already paid'));
        }

        // Check if order is cancelled
        if (order.status === 'cancelled') {
            return next(new ApiError(400, 'Cannot process payment for cancelled order'));
        }

        // Create Razorpay order
        const razorpayOrder = await razorpay.orders.create({
            amount: formatAmountForRazorpay(order.totalPrice),
            currency: RAZORPAY_CONFIG.currency,
            receipt: order.orderNumber,
            notes: {
                orderId: order._id.toString(),
                orderNumber: order.orderNumber,
                customerName: order.user.name,
                customerEmail: order.user.email
            }
        });

        // Update order with Razorpay order ID
        order.razorpayOrderId = razorpayOrder.id;
        await order.save();

        res.status(200).json(
            new ApiResponse(200, {
                razorpayOrder: razorpayOrder, // full object from Razorpay
                key: process.env.RAZORPAY_KEY_ID
            }, 'Razorpay order created successfully')
        );
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Verify Razorpay payment
 * @route   POST /api/v1/payments/verify
 * @access  Private
 */
export const verifyPayment = async (req, res, next) => {
    try {
        const {
            razorpay_order_id, 
            razorpay_payment_id, 
            razorpay_signature,
            orderId 
        } = req.body;

        console.log('Payment verification request:', req.body);

        // Check for required fields
        if (!razorpay_payment_id) {
            return next(new ApiError(400, 'Missing razorpay_payment_id'));
        }

        // If orderId is not provided, try to extract it from razorpay_order_id
        let actualOrderId = orderId;
        if (!actualOrderId && razorpay_order_id) {
            // Try to find order by razorpay_order_id
            const order = await Order.findOne({ razorpayOrderId: razorpay_order_id });
            if (order) {
                actualOrderId = order._id;
            }
        }

        if (!actualOrderId) {
            return next(new ApiError(400, 'Order ID not found. Please provide orderId or valid razorpay_order_id'));
        }

        // Find the order
        const order = await Order.findById(actualOrderId);

        if (!order) {
            return next(new ApiError(404, 'Order not found'));
        }

        // Check if the order belongs to the logged-in user
        if (order.user.toString() !== req.user.id) {
            return next(new ApiError(403, 'Not authorized to verify this payment'));
        }

        // Verify the payment signature if provided
        if (razorpay_order_id && razorpay_signature) {
            const body = razorpay_order_id + "|" + razorpay_payment_id;
            const expectedSignature = crypto
                .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
                .update(body.toString())
                .digest("hex");

            if (expectedSignature !== razorpay_signature) {
                return next(new ApiError(400, 'Invalid payment signature'));
            }
        }

        // Verify payment with Razorpay
        try {
            const payment = await razorpay.payments.fetch(razorpay_payment_id);
            
            if (payment.status !== 'captured') {
                return next(new ApiError(400, 'Payment not captured'));
            }

            // Update order payment details
            order.isPaid = true;
            order.paidAt = Date.now();
            order.paymentMethod = 'razorpay';
            order.paymentResult = {
                id: razorpay_payment_id,
                status: 'captured',
                update_time: Date.now(),
                email_address: req.user.email,
                razorpay_order_id: razorpay_order_id || payment.order_id,
                razorpay_payment_id: razorpay_payment_id
            };
            order.status = 'processing';

            await order.save();

            // Add notification for user
            await sendUserNotification(order.user, {
                type: 'payment_successful',
                order: order._id
            }, { orderNumber: order.orderNumber, method: order.paymentMethod, orderId: order._id });

            res.status(200).json(
                new ApiResponse(200, {
                    order: order,
                    payment: {
                        id: razorpay_payment_id,
                        status: 'captured',
                        amount: formatAmountFromRazorpay(payment.amount),
                        currency: payment.currency
                    }
                }, 'Payment verified and order updated successfully')
            );
        } catch (razorpayError) {
            console.error('Razorpay verification error:', razorpayError);
            return next(new ApiError(400, 'Failed to verify payment with Razorpay'));
        }
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get payment status
 * @route   GET /api/v1/payments/status/:orderId
 * @access  Private
 */
export const getPaymentStatus = async (req, res, next) => {
    try {
        const { orderId } = req.params;

        const order = await Order.findById(orderId);

        if (!order) {
            return next(new ApiError(404, 'Order not found'));
        }

        // Check if the order belongs to the logged-in user
        if (order.user.toString() !== req.user.id) {
            return next(new ApiError(403, 'Not authorized to access this order'));
        }

        let paymentStatus = {
            isPaid: order.isPaid,
            paymentMethod: order.paymentMethod,
            paidAt: order.paidAt,
            status: order.status
        };

        // If payment was made via Razorpay, get additional details
        if (order.isPaid && order.paymentResult?.razorpay_payment_id) {
            try {
                const payment = await razorpay.payments.fetch(order.paymentResult.razorpay_payment_id);
                paymentStatus.razorpayDetails = {
                    paymentId: payment.id,
                    status: payment.status,
                    method: payment.method,
                    bank: payment.bank,
                    cardId: payment.card_id,
                    vpa: payment.vpa,
                    email: payment.email,
                    contact: payment.contact
                };
            } catch (error) {
                paymentStatus.razorpayDetails = {
                    error: 'Unable to fetch payment details from Razorpay'
                };
            }
        }

        res.status(200).json(
            new ApiResponse(200, paymentStatus, 'Payment status retrieved successfully')
        );
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Process refund via Razorpay
 * @route   POST /api/v1/payments/refund
 * @access  Private/Admin
 */
export const processRefund = async (req, res, next) => {
    try {
        const { orderId, refundAmount, reason } = req.body;

        if (!orderId) {
            return next(new ApiError(400, 'Order ID is required'));
        }

        const order = await Order.findById(orderId);

        if (!order) {
            return next(new ApiError(404, 'Order not found'));
        }

        // Check if order is paid
        if (!order.isPaid) {
            return next(new ApiError(400, 'Order is not paid'));
        }

        // Check if order has Razorpay payment
        if (!order.paymentResult?.razorpay_payment_id) {
            return next(new ApiError(400, 'Order does not have Razorpay payment'));
        }

        // Calculate refund amount
        const refundAmountInPaise = refundAmount 
            ? formatAmountForRazorpay(refundAmount)
            : formatAmountForRazorpay(order.totalPrice);

        // Process refund with Razorpay
        const refund = await razorpay.payments.refund(
            order.paymentResult.razorpay_payment_id,
            {
                amount: refundAmountInPaise,
                speed: 'normal',
                notes: {
                    reason: reason || 'Customer request',
                    orderId: order._id.toString(),
                    orderNumber: order.orderNumber
                }
            }
        );

        // Update order with refund details
        order.refundStatus = 'completed';
        order.refundDetails = {
            amount: formatAmountFromRazorpay(refund.amount),
            id: refund.id,
            status: refund.status,
            processedAt: Date.now(),
            processedBy: req.user.id,
            reason: reason || 'Customer request',
            razorpayRefundId: refund.id
        };

        await order.save();

        // Add notification for user
        await sendUserNotification(order.user, {
            type: 'refund_processed',
            order: order._id
        }, { orderNumber: order.orderNumber, amount: formatAmountFromRazorpay(refund.amount) });

        res.status(200).json(
            new ApiResponse(200, {
                refund: {
                    id: refund.id,
                    amount: formatAmountFromRazorpay(refund.amount),
                    status: refund.status,
                    processedAt: Date.now()
                },
                order: order
            }, 'Refund processed successfully')
        );
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get payment methods available
 * @route   GET /api/v1/payments/methods
 * @access  Public
 */
export const getPaymentMethods = async (req, res, next) => {
    try {
        const paymentMethods = [
            {
                id: 'razorpay',
                name: 'Razorpay',
                description: 'Pay securely with cards, UPI, net banking, and wallets',
                methods: [
                    { id: 'card', name: 'Credit/Debit Card', icon: '💳' },
                    { id: 'upi', name: 'UPI', icon: '📱' },
                    { id: 'netbanking', name: 'Net Banking', icon: '🏦' },
                    { id: 'wallet', name: 'Digital Wallets', icon: '👛' }
                ],
                isActive: true
            },
            {
                id: 'cod',
                name: 'Cash on Delivery',
                description: 'Pay with cash when your order is delivered',
                methods: [
                    { id: 'cod', name: 'Cash on Delivery', icon: '💵' }
                ],
                isActive: true
            }
        ];

        res.status(200).json(
            new ApiResponse(200, paymentMethods, 'Payment methods retrieved successfully')
        );
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get payment analytics (admin only)
 * @route   GET /api/v1/payments/analytics
 * @access  Private/Admin
 */
export const getPaymentAnalytics = async (req, res, next) => {
    try {
        // Get date range from query params or default to last 30 days
        const endDate = new Date();
        const startDate = new Date(req.query.startDate || endDate.getTime() - 30 * 24 * 60 * 60 * 1000);

        // Payment success rate
        const totalOrders = await Order.countDocuments({
            created_at: { $gte: startDate, $lte: endDate }
        });

        const paidOrders = await Order.countDocuments({
            created_at: { $gte: startDate, $lte: endDate },
            isPaid: true
        });

        const successRate = totalOrders > 0 ? (paidOrders / totalOrders) * 100 : 0;

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
                    _id: '$paymentMethod',
                    count: { $sum: 1 },
                    total: { $sum: '$totalPrice' }
                }
            },
            {
                $project: {
                    _id: 0,
                    method: '$_id',
                    count: 1,
                    total: 1,
                    percentage: { $multiply: [{ $divide: ['$count', paidOrders] }, 100] }
                }
            }
        ]);

        // Daily payment trends
        const dailyPayments = await Order.aggregate([
            {
                $match: {
                    created_at: { $gte: startDate, $lte: endDate },
                    isPaid: true
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$paidAt' },
                        month: { $month: '$paidAt' },
                        day: { $dayOfMonth: '$paidAt' }
                    },
                    count: { $sum: 1 },
                    total: { $sum: '$totalPrice' }
                }
            },
            {
                $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
            }
        ]);

        // Failed payments analysis
        const failedPayments = await Order.countDocuments({
            created_at: { $gte: startDate, $lte: endDate },
            isPaid: false,
            status: { $ne: 'cancelled' }
        });

        res.status(200).json(
            new ApiResponse(200, {
                summary: {
                    totalOrders,
                    paidOrders,
                    failedPayments,
                    successRate: Math.round(successRate * 100) / 100
                },
                paymentMethods,
                dailyPayments,
                period: {
                    startDate,
                    endDate
                }
            }, 'Payment analytics retrieved successfully')
        );
    } catch (error) {
        next(error);
    }
}; 