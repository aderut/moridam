"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/app/cart/CartProvider";

export default function CartView() {
    const { items, setQty, remove, total, clear } = useCart();

    if (items.length === 0) {
        return (
            <div className="mt-6 border rounded-xl p-6 bg-white">
                <p className="text-slate-600">Your cart is empty.</p>
                <Link href="/menu" className="inline-block mt-4 text-teal-700 font-semibold">
                    Go to Menu →
                </Link>
            </div>
        );
    }

    return (
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
            {/* Items */}
            <div className="space-y-4">
                {items.map((it) => (
                    <div
                        key={it.id}
                        className="border rounded-xl p-4 bg-white flex flex-col sm:flex-row gap-4"
                    >
                        {/* Image */}
                        <div className="relative w-full sm:w-24 h-44 sm:h-24 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                            {it.image ? (
                                <Image src={it.image} alt={it.title} fill className="object-cover" />
                            ) : (
                                <div className="absolute inset-0 grid place-items-center text-xs text-slate-400">
                                    No image
                                </div>
                            )}
                        </div>

                        {/* Content */}
                        <div className="flex-1">
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                                <div>
                                    <div className="font-extrabold text-[var(--ink)]">{it.title}</div>
                                </div>

                                <div className="font-extrabold text-[var(--ink)]">
                                    ₦{(it.price * it.qty).toLocaleString()}
                                </div>
                            </div>

                            {/* Controls */}
                            <div className="mt-4 flex flex-wrap items-center gap-2">
                                <button
                                    className="w-10 h-10 rounded-lg border"
                                    onClick={() => setQty(it.id, it.qty - 1)}
                                    type="button"
                                >
                                    -
                                </button>

                                <input
                                    className="w-16 h-10 border rounded-lg text-center"
                                    value={it.qty}
                                    onChange={(e) => setQty(it.id, Number(e.target.value) || 1)}
                                    inputMode="numeric"
                                />

                                <button
                                    className="w-10 h-10 rounded-lg border"
                                    onClick={() => setQty(it.id, it.qty + 1)}
                                    type="button"
                                >
                                    +
                                </button>

                                <button
                                    className="sm:ml-auto text-sm text-red-600 font-semibold px-2 py-2"
                                    onClick={() => remove(it.id)}
                                    type="button"
                                >
                                    Remove
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                <button onClick={clear} className="text-sm text-slate-500 underline" type="button">
                    Clear cart
                </button>
            </div>

            {/* Summary */}
            <div className="border rounded-xl p-5 bg-white h-fit lg:sticky lg:top-24">
                <div className="flex justify-between font-extrabold">
                    <span>Total</span>
                    <span>₦{total.toLocaleString()}</span>
                </div>

                <Link
                    href="/checkout"
                    className="mt-4 w-full h-11 rounded-lg bg-teal-700 text-white font-semibold inline-flex items-center justify-center"
                >
                    Checkout
                </Link>
            </div>
        </div>
    );
}
