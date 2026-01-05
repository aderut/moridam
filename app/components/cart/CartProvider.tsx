"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

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
    total: number;
    add: (item: Omit<CartItem, "qty">) => void;
    remove: (id: string) => void;
    setQty: (id: string, qty: number) => void;
    clear: () => void;
};

const CartContext = createContext<CartContextType | null>(null);
const KEY = "superfood_cart_v1";

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);

    useEffect(() => {
        try {
            const raw = localStorage.getItem(KEY);
            if (raw) setItems(JSON.parse(raw));
        } catch {}
    }, []);

    useEffect(() => {
        try {
            localStorage.setItem(KEY, JSON.stringify(items));
        } catch {}
    }, [items]);

    const count = useMemo(() => items.reduce((s, i) => s + i.qty, 0), [items]);
    const total = useMemo(() => items.reduce((s, i) => s + i.price * i.qty, 0), [items]);

    function add(item: Omit<CartItem, "qty">) {
        setItems((prev) => {
            const found = prev.find((x) => x.id === item.id);
            if (found) {
                return prev.map((x) => (x.id === item.id ? { ...x, qty: x.qty + 1 } : x));
            }
            return [...prev, { ...item, qty: 1 }];
        });
    }

    function remove(id: string) {
        setItems((prev) => prev.filter((x) => x.id !== id));
    }

    function setQty(id: string, qty: number) {
        setItems((prev) => {
            if (qty <= 0) return prev.filter((x) => x.id !== id);
            return prev.map((x) => (x.id === id ? { ...x, qty } : x));
        });
    }

    function clear() {
        setItems([]);
    }

    return (
        <CartContext.Provider value={{ items, count, total, add, remove, setQty, clear }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error("useCart must be used inside CartProvider");
    return ctx;
}
