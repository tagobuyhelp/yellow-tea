'use client';
import React, { createContext, useState, useEffect, useContext } from 'react';
import * as authApi from '../services/auth';
const AuthContext = createContext(undefined);
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            authApi.getCurrentUser(token).then(data => {
                if (data.success)
                    setUser(data.data);
                setLoading(false);
            }).catch(() => setLoading(false));
        }
        else {
            setLoading(false);
        }
    }, []);
    const login = async (email, password) => {
        const data = await authApi.login(email, password);
        if (data.success) {
            localStorage.setItem('token', data.data.token);
            // Also set as a non-httpOnly cookie for admin API
            document.cookie = `jwt=${data.data.token}; path=/; max-age=${7 * 24 * 60 * 60}`;
            setUser(data.data.user);
        }
        else {
            throw new Error(data.message);
        }
    };
    const register = async (name, email, password, passwordConfirm) => {
        const data = await authApi.register(name, email, password, passwordConfirm);
        if (data.success) {
            localStorage.setItem('token', data.data.token);
            document.cookie = `jwt=${data.data.token}; path=/; max-age=${7 * 24 * 60 * 60}`;
            setUser(data.data.user);
        }
        else {
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
    return (<AuthContext.Provider value={{ user, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>);
};
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context)
        throw new Error('useAuth must be used within an AuthProvider');
    return context;
}
