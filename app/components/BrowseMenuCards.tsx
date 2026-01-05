import Link from "next/link";
import { Coffee, UtensilsCrossed, GlassWater, CakeSlice } from "lucide-react";

const cards = [
    { title: "Breakfast", icon: Coffee, desc: "Start your day with fresh meals.", href: "/menu" },
    { title: "Main Dishes", icon: UtensilsCrossed, desc: "Classic meals made with love.", href: "/menu" },
    { title: "Drinks", icon: GlassWater, desc: "Refreshing beverages", href: "/menu" },
    { title: "Desserts", icon: CakeSlice, desc: "Sweet treats to finish strong.", href: "/menu" },
];

export default function BrowseMenuCards() {
    return (
        <section className="py-14">
            <div className="max-w-[1120px] mx-auto px-5">
                <h2 className="text-3xl font-extrabold text-center text-[var(--ink)]">
                    Browse Our Menu
                </h2>

                <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {cards.map((c) => {
                        const Icon = c.icon;

                        return (
                            <div
                                key={c.title}
                                className="bg-white border border-[var(--line)] rounded-2xl p-6 text-center hover:shadow-sm transition"
                            >
                                {/* Icon */}
                                <div className="mx-auto w-14 h-14 rounded-full bg-[#FBF4DE] grid place-items-center">
                                    <Icon className="w-6 h-6 text-black" />
                                </div>

                                <div className="mt-4 font-extrabold text-[var(--ink)]">
                                    {c.title}
                                </div>

                                <p className="mt-2 text-sm text-[var(--color-muted)] leading-6">
                                    {c.desc}
                                </p>

                                {/* Explore link */}
                                <Link
                                    href={c.href}
                                    className="mt-4 inline-block text-sm font-semibold text-black underline underline-offset-4 hover:opacity-80"
                                >
                                    Explore Menu
                                </Link>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
