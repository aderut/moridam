"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type OrderItem = {
    id: string;
    title: string;
    price: number;
    qty: number;
};

type ApiOrder = any; // we’ll normalize it

type Order = {
    id: string;
    fullName: string;
    phone: string;
    method: "delivery" | "pickup";
    address: string;
    note?: string | null;
    subtotal: number;
    deliveryFee: number;
    total: number;
    createdAt: string;
    items: OrderItem[];
};

function num(v: any) {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
}

function str(v: any) {
    return String(v ?? "").trim();
}

function normalizeOrder(o: ApiOrder): Order {
    // supports both camelCase and snake_case from Supabase
    const createdAt = o.created_at ?? o.createdAt ?? new Date().toISOString();
    const items = Array.isArray(o.items) ? o.items : [];

    return {
        id: str(o.id),
        fullName: str(o.full_name ?? o.fullName),
        phone: str(o.phone),
        method: (o.method === "pickup" ? "pickup" : "delivery") as "delivery" | "pickup",
        address: str(o.address),
        note: o.note ?? null,
        subtotal: num(o.subtotal),
        deliveryFee: num(o.delivery_fee ?? o.deliveryFee),
        total: num(o.total),
        createdAt: str(createdAt),
        items: items.map((i: any) => ({
            id: str(i.id),
            title: str(i.title),
            price: num(i.price),
            qty: num(i.qty),
        })),
    };
}

export default function AdminOrdersPage() {
    const router = useRouter();

    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const hasOrders = useMemo(() => orders.length > 0, [orders]);

    async function loadOrders() {
        setLoading(true);
        setError(null);

        try {
            const res = await fetch("/api/orders", { cache: "no-store" });

            // If not logged in, your API should return 401
            if (res.status === 401) {
                router.replace("/admin/login");
                return;
            }

            // Safely read as text first (prevents JSON crash when server returns HTML)
            const text = await res.text();
            const data = text ? JSON.parse(text) : null;

            if (!res.ok) {
                throw new Error(data?.error || "Failed to load orders");
            }

            const list = Array.isArray(data) ? data : [];
            setOrders(list.map(normalizeOrder));
        } catch (e: any) {
            setError(e?.message || "Something went wrong");
            setOrders([]);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadOrders();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="bg-[var(--bg)] min-h-screen pt-24 pb-12">
            <div className="max-w-[1100px] mx-auto px-5">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                    <h1 className="text-4xl font-extrabold text-[var(--ink)]">Admin – Orders</h1>

                    <button
                        type="button"
                        onClick={loadOrders}
                        className="h-10 px-5 rounded-full border bg-white font-semibold"
                    >
                        Refresh
                    </button>
                </div>

                {loading && <p className="mt-6 text-slate-500">Loading orders…</p>}

                {error && (
                    <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                        {error}
                    </div>
                )}

                {!loading && !error && !hasOrders && (
                    <p className="mt-6 text-slate-500">No orders yet.</p>
                )}

                <div className="mt-8 space-y-6">
                    {orders.map((order) => (
                        <div
                            key={order.id}
                            className="bg-white border border-[var(--line)] rounded-2xl p-6"
                        >
                            {/* Header */}
                            <div className="flex flex-wrap justify-between gap-3">
                                <div>
                                    <div className="font-extrabold text-[var(--ink)]">{order.fullName || "—"}</div>
                                    <div className="text-sm text-slate-500">{order.phone || "—"}</div>
                                    <div className="text-xs text-slate-400 mt-1">Order ID: {order.id}</div>
                                </div>

                                <div className="text-sm text-right">
                                    <div className="font-extrabold text-[var(--ink)]">
                                        ₦{order.total.toLocaleString()}
                                    </div>
                                    <div className="text-slate-500">
                                        {order.createdAt ? new Date(order.createdAt).toLocaleString() : "—"}
                                    </div>
                                </div>
                            </div>

                            {/* Method + Address */}
                            <div className="mt-4 grid gap-2 sm:grid-cols-2 text-sm">
                                <div>
                                    <span className="font-semibold">Method:</span>{" "}
                                    {order.method === "delivery" ? "Delivery" : "Pickup"}
                                </div>
                                <div className="sm:text-right">
                                    <span className="font-semibold">Address:</span> {order.address || "—"}
                                </div>
                            </div>

                            {/* Items */}
                            <div className="mt-5">
                                <div className="font-semibold mb-2">Items</div>

                                {order.items.length === 0 ? (
                                    <div className="text-sm text-slate-500">No items on this order.</div>
                                ) : (
                                    <ul className="space-y-1 text-sm">
                                        {order.items.map((i, idx) => (
                                            <li key={`${i.id}-${idx}`} className="flex justify-between gap-4">
                        <span className="truncate">
                          {i.title || "Item"} × {i.qty || 0}
                        </span>
                                                <span className="font-semibold">
                          ₦{(i.price * i.qty).toLocaleString()}
                        </span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>

                            {/* Totals */}
                            <div className="mt-5 text-sm space-y-1">
                                <div className="flex justify-between">
                                    <span>Subtotal</span>
                                    <span>₦{order.subtotal.toLocaleString()}</span>
                                </div>

                                <div className="flex justify-between">
                                    <span>Delivery Fee</span>
                                    <span>₦{order.deliveryFee.toLocaleString()}</span>
                                </div>

                                <div className="flex justify-between font-extrabold text-[var(--ink)]">
                                    <span>Total</span>
                                    <span>₦{order.total.toLocaleString()}</span>
                                </div>
                            </div>

                            {/* Note */}
                            {order.note ? (
                                <div className="mt-4 text-sm text-slate-600">
                                    <span className="font-semibold">Note:</span> {order.note}
                                </div>
                            ) : null}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
