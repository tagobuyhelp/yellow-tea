// Payment service for Yellow Tea backend
import axios from 'axios';

// API configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5500/api/v1';

// Create axios instance with default config
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add JWT token to requests if available
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('token') || localStorage.getItem('authToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('Payment API Error:', error);

        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('authToken');
            window.location.href = '/login';
        }

        throw error;
    }
);

// Types
export interface PaymentMethod {
    id: string;
    name: string;
    description: string;
    methods: Array<{
        id: string;
        name: string;
        icon: string;
    }>;
    isActive: boolean;
}

export interface OrderItem {
    product: string;
    quantity: number;
    price: number;
}

export interface ShippingAddress {
    address: string;
    city: string;
    postalCode: string;
    country: string;
    phone: string;
}

export interface CreateOrderPayload {
    orderItems: OrderItem[];
    shippingAddress: ShippingAddress;
    paymentMethod: string;
    itemsPrice: number;
    taxPrice: number;
    shippingPrice: number;
    totalPrice: number;
}

export interface Order {
    _id: string;
    orderNumber: string;
    user: string;
    orderItems: OrderItem[];
    shippingAddress: ShippingAddress;
    paymentMethod: string;
    paymentResult: {
        id?: string;
        status?: string;
        update_time?: string;
        email_address?: string;
        [key: string]: unknown;
    } | null;
    itemsPrice: number;
    taxPrice: number;
    shippingPrice: number;
    totalPrice: number;
    isPaid: boolean;
    paidAt: string | null;
    isDelivered: boolean;
    deliveredAt: string | null;
    status: string;
    createdAt: string;
    updatedAt: string;
}

export interface RazorpayOrder {
    id: string;
    entity: string;
    amount: number;
    amount_paid: number;
    amount_due: number;
    currency: string;
    receipt: string;
    status: string;
    attempts: number;
    notes: Record<string, unknown>;
    created_at: number;
}

export interface PaymentVerificationPayload {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
}

export interface PaymentStatus {
    orderId: string;
    orderNumber: string;
    paymentStatus: string;
    isPaid: boolean;
    paidAt: string | null;
    paymentMethod: string;
    amount: number;
}

export interface RazorpayHandlerResponse {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    [key: string]: unknown;
}

// Payment API functions
export const paymentAPI = {
    // Get available payment methods
    getPaymentMethods: async (): Promise<{ status: string; data: PaymentMethod[]; message: string }> => {
        const response = await apiClient.get('/payments/methods');
        return response.data;
    },

    // Create order
    createOrder: async (orderData: CreateOrderPayload): Promise<{ status: string; data: Order; message: string }> => {
        const response = await apiClient.post('/orders', orderData);
        return response.data;
    },

    // Create Razorpay order
    createRazorpayOrder: async (orderId: string, amount: number, currency: string = 'INR'): Promise<{ status: string; data: RazorpayOrder; message: string }> => {
        const response = await apiClient.post('/payments/create-order', {
            orderId,
            amount: Math.round(amount * 100), // Convert to paise
            currency,
            receipt: `order_${orderId}`
        });
        return response.data;
    },

    // Verify payment
    verifyPayment: async (verificationData: PaymentVerificationPayload): Promise<{ status: string; data: { order: Order }; message: string }> => {
        const response = await apiClient.post('/payments/verify', verificationData);
        return response.data;
    },

    // Get payment status
    getPaymentStatus: async (orderId: string): Promise<{ status: string; data: PaymentStatus; message: string }> => {
        const response = await apiClient.get(`/payments/status/${orderId}`);
        return response.data;
    },

    // Mark COD order as paid (admin only)
    markCODPaid: async (orderId: string): Promise<{ status: string; data: Order; message: string }> => {
        const response = await apiClient.put(`/orders/${orderId}/mark-cod-paid`);
        return response.data;
    },

    // Get user orders
    getUserOrders: async (page: number = 1, limit: number = 10): Promise<{ status: string; data: { orders: Order[]; pagination: unknown }; message: string }> => {
        const response = await apiClient.get('/orders/my-orders', {
            params: { page, limit }
        });
        return response.data;
    },

    // Get order details
    getOrderDetails: async (orderId: string): Promise<{ status: string; data: Order; message: string }> => {
        const response = await apiClient.get(`/orders/${orderId}`);
        return response.data;
    }
};

// Razorpay integration class
export class RazorpayService {
    public readonly key: string;

    constructor(key: string) {
        this.key = key;
    }

    // Initialize Razorpay payment
    async processPayment(
        orderData: RazorpayOrder,
        customerInfo: {
            name: string;
            email: string;
            contact: string;
        },
        onSuccess: (response: RazorpayHandlerResponse) => void,
        onError: (error: unknown) => void
    ): Promise<void> {
        // Load Razorpay script if not already loaded
        await this.loadRazorpayScript();

        const options = {
            key: this.key,
            amount: orderData.amount,
            currency: orderData.currency,
            name: 'Yellow Tea',
            description: 'Premium Tea Products',
            image: 'https://yourdomain.com/path/to/logo.jpg', // Use HTTPS logo
            order_id: orderData.id, // <-- CRITICAL: must be present for handler to return all fields
            handler: onSuccess,
            prefill: customerInfo,
            theme: {
                color: '#3399cc'
            },
            modal: {
                ondismiss: onError
            }
        };

        try {
            // TypeScript workaround for Razorpay SDK
            const win = window as typeof window & { Razorpay: new (options: Record<string, unknown>) => { open: () => void } };
            const rzp = new win.Razorpay(options);
            rzp.open();
        } catch (error) {
            onError(error);
        }
    }

    // Load Razorpay script
    private loadRazorpayScript(): Promise<void> {
        return new Promise((resolve, reject) => {
            if ((window as unknown as { Razorpay: unknown }).Razorpay) {
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve();
            script.onerror = () => reject(new Error('Failed to load Razorpay script'));
            document.head.appendChild(script);
        });
    }
}

// Checkout service class
export class CheckoutService {
    private razorpayKey: string | null = null;
    private razorpayService: RazorpayService | null = null;

    async getRazorpayKey(): Promise<string> {
        if (!this.razorpayKey) {
            const response = await apiClient.get('/payments/razorpay-key');
            this.razorpayKey = response.data.key;
        }
        return this.razorpayKey;
    }

    // Get available payment methods
    async getPaymentMethods() {
        try {
            const response = await paymentAPI.getPaymentMethods();
            return response.data;
        } catch (error) {
            console.error('Error fetching payment methods:', error);
            throw error;
        }
    }

    // Create order
    async createOrder(orderData: CreateOrderPayload) {
        try {
            console.log('Sending order data to backend:', JSON.stringify(orderData, null, 2));
            const response = await paymentAPI.createOrder(orderData);
            console.log('Backend order creation response:', response);
            return response.data;
        } catch (error) {
            console.error('Error creating order:', error);
            if (error.response) {
                console.error('Backend error response:', {
                    status: error.response.status,
                    data: error.response.data,
                    headers: error.response.headers
                });
            }
            throw error;
        }
    }

    // Process online payment (Razorpay)
    async processOnlinePayment(
        orderId: string,
        amount: number,
        customerInfo: { name: string; email: string; contact: string }
    ): Promise<unknown> {
        try {
            // 1. Create Razorpay order and get public key from backend
            const createOrderResponse = await apiClient.post('/payments/create-order', {
                orderId,
                amount,
                currency: 'INR',
                receipt: `order_${orderId}`
            });
            const { razorpayOrder, key } = createOrderResponse.data.data;
            // 2. Initialize RazorpayService with the key
            this.razorpayService = new RazorpayService(key);
            // 3. Process payment through Razorpay
            return new Promise((resolve, reject) => {
                this.razorpayService!.processPayment(
                    razorpayOrder, // Pass the full Razorpay order object
                    customerInfo,
                    async (response) => {
                        try {
                            // Debug: Log the response from Razorpay
                            console.log('Razorpay payment response:', response);
                            // Ensure all required fields are present
                            if (!response.razorpay_order_id || !response.razorpay_payment_id || !response.razorpay_signature) {
                                throw new Error('Missing required Razorpay response fields');
                            }
                            // Prepare verification payload
                            const verificationPayload = {
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature
                            };
                            // Debug: Log the verification payload
                            console.log('Sending verification payload:', verificationPayload);
                            // 4. Verify payment on backend
                            const verificationResponse = await paymentAPI.verifyPayment(verificationPayload);
                            console.log('Payment verification response:', verificationResponse);
                            resolve(verificationResponse);
                        } catch (error) {
                            console.error('Payment verification error:', error);
                            reject(error);
                        }
                    },
                    (error) => {
                        console.error('Razorpay payment error:', error);
                        reject(error);
                    }
                );
            });
        } catch (error) {
            console.error('Error processing online payment:', error);
            throw error;
        }
    }

    // Process COD order
    async processCODOrder(orderData: CreateOrderPayload) {
        try {
            const codOrderData = {
                ...orderData,
                paymentMethod: 'cod'
            };
            const response = await paymentAPI.createOrder(codOrderData);
            return response.data;
        } catch (error) {
            console.error('Error processing COD order:', error);
            throw error;
        }
    }

    // Get order status
    async getOrderStatus(orderId: string) {
        try {
            const response = await paymentAPI.getOrderDetails(orderId);
            return response.data;
        } catch (error) {
            console.error('Error getting order status:', error);
            throw error;
        }
    }

    // Get payment status
    async getPaymentStatus(orderId: string) {
        try {
            const response = await paymentAPI.getPaymentStatus(orderId);
            return response.data;
        } catch (error) {
            console.error('Error getting payment status:', error);
            throw error;
        }
    }

    // Get user orders
    async getUserOrders(page: number = 1, limit: number = 10) {
        try {
            const response = await paymentAPI.getUserOrders(page, limit);
            return response.data;
        } catch (error) {
            console.error('Error getting user orders:', error);
            throw error;
        }
    }
}

// Export default instance
export const checkoutService = new CheckoutService();

export default paymentAPI; 