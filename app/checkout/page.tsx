"use client";

import { useMemo, useState } from "react";
import { useCart } from "@/app/cart/CartProvider";

const BEIGE = "#FBF4DE";
const TEXT = "#2B2B2B";

const PICKUP_LABEL = "Pickup (Rumuevorlu)";
type Method = "delivery" | "pickup";

export default function CheckoutPage() {
    const { items, total: subtotal, clear } = useCart();

    const [method, setMethod] = useState<Method>("delivery");
    const [fullName, setFullName] = useState("");
    const [phone, setPhone] = useState("");
    const [address, setAddress] = useState("");
    const [note, setNote] = useState("");

    const [saving, setSaving] = useState(false);
    const [done, setDone] = useState(false);
    const [orderId, setOrderId] = useState<string | null>(null);

    // ✅ store final values so WhatsApp total never becomes 0 after clear()
    const [finalTotal, setFinalTotal] = useState<number>(0);
    const [finalMethod, setFinalMethod] = useState<Method>("delivery");

    // ✅ NO delivery fee
    const grandTotal = useMemo(() => subtotal, [subtotal]);

    async function placeOrder(e: React.FormEvent) {
        e.preventDefault();
        if (items.length === 0) return;

        if (method === "delivery" && !address.trim()) {
            alert("Please enter your delivery address.");
            return;
        }

        setSaving(true);

        // ✅ capture totals BEFORE clearing cart
        const totalNow = grandTotal;

        try {
            const payload = {
                fullName,
                phone,
                note,
                items,
                subtotal,
                total: totalNow,
                method,
                deliveryFee: 0,
                address: method === "delivery" ? address : PICKUP_LABEL,
            };

            const res = await fetch("/api/orders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data?.error || "Order failed");

            const id = data?.order?.id || data?.id || null;
            setOrderId(id);

            // ✅ store values for success page BEFORE clear()
            setFinalTotal(totalNow);
            setFinalMethod(method);

            clear(); // ✅ safe now
            setDone(true);
        } catch (err: any) {
            alert(err?.message || "Order failed");
        } finally {
            setSaving(false);
        }
    }

    /* ================= SUCCESS PAGE ================= */
    if (done) {
        const message = encodeURIComponent(
            `Hello Moridam Catering 👋

I have placed an order successfully.

Order ID: ${orderId ?? "N/A"}
Order Method: ${finalMethod}
Total Amount: ₦${finalTotal.toLocaleString()}`
        );

        return (
            <div className="bg-[var(--bg)] min-h-screen pt-24 pb-12">
                <div className="max-w-[700px] mx-auto px-5">
                    <div className="bg-white border border-[var(--line)] rounded-2xl p-8 text-center">
                        <h1 className="text-2xl font-extrabold text-[var(--ink)]">
                            Order Successful ✅
                        </h1>

                        <p className="mt-3 text-[var(--color-muted)]">
                            Please send your payment receipt on WhatsApp to confirm your order.
                        </p>

                        <a
                            href={`https://wa.me/2348142517798?text=${message}`}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-6 inline-flex h-11 px-6 rounded-full font-semibold items-center justify-center"
                            style={{ backgroundColor: BEIGE, color: TEXT }}
                        >
                            Send confirmation to WhatsApp
                        </a>
                    </div>
                </div>
            </div>
        );
    }

    /* ================= CHECKOUT PAGE ================= */
    return (
        <div className="bg-[var(--bg)] min-h-screen pt-24 pb-12">
            <div className="max-w-[900px] mx-auto px-5">
                <h1 className="text-4xl font-extrabold text-[var(--ink)]">Checkout</h1>

                {items.length === 0 ? (
                    <p className="mt-6 text-[var(--color-muted)]">Your cart is empty.</p>
                ) : (
                    <form onSubmit={placeOrder} className="mt-6 grid lg:grid-cols-2 gap-6">
                        {/* LEFT */}
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
                                    Pickup
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
                                placeholder="Phone number"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                required
                            />

                            {method === "delivery" ? (
                                <input
                                    className="w-full h-11 rounded-xl border border-[var(--line)] px-3"
                                    placeholder="Delivery address"
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    required
                                />
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

                        {/* RIGHT */}
                        <div className="bg-white border border-[var(--line)] rounded-2xl p-6 h-fit">
                            <div className="flex justify-between font-bold">
                                <span>Subtotal</span>
                                <span>₦{subtotal.toLocaleString()}</span>
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
