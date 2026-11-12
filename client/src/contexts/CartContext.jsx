'use client';
import { createContext, useContext, useState, useCallback, useEffect } from 'react';
const CartContext = createContext(undefined);
export function CartProvider({ children }) {
    // Load cart from localStorage on init
    const [items, setItems] = useState(() => {
        if (typeof window === 'undefined') return [];
        try {
            const savedCart = localStorage.getItem('cart');
            return savedCart ? JSON.parse(savedCart) : [];
        } catch (e) {
            return [];
        }
    });
    // Save cart to localStorage whenever it changes
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('cart', JSON.stringify(items));
        }
    }, [items]);
    const addToCart = useCallback((product, quantity) => {
        setItems(currentItems => {
            const existingItem = currentItems.find(item => item.product.id === product.id);
            if (existingItem) {
                return currentItems.map(item => item.product.id === product.id
                    ? { ...item, quantity: item.quantity + quantity }
                    : item);
            }
            return [...currentItems, { product, quantity }];
        });
    }, []);
    const removeFromCart = useCallback((productId) => {
        setItems(items => items.filter(item => item.product.id !== productId));
    }, []);
    const clearCart = useCallback(() => {
        setItems([]);
    }, []);
    const getCartTotal = useCallback(() => {
        return items.reduce((total, item) => total + (item.product.price * item.quantity), 0);
    }, [items]);
    return (<CartContext.Provider value={{
            items,
            addToCart,
            removeFromCart,
            clearCart,
            getCartTotal,
        }}>
            {children}
        </CartContext.Provider>);
}
export const useCart = () => {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};
