"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

export type SelectedOptionDetail = {
  group: string;
  label: string;
  price: number;
};

export type CartItem = {
  // product id
  id: string;

  // unique line id (product id + selected options)
  lineId: string;

  title: string;

  /**
   * ✅ FINAL unit price (base + addons) per 1 qty
   * Cart total will be price * qty
   */
  price: number;

  image?: string;
  category?: string;
  description?: string;

  qty: number;

  // selections
  selectedOptions?: Record<string, string[]>;
  selectedOptionDetails?: SelectedOptionDetail[];

  // breakdown numbers (optional but helpful)
  basePrice?: number;
  addonsTotal?: number;
};

type CartContextType = {
  items: CartItem[];
  count: number;
  total: number;
  add: (item: Omit<CartItem, "qty">) => void;
  remove: (lineId: string) => void;
  setQty: (lineId: string, qty: number) => void;
  clear: () => void;

  // (optional alias if you use it elsewhere)
  clearCart: () => void;
};

const CartContext = createContext<CartContextType | null>(null);
const STORAGE_KEY = "moridam_cart_v2";

/** stable stringify so the same options produce the same key */
function stableStringify(obj: any) {
  if (!obj) return "";
  if (Array.isArray(obj)) return `[${obj.map(stableStringify).join(",")}]`;
  if (typeof obj === "object") {
    const keys = Object.keys(obj).sort();
    return `{${keys.map((k) => `"${k}":${stableStringify(obj[k])}`).join(",")}}`;
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

/**
 * ✅ Ensure cart item ALWAYS has:
 * - basePrice
 * - addonsTotal
 * - price = basePrice + addonsTotal
 */
function normalizeCartItem(input: any): CartItem {
  const selectedOptionDetails: SelectedOptionDetail[] = Array.isArray(input?.selectedOptionDetails)
    ? input.selectedOptionDetails
    : [];

  const addonsTotalFromDetails = sumAddons(selectedOptionDetails);

  // If basePrice was provided, trust it.
  // Otherwise assume current input.price is base price (this fixes your exact issue).
  const basePrice =
    Number.isFinite(Number(input?.basePrice)) ? Number(input.basePrice) : Number(input?.price ?? 0);

  // If addonsTotal exists, keep it; else compute from details
  const addonsTotal =
    Number.isFinite(Number(input?.addonsTotal)) ? Number(input.addonsTotal) : addonsTotalFromDetails;

  const finalUnitPrice = basePrice + addonsTotal;

  const id = String(input?.id ?? "").trim();
  const selectedOptions = input?.selectedOptions;

  const lineId =
    String(input?.lineId ?? "").trim() || makeLineId(id, selectedOptions);

  return {
    ...input,
    id,
    lineId,
    basePrice,
    addonsTotal,
    price: finalUnitPrice,
    qty: Math.max(1, Number(input?.qty ?? 1)),
    selectedOptionDetails,
  };
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  // load + migrate old items
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;

      const parsed = JSON.parse(raw) as any[];
      const fixed = (parsed || []).map((i) => normalizeCartItem(i));
      setItems(fixed);
    } catch {}
  }, []);

  // persist
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {}
  }, [items]);

  const count = useMemo(() => items.reduce((sum, i) => sum + i.qty, 0), [items]);

  // ✅ totals will now include toppings/addons
  const total = useMemo(() => items.reduce((sum, i) => sum + i.price * i.qty, 0), [items]);

  function add(item: Omit<CartItem, "qty">) {
    // ✅ normalize ensures addons are included in price
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
