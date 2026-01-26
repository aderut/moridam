import Link from "next/link";
import Image from "next/image";

const cards = [
    {
        title: "Food",
        desc: "Start your day with fresh meals.",
        image: "/images/jollof.png",
        href: "/menu?category=food",
    },
    {
        title: "Pastries",
        desc: " baked treats made with love.",
        image: "/images/MeatPie.png",
        href: "/menu?category=pastries",
    },
    {
        title: "Drinks",
        desc: "Refreshing beverages",
        image: "/images/Yorgurt.png",
        href: "/menu?category=drinks",
    },
    {
        title: "Cakes",
        desc: "Sweet treats to finish strong.",
        image: "/images/cake.jpg",
        href: "/menu?category=cakes",
    },
];

export default function BrowseMenuCards() {
    return (
        <section className="py-14">
            <div className="max-w-[1120px] mx-auto px-5">
                {/* Title */}
                <h2 className="text-3xl font-extrabold text-center text-[var(--ink)]">
                    Browse Our Menu
                </h2>

                {/* Cards */}
                <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {cards.map((c) => (
                        <Link
                            key={c.title}
                            href={c.href}
                            className="group block"
                        >
                            <div
                                className="
                  bg-white
                  border border-[var(--line)]
                  rounded-2xl
                  overflow-hidden
                  transition
                  hover:shadow-md
                  hover:-translate-y-1
                "
                            >
                                {/* Image */}
                                <div className="relative h-44 w-full">
                                    <Image
                                        src={c.image}
                                        alt={c.title}
                                        fill
                                        className="object-cover"
                                    />
                                </div>

                                {/* Text */}
                                <div className="p-5 text-center">
                                    <div className="font-extrabold text-[var(--ink)]">
                                        {c.title}
                                    </div>

                                    <p className="mt-2 text-sm text-[var(--color-muted)] leading-6">
                                        {c.desc}
                                    </p>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* View All (text only) */}
                <div className="mt-10 text-center">
                    <Link
                        href="/menu"
                        className="
              inline-flex items-center gap-2
              font-semibold
              text-black
              underline
              underline-offset-4
              hover:opacity-80
            "
                    >
                        View All →
                    </Link>
                </div>
            </div>
        </section>
    );
}
