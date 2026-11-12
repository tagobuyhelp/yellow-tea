// Orders service for Yellow Tea backend
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
    console.error('Orders API Error:', error);
    if (error.response?.status === 401 && typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('authToken');
        window.location.href = '/login';
    }
    throw error;
});
// Orders API functions
export const ordersAPI = {
    // Get user orders with pagination and filters
    getUserOrders: async (page = 1, limit = 10, filters) => {
        const params = { page, limit };
        if (filters?.status)
            params.status = filters.status;
        if (filters?.startDate)
            params.startDate = filters.startDate;
        if (filters?.endDate)
            params.endDate = filters.endDate;
        if (filters?.paymentMethod)
            params.paymentMethod = filters.paymentMethod;
        const response = await apiClient.get('/orders/my-orders', { params });
        return response.data;
    },
    // Get order details by ID
    getOrderDetails: async (orderId) => {
        const response = await apiClient.get(`/orders/${orderId}`);
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
    // Request refund
    requestRefund: async (orderId, refundData) => {
        const response = await apiClient.post(`/orders/${orderId}/refund-request`, refundData);
        return response.data;
    },
    // Get refund status
    getRefundStatus: async (orderId) => {
        const response = await apiClient.get(`/orders/${orderId}/refund-status`);
        return response.data;
    },
    // Generate invoice
    generateInvoice: async (orderId) => {
        const response = await apiClient.get(`/orders/${orderId}/invoice`, {
            responseType: 'blob',
        });
        return response.data;
    },
    // Download invoice
    downloadInvoice: async (orderId) => {
        try {
            const blob = await ordersAPI.generateInvoice(orderId);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `invoice-${orderId}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        }
        catch (error) {
            console.error('Error downloading invoice:', error);
            throw error;
        }
    },
    // Rate order
    rateOrder: async (orderId, ratingData) => {
        const response = await apiClient.post(`/orders/${orderId}/rate`, ratingData);
        return response.data;
    },
    // Get order analytics (for user)
    getOrderAnalytics: async () => {
        const response = await apiClient.get('/orders/analytics');
        return response.data;
    },
    getAllOrders: async (page = 1, limit = 10, filters) => {
        const params = { page, limit };
        if (filters?.status)
            params.status = filters.status;
        if (filters?.startDate)
            params.startDate = filters.startDate;
        if (filters?.endDate)
            params.endDate = filters.endDate;
        if (filters?.paymentMethod)
            params.paymentMethod = filters.paymentMethod;
        const response = await apiClient.get('/orders/admin/all', { params });
        return response.data;
    },
    checkShiprocketServiceability: async (params) => {
        const response = await apiClient.post('/orders/shiprocket-serviceability', params);
        return response.data;
    },
};
// Order management class
export class OrderService {
    // Get user orders with filters
    async getUserOrders(page = 1, limit = 10, filters) {
        try {
            const response = await ordersAPI.getUserOrders(page, limit, filters);
            return response.data;
        }
        catch (error) {
            console.error('Error getting user orders:', error);
            throw error;
        }
    }
    // Get order details
    async getOrderDetails(orderId) {
        try {
            const response = await ordersAPI.getOrderDetails(orderId);
            return response.data;
        }
        catch (error) {
            console.error('Error getting order details:', error);
            throw error;
        }
    }
    // Track order
    async trackOrder(orderId) {
        try {
            const response = await ordersAPI.trackOrder(orderId);
            return response.data;
        }
        catch (error) {
            console.error('Error tracking order:', error);
            throw error;
        }
    }
    // Cancel order
    async cancelOrder(orderId, reason) {
        try {
            const response = await ordersAPI.cancelOrder(orderId, reason);
            return response.data;
        }
        catch (error) {
            console.error('Error cancelling order:', error);
            throw error;
        }
    }
    // Request refund
    async requestRefund(orderId, amount, reason, description) {
        try {
            const response = await ordersAPI.requestRefund(orderId, { amount, reason, description });
            return response.data;
        }
        catch (error) {
            console.error('Error requesting refund:', error);
            throw error;
        }
    }
    // Get refund status
    async getRefundStatus(orderId) {
        try {
            const response = await ordersAPI.getRefundStatus(orderId);
            return response.data;
        }
        catch (error) {
            console.error('Error getting refund status:', error);
            throw error;
        }
    }
    // Download invoice
    async downloadInvoice(orderId) {
        try {
            await ordersAPI.downloadInvoice(orderId);
        }
        catch (error) {
            console.error('Error downloading invoice:', error);
            throw error;
        }
    }
    // Rate order
    async rateOrder(orderId, rating, review, productRatings) {
        try {
            const response = await ordersAPI.rateOrder(orderId, { rating, review, productRatings });
            return response.data;
        }
        catch (error) {
            console.error('Error rating order:', error);
            throw error;
        }
    }
    // Get order analytics
    async getOrderAnalytics() {
        try {
            const response = await ordersAPI.getOrderAnalytics();
            return response.data;
        }
        catch (error) {
            console.error('Error getting order analytics:', error);
            throw error;
        }
    }
    async getAllOrders(page = 1, limit = 10, filters) {
        try {
            const response = await ordersAPI.getAllOrders(page, limit, filters);
            return response.data;
        }
        catch (error) {
            console.error('Error getting all orders:', error);
            throw error;
        }
    }
    // Helper method to get order status color
    getOrderStatusColor(status) {
        switch (status) {
            case 'pending':
                return 'text-yellow-600 bg-yellow-100';
            case 'processing':
                return 'text-blue-600 bg-blue-100';
            case 'shipped':
                return 'text-purple-600 bg-purple-100';
            case 'delivered':
                return 'text-green-600 bg-green-100';
            case 'cancelled':
                return 'text-red-600 bg-red-100';
            case 'refunded':
                return 'text-gray-600 bg-gray-100';
            default:
                return 'text-gray-600 bg-gray-100';
        }
    }
    // Helper method to get order status icon
    getOrderStatusIcon(status) {
        switch (status) {
            case 'pending':
                return '⏳';
            case 'processing':
                return '🔄';
            case 'shipped':
                return '📦';
            case 'delivered':
                return '✅';
            case 'cancelled':
                return '❌';
            case 'refunded':
                return '💰';
            default:
                return '📋';
        }
    }
    // Helper method to format order date
    formatOrderDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
    // Helper method to calculate order age
    getOrderAge(dateString) {
        const orderDate = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - orderDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays === 1)
            return '1 day ago';
        if (diffDays < 7)
            return `${diffDays} days ago`;
        if (diffDays < 30)
            return `${Math.floor(diffDays / 7)} weeks ago`;
        if (diffDays < 365)
            return `${Math.floor(diffDays / 30)} months ago`;
        return `${Math.floor(diffDays / 365)} years ago`;
    }
}
// Export default instance
export const orderService = new OrderService();
export default ordersAPI;
