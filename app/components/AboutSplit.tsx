import Image from "next/image";
import Link from "next/link";
import { MapPin, Mail, Phone } from "lucide-react";

const BEIGE = "#FBF5E6";

export default function AboutSplit() {
    return (
        <section className="py-14">
            <div className="max-w-[1120px] mx-auto px-5">
                <div className="grid md:grid-cols-2 gap-10 items-center">
                    <div className="relative">
                        <div className="relative h-[360px] rounded-2xl overflow-hidden border border-[var(--line)]">
                            <Image
                                src="/images/Meatpie.png" // you will replace
                                alt="About"
                                fill
                                className="object-cover"
                            />
                        </div>

                        {/* ✅ Beige info box */}
                        <div
                            className="absolute -bottom-6 left-6 rounded-2xl p-5 w-[280px] shadow-xl"
                            style={{ backgroundColor: BEIGE, color: "#000" }}
                        >
                            <div className="font-bold">Come and visit us</div>
                            <div className="mt-3 text-sm space-y-2 text-black/80">
                                <div className="flex items-center gap-2">
                                    <Phone className="w-4 h-4" /> +234 816 163 7306
                                </div>
                                <div className="flex items-center gap-2">
                                    <Mail className="w-4 h-4" /> moridamcatering@gmail.com
                                </div>
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4" /> PortHarcourt, Nigeria
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="md:pl-6">
                        <h3 className="text-3xl font-extrabold text-[var(--ink)]">
                            We sell tasty meals and also delivers to your door step.
                        </h3>

                        <p className="mt-4 text-[var(--color-muted)] leading-7">
                            Our story began with a vision to deliver tasty meals to you at your comfort,
                            bringing exceptional service and a vibrant ambiance to the table.
                        </p>

                        <p className="mt-3 text-[var(--color-muted)] leading-7">
                            We’re rooted in fresh ingredients and simple recipes that taste amazing.
                        </p>

                        {/* ✅ Beige button */}
                        <Link
                            href="/about"
                            className="mt-6 inline-flex h-11 px-6 rounded-full font-semibold text-sm items-center justify-center transition"
                            style={{
                                backgroundColor: BEIGE,
                                color: "#000",
                                border: "1px solid rgba(0,0,0,0.1)",
                            }}
                        >
                            More About Us
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
