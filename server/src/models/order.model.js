import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: [1, 'Quantity must be at least 1']
    },
    image: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    }
});

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    orderItems: [orderItemSchema],
    shippingAddress: {
        address: { type: String, required: true },
        city: { type: String, required: true },
        postalCode: { type: String, required: true },
        state: { type: String, required: true },
        country: { type: String, required: true },
        phone: { type: String, required: true }
    },
    paymentMethod: {
        type: String,
        required: true,
        enum: ['credit_card', 'debit_card', 'upi', 'cod', 'wallet', 'razorpay']
    },
    paymentResult: {
        id: { type: String },
        status: { type: String },
        update_time: { type: String },
        email_address: { type: String },
        razorpay_order_id: { type: String },
        razorpay_payment_id: { type: String }
    },
    itemsPrice: {
        type: Number,
        required: true,
        default: 0.0
    },
    taxPrice: {
        type: Number,
        required: true,
        default: 0.0
    },
    shippingPrice: {
        type: Number,
        required: true,
        default: 0.0
    },
    discountAmount: {
        type: Number,
        default: 0.0
    },
    totalPrice: {
        type: Number,
        required: true,
        default: 0.0
    },
    isPaid: {
        type: Boolean,
        required: true,
        default: false
    },
    paidAt: {
        type: Date
    },
    isDelivered: {
        type: Boolean,
        required: true,
        default: false
    },
    deliveredAt: {
        type: Date
    },
    status: {
        type: String,
        required: true,
        enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
        default: 'pending'
    },
    // Shiprocket integration fields
    shiprocketOrderId: {
        type: String,
        default: null
    },
    shiprocketShipmentId: {
        type: String,
        default: null
    },
    trackingNumber: {
        type: String
    },
    orderNumber: {
        type: String,
        required: true,
        unique: true
    },
    razorpayOrderId: {
        type: String
    },
    couponCode: {
        type: String
    },
    notes: {
        type: String
    },
    refundStatus: {
        type: String,
        enum: ['pending', 'processing', 'completed', 'failed'],
        required: false
    },
    refundDetails: {
        amount: { type: Number },
        id: { type: String },
        status: { type: String },
        processedAt: { type: Date },
        processedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        reason: { type: String },
        razorpayRefundId: { type: String }
    }
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

// Add any order-specific methods here

const Order = mongoose.model('Order', orderSchema);

export default Order;