import Image from "next/image";
import Link from "next/link";

const services = [
    { title: "Caterings", slug: "caterings", img: "/images/catering.JPG" },
    { title: "Birthdays", slug: "birthdays", img: "/images/Birthday.JPG" },
    { title: "Weddings", slug: "weddings", img: "/images/wedding.jpg" },
    { title: "Events", slug: "events", img: "/images/Events.JPG" },
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
                            href={`/services/book?service=${s.slug}`} // ✅ FIXED
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

                            {/* Title */}
                            <div className="mt-3 font-bold transition-colors text-[var(--ink)] group-hover:text-[#FBF4DE]">
                                {s.title}
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
