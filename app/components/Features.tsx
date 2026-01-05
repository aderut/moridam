const features = [
    {
        title: "Easy To Order",
        text:
            "Easily order food by selecting a platform, choosing a restaurant, and confirming your order.",
    },
    {
        title: "Fast Delivery",
        text:
            "Get your food delivered quickly with optimized delivery options.",
    },
    {
        title: "Best Quality",
        text:
            "Enjoy top-quality meals prepared with fresh ingredients.",
    },
];

export default function Features() {
    return (
        <section className="bg-primary py-6 mt-6">
            <div className="max-w-[1120px] mx-auto px-5 grid md:grid-cols-3 gap-4">
                {features.map((f) => (
                    <div
                        key={f.title}
                        className="bg-white rounded-xl p-4 grid grid-cols-[52px_1fr] gap-3"
                    >
                        <div className="w-12 h-12 rounded-full border-4 border-primary grid place-items-center">
                            <span className="w-2 h-2 rounded-full bg-primary" />
                        </div>

                        <div>
                            <h4 className="text-sm font-extrabold">{f.title}</h4>
                            <p className="mt-1 text-[11px] text-muted leading-relaxed">
                                {f.text}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
