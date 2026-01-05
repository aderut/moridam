"use client";

import Link from "next/link";
import Image from "next/image";
import { Instagram, Facebook, Twitter, Youtube } from "lucide-react";

// Brand colors (from your logo vibe)
const BEIGE = "#FBF4DE";
const FOOTER_BG = "#2B2B2B"; // dark gray like Figma
const MUTED = "rgba(255,255,255,0.70)";
const LINE = "rgba(255,255,255,0.12)";

export default function Footer() {
    return (
        <footer style={{ backgroundColor: FOOTER_BG }}>
            <div className="max-w-[1120px] mx-auto px-5 py-14">
                <div className="grid gap-10 md:grid-cols-[1.2fr_0.9fr_0.9fr_1.2fr]">
                    {/* Brand */}
                    <div>
                        <div className="flex items-center gap-3">
                            {/* ✅ Replace with your logo path if you want */}
                            <div
                                className="h-10 w-10 rounded-full grid place-items-center"
                                style={{ backgroundColor: BEIGE }}
                            >
                                <span className="text-black font-extrabold text-sm">MC</span>
                            </div>

                            <div className="text-white font-extrabold text-lg">
                                Moridam Catering
                            </div>
                        </div>

                        <p className="mt-4 text-sm leading-7" style={{ color: MUTED }}>
                            Bringing tasty meals, quality service, and beautiful presentation
                            to your events and doorstep.
                        </p>

                        {/* Social */}
                        <div className="mt-5 flex items-center gap-3">
                            <SocialIcon href="#" label="Instagram" icon={<Instagram className="w-4 h-4" />} />
                            <SocialIcon href="#" label="Facebook" icon={<Facebook className="w-4 h-4" />} />
                            <SocialIcon href="#" label="Twitter" icon={<Twitter className="w-4 h-4" />} />
                            <SocialIcon href="#" label="YouTube" icon={<Youtube className="w-4 h-4" />} />
                        </div>
                    </div>

                    {/* Pages */}
                    <div>
                        <div className="text-white font-bold text-sm">Pages</div>
                        <ul className="mt-4 space-y-3 text-sm">
                            <FooterLink href="/" label="Home" />
                            <FooterLink href="/about" label="About" />
                            <FooterLink href="/menu" label="Menu" />
                            <FooterLink href="/blog" label="Blog" />
                            <FooterLink href="/contact" label="Contact" />
                        </ul>
                    </div>

                    {/* Utility Pages */}
                    <div>
                        <div className="text-white font-bold text-sm">Utility Pages</div>
                        <ul className="mt-4 space-y-3 text-sm">
                            <FooterLink href="/services" label="Services" />
                            <FooterLink href="/reservation" label="Reservation" />
                            <FooterLink href="/cart" label="Cart" />
                            <FooterLink href="/menu" label="Order Now" />
                            <FooterLink href="/contact" label="Support" />
                        </ul>
                    </div>

                    {/* Instagram Grid */}
                    <div>
                        <div className="text-white font-bold text-sm">
                            Follow Us On Instagram
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-3">
                            <InstaTile src="/images/insta1.jpg" />
                            <InstaTile src="/images/insta2.jpg" />
                            <InstaTile src="/images/insta3.jpg" />
                            <InstaTile src="/images/insta4.jpg" />
                        </div>

                        <div className="mt-4">
                            <Link
                                href="#"
                                className="inline-flex h-10 px-5 rounded-full text-sm font-semibold items-center justify-center transition"
                                style={{ backgroundColor: BEIGE, color: "#000" }}
                            >
                                View More
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Bottom line */}
                <div
                    className="mt-12 pt-6 text-center text-xs"
                    style={{ borderTop: `1px solid ${LINE}`, color: MUTED }}
                >
                    Copyright © {new Date().getFullYear()} Moridam Catering Services. All
                    Rights Reserved.
                </div>
            </div>
        </footer>
    );
}

/* ---------- helpers ---------- */

function FooterLink({ href, label }: { href: string; label: string }) {
    return (
        <li>
            <Link
                href={href}
                className="transition"
                style={{ color: "rgba(255,255,255,0.75)" }}
                onMouseEnter={(e) => ((e.currentTarget.style.color = "#FBF4DE"))}
                onMouseLeave={(e) => ((e.currentTarget.style.color = "rgba(255,255,255,0.75)"))}
            >
                {label}
            </Link>
        </li>
    );
}

function SocialIcon({
                        href,
                        label,
                        icon,
                    }: {
    href: string;
    label: string;
    icon: React.ReactNode;
}) {
    return (
        <Link
            href={href}
            aria-label={label}
            className="h-10 w-10 rounded-full grid place-items-center transition"
            style={{ backgroundColor: "rgba(255,255,255,0.10)", color: "#fff" }}
            onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = BEIGE;
                e.currentTarget.style.color = "#000";
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.10)";
                e.currentTarget.style.color = "#fff";
            }}
        >
            {icon}
        </Link>
    );
}

function InstaTile({ src }: { src: string }) {
    return (
        <div className="relative aspect-square overflow-hidden rounded-xl">
            <Image
                src={src}
                alt="Instagram"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, 180px"
            />
            <div
                className="absolute inset-0 opacity-0 hover:opacity-100 transition"
                style={{ backgroundColor: "rgba(251,244,222,0.12)" }}
            />
        </div>
    );
}
