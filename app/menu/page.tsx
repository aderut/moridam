"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import type { MenuCategory, MenuItem } from "@/app/components/menu/menuStore";
import { useCart } from "@/app/components/cart/CartProvider";

const BRAND_BG = "#F7EED9"; // navbar / logo beige
const BRAND_TEXT = "#2B2B2B";

const tabs: { label: string; value: MenuCategory }[] = [
    { label: "All", value: "all" },
    { label: "Food", value: "food" },
    { label: "Pastries", value: "pastries" },
    { label: "Drinks", value: "drinks" },
    { label: "Cakes", value: "cakes" },
];

// Supabase row shape
type DbMenuItem = {
    id: string;
    title: string;
    description: string | null;
    price: number;
    category: string;
    image: string | null;
    created_at?: string;
};

function toMenuItem(d: DbMenuItem): MenuItem {
    return {
        id: d.id,
        title: d.title,
        description: d.description ?? "",
        price: d.price ?? 0,
        category: d.category as any,
        image: d.image ?? undefined,
    };
}

export default function MenuPage() {
    const [items, setItems] = useState<MenuItem[]>([]);
    const [active, setActive] = useState<MenuCategory>("all");
    const [loading, setLoading] = useState(true);

    const { add } = useCart();

    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                const res = await fetch("/api/menu", { cache: "no-store" });
                const data = await res.json();

                if (!res.ok) {
                    console.error("Menu API error:", data?.error || data);
                    setItems([]);
                    return;
                }

                setItems((data as DbMenuItem[]).map(toMenuItem));
            } catch (e) {
                console.error("Failed to fetch menu:", e);
                setItems([]);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const filtered = useMemo(() => {
        if (active === "all") return items;
        return items.filter((i) => i.category === active);
    }, [items, active]);

    return (
        <div className="bg-[var(--bg)] min-h-screen pt-20 pb-12">
            <div className="max-w-[1120px] mx-auto px-5">
                {/* Title */}
                <div className="text-center">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-[var(--ink)]">
                        Our Menu
                    </h1>
                    <p className="mt-3 text-[var(--color-muted)] max-w-2xl mx-auto">
                        Browse our menu and add items to cart.
                    </p>
                </div>

                {/* Tabs */}
                <div className="mt-8 flex items-center justify-center gap-3 flex-wrap">
                    {tabs.map((t) => {
                        const on = t.value === active;
                        return (
                            <button
                                key={t.value}
                                type="button"
                                onClick={() => setActive(t.value)}
                                className={`h-10 px-5 rounded-full border text-sm font-semibold transition ${
                                    on ? "border-transparent" : "bg-white border-[var(--line)] hover:bg-slate-50"
                                }`}
                                style={on ? { backgroundColor: BRAND_BG, color: BRAND_TEXT } : {}}
                            >
                                {t.label}
                            </button>
                        );
                    })}
                </div>

                {/* Loading */}
                {loading ? (
                    <div className="mt-12 text-center text-[var(--color-muted)]">
                        Loading menu...
                    </div>
                ) : filtered.length > 0 ? (
                    <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {filtered.map((item) => (
                            <div
                                key={item.id}
                                className="relative bg-white border border-[var(--line)] rounded-2xl overflow-hidden"
                            >
                                {/* Image */}
                                <div className="relative h-40 bg-slate-100">
                                    {item.image ? (
                                        <Image
                                            src={item.image}
                                            alt={item.title}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="absolute inset-0 grid place-items-center text-slate-400 text-sm pointer-events-none">
                                            No image
                                        </div>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="p-4">
                                    <div className="text-[11px] uppercase tracking-wide text-slate-500">
                                        {item.category}
                                    </div>

                                    <div className="mt-1 flex items-start justify-between gap-3">
                                        <div className="font-extrabold text-[var(--ink)] leading-tight">
                                            {item.title}
                                        </div>
                                        <div className="font-extrabold" style={{ color: BRAND_TEXT }}>
                                            ₦{item.price.toLocaleString()}
                                        </div>
                                    </div>

                                    <p className="mt-2 text-sm text-[var(--color-muted)] leading-6 line-clamp-2">
                                        {item.description}
                                    </p>

                                    {/* Add to Cart */}
                                    <button
                                        type="button"
                                        onClick={() =>
                                            add({
                                                id: item.id,
                                                title: item.title,
                                                price: item.price,
                                                image: item.image || "",
                                                category: item.category,
                                                description: item.description,
                                            })
                                        }
                                        className="mt-4 w-full h-10 rounded-full font-semibold transition hover:opacity-90"
                                        style={{ backgroundColor: BRAND_BG, color: BRAND_TEXT }}
                                    >
                                        Add to Cart
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="mt-12 text-center text-[var(--color-muted)]">
                        No items yet.
                    </div>
                )}
            </div>
        </div>
    );
}
