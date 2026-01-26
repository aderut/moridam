"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const STORAGE_KEY = "valentine_popup_seen_v1";

export default function ValentinePopup() {
    const router = useRouter();
    const [open, setOpen] = useState(false);

    useEffect(() => {
        // Show once per device/browser
        const seen = localStorage.getItem(STORAGE_KEY);
        if (!seen) {
            // small delay so page loads nicely
            const t = setTimeout(() => setOpen(true), 700);
            return () => clearTimeout(t);
        }
    }, []);

    if (!open) return null;

    function close() {
        localStorage.setItem(STORAGE_KEY, "1");
        setOpen(false);
    }

    function goToMenu() {
        localStorage.setItem(STORAGE_KEY, "1");
        setOpen(false);
        router.push("/menu?category=cakes"); // optional filter
    }

    return (
        <div className="fixed inset-0 z-[80] grid place-items-center bg-black/50 px-4">
            <div className="w-full max-w-[520px] rounded-2xl bg-white border border-black/10 overflow-hidden shadow-xl">
                {/* Header bar (matches your style vibe) */}
                <div
                    className="px-5 py-4"
                    style={{ backgroundColor: "#000", color: "#FBF4DE" }}
                >
                    <div className="text-lg font-extrabold">Valentine Special 💝</div>
                    <div className="text-sm opacity-90">
                        Limited offer — while it lasts
                    </div>
                </div>

                <div className="p-5">
                    <div className="text-[var(--ink)] text-xl font-extrabold leading-tight">
                        Buy our 6-inch single layer cake for ₦15,000
                    </div>

                    <p className="mt-2 text-slate-600">
                        Get an extra <b>4 cupcakes</b> FREE.
                    </p>

                    <div className="mt-5 flex gap-3 flex-wrap">
                        <button
                            type="button"
                            onClick={goToMenu}
                            className="h-11 px-6 rounded-full font-semibold"
                            style={{ backgroundColor: "#FBF4DE", color: "#000" }}
                        >
                            Shop Valentine Special
                        </button>

                        <button
                            type="button"
                            onClick={close}
                            className="h-11 px-6 rounded-full border font-semibold bg-white"
                        >
                            Not now
                        </button>
                    </div>

                    <div className="mt-3 text-xs text-slate-500">
                        Tip: If you want to show it again, clear site data or remove the localStorage key:{" "}
                        <b>{STORAGE_KEY}</b>
                    </div>
                </div>
            </div>
        </div>
    );
}
