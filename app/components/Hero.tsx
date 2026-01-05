import Link from "next/link";
import Image from "next/image";

export default function HeroBistro() {
    return (
        <section className="pt-4 sm:pt-6 md:pt-8">
            <div className="max-w-[1120px] mx-auto px-4 sm:px-5">
                <div className="relative overflow-hidden rounded-2xl bg-white border border-[var(--line)]">
                    {/* Background image */}
                    <div className="relative h-[360px] sm:h-[420px] md:h-[520px]">
                        <Image
                            src="/images/Rice.PNG"
                            alt="Hero"
                            fill
                            className="object-cover"
                            priority
                        />
                        <div className="absolute inset-0 bg-black/20" />
                    </div>

                    {/* Center content */}
                    <div className="absolute inset-0 flex items-center justify-center px-4 sm:px-6 text-center">
                        <div className="max-w-xl">
                            <h1 className="text-3xl sm:text-4xl md:text-6xl font-extrabold text-white drop-shadow leading-tight">
                                Best food for <br className="hidden sm:block" /> your taste
                            </h1>

                            <p className="mt-3 sm:mt-4 text-sm sm:text-base text-white/90 leading-6 sm:leading-7">
                                Discover delicious cuisine and unforgettable moments in our welcoming kitchen.
                            </p>

                            <div className="mt-5 sm:mt-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3">
                                {/* Primary button */}
                                <Link
                                    href="/menu"
                                    className="h-11 px-6 rounded-full bg-[#FBF4DE] text-black font-semibold inline-flex items-center justify-center hover:opacity-90 w-full sm:w-auto"
                                >
                                    Place an Order
                                </Link>

                                {/* Secondary button */}
                                <Link
                                    href="/menu"
                                    className="h-11 px-6 rounded-full bg-white/90 text-black font-semibold inline-flex items-center justify-center hover:bg-white w-full sm:w-auto"
                                >
                                    Explore Menu
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
