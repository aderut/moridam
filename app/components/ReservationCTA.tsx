import Link from "next/link";

export default function ReservationCTA() {
    return (
        <section className="py-14 bg-[var(--color-primary)]">
            <div className="max-w-[1120px] mx-auto px-5 text-center text-white">
                <h2 className="text-3xl font-extrabold">
                    Ready to Dine With Us?
                </h2>

                <p className="mt-3 text-white/90 max-w-xl mx-auto">
                    Reserve a table in seconds or order your favorite meal online.
                </p>

                <div className="mt-6 flex justify-center gap-3">
                    <Link
                        href="/reservation"
                        className="px-6 h-11 rounded-full bg-white text-[var(--color-primary)] font-semibold inline-flex items-center justify-center"
                    >
                        Book a Table
                    </Link>

                    <Link
                        href="/menu"
                        className="px-6 h-11 rounded-full border border-white text-white font-semibold inline-flex items-center justify-center"
                    >
                        Order Online
                    </Link>
                </div>
            </div>
        </section>
    );
}
