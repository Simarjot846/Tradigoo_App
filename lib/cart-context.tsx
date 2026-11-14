'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth-context';
import { authFetch } from '@/lib/auth-fetch';
import { toast } from 'sonner';

interface CartContextType {
    cartCount: number;
    refreshCart: () => Promise<void>;
    addToCart: (productId: string, quantity: number) => Promise<boolean>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const [cartCount, setCartCount] = useState(0);

    const refreshCart = useCallback(async () => {
        if (!user) {
            setCartCount(0);
            return;
        }
        try {
            const res = await authFetch('/api/cart', { cache: 'no-store' });
            if (res.ok) {
                const data = await res.json();
                setCartCount(Array.isArray(data) ? data.length : 0);
            }
        } catch (error) {
            console.error('Error fetching cart count:', error);
        }
    }, [user]);

    const addToCart = useCallback(async (productId: string, quantity: number) => {
        if (!user) {
            toast.error('Please sign in to add items to your cart.');
            return false;
        }
        if (user.role === 'wholesaler') {
            toast.info('Switch to a Retailer account to place wholesale purchases.');
            return false;
        }
        try {
            const res = await authFetch('/api/cart', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ product_id: productId, quantity }),
            });

            const payload = await res.json().catch(() => ({}));
            if (!res.ok) {
                throw new Error(payload.error || 'Failed to add item to cart');
            }

            await refreshCart();
            toast.success('Added to cart');
            return true;
        } catch (error: any) {
            toast.error(error?.message || 'Failed to add item to cart');
            return false;
        }
    }, [user, refreshCart]);

    useEffect(() => {
        refreshCart();
    }, [refreshCart]);

    return (
        <CartContext.Provider value={{ cartCount, refreshCart, addToCart }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}
