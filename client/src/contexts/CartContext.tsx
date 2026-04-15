import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Product } from '@/services/products';

interface CartItem {
    product: Product;
    quantity: number;
}

interface CartContextType {
    items: CartItem[];
    addToCart: (product: Product, quantity: number) => void;
    removeFromCart: (productId: string) => void;
    clearCart: () => void;
    getCartTotal: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
    // Load cart from localStorage on init
    const [items, setItems] = useState<CartItem[]>(() => {
        const savedCart = localStorage.getItem('cart');
        return savedCart ? JSON.parse(savedCart) : [];
    });

    // Save cart to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(items));
    }, [items]);

    const addToCart = useCallback((product: Product, quantity: number) => {
        setItems(currentItems => {
            const existingItem = currentItems.find(
                item => item.product.id === product.id
            );

            if (existingItem) {
                return currentItems.map(item =>
                    item.product.id === product.id
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            }

            return [...currentItems, { product, quantity }];
        });
    }, []);

    const removeFromCart = useCallback((productId: string) => {
        setItems(items => items.filter(item => item.product.id !== productId));
    }, []);

    const clearCart = useCallback(() => {
        setItems([]);
    }, []);

    const getCartTotal = useCallback(() => {
        return items.reduce((total, item) => total + (item.product.price * item.quantity), 0);
    }, [items]);

    return (
        <CartContext.Provider value={{
            items,
            addToCart,
            removeFromCart,
            clearCart,
            getCartTotal,
        }}>
            {children}
        </CartContext.Provider>
    );
}

export const useCart = () => {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};