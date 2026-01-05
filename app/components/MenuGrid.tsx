"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { products, type Category } from "@/data/product";
import { useCart } from "@/app/components/cart/CartProvider";

const tabs: (Category | "All")[] = ["All", "Breakfast", "Lunch", "Dinner", "Snacks"];

export default function MenuGrid() {
    const [active, setActive] = useState<(typeof tabs)[number]>("All");
    const { add } = useCart();

    const filtered = useMemo(() => {
        if (active === "All") return products;
        return products.filter((p) => p.category === active);
    }, [active]);

    return (
        <div className="mt-6">
            <div className="flex flex-wrap gap-2">
                {tabs.map((t) => (
                    <button
                        key={t}
                        onClick={() => setActive(t)}
                        className={`px-4 h-10 rounded-full text-sm font-semibold border ${
                            active === t
                                ? "bg-teal-700 text-white border-teal-700"
                                : "bg-white hover:bg-slate-50 border-slate-200"
                        }`}
                    >
                        {t}
                    </button>
                ))}
            </div>

            <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map((p) => (
                    <div key={p.id} className="border rounded-xl overflow-hidden bg-white">
                        <div className="relative h-44 bg-slate-100">
                            <Image src={p.image} alt={p.name} fill className="object-cover" />
                        </div>

                        <div className="p-4">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <div className="font-extrabold">{p.name}</div>
                                    <div className="text-xs text-slate-500 mt-1">{p.category}</div>
                                </div>
                                <div className="font-extrabold">₦{p.price.toLocaleString()}</div>
                            </div>

                            <p className="text-sm text-slate-600 mt-3">{p.desc}</p>

                            <button
                                onClick={() => add(p)}
                                className="mt-4 w-full h-10 rounded-lg bg-teal-700 text-white font-semibold hover:opacity-95"
                            >
                                Add to Cart
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
