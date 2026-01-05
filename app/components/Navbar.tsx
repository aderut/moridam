"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Menu, X, ShoppingCart } from "lucide-react";
import { useCart } from "@/app/components/cart/CartProvider";

const BEIGE = "#FBF5E6";

const links = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: "/menu", label: "Menu" },
    { href: "/contact", label: "Contact" },
];

export default function Navbar() {
    const { count } = useCart();
    const [open, setOpen] = useState(false);

    return (
        <header className="sticky top-0 z-50 border-b border-black/10" style={{ backgroundColor: BEIGE }}>
            <div className="max-w-[1120px] mx-auto px-5 py-4 flex items-center justify-between">
                {/* Logo + Brand */}
                <Link href="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
                    <Image src="/moridam.png" alt="Moridam Catering" width={38} height={38} priority />
                    <span className="font-extrabold text-black tracking-wide">
            Moridam Catering
          </span>
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-black/70">
                    {links.map((l) => (
                        <Link key={l.href} href={l.href} className="hover:text-black">
                            {l.label}
                        </Link>
                    ))}
                </nav>

                {/* Right actions */}
                <div className="flex items-center gap-3">
                    {/* Cart */}
                    <Link
                        href="/cart"
                        className="relative h-10 w-10 rounded-full border border-black/20 grid place-items-center hover:bg-black/5"
                        aria-label="Cart"
                        onClick={() => setOpen(false)}
                    >
                        <ShoppingCart size={18} className="text-black" />
                        {count > 0 && (
                            <span className="absolute -top-1 -right-1 h-5 min-w-5 px-1 rounded-full bg-black text-white text-[11px] font-bold grid place-items-center">
                {count}
              </span>
                        )}
                    </Link>

                    {/* Desktop button */}
                    <Link
                        href="/menu"
                        className="hidden md:flex h-10 px-6 rounded-full bg-black text-white font-semibold items-center justify-center hover:opacity-90"
                    >
                        Place an Order
                    </Link>

                    {/* Mobile menu button */}
                    <button
                        type="button"
                        className="md:hidden h-10 w-10 rounded-full border border-black/20 grid place-items-center hover:bg-black/5"
                        aria-label="Open menu"
                        onClick={() => setOpen((v) => !v)}
                    >
                        {open ? <X size={20} className="text-black" /> : <Menu size={20} className="text-black" />}
                    </button>
                </div>
            </div>

            {/* Mobile dropdown */}
            {open && (
                <div className="md:hidden border-t border-black/10" style={{ backgroundColor: BEIGE }}>
                    <div className="max-w-[1120px] mx-auto px-5 py-4 flex flex-col gap-3">
                        {links.map((l) => (
                            <Link
                                key={l.href}
                                href={l.href}
                                className="py-2 font-semibold text-black/80 hover:text-black"
                                onClick={() => setOpen(false)}
                            >
                                {l.label}
                            </Link>
                        ))}

                        <Link
                            href="/menu"
                            className="mt-2 h-11 rounded-full bg-black text-white font-semibold flex items-center justify-center hover:opacity-90"
                            onClick={() => setOpen(false)}
                        >
                            Place an Order
                        </Link>
                    </div>
                </div>
            )}
        </header>
    );
}
