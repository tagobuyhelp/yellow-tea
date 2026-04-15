/**
 * Standard success response
 * @param {Object} res - Express response object
 * @param {Number} statusCode - HTTP status code
 * @param {String} message - Success message
 * @param {Object} data - Response data
 */
export const successResponse = (res, statusCode = 200, message = 'Success', data = {}) => {
    return res.status(statusCode).json({
        success: true,
        message,
        data
    });
};

/**
 * Paginated response
 * @param {Object} res - Express response object
 * @param {Number} statusCode - HTTP status code
 * @param {String} message - Success message
 * @param {Array} data - Response data array
 * @param {Number} page - Current page
 * @param {Number} limit - Items per page
 * @param {Number} total - Total number of items
 */
export const paginatedResponse = (res, statusCode = 200, message = 'Success', data = [], page = 1, limit = 10, total = 0) => {
    const totalPages = Math.ceil(total / limit);

    return res.status(statusCode).json({
        success: true,
        message,
        data,
        pagination: {
            page,
            limit,
            total,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1
        }
    });
};

import { sendWhatsApp } from './whatsapp.js';
import { sendEmailNotification } from './emailNotifications.js';
import User from '../models/user.model.js';
import { notificationTemplates } from './notificationTemplates.js';

// Configuration - you can control which notifications to send
const NOTIFICATION_CONFIG = {
    enableWhatsApp: true,
    enableEmail: true,
    emailFallback: true, // Always send email if WhatsApp fails
    inAppFallback: true  // Always save in-app notification
};

const whatsappNotificationTypes = [
    'order_placed',
    'order_processing',
    'order_shipped',
    'order_delivered',
    'order_cancelled',
    'payment_successful',
    'payment_failed',
    'refund_processed'
];

export const sendUserNotification = async (userId, notification, data = {}) => {
    try {
        // Fetch user for name/phone/email if needed
        const user = await User.findById(userId).select('phone name email');
        
        // Use template if available
        let inAppMessage = notification.message;
        let whatsappMessage = null;
        let emailData = null;
        
        if (notificationTemplates[notification.type]) {
            const templateData = { 
                ...data, 
                name: user?.name || '', 
                orderNumber: data.orderNumber,
                orderId: data.orderId || notification.order // Use orderId from data or notification.order
            };
            const templates = notificationTemplates[notification.type](templateData);
            inAppMessage = templates.inApp;
            whatsappMessage = templates.whatsapp;
            emailData = templates.email;
        }

        // Always save in-app notification
        if (NOTIFICATION_CONFIG.inAppFallback) {
            await User.findByIdAndUpdate(userId, {
                $push: { notifications: { ...notification, message: inAppMessage } }
            });
        }

        // Send WhatsApp notification
        let whatsappSent = false;
        if (NOTIFICATION_CONFIG.enableWhatsApp && whatsappMessage && user?.phone) {
            try {
                await sendWhatsApp(user.phone, whatsappMessage);
                whatsappSent = true;
                console.log(`WhatsApp notification sent to ${user.phone} for ${notification.type}`);
            } catch (error) {
                console.error('WhatsApp notification failed:', error);
                whatsappSent = false;
            }
        }

        // Send email notification (always if email is enabled, or as fallback if WhatsApp failed)
        if (NOTIFICATION_CONFIG.enableEmail && emailData && user?.email) {
            const shouldSendEmail = !NOTIFICATION_CONFIG.emailFallback || !whatsappSent;
            
            if (shouldSendEmail) {
                try {
                    await sendEmailNotification(user.email, emailData.subject, emailData.message);
                    console.log(`Email notification sent to ${user.email} for ${notification.type}`);
                } catch (error) {
                    console.error('Email notification failed:', error);
                }
            }
        }

        console.log(`Notification sent for ${notification.type} to user ${userId}`);
        
    } catch (err) {
        console.error('Failed to send notification:', err);
    }
};