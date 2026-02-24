"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type SelectedOptionDetail = {
  group: string;
  label: string;
  price: number;
};

export type CartItem = {
  lineId: string;
  id: string;
  title: string;
  category: string;
  description: string;
  image: string;
  selectedOptions: Record<string, string[]>;
  selectedOptionDetails: SelectedOptionDetail[];
  basePrice: number;
  addonsTotal: number;
  price: number;
  qty: number;
};

type CartContextType = {
  items: CartItem[];
  add: (item: Omit<CartItem, "qty">) => void;
  remove: (lineId: string) => void;
  increase: (lineId: string) => void;
  decrease: (lineId: string) => void;
  setQty: (lineId: string, qty: number) => void; // ✅ added
  clear: () => void;
  total: number;
  count: number; // ✅ total item count
};

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("cart");
    if (stored) setItems(JSON.parse(stored));
  }, []);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(items));
  }, [items]);

  function add(item: Omit<CartItem, "qty">) {
    setItems((prev) => {
      const existing = prev.find((i) => i.lineId === item.lineId);
      if (existing) return prev.map((i) => (i.lineId === item.lineId ? { ...i, qty: i.qty + 1 } : i));
      return [...prev, { ...item, qty: 1 }];
    });
  }

  function remove(lineId: string) {
    setItems((prev) => prev.filter((i) => i.lineId !== lineId));
  }

  function increase(lineId: string) {
    setItems((prev) => prev.map((i) => (i.lineId === lineId ? { ...i, qty: i.qty + 1 } : i)));
  }

  function decrease(lineId: string) {
    setItems((prev) =>
        prev
            .map((i) => (i.lineId === lineId ? { ...i, qty: i.qty - 1 } : i))
            .filter((i) => i.qty > 0)
    );
  }

  // ✅ New function to directly set quantity
  function setQty(lineId: string, qty: number) {
    setItems((prev) =>
        prev
            .map((i) => (i.lineId === lineId ? { ...i, qty: Math.max(qty, 0) } : i))
            .filter((i) => i.qty > 0)
    );
  }

  function clear() {
    setItems([]);
  }

  const total = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const count = items.reduce((sum, item) => sum + item.qty, 0);

  return (
      <CartContext.Provider value={{ items, add, remove, increase, decrease, setQty, clear, total, count }}>
        {children}
      </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}