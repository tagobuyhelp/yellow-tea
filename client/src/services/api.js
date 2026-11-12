// API service for Yellow Tea backend
import axios from 'axios';
// API configuration
const API_BASE_URL = (typeof process !== 'undefined' && (process.env.NEXT_PUBLIC_API_BASE_URL || process.env.VITE_API_BASE_URL)) || 'http://localhost:5500/api/v1';
// Create axios instance with default config
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});
// Add JWT token to requests if available
apiClient.interceptors.request.use((config) => {
    // Check both token keys for compatibility
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token') || localStorage.getItem('authToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});
// Response interceptor for error handling
apiClient.interceptors.response.use((response) => response, (error) => {
    console.error('API Error:', error);
    if (error.response?.status === 401 && typeof window !== 'undefined') {
        // Handle unauthorized access - clear both token keys
        localStorage.removeItem('token');
        localStorage.removeItem('authToken');
        window.location.href = '/login';
    }
    throw error;
});
// Helper function to map legacy frontend fields to backend fields
const mapLegacyOrderDataToBackend = (orderData) => {
    return {
        orderItems: orderData.items.map(item => ({
            product: item.productId,
            quantity: item.quantity,
            price: item.price
        })),
        shippingAddress: {
            address: orderData.shippingAddress.street,
            city: orderData.shippingAddress.city,
            postalCode: orderData.shippingAddress.pincode,
            country: orderData.shippingAddress.country,
            phone: orderData.customerPhone
        },
        paymentMethod: orderData.paymentMethod === 'card' ? 'razorpay' : orderData.paymentMethod,
        itemsPrice: orderData.subtotal,
        taxPrice: orderData.tax,
        shippingPrice: orderData.deliveryCharges,
        totalPrice: orderData.total
    };
};
// Order API functions
export const orderAPI = {
    // Create a new order (updated to match backend API)
    createOrder: async (orderData) => {
        const response = await apiClient.post('/orders', orderData);
        return response.data;
    },
    // Create a new order (legacy method for backward compatibility)
    createOrderLegacy: async (orderData) => {
        const mappedData = mapLegacyOrderDataToBackend(orderData);
        const response = await apiClient.post('/orders', mappedData);
        return response.data;
    },
    // Track order by ID
    trackOrder: async (orderId) => {
        const response = await apiClient.get(`/orders/${orderId}/track`);
        return response.data;
    },
    // Cancel order
    cancelOrder: async (orderId, reason) => {
        const response = await apiClient.put(`/orders/${orderId}/cancel`, { reason });
        return response.data;
    },
    // Process refund (admin only)
    processRefund: async (orderId, refundData) => {
        const response = await apiClient.put(`/orders/${orderId}/refund`, refundData);
        return response.data;
    },
    // Generate invoice
    generateInvoice: async (orderId) => {
        const response = await apiClient.get(`/orders/${orderId}/invoice`, {
            responseType: 'blob', // For PDF download
        });
        return response.data;
    },
    // Get order analytics (admin only)
    getOrderAnalytics: async (startDate, endDate) => {
        const params = {};
        if (startDate)
            params.startDate = startDate;
        if (endDate)
            params.endDate = endDate;
        const response = await apiClient.get('/orders/analytics', { params });
        return response.data;
    },
    // Get order statistics (admin only)
    getOrderStatistics: async () => {
        const response = await apiClient.get('/orders/stats');
        return response.data;
    },
    // Update shipping details (admin only)
    updateShippingDetails: async (orderId, shippingData) => {
        const response = await apiClient.put(`/orders/${orderId}/shipping`, shippingData);
        return response.data;
    },
    // Get order counts by status (admin only)
    getOrderCountsByStatus: async () => {
        const response = await apiClient.get('/orders/count-by-status');
        return response.data;
    },
    // Export orders (admin only)
    exportOrders: async (startDate, endDate) => {
        const response = await apiClient.get('/orders/export', {
            params: { startDate, endDate },
            responseType: 'blob', // For file download
        });
        return response.data;
    }
};
// Authentication API functions
export const authAPI = {
    login: async (email, password) => {
        const response = await apiClient.post('/auth/login', { email, password });
        if (response.data.token) {
            // Store token with the key used by AuthContext for consistency
            localStorage.setItem('token', response.data.token);
        }
        return response.data;
    },
    logout: () => {
        // Clear both token keys for compatibility
        localStorage.removeItem('token');
        localStorage.removeItem('authToken');
    },
    getCurrentUser: async () => {
        const response = await apiClient.get('/auth/me');
        return response.data;
    }
};
export default apiClient;
