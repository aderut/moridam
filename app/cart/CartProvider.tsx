"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type CartItem = {
    id: string;
    title: string;
    price: number;
    image?: string;
    qty: number;
};

type CartContextType = {
    items: CartItem[];
    count: number;
    add: (item: Omit<CartItem, "qty">) => void;
};

const CartContext = createContext<CartContextType | null>(null);
const STORAGE_KEY = "superfood_cart_v1";

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);

    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) setItems(JSON.parse(saved));
    }, []);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }, [items]);

    const count = useMemo(
        () => items.reduce((sum, i) => sum + i.qty, 0),
        [items]
    );

    function add(item: Omit<CartItem, "qty">) {
        setItems((prev) => {
            const found = prev.find((x) => x.id === item.id);
            if (found) {
                return prev.map((x) =>
                    x.id === item.id ? { ...x, qty: x.qty + 1 } : x
                );
            }
            return [...prev, { ...item, qty: 1 }];
        });
    }

    return (
        <CartContext.Provider value={{ items, count, add }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error("useCart must be used inside CartProvider");
    return ctx;
}
