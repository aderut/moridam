import Image from "next/image";

export default function Promo() {
    return (
        <section className="py-4">
            <div className="max-w-[1120px] mx-auto px-5">
                <div className="w-[420px] h-[110px] bg-accent rounded-xl grid grid-cols-[1fr_140px] overflow-hidden shadow-lg">

                    <div className="p-5 text-white font-extrabold text-sm leading-tight">
                        Savor the Savings <br />
                        on Your Favorite <br />
                        Dishes!
                    </div>

                    <div className="relative flex items-center justify-center">
                        <div className="absolute left-4 bottom-3 text-xl font-black text-white">
                            15%
                        </div>

                        <div className="w-20 h-20 bg-white rounded-full overflow-hidden">
                            <Image
                                src="/images/hero-food.png"
                                alt="Promo"
                                width={80}
                                height={80}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
