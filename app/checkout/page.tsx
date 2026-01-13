"use client";

import { useEffect, useMemo, useState } from "react";
import { useCart } from "@/app/cart/CartProvider";

const BEIGE = "#FBF4DE";
const TEXT = "#2B2B2B";

// Your pickup point (Rumuevorlu)
const PICKUP_LABEL = "Pickup (Rumuevorlu)";
const PICKUP_COORDS: [number, number] = [6.96449, 4.84044]; // [lng, lat]

type Method = "delivery" | "pickup";

type PlaceResult = {
    label: string;
    lat: number;
    lng: number;
};

export default function CheckoutPage() {
    const { items, total: subtotal, clear } = useCart();

    const [method, setMethod] = useState<Method>("delivery");

    const [fullName, setFullName] = useState("");
    const [phone, setPhone] = useState("");
    const [note, setNote] = useState("");

    // ✅ Search + dropdown results
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<PlaceResult[]>([]);
    const [selectedPlace, setSelectedPlace] = useState<PlaceResult | null>(null);

    const [searchLoading, setSearchLoading] = useState(false);
    const [searchError, setSearchError] = useState<string | null>(null);

    // ✅ Delivery quote
    const [quoteLoading, setQuoteLoading] = useState(false);
    const [deliveryFee, setDeliveryFee] = useState(0);

    const [saving, setSaving] = useState(false);
    const [done, setDone] = useState(false);
    const [orderId, setOrderId] = useState<string | null>(null);

    const grandTotal = useMemo(() => {
        return method === "delivery" ? subtotal + deliveryFee : subtotal;
    }, [subtotal, deliveryFee, method]);

    // ✅ Search places (debounced)
    useEffect(() => {
        if (method !== "delivery") {
            setQuery("");
            setResults([]);
            setSelectedPlace(null);
            setSearchError(null);
            setSearchLoading(false);
            setDeliveryFee(0);
            return;
        }

        const q = query.trim();
        if (q.length < 3) {
            setResults([]);
            setSearchError(null);
            return;
        }

        const t = setTimeout(async () => {
            setSearchLoading(true);
            setSearchError(null);
            try {
                const res = await fetch("/api/places/search", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ query: q }),
                });

                const data = await res.json().catch(() => []);
                if (!res.ok) throw new Error(data?.error || "Search failed");

                setResults(Array.isArray(data) ? data : []);
            } catch (e: any) {
                setResults([]);
                setSearchError(e?.message || "Could not search address");
            } finally {
                setSearchLoading(false);
            }
        }, 500);

        return () => clearTimeout(t);
    }, [query, method]);

    // ✅ When user picks a place -> calculate delivery fee
    useEffect(() => {
        if (method !== "delivery") return;

        if (!selectedPlace) {
            setDeliveryFee(0);
            return;
        }

        const run = async () => {
            setQuoteLoading(true);
            try {
                const to: [number, number] = [selectedPlace.lng, selectedPlace.lat];

                const res = await fetch("/api/delivery/quote", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ to }), // [lng, lat]
                });

                const data = await res.json().catch(() => ({}));
                if (!res.ok) throw new Error(data?.error || "Quote failed");

                setDeliveryFee(Number(data.fee) || 0);
            } catch {
                setDeliveryFee(0);
            } finally {
                setQuoteLoading(false);
            }
        };

        run();
    }, [selectedPlace, method]);

    async function placeOrder(e: React.FormEvent) {
        e.preventDefault();
        if (items.length === 0) return;

        if (method === "delivery" && !selectedPlace) {
            alert("Please select the correct address from the list.");
            return;
        }

        setSaving(true);
        try {
            const payload = {
                fullName,
                phone,
                note,
                items,
                subtotal,
                method,
                deliveryFee: method === "delivery" ? deliveryFee : 0,
                total: grandTotal,
                address:
                    method === "delivery"
                        ? selectedPlace?.label
                        : PICKUP_LABEL,
                coords:
                    method === "delivery"
                        ? [selectedPlace!.lng, selectedPlace!.lat]
                        : PICKUP_COORDS,
            };

            // ✅ You can still save to Supabase here (your /api/orders)
            const res = await fetch("/api/orders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data?.error || "Order failed");

            setOrderId(data?.order?.id || null);
            clear();
            setDone(true);
        } catch (err: any) {
            alert(err?.message || "Order failed");
        } finally {
            setSaving(false);
        }
    }

    if (done) {
        const message = encodeURIComponent(
            `Hi Moridam Catering, I placed an order.\nOrder ID: ${orderId ?? "N/A"}\nMethod: ${method}\nTotal: ₦${grandTotal.toLocaleString()}`
        );

        return (
            <div className="bg-[var(--bg)] min-h-screen pt-24 pb-12">
                <div className="max-w-[800px] mx-auto px-5">
                    <div className="bg-white border border-[var(--line)] rounded-2xl p-8">
                        <h1 className="text-2xl font-extrabold text-[var(--ink)]">
                            Order successful ✅
                        </h1>
                        <p className="mt-2 text-[var(--color-muted)]">
                            Your order has been received.
                        </p>

                        <a
                            className="mt-5 inline-flex h-11 px-6 rounded-full font-semibold items-center justify-center"
                            style={{ backgroundColor: BEIGE, color: TEXT }}
                            href={`https://wa.me/2348161637306?text=${message}`}
                            target="_blank"
                            rel="noreferrer"
                        >
                            Send confirmation on WhatsApp
                        </a>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-[var(--bg)] min-h-screen pt-24 pb-12">
            <div className="max-w-[900px] mx-auto px-5">
                <h1 className="text-4xl font-extrabold text-[var(--ink)]">Checkout</h1>

                {items.length === 0 ? (
                    <p className="mt-6 text-[var(--color-muted)]">Your cart is empty.</p>
                ) : (
                    <form onSubmit={placeOrder} className="mt-6 grid lg:grid-cols-2 gap-6">
                        {/* Left */}
                        <div className="bg-white border border-[var(--line)] rounded-2xl p-6 space-y-4">
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setMethod("delivery")}
                                    className="h-10 px-4 rounded-full border text-sm font-semibold"
                                    style={
                                        method === "delivery"
                                            ? { backgroundColor: BEIGE, color: TEXT, borderColor: "transparent" }
                                            : {}
                                    }
                                >
                                    Delivery
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setMethod("pickup")}
                                    className="h-10 px-4 rounded-full border text-sm font-semibold"
                                    style={
                                        method === "pickup"
                                            ? { backgroundColor: BEIGE, color: TEXT, borderColor: "transparent" }
                                            : {}
                                    }
                                >
                                    Pickup (Rumuevorlu)
                                </button>
                            </div>

                            <input
                                className="w-full h-11 rounded-xl border border-[var(--line)] px-3"
                                placeholder="Full name"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                required
                            />

                            <input
                                className="w-full h-11 rounded-xl border border-[var(--line)] px-3"
                                placeholder="Phone"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                required
                            />

                            {/* Delivery search + dropdown */}
                            {method === "delivery" ? (
                                <div className="relative">
                                    <input
                                        className="w-full h-11 rounded-xl border border-[var(--line)] px-3"
                                        placeholder="Search restaurant, church, or street (Port Harcourt)"
                                        value={query}
                                        onChange={(e) => {
                                            setQuery(e.target.value);
                                            setSelectedPlace(null);
                                        }}
                                        required
                                    />

                                    {/* Status */}
                                    <div className="mt-2 text-sm text-slate-500">
                                        {searchLoading ? (
                                            <span>Searching…</span>
                                        ) : searchError ? (
                                            <span className="text-red-600">{searchError}</span>
                                        ) : selectedPlace ? (
                                            <span>
                        Selected: <b>{selectedPlace.label}</b>
                      </span>
                                        ) : (
                                            <span>Type and choose the correct place from the list.</span>
                                        )}
                                    </div>

                                    {/* Dropdown */}
                                    {results.length > 0 && (
                                        <div className="absolute z-20 mt-2 w-full bg-white border border-[var(--line)] rounded-xl shadow overflow-hidden">
                                            {results.map((r, i) => (
                                                <button
                                                    key={i}
                                                    type="button"
                                                    onClick={() => {
                                                        setSelectedPlace(r);
                                                        setQuery(r.label);
                                                        setResults([]);
                                                    }}
                                                    className="block w-full text-left px-4 py-2 text-sm hover:bg-slate-50"
                                                >
                                                    {r.label}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="rounded-xl border p-3 text-sm text-slate-700">
                                    Pickup location: <b>{PICKUP_LABEL}</b>
                                </div>
                            )}

                            <textarea
                                className="w-full min-h-[120px] rounded-xl border border-[var(--line)] p-3"
                                placeholder="Order note (optional)"
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                            />
                        </div>

                        {/* Right */}
                        <div className="bg-white border border-[var(--line)] rounded-2xl p-6 h-fit">
                            <div className="flex justify-between font-bold">
                                <span>Subtotal</span>
                                <span>₦{subtotal.toLocaleString()}</span>
                            </div>

                            <div className="flex justify-between font-bold mt-3">
                                <span>Delivery Fee</span>
                                <span>
                  {method === "pickup"
                      ? "₦0"
                      : quoteLoading
                          ? "Calculating…"
                          : `₦${deliveryFee.toLocaleString()}`}
                </span>
                            </div>

                            <div className="flex justify-between font-extrabold mt-4 text-lg">
                                <span>Total</span>
                                <span>₦{grandTotal.toLocaleString()}</span>
                            </div>

                            <button
                                type="submit"
                                disabled={saving}
                                className="mt-5 w-full h-11 rounded-full font-semibold disabled:opacity-60"
                                style={{ backgroundColor: BEIGE, color: TEXT }}
                            >
                                {saving ? "Placing order…" : "Place Order"}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
