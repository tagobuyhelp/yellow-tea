import Cookies from 'js-cookie';
const API_BASE = (typeof process !== 'undefined' && (process.env.NEXT_PUBLIC_API_BASE_URL || process.env.VITE_API_BASE_URL)) || 'http://localhost:5500/api/v1';
const USER_BASE = `${API_BASE}/users`;
export async function login(email, password) {
    const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include', // allow backend to set httpOnly cookie
    });
    const data = await res.json();
    if (data.data?.token) {
        if (typeof window !== 'undefined') {
            localStorage.setItem('token', data.data.token);
            // Also store as a cookie (non-httpOnly, for client-side access)
            Cookies.set('jwt', data.data.token, { expires: 7, secure: window.location.protocol === 'https:' });
        }
    }
    return data;
}
export async function register(name, email, password, passwordConfirm) {
    const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, passwordConfirm }),
        credentials: 'include',
    });
    const data = await res.json();
    if (data.data?.token) {
        localStorage.setItem('token', data.data.token);
        Cookies.set('jwt', data.data.token, { expires: 7, secure: window.location.protocol === 'https:' });
    }
    return data;
}
export async function getCurrentUser(token) {
    const res = await fetch(`${API_BASE}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.json();
}
export async function logout(token) {
    const res = await fetch(`${API_BASE}/auth/logout`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.json();
}
export async function updateProfile(token, profileData) {
    const res = await fetch(`${API_BASE}/auth/update-me`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
    });
    return res.json();
}
// User CRUD API functions
export const userAPI = {
    // Avatar
    updateAvatar: async (token, file) => {
        const formData = new FormData();
        formData.append('avatar', file);
        const res = await fetch(`${USER_BASE}/avatar`, {
            method: 'PUT',
            headers: { Authorization: `Bearer ${token}` },
            body: formData,
        });
        return res.json();
    },
    // Address
    addAddress: async (token, address) => {
        const res = await fetch(`${USER_BASE}/address`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(address),
        });
        return res.json();
    },
    deleteAddress: async (token, addressId) => {
        const res = await fetch(`${USER_BASE}/address/${addressId}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
        });
        return res.json();
    },
    setDefaultAddress: async (token, addressId, type) => {
        const res = await fetch(`${USER_BASE}/address/${addressId}/default`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ type }),
        });
        return res.json();
    },
    // Wishlist
    getWishlist: async (token) => {
        const res = await fetch(`${USER_BASE}/wishlist`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return res.json();
    },
    addToWishlist: async (token, productId) => {
        const res = await fetch(`${USER_BASE}/wishlist`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ productId }),
        });
        return res.json();
    },
    removeFromWishlist: async (token, productId) => {
        const res = await fetch(`${USER_BASE}/wishlist/${productId}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
        });
        return res.json();
    },
    // Orders & Dashboard
    getOrders: async (token) => {
        const res = await fetch(`${USER_BASE}/orders`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return res.json();
    },
    getDashboard: async (token) => {
        const res = await fetch(`${USER_BASE}/dashboard`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return res.json();
    },
    // Password
    updatePassword: async (token, currentPassword, newPassword) => {
        const res = await fetch(`${USER_BASE}/password`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ currentPassword, newPassword }),
        });
        return res.json();
    },
    // Notifications
    getNotifications: async (token) => {
        const res = await fetch(`${USER_BASE}/notifications`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return res.json();
    },
    markNotificationRead: async (token, notificationId) => {
        const res = await fetch(`${USER_BASE}/notifications/${notificationId}`, {
            method: 'PUT',
            headers: { Authorization: `Bearer ${token}` },
        });
        return res.json();
    },
    deleteNotification: async (token, notificationId) => {
        const res = await fetch(`${USER_BASE}/notifications/${notificationId}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
        });
        return res.json();
    },
    // Email Preferences
    updateEmailPreferences: async (token, preferences) => {
        const res = await fetch(`${USER_BASE}/email-preferences`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(preferences),
        });
        return res.json();
    },
    // Admin Endpoints
    getUserStats: async (token) => {
        const res = await fetch(`${USER_BASE}/stats`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return res.json();
    },
    searchUsers: async (token, query) => {
        const res = await fetch(`${USER_BASE}/search?query=${encodeURIComponent(query)}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return res.json();
    },
    getUserByEmail: async (token, email) => {
        const res = await fetch(`${USER_BASE}/email/${encodeURIComponent(email)}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return res.json();
    },
    updateUserRole: async (token, userId, role) => {
        const res = await fetch(`${USER_BASE}/${userId}/role`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ role }),
        });
        return res.json();
    },
    deleteUser: async (token, userId) => {
        const res = await fetch(`${USER_BASE}/${userId}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
        });
        return res.json();
    },
};
