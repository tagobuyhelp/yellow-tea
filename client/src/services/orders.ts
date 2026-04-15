// Orders service for Yellow Tea backend
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
    console.error('Orders API Error:', error);
    
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    
    throw error;
  }
);

// Types
export interface OrderItem {
  product: {
    _id: string;
    name: string;
    image: string;
    price: number;
  };
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

export interface PaymentResult {
  id?: string;
  status?: string;
  update_time?: string;
  email_address?: string;
  [key: string]: unknown;
}

export interface Order {
  _id: string;
  orderNumber: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  orderItems: OrderItem[];
  shippingAddress: ShippingAddress;
  paymentMethod: string;
  paymentResult: PaymentResult | null;
  itemsPrice: number;
  taxPrice: number;
  shippingPrice: number;
  totalPrice: number;
  isPaid: boolean;
  paidAt: string | null;
  isDelivered: boolean;
  deliveredAt: string | null;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  createdAt: string;
  updatedAt: string;
}

export interface OrderStatus {
  status: string;
  timestamp: string;
  description: string;
  location?: string;
}

export interface OrderTracking {
  orderId: string;
  orderNumber: string;
  status: string;
  trackingNumber?: string;
  courierName?: string;
  estimatedDelivery?: string;
  statusHistory: OrderStatus[];
}

export interface OrderFilters {
  status?: string;
  startDate?: string;
  endDate?: string;
  paymentMethod?: string;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalOrders: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ShiprocketServiceabilityRequest {
  pickup_postcode: string;
  delivery_postcode: string;
  cod?: number;
  weight?: number;
}

export interface ShiprocketCourierCompany {
  courier_company_id: number;
  courier_name: string;
  estimated_delivery_days: string;
  etd: string;
  freight_charge: number;
  cod: number;
  rating: number;
  [key: string]: unknown;
}

export interface ShiprocketServiceabilityData {
  available_courier_companies: ShiprocketCourierCompany[];
  blocked_courier_companies: ShiprocketCourierCompany[];
  [key: string]: unknown;
}

export interface ShiprocketServiceabilityResponse {
  success: boolean;
  data: ShiprocketServiceabilityData;
  message: string;
}

export interface RefundStatus {
  status: string;
  amount: number;
  reason: string;
  description?: string;
  requestedAt: string;
  processedAt?: string;
  refundedAt?: string;
  [key: string]: unknown;
}

export interface OrderAnalytics {
  totalOrders: number;
  totalRevenue: number;
  totalCustomers: number;
  [key: string]: unknown;
}

// Orders API functions
export const ordersAPI = {
  // Get user orders with pagination and filters
  getUserOrders: async (
    page: number = 1, 
    limit: number = 10, 
    filters?: OrderFilters
  ): Promise<{ status: string; data: { orders: Order[]; pagination: PaginationInfo }; message: string }> => {
    const params: {
      page: number;
      limit: number;
      status?: string;
      startDate?: string;
      endDate?: string;
      paymentMethod?: string;
    } = { page, limit };
    if (filters?.status) params.status = filters.status;
    if (filters?.startDate) params.startDate = filters.startDate;
    if (filters?.endDate) params.endDate = filters.endDate;
    if (filters?.paymentMethod) params.paymentMethod = filters.paymentMethod;

    const response = await apiClient.get('/orders/my-orders', { params });
    return response.data;
  },

  // Get order details by ID
  getOrderDetails: async (orderId: string): Promise<{ status: string; data: Order; message: string }> => {
    const response = await apiClient.get(`/orders/${orderId}`);
    return response.data;
  },

  // Track order by ID
  trackOrder: async (orderId: string): Promise<{ status: string; data: OrderTracking; message: string }> => {
    const response = await apiClient.get(`/orders/${orderId}/track`);
    return response.data;
  },

  // Cancel order
  cancelOrder: async (orderId: string, reason: string): Promise<{ status: string; data: Order; message: string }> => {
    const response = await apiClient.put(`/orders/${orderId}/cancel`, { reason });
    return response.data;
  },

  // Request refund
  requestRefund: async (orderId: string, refundData: { 
    amount: number; 
    reason: string; 
    description?: string;
  }): Promise<{ status: string; data: Order; message: string }> => {
    const response = await apiClient.post(`/orders/${orderId}/refund-request`, refundData);
    return response.data;
  },

  // Get refund status
  getRefundStatus: async (orderId: string): Promise<{ status: string; data: RefundStatus; message: string }> => {
    const response = await apiClient.get(`/orders/${orderId}/refund-status`);
    return response.data;
  },

  // Generate invoice
  generateInvoice: async (orderId: string): Promise<Blob> => {
    const response = await apiClient.get(`/orders/${orderId}/invoice`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // Download invoice
  downloadInvoice: async (orderId: string): Promise<void> => {
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
    } catch (error) {
      console.error('Error downloading invoice:', error);
      throw error;
    }
  },

  // Rate order
  rateOrder: async (orderId: string, ratingData: {
    rating: number;
    review?: string;
    productRatings?: Array<{
      productId: string;
      rating: number;
      review?: string;
    }>;
  }): Promise<{ status: string; data: Order; message: string }> => {
    const response = await apiClient.post(`/orders/${orderId}/rate`, ratingData);
    return response.data;
  },

  // Get order analytics (for user)
  getOrderAnalytics: async (): Promise<{ status: string; data: OrderAnalytics; message: string }> => {
    const response = await apiClient.get('/orders/analytics');
    return response.data;
  },

  getAllOrders: async (
    page: number = 1,
    limit: number = 10,
    filters?: OrderFilters
  ): Promise<{ status: string; data: { orders: Order[]; pagination: PaginationInfo }; message: string }> => {
    const params: {
      page: number;
      limit: number;
      status?: string;
      startDate?: string;
      endDate?: string;
      paymentMethod?: string;
    } = { page, limit };
    if (filters?.status) params.status = filters.status;
    if (filters?.startDate) params.startDate = filters.startDate;
    if (filters?.endDate) params.endDate = filters.endDate;
    if (filters?.paymentMethod) params.paymentMethod = filters.paymentMethod;

    const response = await apiClient.get('/orders/admin/all', { params });
    return response.data;
  },

  checkShiprocketServiceability: async (
    params: ShiprocketServiceabilityRequest
  ): Promise<ShiprocketServiceabilityResponse> => {
    const response = await apiClient.post('/orders/shiprocket-serviceability', params);
    return response.data;
  },
};

// Order management class
export class OrderService {
  // Get user orders with filters
  async getUserOrders(page: number = 1, limit: number = 10, filters?: OrderFilters) {
    try {
      const response = await ordersAPI.getUserOrders(page, limit, filters);
      return response.data;
    } catch (error) {
      console.error('Error getting user orders:', error);
      throw error;
    }
  }

  // Get order details
  async getOrderDetails(orderId: string) {
    try {
      const response = await ordersAPI.getOrderDetails(orderId);
      return response.data;
    } catch (error) {
      console.error('Error getting order details:', error);
      throw error;
    }
  }

  // Track order
  async trackOrder(orderId: string) {
    try {
      const response = await ordersAPI.trackOrder(orderId);
      return response.data;
    } catch (error) {
      console.error('Error tracking order:', error);
      throw error;
    }
  }

  // Cancel order
  async cancelOrder(orderId: string, reason: string) {
    try {
      const response = await ordersAPI.cancelOrder(orderId, reason);
      return response.data;
    } catch (error) {
      console.error('Error cancelling order:', error);
      throw error;
    }
  }

  // Request refund
  async requestRefund(orderId: string, amount: number, reason: string, description?: string) {
    try {
      const response = await ordersAPI.requestRefund(orderId, { amount, reason, description });
      return response.data;
    } catch (error) {
      console.error('Error requesting refund:', error);
      throw error;
    }
  }

  // Get refund status
  async getRefundStatus(orderId: string) {
    try {
      const response = await ordersAPI.getRefundStatus(orderId);
      return response.data;
    } catch (error) {
      console.error('Error getting refund status:', error);
      throw error;
    }
  }

  // Download invoice
  async downloadInvoice(orderId: string) {
    try {
      await ordersAPI.downloadInvoice(orderId);
    } catch (error) {
      console.error('Error downloading invoice:', error);
      throw error;
    }
  }

  // Rate order
  async rateOrder(orderId: string, rating: number, review?: string, productRatings?: Array<{
    productId: string;
    rating: number;
    review?: string;
  }>) {
    try {
      const response = await ordersAPI.rateOrder(orderId, { rating, review, productRatings });
      return response.data;
    } catch (error) {
      console.error('Error rating order:', error);
      throw error;
    }
  }

  // Get order analytics
  async getOrderAnalytics() {
    try {
      const response = await ordersAPI.getOrderAnalytics();
      return response.data;
    } catch (error) {
      console.error('Error getting order analytics:', error);
      throw error;
    }
  }

  async getAllOrders(page: number = 1, limit: number = 10, filters?: OrderFilters) {
    try {
      const response = await ordersAPI.getAllOrders(page, limit, filters);
      return response.data;
    } catch (error) {
      console.error('Error getting all orders:', error);
      throw error;
    }
  }

  // Helper method to get order status color
  getOrderStatusColor(status: string): string {
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
  getOrderStatusIcon(status: string): string {
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
  formatOrderDate(dateString: string): string {
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
  getOrderAge(dateString: string): string {
    const orderDate = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - orderDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  }
}

// Export default instance
export const orderService = new OrderService();

export default ordersAPI; 