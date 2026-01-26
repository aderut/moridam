"use client";

import Link from "next/link";
import { Instagram, Facebook, Twitter, Youtube } from "lucide-react";

const BEIGE = "#FBF4DE";
const FOOTER_BG = "#2B2B2B";
const MUTED = "rgba(255,255,255,0.70)";
const LINE = "rgba(255,255,255,0.12)";

export default function Footer() {
    return (
        <footer style={{ backgroundColor: FOOTER_BG }}>
            <div className="max-w-[1120px] mx-auto px-5 py-12">

            {/* 3 COLUMNS */}
                <div className="grid gap-8 md:grid-cols-3">
                    {/* Brand */}
                    <div>
                        <div className="flex items-center gap-3">
                            <div
                                className="h-9 w-9 rounded-full grid place-items-center"
                                style={{ backgroundColor: BEIGE }}
                            >
                                <span className="text-black font-extrabold text-xs">MC</span>
                            </div>

                            <div className="text-white font-extrabold text-base">
                                Moridam Catering
                            </div>
                        </div>

                        <p className="mt-3 text-sm leading-6 max-w-[320px]" style={{ color: MUTED }}>
                            Bringing tasty meals, quality service, and beautiful presentation
                            to your events and doorstep.
                        </p>

                        {/* Social */}
                        <div className="mt-4 flex gap-2">
                            <SocialIcon href="#" label="Instagram" icon={<Instagram className="w-4 h-4" />} />
                            <SocialIcon href="#" label="Facebook" icon={<Facebook className="w-4 h-4" />} />
                            <SocialIcon href="#" label="Twitter" icon={<Twitter className="w-4 h-4" />} />
                            <SocialIcon href="#" label="YouTube" icon={<Youtube className="w-4 h-4" />} />
                        </div>
                    </div>

                    {/* Pages */}
                    <div>
                        <div className="text-white font-bold text-sm mb-3">Pages</div>
                        <ul className="space-y-2 text-sm">
                            <FooterLink href="/" label="Home" />
                            <FooterLink href="/about" label="About" />
                            <FooterLink href="/menu" label="Menu" />
                            <FooterLink href="/blog" label="Blog" />
                            <FooterLink href="/contact" label="Contact" />
                        </ul>
                    </div>

                    {/* Utility Pages */}
                    <div>
                        <div className="text-white font-bold text-sm mb-3">Utility Pages</div>
                        <ul className="space-y-2 text-sm">
                            <FooterLink href="/services" label="Services" />
                            <FooterLink href="/reservation" label="Reservation" />
                            <FooterLink href="/cart" label="Cart" />
                            <FooterLink href="/menu" label="Order Now" />
                            <FooterLink href="/contact" label="Support" />
                        </ul>
                    </div>
                </div>

                {/* Bottom line */}
                <div
                    className="mt-6 pt-4 text-center text-xs"
                    style={{ borderTop: `1px solid ${LINE}`, color: MUTED }}
                >
                    © {new Date().getFullYear()} Moridam Catering Services. All Rights Reserved.
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
                onMouseEnter={(e) => (e.currentTarget.style.color = BEIGE)}
                onMouseLeave={(e) =>
                    (e.currentTarget.style.color = "rgba(255,255,255,0.75)")
                }
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
            className="h-9 w-9 rounded-full grid place-items-center transition"
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
