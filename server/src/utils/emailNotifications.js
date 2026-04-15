import { sendEmail } from './sendEmail.js';

export const sendEmailNotification = async (userEmail, subject, message) => {
    try {
        await sendEmail({
            email: userEmail,
            subject: subject,
            message: message
        });
        console.log(`Email notification sent to ${userEmail}`);
        return true;
    } catch (error) {
        console.error('Failed to send email notification:', error);
        return false;
    }
}; 