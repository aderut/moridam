"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Announcement = {
    id: string;
    text: string;
    enabled?: boolean;
    sort?: number;
};

const FOOTER_BG = "#2B2B2B";
const BEIGE = "#FBF4DE";

async function safeJson(res: Response) {
    const t = await res.text();
    if (!t) return null;
    try {
        return JSON.parse(t);
    } catch {
        return null;
    }
}

export default function AnnouncementBar() {
    const [items, setItems] = useState<Announcement[]>([]);
    const [idx, setIdx] = useState(0);

    const timerRef = useRef<any>(null);

    const active = useMemo(() => {
        if (!items.length) return null;
        return items[Math.max(0, Math.min(idx, items.length - 1))];
    }, [items, idx]);

    // load announcements
    useEffect(() => {
        (async () => {
            try {
                const res = await fetch("/api/announcements", { cache: "no-store" });
                const data = await safeJson(res);
                const list = Array.isArray(data) ? data : [];
                setItems(list.filter((x) => x?.text));
                setIdx(0);
            } catch {
                setItems([]);
            }
        })();
    }, []);

    // auto slide
    useEffect(() => {
        if (!items.length) return;

        clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
            setIdx((prev) => (prev + 1) % items.length);
        }, 4000);

        return () => clearInterval(timerRef.current);
    }, [items]);

    function prev() {
        if (!items.length) return;
        setIdx((p) => (p - 1 + items.length) % items.length);
    }

    function next() {
        if (!items.length) return;
        setIdx((p) => (p + 1) % items.length);
    }

    if (!active) return null;

    return (
        <div
            className="w-full"
            style={{ backgroundColor: FOOTER_BG, color: BEIGE }}
        >
            <div className="max-w-[1120px] mx-auto px-4 h-10 flex items-center justify-between gap-3">
                <button
                    type="button"
                    onClick={prev}
                    className="h-8 w-8 rounded-full grid place-items-center"
                    style={{ backgroundColor: "rgba(255,255,255,0.10)" }}
                    aria-label="Previous announcement"
                >
                    ‹
                </button>

                <div className="flex-1 text-center text-sm font-semibold truncate px-2">
                    {active.text}
                </div>

                <button
                    type="button"
                    onClick={next}
                    className="h-8 w-8 rounded-full grid place-items-center"
                    style={{ backgroundColor: "rgba(255,255,255,0.10)" }}
                    aria-label="Next announcement"
                >
                    ›
                </button>
            </div>
        </div>
    );
}
