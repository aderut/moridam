"use client";

import { useMemo, useState } from "react";

type Category = "Breakfast" | "Lunch" | "Dinner";

const items = [
    { name: "Avocado Toast", price: 3200, category: "Breakfast" as Category },
    { name: "Egg & Veg Bowl", price: 4500, category: "Breakfast" as Category },
    { name: "Grilled Chicken Salad", price: 6500, category: "Lunch" as Category },
    { name: "Jollof + Chicken", price: 7500, category: "Lunch" as Category },
    { name: "Steak & Veg", price: 12000, category: "Dinner" as Category },
    { name: "Seafood Pasta", price: 9800, category: "Dinner" as Category },
];

export default function MenuSection() {
    const [active, setActive] = useState<Category | "All">("All");

    const filtered = useMemo(() => {
        if (active === "All") return items;
        return items.filter((i) => i.category === active);
    }, [active]);

    return (
        <div className="mt-6">
            <div className="flex flex-wrap gap-2">
                {(["All", "Breakfast", "Lunch", "Dinner"] as const).map((c) => (
                    <button
                        key={c}
                        onClick={() => setActive(c)}
                        className={`px-4 h-10 rounded-full text-sm font-semibold border ${
                            active === c
                                ? "bg-teal-700 text-white border-teal-700"
                                : "bg-white hover:bg-slate-50 border-slate-200"
                        }`}
                    >
                        {c}
                    </button>
                ))}
            </div>

            <div className="mt-6 grid md:grid-cols-3 gap-4">
                {filtered.map((it) => (
                    <div key={it.name} className="border rounded-xl p-5 bg-white">
                        <div className="font-bold">{it.name}</div>
                        <div className="text-sm text-slate-500 mt-1">{it.category}</div>
                        <div className="mt-4 font-extrabold">₦{it.price.toLocaleString()}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}
