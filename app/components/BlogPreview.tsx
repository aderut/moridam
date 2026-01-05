"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { BlogPost } from "@/app/components/blog/blogStore";
import { loadPosts } from "@/app/components/blog/blogStore";

const BEIGE = "#FBF5E6";

export default function BlogPreview() {
    const [posts, setPosts] = useState<BlogPost[]>([]);

    useEffect(() => {
        setPosts(loadPosts());
    }, []);

    // hide section completely if no blogs
    if (posts.length === 0) return null;

    const featured = posts[0];
    const others = posts.slice(1, 5);

    return (
        <section className="py-14">
            <div className="max-w-[1120px] mx-auto px-5">
                <div className="flex items-center justify-between">
                    <h3 className="text-3xl font-extrabold text-[var(--ink)]">
                        Our Blog & Articles
                    </h3>

                    {/* ✅ Beige button */}
                    <Link
                        href="/blog"
                        className="h-10 px-4 rounded-full font-semibold text-sm inline-flex items-center justify-center"
                        style={{ backgroundColor: BEIGE, color: "#000" }}
                    >
                        Read All Articles
                    </Link>
                </div>

                <div className="mt-10 grid lg:grid-cols-[1.1fr_0.9fr] gap-6">
                    {/* Featured post */}
                    <Link
                        href={`/blog/${featured.slug}`}
                        className="bg-white border border-[var(--line)] rounded-2xl overflow-hidden block hover:shadow-sm transition"
                    >
                        <div className="relative h-72 bg-slate-100">
                            {featured.coverImage && (
                                <Image
                                    src={featured.coverImage}
                                    alt={featured.title}
                                    fill
                                    className="object-cover"
                                />
                            )}
                        </div>

                        <div className="p-6">
                            <div className="text-xs text-slate-500">{featured.date}</div>

                            <div className="mt-2 font-extrabold text-[var(--ink)]">
                                {featured.title}
                            </div>

                            <p className="mt-2 text-sm text-[var(--color-muted)] leading-7">
                                {featured.excerpt}
                            </p>

                            {/* ✅ Beige link */}
                            <span
                                className="mt-4 inline-block text-sm font-semibold"
                                style={{ color: BEIGE }}
                            >
                Read more →
              </span>
                        </div>
                    </Link>

                    {/* Other posts */}
                    <div className="grid sm:grid-cols-2 gap-5">
                        {others.map((p) => (
                            <Link
                                key={p.id}
                                href={`/blog/${p.slug}`}
                                className="bg-white border border-[var(--line)] rounded-2xl overflow-hidden block hover:shadow-sm transition"
                            >
                                <div className="relative h-32 bg-slate-100">
                                    {p.coverImage && (
                                        <Image
                                            src={p.coverImage}
                                            alt={p.title}
                                            fill
                                            className="object-cover"
                                        />
                                    )}
                                </div>

                                <div className="p-4">
                                    <div className="text-xs text-slate-500">{p.date}</div>

                                    <div className="mt-1 text-sm font-bold text-[var(--ink)]">
                                        {p.title}
                                    </div>

                                    {/* ✅ Beige link */}
                                    <span
                                        className="mt-3 inline-block text-sm font-semibold"
                                        style={{ color: BEIGE }}
                                    >
                    Read more →
                  </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
