import React, { createContext, useState, useEffect, useContext } from 'react';
import * as authApi from '../services/auth';

// Define the User type based on backend response
export type Address = {
    _id: string;
    line1: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
    isDefault?: boolean;
    type?: string;
    line2?: string;
};

export type User = {
    _id: string;
    name: string;
    email: string;
    role: string;
    phone?: string;
    created_at?: string;
    addresses?: Address[];
    totalOrders?: number;
    favoriteTeaType?: string;
    wishlist?: Array<{
        _id: string;
        name: string;
        price: number;
        image?: string;
    }>;
    recentActivity?: Array<{
        description: string;
        date: string;
    }>;
    // Add other fields as needed
};

// Define the AuthContext type
export type AuthContextType = {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (name: string, email: string, password: string, passwordConfirm: string) => Promise<void>;
    logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            authApi.getCurrentUser(token).then(data => {
                if (data.success) setUser(data.data);
                setLoading(false);
            }).catch(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    const login = async (email: string, password: string) => {
        const data = await authApi.login(email, password);
        if (data.success) {
            localStorage.setItem('token', data.data.token);
            // Also set as a non-httpOnly cookie for admin API
            document.cookie = `jwt=${data.data.token}; path=/; max-age=${7 * 24 * 60 * 60}`;
            setUser(data.data.user);
        } else {
            throw new Error(data.message);
        }
    };

    const register = async (name: string, email: string, password: string, passwordConfirm: string) => {
        const data = await authApi.register(name, email, password, passwordConfirm);
        if (data.success) {
            localStorage.setItem('token', data.data.token);
            document.cookie = `jwt=${data.data.token}; path=/; max-age=${7 * 24 * 60 * 60}`;
            setUser(data.data.user);
        } else {
            throw new Error(data.message);
        }
    };

    const logout = async () => {
        const token = localStorage.getItem('token');
        if (token) {
            await authApi.logout(token);
            localStorage.removeItem('token');
            setUser(null);
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
} 