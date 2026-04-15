import crypto from 'crypto';
import Order from '../models/order.model.js';
import User from '../models/user.model.js';
import { ApiError } from '../utils/apiError.js';
import { ApiResponse } from '../utils/apiResponse.js';

/**
 * @desc    Handle Razorpay webhook notifications
 * @route   POST /api/v1/webhooks/razorpay
 * @access  Public (but verified by signature)
 */
export const handleRazorpayWebhook = async (req, res, next) => {
    try {
        const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
        
        if (!webhookSecret) {
            return next(new ApiError(500, 'Webhook secret not configured'));
        }

        // Get the signature from headers
        const signature = req.headers['x-razorpay-signature'];
        
        if (!signature) {
            return next(new ApiError(400, 'Missing webhook signature'));
        }

        // Verify webhook signature
        const expectedSignature = crypto
            .createHmac('sha256', webhookSecret)
            .update(JSON.stringify(req.body))
            .digest('hex');

        if (signature !== expectedSignature) {
            return next(new ApiError(400, 'Invalid webhook signature'));
        }

        const event = req.body;

        // Handle different webhook events
        switch (event.event) {
            case 'payment.captured':
                await handlePaymentCaptured(event.payload.payment.entity);
                break;
                
            case 'payment.failed':
                await handlePaymentFailed(event.payload.payment.entity);
                break;
                
            case 'refund.processed':
                await handleRefundProcessed(event.payload.refund.entity);
                break;
                
            case 'order.paid':
                await handleOrderPaid(event.payload.order.entity);
                break;
                
            default:
                console.log(`Unhandled webhook event: ${event.event}`);
        }

        res.status(200).json(
            new ApiResponse(200, {}, 'Webhook processed successfully')
        );
    } catch (error) {
        next(error);
    }
};

/**
 * Handle payment captured event
 */
const handlePaymentCaptured = async (payment) => {
    try {
        // Find order by Razorpay order ID
        const order = await Order.findOne({ razorpayOrderId: payment.order_id });
        
        if (!order) {
            console.error(`Order not found for Razorpay order ID: ${payment.order_id}`);
            return;
        }

        // Update order if not already paid
        if (!order.isPaid) {
            order.isPaid = true;
            order.paidAt = Date.now();
            order.paymentMethod = 'razorpay';
            order.paymentResult = {
                id: payment.id,
                status: payment.status,
                update_time: Date.now(),
                email_address: payment.email,
                razorpay_order_id: payment.order_id,
                razorpay_payment_id: payment.id
            };
            order.status = 'processing';

            await order.save();

            // Send notification to user
            await sendUserNotification(order.user, {
                type: 'payment_successful',
                order: order._id
            }, { orderNumber: order.orderNumber, method: 'razorpay', orderId: order._id });

            console.log(`Payment captured for order: ${order.orderNumber}`);
        }
    } catch (error) {
        console.error('Error handling payment captured:', error);
    }
};

/**
 * Handle payment failed event
 */
const handlePaymentFailed = async (payment) => {
    try {
        // Find order by Razorpay order ID
        const order = await Order.findOne({ razorpayOrderId: payment.order_id });
        
        if (!order) {
            console.error(`Order not found for Razorpay order ID: ${payment.order_id}`);
            return;
        }

        // Update order status
        order.status = 'cancelled';
        order.paymentResult = {
            id: payment.id,
            status: payment.status,
            update_time: Date.now(),
            email_address: payment.email,
            razorpay_order_id: payment.order_id,
            razorpay_payment_id: payment.id,
            error_code: payment.error_code,
            error_description: payment.error_description
        };

        await order.save();

        // Add notification for user
        await User.findByIdAndUpdate(order.user, {
            $push: {
                notifications: {
                    type: 'payment_failed',
                    message: `Payment for order ${order.orderNumber} failed. Please try again.`,
                    order: order._id
                }
            }
        });

        console.log(`Payment failed for order: ${order.orderNumber}`);
    } catch (error) {
        console.error('Error handling payment failed:', error);
    }
};

/**
 * Handle refund processed event
 */
const handleRefundProcessed = async (refund) => {
    try {
        // Find order by Razorpay payment ID
        const order = await Order.findOne({ 
            'paymentResult.razorpay_payment_id': refund.payment_id 
        });
        
        if (!order) {
            console.error(`Order not found for Razorpay payment ID: ${refund.payment_id}`);
            return;
        }

        // Update order refund details
        order.refundStatus = 'completed';
        order.refundDetails = {
            amount: refund.amount / 100, // Convert from paise to rupees
            id: refund.id,
            status: refund.status,
            processedAt: Date.now(),
            reason: refund.notes?.reason || 'Customer request',
            razorpayRefundId: refund.id
        };

        await order.save();

        // Add notification for user
        await User.findByIdAndUpdate(order.user, {
            $push: {
                notifications: {
                    type: 'refund_processed',
                    message: `Refund for order ${order.orderNumber} has been processed. Amount: ₹${refund.amount / 100}`,
                    order: order._id
                }
            }
        });

        console.log(`Refund processed for order: ${order.orderNumber}`);
    } catch (error) {
        console.error('Error handling refund processed:', error);
    }
};

/**
 * Handle order paid event
 */
const handleOrderPaid = async (orderEntity) => {
    try {
        // Find order by Razorpay order ID
        const order = await Order.findOne({ razorpayOrderId: orderEntity.id });
        
        if (!order) {
            console.error(`Order not found for Razorpay order ID: ${orderEntity.id}`);
            return;
        }

        // Update order status
        if (!order.isPaid) {
            order.isPaid = true;
            order.paidAt = Date.now();
            order.status = 'processing';

            await order.save();

            console.log(`Order paid: ${order.orderNumber}`);
        }
    } catch (error) {
        console.error('Error handling order paid:', error);
    }
};

/**
 * @desc    Test webhook endpoint
 * @route   POST /api/v1/webhooks/test
 * @access  Public
 */
export const testWebhook = async (req, res, next) => {
    try {
        res.status(200).json(
            new ApiResponse(200, {
                message: 'Webhook endpoint is working',
                timestamp: new Date().toISOString(),
                body: req.body
            }, 'Webhook test successful')
        );
    } catch (error) {
        next(error);
    }
}; 