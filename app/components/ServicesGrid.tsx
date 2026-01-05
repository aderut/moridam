import Image from "next/image";
import Link from "next/link";

const services = [
    { title: "Caterings", slug: "caterings", img: "/images/weddings.png" },
    { title: "Birthdays", slug: "birthdays", img: "/images/service2.jpg" },
    { title: "Weddings", slug: "weddings", img: "/images/weddings.png" },
    { title: "Events", slug: "events", img: "/images/service4.jpg" },
];

export default function ServicesGrid() {
    return (
        <section className="py-14">
            <div className="max-w-[1120px] mx-auto px-5">
                <h3 className="text-3xl font-extrabold text-[var(--ink)]">
                    We also offer unique services for your events
                </h3>

                <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {services.map((s) => (
                        <Link
                            key={s.slug}
                            href={`/services/${s.slug}`}
                            className="group block"
                        >
                            <div className="relative h-44 rounded-2xl overflow-hidden border border-[var(--line)] bg-white">
                                <Image
                                    src={s.img}
                                    alt={s.title}
                                    fill
                                    className="object-cover"
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition" />
                            </div>

                            {/* ✅ Hover → beige */}
                            <div
                                className="mt-3 font-bold transition-colors"
                                style={{ color: "var(--ink)" }}
                            >
                <span className="group-hover:text-[#FBF5E6]">
                  {s.title}
                </span>
                            </div>

                            <p className="mt-1 text-sm text-[var(--color-muted)]">
                                Tap to request a booking and tell us your guest count.
                            </p>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
