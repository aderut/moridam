"use client";

import { useCart } from "@/app/cart/CartProvider";

const BEIGE = "#FBF4DE";
const TEXT = "#2B2B2B";

export default function AddToCartPanel({
                                           item,
                                       }: {
    item: {
        id: string;
        title: string;
        description: string | null;
        price: number;
        category: string;
        image: string | null;
    };
}) {
    const { add } = useCart();

    return (
        <div className="border-t border-[var(--line)] pt-5">
            <div className="flex items-center justify-between">
                <div className="text-lg font-extrabold text-[var(--ink)]">
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
                            description: item.description ?? "",
                        })
                    }
                    className="h-11 px-6 rounded-full font-semibold hover:opacity-90"
                    style={{ backgroundColor: BEIGE, color: TEXT }}
                >
                    Add to cart
                </button>
            </div>

            {/* You can add options here later (spice, add-ons, etc.) */}
        </div>
    );
}
