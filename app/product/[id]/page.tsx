"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useCart } from "@/app/cart/CartProvider";

const CREAM = "#FBF4DE";
const INK = "#2B2B2B";

type DbMenuItem = {
    id: string;
    title: string;
    description: string | null;
    price: number;
    category: string;
    image: string | null;
};

export default function ProductPage({
                                        params,
                                    }: {
    params: Promise<{ id: string }>;
}) {
    const { add } = useCart();

    const [item, setItem] = useState<DbMenuItem | null>(null);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState<string | null>(null);

    useEffect(() => {
        let alive = true;

        (async () => {
            setLoading(true);
            setErr(null);

            const { id } = await params;

            try {
                const res = await fetch(`/api/menu/${id}`, { cache: "no-store" });
                const data = await res.json().catch(() => null);

                if (!res.ok) {
                    if (!alive) return;
                    setItem(null);
                    setErr(data?.error || "Item not found");
                    return;
                }

                if (!alive) return;
                setItem(data as DbMenuItem);
            } catch (e: any) {
                if (!alive) return;
                setErr(e?.message || "Failed to load item");
            } finally {
                if (!alive) return;
                setLoading(false);
            }
        })();

        return () => {
            alive = false;
        };
    }, [params]);

    if (loading) {
        return (
            <div className="bg-[var(--bg)] min-h-screen pt-24">
                <div className="max-w-[1120px] mx-auto px-5 text-[var(--color-muted)]">
                    Loading...
                </div>
            </div>
        );
    }

    if (err || !item) {
        return (
            <div className="bg-[var(--bg)] min-h-screen pt-24">
                <div className="max-w-[1120px] mx-auto px-5">
                    <Link href="/menu" className="text-sm font-semibold underline">
                        ← Back
                    </Link>
                    <div className="mt-6 text-red-600 font-bold">{err || "Item not found."}</div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-[var(--bg)] min-h-screen pt-24 pb-12">
            <div className="max-w-[1120px] mx-auto px-5">
                <Link href="/menu" className="text-sm font-semibold underline">
                    ← Back
                </Link>

                <div className="mt-6 bg-white border border-[var(--line)] rounded-2xl p-6 md:p-8">
                    <div className="grid md:grid-cols-2 gap-8 items-start">
                        {/* Left image */}
                        <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-slate-100">
                            {item.image ? (
                                <Image
                                    src={item.image}
                                    alt={item.title}
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 768px) 100vw, 520px"
                                />
                            ) : (
                                <div className="absolute inset-0 grid place-items-center text-slate-400">
                                    No image
                                </div>
                            )}
                        </div>

                        {/* Right details */}
                        <div>
                            <h1 className="text-3xl md:text-4xl font-extrabold" style={{ color: INK }}>
                                {item.title}
                            </h1>

                            <div className="mt-3 text-[var(--color-muted)] leading-7">
                                {item.description || "No description yet."}
                            </div>

                            <div className="mt-6 flex items-center gap-3 flex-wrap">
                                <div
                                    className="h-11 px-5 rounded-xl inline-flex items-center font-extrabold"
                                    style={{ backgroundColor: CREAM, color: INK }}
                                >
                                    ₦{Number(item.price ?? 0).toLocaleString()}
                                </div>

                                <button
                                    type="button"
                                    onClick={() =>
                                        add({
                                            id: item.id,
                                            title: item.title,
                                            price: Number(item.price ?? 0),
                                            image: item.image || "",
                                            category: item.category,
                                            description: item.description || "",
                                        })
                                    }
                                    className="h-11 px-6 rounded-xl font-semibold hover:opacity-90"
                                    style={{ backgroundColor: INK, color: "white" }}
                                >
                                    Add to cart
                                </button>
                            </div>

                            <div className="mt-8 text-sm text-[var(--color-muted)]">
                                Category: <span className="font-semibold">{item.category}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
