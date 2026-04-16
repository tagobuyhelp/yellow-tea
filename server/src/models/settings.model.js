import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
    singleton_key: {
        type: String,
        default: 'global',
        unique: true,
        index: true
    },
    store: {
        name: { type: String, default: '' },
        description: { type: String, default: '' },
        email: { type: String, default: '' },
        phone: { type: String, default: '' },
        address: { type: String, default: '' },
        currency: { type: String, default: 'INR' },
        timezone: { type: String, default: 'Asia/Kolkata' },
        logoUrl: { type: String, default: '' }
    },
    payments: {
        razorpayEnabled: { type: Boolean, default: false },
        razorpayKeyId: { type: String, default: '' },
        razorpayKeySecretEnc: { type: String, default: '' },
        codEnabled: { type: Boolean, default: true },
        minOrderAmount: { type: Number, default: 0 },
        maxOrderAmount: { type: Number, default: 0 }
    },
    shipping: {
        freeShippingThreshold: { type: Number, default: 0 },
        standardShipping: { type: Number, default: 0 },
        expressShipping: { type: Number, default: 0 },
        internationalShipping: { type: Number, default: 0 },
        shippingTax: { type: Number, default: 0 },
        pickupPincode: { type: String, default: '' },
        chargeDelivery: { type: Boolean, default: false },
        chargeGST: { type: Boolean, default: false }
    },
    notifications: {
        emailNotifications: { type: Boolean, default: true },
        smsNotifications: { type: Boolean, default: false },
        orderNotifications: { type: Boolean, default: true },
        lowStockAlerts: { type: Boolean, default: true },
        customerRegistration: { type: Boolean, default: true },
        weeklyReports: { type: Boolean, default: true }
    },
    version: {
        type: Number,
        default: 1
    }
}, { timestamps: true, collection: 'settings' });

const Settings = mongoose.model('Settings', settingsSchema);

export default Settings;
