const FRONTEND_BASE_URL = process.env.FRONTEND_BASE_URL || 'http://localhost:8081';

export const notificationTemplates = {
    order_placed: ({ name, orderNumber, orderId }) => ({
        whatsapp: `Hi ${name}, your order ${orderNumber} has been placed successfully! Thank you for shopping with us.`,
        inApp: `Your order ${orderNumber} has been placed successfully.`,
        email: {
            subject: `Order Confirmed - ${orderNumber}`,
            message: `Hi ${name},\n\nYour order ${orderNumber} has been placed successfully!\n\nThank you for shopping with Yellow Tea.\n\nTrack your order: ${FRONTEND_BASE_URL}/track-order/${orderId}\n\nWe'll keep you updated on your order status.\n\nBest regards,\nYellow Tea Team`
        }
    }),
    order_processing: ({ name, orderNumber, orderId }) => ({
        whatsapp: `Hi ${name}, your order ${orderNumber} is now being processed. We will notify you when it ships.`,
        inApp: `Your order ${orderNumber} is now being processed.`,
        email: {
            subject: `Order Processing - ${orderNumber}`,
            message: `Hi ${name},\n\nYour order ${orderNumber} is now being processed.\n\nTrack your order: ${FRONTEND_BASE_URL}/track-order/${orderId}\n\nWe'll notify you when it ships.\n\nBest regards,\nYellow Tea Team`
        }
    }),
    order_shipped: ({ name, orderNumber, courier, trackingNumber, orderId }) => ({
        whatsapp: `Hi ${name}, your order ${orderNumber} has been shipped via ${courier}. Tracking number: ${trackingNumber}.`,
        inApp: `Your order ${orderNumber} has been shipped. Track it with ${courier} using tracking number ${trackingNumber}.`,
        email: {
            subject: `Order Shipped - ${orderNumber}`,
            message: `Hi ${name},\n\nYour order ${orderNumber} has been shipped!\n\nCourier: ${courier}\nTracking Number: ${trackingNumber}\n\nTrack your order: ${FRONTEND_BASE_URL}/track-order/${orderId}\n\nBest regards,\nYellow Tea Team`
        }
    }),
    order_delivered: ({ name, orderNumber, orderId }) => ({
        whatsapp: `Hi ${name}, your order ${orderNumber} has been delivered. Enjoy your purchase!`,
        inApp: `Your order ${orderNumber} has been delivered.`,
        email: {
            subject: `Order Delivered - ${orderNumber}`,
            message: `Hi ${name},\n\nYour order ${orderNumber} has been delivered successfully!\n\nTrack your order: ${FRONTEND_BASE_URL}/track-order/${orderId}\n\nWe hope you enjoy your purchase. If you have any questions, please don't hesitate to contact us.\n\nBest regards,\nYellow Tea Team`
        }
    }),
    order_cancelled: ({ name, orderNumber, orderId }) => ({
        whatsapp: `Hi ${name}, your order ${orderNumber} has been cancelled. If you have questions, contact support.`,
        inApp: `Your order ${orderNumber} has been cancelled.`,
        email: {
            subject: `Order Cancelled - ${orderNumber}`,
            message: `Hi ${name},\n\nYour order ${orderNumber} has been cancelled.\n\nTrack your order: ${FRONTEND_BASE_URL}/track-order/${orderId}\n\nIf you have any questions, please contact our support team.\n\nBest regards,\nYellow Tea Team`
        }
    }),
    payment_successful: ({ name, orderNumber, method, orderId }) => ({
        whatsapp: `Hi ${name}, your payment for order ${orderNumber} (${method || 'online'}) was successful. Thank you!`,
        inApp: `Payment for order ${orderNumber} was successful.`,
        email: {
            subject: `Payment Successful - ${orderNumber}`,
            message: `Hi ${name},\n\nYour payment for order ${orderNumber} (${method || 'online'}) was successful!\n\nTrack your order: ${FRONTEND_BASE_URL}/track-order/${orderId}\n\nThank you for your purchase.\n\nBest regards,\nYellow Tea Team`
        }
    }),
    payment_failed: ({ name, orderNumber, orderId }) => ({
        whatsapp: `Hi ${name}, your payment for order ${orderNumber} failed. Please try again or contact support.`,
        inApp: `Payment for order ${orderNumber} failed.`,
        email: {
            subject: `Payment Failed - ${orderNumber}`,
            message: `Hi ${name},\n\nYour payment for order ${orderNumber} failed.\n\nTrack your order: ${FRONTEND_BASE_URL}/track-order/${orderId}\n\nPlease try again or contact our support team for assistance.\n\nBest regards,\nYellow Tea Team`
        }
    }),
    refund_processed: ({ name, orderNumber, amount, orderId }) => ({
        whatsapp: `Hi ${name}, your refund for order ${orderNumber} has been processed. Amount: ₹${amount}.`,
        inApp: `Refund for order ${orderNumber} has been processed. Amount: ₹${amount}.`,
        email: {
            subject: `Refund Processed - ${orderNumber}`,
            message: `Hi ${name},\n\nYour refund for order ${orderNumber} has been processed.\n\nRefund Amount: ₹${amount}\nTrack your order: ${FRONTEND_BASE_URL}/track-order/${orderId}\n\nThe refund will be credited to your original payment method within 5-7 business days.\n\nBest regards,\nYellow Tea Team`
        }
    })
}; 