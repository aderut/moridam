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
  clear: () => void;
  total: number;
};

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  /* ✅ LOAD FROM LOCALSTORAGE */
  useEffect(() => {
    const stored = localStorage.getItem("cart");
    if (stored) {
      setItems(JSON.parse(stored));
    }
  }, []);

  /* ✅ SAVE TO LOCALSTORAGE */
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(items));
  }, [items]);

  /* ✅ ADD TO CART */
  function add(item: Omit<CartItem, "qty">) {
    setItems((prev) => {
      const existing = prev.find((i) => i.lineId === item.lineId);

      if (existing) {
        return prev.map((i) =>
            i.lineId === item.lineId ? { ...i, qty: i.qty + 1 } : i
        );
      }

      return [...prev, { ...item, qty: 1 }];
    });
  }

  function remove(lineId: string) {
    setItems((prev) => prev.filter((i) => i.lineId !== lineId));
  }

  function increase(lineId: string) {
    setItems((prev) =>
        prev.map((i) =>
            i.lineId === lineId ? { ...i, qty: i.qty + 1 } : i
        )
    );
  }

  function decrease(lineId: string) {
    setItems((prev) =>
        prev
            .map((i) =>
                i.lineId === lineId ? { ...i, qty: i.qty - 1 } : i
            )
            .filter((i) => i.qty > 0)
    );
  }

  function clear() {
    setItems([]);
  }

  const total = items.reduce((sum, item) => {
    return sum + item.price * item.qty;
  }, 0);

  return (
      <CartContext.Provider
          value={{ items, add, remove, increase, decrease, clear, total }}
      >
        {children}
      </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used inside CartProvider");
  }
  return ctx;
}