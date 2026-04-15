// src/services/auth.ts
import type { Address } from '../contexts/AuthContext';
import Cookies from 'js-cookie';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5500/api/v1';
const USER_BASE = `${API_BASE}/users`;

export async function login(email: string, password: string) {
    const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include', // allow backend to set httpOnly cookie
    });
    const data = await res.json();
    if (data.data?.token) {
        localStorage.setItem('token', data.data.token);
        // Also store as a cookie (non-httpOnly, for client-side access)
        Cookies.set('jwt', data.data.token, { expires: 7, secure: window.location.protocol === 'https:' });
    }
    return data;
}

export async function register(name: string, email: string, password: string, passwordConfirm: string) {
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

export async function getCurrentUser(token: string) {
    const res = await fetch(`${API_BASE}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.json();
}

export async function logout(token: string) {
    const res = await fetch(`${API_BASE}/auth/logout`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.json();
}

export type ProfileUpdate = {
    name?: string;
    email?: string;
    phone?: string;
    addresses?: Address[];
};

export async function updateProfile(token: string, profileData: ProfileUpdate) {
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
    updateAvatar: async (token: string, file: File) => {
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
    addAddress: async (
        token: string,
        address: { line1: string; city: string; state: string; pincode: string; country: string }
    ) => {
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
    deleteAddress: async (token: string, addressId: string) => {
        const res = await fetch(`${USER_BASE}/address/${addressId}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
        });
        return res.json();
    },
    setDefaultAddress: async (token: string, addressId: string, type: string) => {
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
    getWishlist: async (token: string) => {
        const res = await fetch(`${USER_BASE}/wishlist`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return res.json();
    },
    addToWishlist: async (token: string, productId: string) => {
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
    removeFromWishlist: async (token: string, productId: string) => {
        const res = await fetch(`${USER_BASE}/wishlist/${productId}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
        });
        return res.json();
    },

    // Orders & Dashboard
    getOrders: async (token: string) => {
        const res = await fetch(`${USER_BASE}/orders`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return res.json();
    },
    getDashboard: async (token: string) => {
        const res = await fetch(`${USER_BASE}/dashboard`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return res.json();
    },

    // Password
    updatePassword: async (token: string, currentPassword: string, newPassword: string) => {
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
    getNotifications: async (token: string) => {
        const res = await fetch(`${USER_BASE}/notifications`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return res.json();
    },
    markNotificationRead: async (token: string, notificationId: string) => {
        const res = await fetch(`${USER_BASE}/notifications/${notificationId}`, {
            method: 'PUT',
            headers: { Authorization: `Bearer ${token}` },
        });
        return res.json();
    },
    deleteNotification: async (token: string, notificationId: string) => {
        const res = await fetch(`${USER_BASE}/notifications/${notificationId}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
        });
        return res.json();
    },

    // Email Preferences
    updateEmailPreferences: async (token: string, preferences: any) => {
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
    getUserStats: async (token: string) => {
        const res = await fetch(`${USER_BASE}/stats`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return res.json();
    },
    searchUsers: async (token: string, query: string) => {
        const res = await fetch(`${USER_BASE}/search?query=${encodeURIComponent(query)}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return res.json();
    },
    getUserByEmail: async (token: string, email: string) => {
        const res = await fetch(`${USER_BASE}/email/${encodeURIComponent(email)}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return res.json();
    },
    updateUserRole: async (token: string, userId: string, role: string) => {
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
    deleteUser: async (token: string, userId: string) => {
        const res = await fetch(`${USER_BASE}/${userId}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
        });
        return res.json();
    },
}; 