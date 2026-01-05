"use client";

import { useState } from "react";
import { useCart } from "./CartProvider";

export default function CheckoutForm() {
    const { items, total, clear } = useCart();
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [address, setAddress] = useState("");
    const [note, setNote] = useState("");
    const [done, setDone] = useState(false);

    function placeOrder(e: React.FormEvent) {
        e.preventDefault();
        const order = {
            id: `ORD-${Date.now()}`,
            name,
            phone,
            address,
            note,
            items,
            total,
            createdAt: new Date().toISOString(),
        };

        const raw = localStorage.getItem("orders");
        const orders = raw ? JSON.parse(raw) : [];
        orders.unshift(order);
        localStorage.setItem("orders", JSON.stringify(orders));

        clear();
        setDone(true);
    }

    if (items.length === 0 && !done) {
        return <p className="mt-6 text-slate-600">Your cart is empty.</p>;
    }

    if (done) {
        return (
            <div className="mt-6 border rounded-xl p-6 bg-white">
                <div className="text-xl font-extrabold">Order placed ✅</div>
                <p className="mt-2 text-slate-600">
                    Your order has been saved on this device (localStorage).
                </p>
            </div>
        );
    }

    return (
        <form onSubmit={placeOrder} className="mt-6 max-w-xl border rounded-xl p-5 bg-white space-y-3">
            <input
                className="w-full h-11 px-4 rounded-lg border"
                placeholder="Full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
            />
            <input
                className="w-full h-11 px-4 rounded-lg border"
                placeholder="Phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
            />
            <input
                className="w-full h-11 px-4 rounded-lg border"
                placeholder="Delivery address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
            />
            <textarea
                className="w-full min-h-[120px] px-4 py-3 rounded-lg border"
                placeholder="Order note (optional)"
                value={note}
                onChange={(e) => setNote(e.target.value)}
            />

            <div className="flex justify-between font-extrabold">
                <span>Total</span>
                <span>₦{total.toLocaleString()}</span>
            </div>

            <button className="w-full h-11 rounded-lg bg-teal-700 text-white font-semibold">
                Place Order
            </button>
        </form>
    );
}
