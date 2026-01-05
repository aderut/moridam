import Image from "next/image";

const images = [
    "/images/ai/avocado-toast.png",
    "/images/ai/chicken-salad.png",
    "/images/ai/steak-veg.png",
    "/images/ai/chicken-pie.png",
    "/images/ai/meat-pie.png",
    "/images/ai/chin-chin.png",
];

export default function Gallery() {
    return (
        <section className="py-12 bg-slate-50">
            <div className="max-w-[1120px] mx-auto px-5">
                <h2 className="text-2xl font-extrabold mb-6">
                    Our Dishes
                </h2>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                    {images.map((src) => (
                        <div
                            key={src}
                            className="relative aspect-square rounded-xl overflow-hidden bg-slate-100"
                        >
                            <Image
                                src={src}
                                alt="Food"
                                fill
                                className="object-cover"
                            />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
