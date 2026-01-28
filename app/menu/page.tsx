"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/app/cart/CartProvider";

const CREAM = "#FBF4DE";
const INK = "#2B2B2B";

type MenuCategory = "all" | "food" | "pastries" | "drinks" | "cakes";

type DbMenuItem = {
    id: string;
    title: string;
    description: string | null;
    price: number;
    category: string;
    image: string | null;
    created_at?: string;
};

type MenuItem = {
    id: string;
    title: string;
    description: string;
    price: number;
    category: MenuCategory;
    image?: string;
};

const tabs: { label: string; value: MenuCategory }[] = [
    { label: "All", value: "all" },
    { label: "Food", value: "food" },
    { label: "Pastries", value: "pastries" },
    { label: "Drinks", value: "drinks" },
    { label: "Cakes", value: "cakes" },
];

function toMenuItem(d: DbMenuItem): MenuItem {
    const cat = String(d.category || "").toLowerCase() as MenuCategory;
    return {
        id: d.id,
        title: d.title,
        description: d.description ?? "",
        price: Number(d.price ?? 0),
        category: (tabs.some((t) => t.value === cat) ? cat : "food") as MenuCategory,
        image: d.image ?? undefined,
    };
}

async function safeJson(res: Response) {
    const text = await res.text();
    if (!text) return null;
    try {
        return JSON.parse(text);
    } catch {
        return { error: text };
    }
}

export default function MenuPage() {
    const router = useRouter();
    const { add } = useCart();

    const [items, setItems] = useState<MenuItem[]>([]);
    const [active, setActive] = useState<MenuCategory>("all");
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);

    // Optional: read ?category=cakes on first load (without useSearchParams)
    useEffect(() => {
        const sp = new URLSearchParams(window.location.search);
        const c = (sp.get("category") || "").toLowerCase() as MenuCategory;
        if (tabs.some((t) => t.value === c)) setActive(c);
    }, []);

    useEffect(() => {
        let alive = true;

        (async () => {
            setLoading(true);
            setLoadError(null);

            try {
                const res = await fetch("/api/menu", { cache: "no-store" });
                const data = await safeJson(res);

                if (!res.ok) {
                    if (!alive) return;
                    setItems([]);
                    setLoadError((data as any)?.error || "Failed to load menu");
                    return;
                }

                const list = Array.isArray(data) ? (data as DbMenuItem[]) : [];
                if (!alive) return;
                setItems(list.map(toMenuItem));
            } catch (e: any) {
                if (!alive) return;
                setItems([]);
                setLoadError(e?.message || "Failed to load menu");
            } finally {
                if (!alive) return;
                setLoading(false);
            }
        })();

        return () => {
            alive = false;
        };
    }, []);

    const filtered = useMemo(() => {
        if (active === "all") return items;
        return items.filter((i) => i.category === active);
    }, [items, active]);

    return (
        <div className="bg-[var(--bg)] min-h-screen pt-20 pb-12">
            <div className="max-w-[1120px] mx-auto px-5">
                {/* Title row */}
                <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-extrabold text-[var(--ink)]">
                            Featured favorites
                        </h1>

                        {/* ✅ No "Loading..." text here anymore */}
                        <div className="mt-3 text-[var(--color-muted)] font-semibold">
                            {loadError
                                ? ""
                                : `${filtered.length} item${filtered.length === 1 ? "" : "s"}`}
                        </div>
                    </div>
                </div>

                {/* Tabs row */}
                <div className="mt-6 flex items-center gap-3 overflow-x-auto pb-2">
                    {tabs.map((t) => {
                        const on = t.value === active;
                        return (
                            <button
                                key={t.value}
                                type="button"
                                onClick={() => setActive(t.value)}
                                className={`shrink-0 h-10 px-4 rounded-xl text-sm font-semibold transition border ${
                                    on
                                        ? "border-transparent"
                                        : "border-[var(--line)] bg-white hover:bg-slate-50"
                                }`}
                                style={on ? { backgroundColor: INK, color: "white" } : {}}
                            >
                                {t.label}
                            </button>
                        );
                    })}
                </div>

                {/* ✅ States (NO loading text). Just show nothing while loading */}
                {loadError ? (
                    <div className="mt-10 text-center text-red-600 font-semibold">
                        {loadError}
                    </div>
                ) : !loading && filtered.length === 0 ? (
                    <div className="mt-10 text-center text-[var(--color-muted)]">
                        No items yet.
                    </div>
                ) : !loading ? (
                    <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {filtered.map((item) => (
                            <div
                                key={item.id}
                                className="relative rounded-2xl bg-white border border-[var(--line)] overflow-hidden cursor-pointer hover:shadow-sm transition"
                                onClick={() => router.push(`/product/${item.id}`)}
                            >
                                {/* Image */}
                                <div className="relative h-44 bg-slate-100">
                                    {item.image ? (
                                        <Image
                                            src={item.image}
                                            alt={item.title}
                                            fill
                                            className="object-cover"
                                            sizes="(max-width: 768px) 100vw, 260px"
                                        />
                                    ) : (
                                        <div className="absolute inset-0 grid place-items-center text-slate-400 text-sm">
                                            No image
                                        </div>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="p-4">
                                    <div className="font-extrabold text-[var(--ink)]">
                                        {item.title}
                                    </div>

                                    <div className="mt-3 flex items-center justify-between">
                                        {/* Price pill */}
                                        <div
                                            className="h-10 px-4 rounded-xl inline-flex items-center text-sm font-bold"
                                            style={{ backgroundColor: CREAM, color: INK }}
                                        >
                                            ₦{Number(item.price ?? 0).toLocaleString()}
                                        </div>

                                        {/* Add button */}
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                add({
                                                    id: item.id,
                                                    title: item.title,
                                                    price: Number(item.price ?? 0),
                                                    image: item.image || "",
                                                    category: item.category,
                                                    description: item.description,
                                                });
                                            }}
                                            className="h-10 w-10 rounded-xl grid place-items-center font-extrabold hover:opacity-90"
                                            style={{ backgroundColor: CREAM, color: INK }}
                                            aria-label="Add to cart"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    // ✅ while loading: show NOTHING (no text)
                    <div className="mt-8" />
                )}
            </div>
        </div>
    );
}
