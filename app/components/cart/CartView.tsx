"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "./CartProvider";

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
        <div className="mt-6 grid lg:grid-cols-[1fr_360px] gap-6">
            <div className="space-y-4">
                {items.map((it) => (
                    <div key={it.id} className="border rounded-xl p-4 bg-white flex gap-4">
                        <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-slate-100">
                            {it.image ? (
                                <Image src={it.image} alt={it.title} fill className="object-cover" />
                            ) : (
                                <div className="absolute inset-0 grid place-items-center text-xs text-slate-400">
                                    No image
                                </div>
                            )}
                        </div>

                        <div className="flex-1">
                            <div className="flex justify-between gap-3">
                                <div>
                                    <div className="font-extrabold">{it.title}</div>
                                    {/* If you want category here, add `category?: string` to CartItem */}
                                </div>

                                <div className="font-extrabold">
                                    ₦{(it.price * it.qty).toLocaleString()}
                                </div>
                            </div>

                            <div className="mt-3 flex items-center gap-2">
                                <button
                                    className="w-9 h-9 rounded-lg border"
                                    onClick={() => setQty(it.id, it.qty - 1)}
                                >
                                    -
                                </button>

                                <input
                                    className="w-14 h-9 border rounded-lg text-center"
                                    value={it.qty}
                                    onChange={(e) => setQty(it.id, Number(e.target.value) || 1)}
                                    inputMode="numeric"
                                />

                                <button
                                    className="w-9 h-9 rounded-lg border"
                                    onClick={() => setQty(it.id, it.qty + 1)}
                                >
                                    +
                                </button>

                                <button
                                    className="ml-auto text-sm text-red-600 font-semibold"
                                    onClick={() => remove(it.id)}
                                >
                                    Remove
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                <button onClick={clear} className="text-sm text-slate-500 underline">
                    Clear cart
                </button>
            </div>

            <div className="border rounded-xl p-5 bg-white h-fit">
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
