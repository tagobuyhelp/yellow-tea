import twilio from 'twilio';
import dotenv from 'dotenv';
dotenv.config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const whatsappFrom = process.env.TWILIO_WHATSAPP_FROM; // e.g. 'whatsapp:+14155238886'

let client = null;
// Only initialize Twilio client if all required environment variables are present
if (accountSid && authToken && whatsappFrom && accountSid.startsWith('AC')) {
    try {
        client = twilio(accountSid, authToken);
        console.log('Twilio WhatsApp client initialized successfully');
    } catch (error) {
        console.error('Failed to initialize Twilio client:', error);
        client = null;
    }
} else {
    console.log('Twilio WhatsApp not configured. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_WHATSAPP_FROM in your .env file to enable WhatsApp notifications.');
}

export const sendWhatsApp = async (to, message) => {
    if (!client || !whatsappFrom) {
        console.warn('Twilio WhatsApp not configured. Skipping WhatsApp notification.');
        return;
    }
    try {
        await client.messages.create({
            from: whatsappFrom,
            to: to.startsWith('whatsapp:') ? to : `whatsapp:${to}`,
            body: message
        });
        console.log(`WhatsApp message sent to ${to}`);
    } catch (err) {
        console.error('Failed to send WhatsApp message:', err);
    }
}; 