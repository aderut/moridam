

export default function AboutPage() {
    return (
        <>

            <main className="max-w-[1120px] mx-auto px-5 py-10">
                <h1 className="text-3xl font-extrabold">About</h1>
                <p className="mt-4 text-slate-600 leading-7 max-w-2xl">
                    We’re a modern kitchen focused on fresh ingredients, fast service,
                    and memorable meals. Built for breakfast lovers and healthy food fans.
                </p>

                <div className="mt-8 grid md:grid-cols-3 gap-4">
                    {[
                        { t: "Fresh Ingredients", d: "Daily-picked produce and quality proteins." },
                        { t: "Fast Delivery", d: "Quick prep and reliable delivery partners." },
                        { t: "Best Quality", d: "Consistent taste, clean kitchen standards." },
                    ].map((x) => (
                        <div key={x.t} className="bg-white shadow-sm rounded-xl p-5 border">
                            <div className="font-bold">{x.t}</div>
                            <div className="mt-2 text-sm text-slate-500">{x.d}</div>
                        </div>
                    ))}
                </div>
            </main>

        </>
    );
}
