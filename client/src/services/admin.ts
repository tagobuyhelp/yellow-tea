import axios from 'axios';
import Cookies from 'js-cookie';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5500/api/v1';

const adminAxios = axios.create({
  baseURL: `${API_BASE}/admin`,
});

// Attach token from cookies to every request
// Attach token from cookies to every request
adminAxios.interceptors.request.use((config) => {

  let token = Cookies.get('jwt');
  if (!token) {
    token = localStorage.getItem('token');
  }
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const adminAPI = {
  getDashboard: async () => {
    const res = await adminAxios.get('/dashboard');
    return res.data;
  },
  getAllCustomers: async (params = {}) => {

    const res = await adminAxios.get('/customers', { params });
    
    return res.data;
  },
  getCustomerById: async (id) => {

    const res = await adminAxios.get(`/customers/${id}`);
    
    return res.data;
  },
  updateCustomer: async (id, data) => {

    const res = await adminAxios.put(`/customers/${id}`, data);
    
    return res.data;
  },
  deleteCustomer: async (id) => {

    const res = await adminAxios.delete(`/customers/${id}`);
    
    return res.data;
  },
  getAllOrders: async (params = {}) => {
    const res = await adminAxios.get('/orders', { params });
    return res.data;
  },
  getOrderById: async (id) => {
    const res = await adminAxios.get(`/orders/${id}`);
    return res.data;
  },
  updateOrderStatus: async (id, data) => {
    const res = await adminAxios.put(`/orders/${id}/status`, data);
    return res.data;
  },
  getOrderStats: async () => {
    const res = await adminAxios.get('/orders/stats');
    return res.data;
  },
  getAllProducts: async (params = {}) => {
    const res = await adminAxios.get('/products', { params });
    return res.data;
  },
  getProductById: async (id) => {
    const res = await adminAxios.get(`/products/${id}`);
    return res.data;
  },
  createProduct: async (data) => {
    // Determine content type based on data type
    const isFormData = data instanceof FormData;
    const headers = isFormData ? {} : { 'Content-Type': 'application/json' };
    
    const res = await adminAxios.post('/products', data, { headers });
    return res.data;
  },
  updateProduct: async (id, data) => {
    const res = await adminAxios.put(`/products/${id}`, data, {
      headers: { 'Content-Type': 'application/json' },
    });
    return res.data;
  },
  deleteProduct: async (id) => {
    const res = await adminAxios.delete(`/products/${id}`);
    return res.data;
  },
  getProductStats: async () => {
    const res = await adminAxios.get('/products/stats');
    return res.data;
  },
  getAdminLogs: async (params = {}) => {

    const res = await adminAxios.get('/logs', { params });
    
    return res.data;
  },
  updateUserRole: async (id, data) => {
    const res = await adminAxios.put(`/users/${id}/role`, data);
    return res.data;
  },
  deleteUser: async (id) => {
    const res = await adminAxios.delete(`/users/${id}`);
    return res.data;
  },
  getAnalytics: async (params = {}) => {
    const res = await adminAxios.get('/analytics', { params });
    return res.data;
  },
  getSystemHealth: async () => {
    const res = await adminAxios.get('/system/health');
    return res.data;
  },
  clearCache: async () => {
    const res = await adminAxios.post('/system/cache/clear');
    return res.data;
  },
};

export default adminAPI; 