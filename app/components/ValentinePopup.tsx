"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const BEIGE = "#FBF4DE";

export default function ValentinePopup() {
    const [open, setOpen] = useState(false);

    // ✅ Show immediately on page load
    useEffect(() => {
        setOpen(true);
    }, []);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
            <div className="w-full max-w-md rounded-3xl bg-white overflow-hidden shadow-xl">
                {/* Header */}
                <div className="bg-black text-white px-6 py-4">
                    <h2 className="text-xl font-extrabold">
                        Valentine Special 💖
                    </h2>
                    <p className="text-sm opacity-80">
                        Limited offer — while it lasts
                    </p>
                </div>

                {/* Body */}
                <div className="p-6">
                    <p className="text-lg font-bold text-[var(--ink)]">
                        Buy our 6-inch single layer cake for ₦15,000
                    </p>

                    <p className="mt-2 text-[var(--color-muted)]">
                        Get an extra <b>4 cupcakes</b> FREE.
                    </p>

                    <Link
                        href="/menu?category=cakes"
                        className="mt-5 inline-flex w-full h-11 items-center justify-center rounded-full font-semibold"
                        style={{ backgroundColor: BEIGE, color: "#000" }}
                        onClick={() => setOpen(false)}
                    >
                        Shop Valentine Special
                    </Link>


                    <button
                        onClick={() => setOpen(false)}
                        className="mt-3 w-full h-11 rounded-full border border-[var(--line)] font-semibold"
                    >
                        Not now
                    </button>
                </div>
            </div>
        </div>
    );
}
