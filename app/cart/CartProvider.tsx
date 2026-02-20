"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

export type SelectedOptionDetail = {
  group: string;
  label: string;
  price: number;
};

export type CartItem = {
  id: string;
  lineId: string;
  title: string;
  price: number;

  image?: string;
  category?: string;
  description?: string;

  qty: number;

  selectedOptions?: Record<string, string[]>;
  selectedOptionDetails?: SelectedOptionDetail[];

  basePrice?: number;
  addonsTotal?: number;
};

type CartContextType = {
  items: CartItem[];
  count: number;
  total: number;

  // ✅ FIXED: remove lineId from required input
  add: (item: Omit<CartItem, "qty" | "lineId">) => void;

  remove: (lineId: string) => void;
  setQty: (lineId: string, qty: number) => void;
  clear: () => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextType | null>(null);
const STORAGE_KEY = "moridam_cart_v2";

function stableStringify(obj: unknown): string {
  if (obj === null || obj === undefined) return "";

  if (Array.isArray(obj)) {
    return `[${obj.map(stableStringify).join(",")}]`;
  }

  if (typeof obj === "object") {
    const rec = obj as Record<string, unknown>;
    const keys = Object.keys(rec).sort();
    return `{${keys.map((k) => `"${k}":${stableStringify(rec[k])}`).join(",")}}`;
  }

  return JSON.stringify(obj);
}

function makeLineId(productId: string, selectedOptions?: Record<string, string[]>) {
  const base = stableStringify(selectedOptions || {});
  return `${productId}__${base}`;
}

function sumAddons(details?: SelectedOptionDetail[]) {
  if (!Array.isArray(details)) return 0;
  return details.reduce((s, d) => s + Number(d?.price ?? 0), 0);
}

function normalizeCartItem(input: unknown): CartItem {
  const raw = (input ?? {}) as any;

  const selectedOptionDetails: SelectedOptionDetail[] = Array.isArray(raw?.selectedOptionDetails)
    ? raw.selectedOptionDetails
    : [];

  const addonsTotalFromDetails = sumAddons(selectedOptionDetails);

  const basePrice =
    Number.isFinite(Number(raw?.basePrice)) ? Number(raw.basePrice) : Number(raw?.price ?? 0);

  const addonsTotal =
    Number.isFinite(Number(raw?.addonsTotal)) ? Number(raw.addonsTotal) : addonsTotalFromDetails;

  const finalUnitPrice = basePrice + addonsTotal;

  const id = String(raw?.id ?? "").trim();
  const selectedOptions = raw?.selectedOptions as Record<string, string[]> | undefined;

  const lineId = makeLineId(id, selectedOptions);

  return {
    ...raw,
    id,
    lineId,
    basePrice,
    addonsTotal,
    price: finalUnitPrice,
    qty: Math.max(1, Number(raw?.qty ?? 1)),
    selectedOptions,
    selectedOptionDetails,
  };
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;

      const parsed = JSON.parse(raw) as unknown[];
      const fixed = (parsed || []).map((i) => normalizeCartItem(i));
      setItems(fixed);
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {}
  }, [items]);

  const count = useMemo(() => items.reduce((sum, i) => sum + i.qty, 0), [items]);
  const total = useMemo(() => items.reduce((sum, i) => sum + i.price * i.qty, 0), [items]);

  // ✅ FIXED SIGNATURE HERE TOO
  function add(item: Omit<CartItem, "qty" | "lineId">) {
    const normalized = normalizeCartItem(item);

    setItems((prev) => {
      const found = prev.find((x) => x.lineId === normalized.lineId);
      if (found) {
        return prev.map((x) =>
          x.lineId === normalized.lineId ? { ...x, qty: x.qty + 1 } : x
        );
      }
      return [...prev, { ...normalized, qty: 1 }];
    });
  }

  function remove(lineId: string) {
    setItems((prev) => prev.filter((x) => x.lineId !== lineId));
  }

  function setQty(lineId: string, qty: number) {
    setItems((prev) => {
      if (!Number.isFinite(qty)) return prev;
      if (qty <= 0) return prev.filter((x) => x.lineId !== lineId);
      return prev.map((x) => (x.lineId === lineId ? { ...x, qty } : x));
    });
  }

  function clearCart() {
    setItems([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
  }

  function clear() {
    clearCart();
  }

  return (
    <CartContext.Provider value={{ items, count, total, add, remove, setQty, clear, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
