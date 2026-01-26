import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";

export default async function MenuItemPage({
                                               params,
                                           }: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    const { data: item } = await supabaseAdmin
        .from("menu_items")
        .select("*")
        .eq("id", id)
        .single();

    if (!item) return notFound();

    return (
        <div className="bg-[var(--bg)] min-h-screen pt-24 pb-12">
            <div className="max-w-[1120px] mx-auto px-5">
                <Link href="/menu" className="inline-flex items-center gap-2 text-sm font-semibold hover:opacity-80">
                    ← Back
                </Link>

                <div className="mt-6 grid lg:grid-cols-2 gap-8">
                    {/* Image */}
                    <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden border border-[var(--line)] bg-white">
                        {item.image ? (
                            <Image src={item.image} alt={item.title} fill className="object-cover" />
                        ) : (
                            <div className="absolute inset-0 grid place-items-center text-slate-400 text-sm">
                                No image
                            </div>
                        )}
                    </div>

                    {/* Details */}
                    <div>
                        <h1 className="text-3xl md:text-4xl font-extrabold text-[var(--ink)]">
                            {item.title}
                        </h1>

                        <div className="mt-2 text-sm text-[var(--color-muted)] capitalize">
                            {item.category}
                        </div>

                        <div className="mt-5 inline-flex items-center rounded-full px-4 py-2 font-extrabold"
                             style={{ backgroundColor: "#FBF4DE", color: "#000" }}
                        >
                            ₦{Number(item.price ?? 0).toLocaleString()}
                        </div>

                        <p className="mt-6 text-[var(--color-muted)] leading-7">
                            {item.description || "No description yet."}
                        </p>

                        {/* You can add extras/options later like Plato */}
                    </div>
                </div>
            </div>
        </div>
    );
}
