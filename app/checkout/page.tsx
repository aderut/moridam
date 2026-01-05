"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useCart } from "@/app/components/cart/CartProvider";

const BEIGE = "#FBF4DE";

type DeliveryMethod = "delivery" | "pickup";
type Zone = "ph_city" | "ph_outskirts" | "outside_ph";
type PaymentMethod = "fake_online" | "cod";

const ZONE_FEES: Record<Zone, number> = {
    ph_city: 1500,
    ph_outskirts: 2500,
    outside_ph: 4000,
};

export default function CheckoutPage() {
    const { items, total, clear } = useCart();

    const [method, setMethod] = useState<DeliveryMethod>("delivery");
    const [zone, setZone] = useState<Zone>("ph_city");
    const [payment, setPayment] = useState<PaymentMethod>("fake_online");

    const [details, setDetails] = useState({
        fullName: "",
        phone: "",
        email: "",
        address: "",
        landmark: "",
        deliveryDate: "",
        notes: "",
    });

    const deliveryFee = useMemo(() => {
        if (method === "pickup") return 0;
        return ZONE_FEES[zone] ?? 0;
    }, [method, zone]);

    const grandTotal = useMemo(() => total + deliveryFee, [total, deliveryFee]);

    function update<K extends keyof typeof details>(key: K, value: (typeof details)[K]) {
        setDetails((p) => ({ ...p, [key]: value }));
    }

    function placeOrderFake(status: "paid" | "unpaid") {
        // basic validation
        if (!details.fullName.trim() || !details.phone.trim()) {
            alert("Please enter your full name and phone number.");
            return;
        }
        if (method === "delivery" && !details.address.trim()) {
            alert("Please enter your delivery address.");
            return;
        }

        const payload = {
            id: `order_${Date.now()}`,
            createdAt: new Date().toISOString(),
            paymentStatus: status,
            paymentMethod: payment,
            method,
            zone: method === "delivery" ? zone : null,
            deliveryFee,
            total,
            grandTotal,
            customer: details,
            items,
        };

        localStorage.setItem("last_order", JSON.stringify(payload));

        clear();
        window.location.href = "/checkout/success";
    }

    if (items.length === 0) {
        return (
            <div className="bg-[var(--bg)] min-h-screen pt-20 pb-12">
                <div className="max-w-[1120px] mx-auto px-5">
                    <div className="bg-white border border-[var(--line)] rounded-2xl p-10 text-center">
                        <div className="text-lg font-extrabold text-[var(--ink)]">Cart is empty</div>
                        <p className="mt-2 text-[var(--color-muted)]">Add items from the menu first.</p>
                        <Link
                            href="/menu"
                            className="mt-5 inline-flex h-11 px-6 rounded-full font-semibold items-center justify-center"
                            style={{ backgroundColor: BEIGE, color: "#000" }}
                        >
                            Go to Menu
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const needsDeliveryFields = method === "delivery";

    return (
        <div className="bg-[var(--bg)] min-h-screen pt-20 pb-12">
            <div className="max-w-[1120px] mx-auto px-5">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                    <h1 className="text-4xl font-extrabold text-[var(--ink)]">Checkout</h1>
                    <Link href="/cart" className="text-sm font-semibold hover:underline">
                        ← Back to Cart
                    </Link>
                </div>

                <div className="mt-8 grid lg:grid-cols-[1fr_360px] gap-6">
                    {/* LEFT */}
                    <div className="bg-white border border-[var(--line)] rounded-2xl p-6">
                        <div className="font-extrabold text-[var(--ink)] text-lg">Delivery Details</div>
                        <p className="mt-1 text-sm text-[var(--color-muted)]">
                            Choose delivery or pickup, then fill your details.
                        </p>

                        {/* Delivery / Pickup */}
                        <div className="mt-5 flex gap-3 flex-wrap">
                            <button
                                type="button"
                                onClick={() => setMethod("delivery")}
                                className={[
                                    "h-10 px-5 rounded-full border text-sm font-semibold transition",
                                    method === "delivery" ? "border-transparent" : "border-[var(--line)]",
                                ].join(" ")}
                                style={method === "delivery" ? { backgroundColor: BEIGE, color: "#000" } : {}}
                            >
                                Delivery
                            </button>

                            <button
                                type="button"
                                onClick={() => setMethod("pickup")}
                                className={[
                                    "h-10 px-5 rounded-full border text-sm font-semibold transition",
                                    method === "pickup" ? "border-transparent" : "border-[var(--line)]",
                                ].join(" ")}
                                style={method === "pickup" ? { backgroundColor: BEIGE, color: "#000" } : {}}
                            >
                                Pickup
                            </button>
                        </div>

                        {/* Zone */}
                        {needsDeliveryFields && (
                            <div className="mt-5">
                                <label className="block text-sm font-semibold text-[var(--ink)] mb-2">
                                    Delivery area (used to calculate fee)
                                </label>
                                <select
                                    value={zone}
                                    onChange={(e) => setZone(e.target.value as Zone)}
                                    className="w-full h-11 rounded-xl border border-[var(--line)] px-3 outline-none"
                                >
                                    <option value="ph_city">Port Harcourt (City)</option>
                                    <option value="ph_outskirts">PH Outskirts</option>
                                    <option value="outside_ph">Outside Port Harcourt</option>
                                </select>
                            </div>
                        )}

                        {/* Fields */}
                        <div className="mt-6 grid md:grid-cols-2 gap-4">
                            <Field label="Full Name">
                                <input
                                    value={details.fullName}
                                    onChange={(e) => update("fullName", e.target.value)}
                                    className="w-full h-11 rounded-xl border border-[var(--line)] px-3 outline-none"
                                    placeholder="Your name"
                                    required
                                />
                            </Field>

                            <Field label="Phone Number">
                                <input
                                    value={details.phone}
                                    onChange={(e) => update("phone", e.target.value)}
                                    className="w-full h-11 rounded-xl border border-[var(--line)] px-3 outline-none"
                                    placeholder="+234..."
                                    required
                                />
                            </Field>

                            <Field label="Email (optional)">
                                <input
                                    value={details.email}
                                    onChange={(e) => update("email", e.target.value)}
                                    className="w-full h-11 rounded-xl border border-[var(--line)] px-3 outline-none"
                                    placeholder="you@email.com"
                                    type="email"
                                />
                            </Field>

                            <Field label={needsDeliveryFields ? "Delivery Date" : "Pickup Date"}>
                                <input
                                    value={details.deliveryDate}
                                    onChange={(e) => update("deliveryDate", e.target.value)}
                                    className="w-full h-11 rounded-xl border border-[var(--line)] px-3 outline-none"
                                    type="date"
                                />
                            </Field>

                            {needsDeliveryFields && (
                                <>
                                    <Field label="Delivery Address">
                                        <input
                                            value={details.address}
                                            onChange={(e) => update("address", e.target.value)}
                                            className="w-full h-11 rounded-xl border border-[var(--line)] px-3 outline-none"
                                            placeholder="Street, area..."
                                            required
                                        />
                                    </Field>

                                    <Field label="Nearest Landmark (optional)">
                                        <input
                                            value={details.landmark}
                                            onChange={(e) => update("landmark", e.target.value)}
                                            className="w-full h-11 rounded-xl border border-[var(--line)] px-3 outline-none"
                                            placeholder="Close to..."
                                        />
                                    </Field>
                                </>
                            )}
                        </div>

                        <div className="mt-4">
                            <Field label="Extra Notes (optional)">
                <textarea
                    value={details.notes}
                    onChange={(e) => update("notes", e.target.value)}
                    className="w-full min-h-[110px] rounded-xl border border-[var(--line)] p-3 outline-none"
                    placeholder="Preferences, time, packaging, etc."
                />
                            </Field>
                        </div>

                        {/* PAYMENT */}
                        <div className="mt-8 border-t border-[var(--line)] pt-6">
                            <div className="font-extrabold text-[var(--ink)] text-lg">Payment</div>

                            <div className="mt-4 grid sm:grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setPayment("fake_online")}
                                    className="rounded-2xl border border-[var(--line)] p-4 text-left"
                                    style={payment === "fake_online" ? { backgroundColor: BEIGE } : {}}
                                >
                                    <div className="font-bold text-[var(--ink)]">Pay Online (Fake)</div>
                                    <div className="text-sm text-[var(--color-muted)] mt-1">
                                        For testing only
                                    </div>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setPayment("cod")}
                                    className="rounded-2xl border border-[var(--line)] p-4 text-left"
                                    style={payment === "cod" ? { backgroundColor: BEIGE } : {}}
                                >
                                    <div className="font-bold text-[var(--ink)]">
                                        {method === "pickup" ? "Pay on Pickup" : "Pay on Delivery"}
                                    </div>
                                    <div className="text-sm text-[var(--color-muted)] mt-1">
                                        We confirm your order first
                                    </div>
                                </button>
                            </div>

                            {/* ✅ Fake success buttons */}
                            <button
                                type="button"
                                onClick={() => placeOrderFake(payment === "fake_online" ? "paid" : "unpaid")}
                                className="mt-5 h-11 px-6 rounded-full font-semibold inline-flex items-center justify-center"
                                style={{ backgroundColor: BEIGE, color: "#000" }}
                            >
                                {payment === "fake_online" ? "Pay Now (Fake)" : "Place Order"}
                            </button>
                        </div>
                    </div>

                    {/* RIGHT */}
                    <div className="bg-white border border-[var(--line)] rounded-2xl p-6 h-fit">
                        <div className="font-extrabold text-[var(--ink)] text-lg">Order Summary</div>

                        <div className="mt-4 space-y-3">
                            {items.map((i) => (
                                <div key={i.id} className="flex items-start justify-between gap-3">
                                    <div className="text-sm">
                                        <div className="font-semibold text-[var(--ink)]">
                                            {i.title} <span className="text-[var(--color-muted)]">× {i.qty}</span>
                                        </div>
                                        <div className="text-[12px] text-[var(--color-muted)]">
                                            ₦{i.price.toLocaleString()} each
                                        </div>
                                    </div>
                                    <div className="text-sm font-bold text-[var(--ink)]">
                                        ₦{(i.price * i.qty).toLocaleString()}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 border-t border-[var(--line)] pt-4 space-y-2 text-sm">
                            <div className="flex items-center justify-between">
                                <div className="text-[var(--color-muted)]">Items total</div>
                                <div className="font-semibold text-[var(--ink)]">₦{total.toLocaleString()}</div>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="text-[var(--color-muted)]">Delivery fee</div>
                                <div className="font-semibold text-[var(--ink)]">₦{deliveryFee.toLocaleString()}</div>
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-[var(--line)]">
                                <div className="font-extrabold text-[var(--ink)]">Grand total</div>
                                <div className="font-extrabold text-[var(--ink)]">
                                    ₦{grandTotal.toLocaleString()}
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 text-xs text-[var(--color-muted)]">
                            Tip: choose <b>Pickup</b> to remove delivery fee.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <label className="block">
            <div className="text-sm font-semibold text-[var(--ink)] mb-2">{label}</div>
            {children}
        </label>
    );
}
