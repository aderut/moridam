"use client";

import { useMemo, useState } from "react";
import { useCart } from "@/app/cart/CartProvider";
import { PH_ZONES } from "@/data/phZones";

const BEIGE = "#FBF4DE";

type Method = "delivery" | "pickup";

export default function CheckoutForm() {
    const { items, total, clear } = useCart();

    const [method, setMethod] = useState<Method>("delivery");
    const [zoneId, setZoneId] = useState(PH_ZONES[0]?.id ?? "");
    const [address, setAddress] = useState(""); // still collect exact street for rider
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [note, setNote] = useState("");
    const [done, setDone] = useState(false);

    const selectedZone = useMemo(
        () => PH_ZONES.find((z) => z.id === zoneId),
        [zoneId]
    );

    const deliveryFee = method === "delivery" ? (selectedZone?.fee ?? 0) : 0;

    const grandTotal = total + deliveryFee;

    function placeOrder(e: React.FormEvent) {
        e.preventDefault();

        if (items.length === 0) return;

        // required check for delivery
        if (method === "delivery" && (!zoneId || !address.trim())) return;

        const order = {
            id: `ORD-${Date.now()}`,
            createdAt: new Date().toISOString(),
            customer: { name, phone },
            method,
            zone: method === "delivery" ? selectedZone?.name : null,
            deliveryFee,
            address: method === "delivery" ? address : "Pickup (Rumuevorlu)",
            note,
            items,
            subtotal: total,
            total: grandTotal,
            status: "success_fake",
        };

        // fake success (localStorage)
        const raw = localStorage.getItem("orders_v1");
        const orders = raw ? JSON.parse(raw) : [];
        orders.unshift(order);
        localStorage.setItem("orders_v1", JSON.stringify(orders));

        clear();
        setDone(true);
    }

    if (items.length === 0 && !done) {
        return <p className="mt-6 text-slate-600">Your cart is empty.</p>;
    }

    if (done) {
        return (
            <div className="mt-6 border rounded-xl p-6 bg-white">
                <div className="text-xl font-extrabold text-[var(--ink)]">
                    Order placed ✅
                </div>
                <p className="mt-2 text-slate-600">
                    Fake success for now — order saved on this device.
                </p>

                <button
                    onClick={() => setDone(false)}
                    className="mt-4 h-11 px-6 rounded-full font-semibold"
                    style={{ backgroundColor: BEIGE, color: "#000" }}
                    type="button"
                >
                    Place another order
                </button>
            </div>
        );
    }

    return (
        <form
            onSubmit={placeOrder}
            className="mt-6 max-w-xl border rounded-xl p-5 bg-white space-y-4"
        >
            <div className="text-xl font-extrabold text-[var(--ink)]">
                Checkout
            </div>

            {/* Delivery / Pickup */}
            <div className="grid grid-cols-2 gap-3">
                <button
                    type="button"
                    onClick={() => setMethod("delivery")}
                    className="h-11 rounded-xl border font-semibold"
                    style={{
                        backgroundColor: method === "delivery" ? BEIGE : "#fff",
                        color: "#000",
                    }}
                >
                    Delivery
                </button>

                <button
                    type="button"
                    onClick={() => setMethod("pickup")}
                    className="h-11 rounded-xl border font-semibold"
                    style={{
                        backgroundColor: method === "pickup" ? BEIGE : "#fff",
                        color: "#000",
                    }}
                >
                    Pickup
                </button>
            </div>

            {/* Customer details */}
            <input
                className="w-full h-11 px-4 rounded-xl border"
                placeholder="Full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
            />

            <input
                className="w-full h-11 px-4 rounded-xl border"
                placeholder="Phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
            />

            {/* Delivery fields */}
            {method === "delivery" ? (
                <>
                    <div>
                        <div className="text-sm font-semibold text-[var(--ink)] mb-2">
                            Choose your area (Port Harcourt)
                        </div>

                        <select
                            className="w-full h-11 px-3 rounded-xl border bg-white"
                            value={zoneId}
                            onChange={(e) => setZoneId(e.target.value)}
                            required
                        >
                            {PH_ZONES.map((z) => (
                                <option key={z.id} value={z.id}>
                                    {z.name} — ₦{z.fee.toLocaleString()}
                                </option>
                            ))}
                        </select>
                    </div>

                    <input
                        className="w-full h-11 px-4 rounded-xl border"
                        placeholder="Street / House address (e.g. Rumuokwuta, close to ...)"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        required
                    />
                </>
            ) : (
                <div className="rounded-xl border p-3 text-sm text-slate-700">
                    Pickup location: <b>Rumuevorlu, Port Harcourt</b>
                </div>
            )}

            <textarea
                className="w-full min-h-[110px] px-4 py-3 rounded-xl border"
                placeholder="Order note (optional)"
                value={note}
                onChange={(e) => setNote(e.target.value)}
            />

            {/* Summary */}
            <div className="rounded-xl border p-4">
                <div className="flex justify-between text-sm text-slate-700">
                    <span>Subtotal</span>
                    <span>₦{total.toLocaleString()}</span>
                </div>

                <div className="flex justify-between text-sm text-slate-700 mt-2">
                    <span>Delivery fee</span>
                    <span>₦{deliveryFee.toLocaleString()}</span>
                </div>

                <div className="flex justify-between font-extrabold text-[var(--ink)] mt-3">
                    <span>Total</span>
                    <span>₦{grandTotal.toLocaleString()}</span>
                </div>
            </div>

            <button
                className="w-full h-11 rounded-full font-semibold"
                style={{ backgroundColor: BEIGE, color: "#000" }}
                type="submit"
            >
                Place Order
            </button>
        </form>
    );
}
