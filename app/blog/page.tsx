"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { loadPosts } from "@/app/components/blog/blogStore";
import type { BlogPost } from "@/app/components/blog/blogStore";

export default function BlogPage() {
    const [posts, setPosts] = useState<BlogPost[]>([]);

    useEffect(() => {
        setPosts(loadPosts());
    }, []);

    if (posts.length === 0) {
        return (
            <div className="min-h-screen bg-[var(--bg)] py-12">
                <div className="max-w-[1120px] mx-auto px-5">
                    <h1 className="text-4xl font-extrabold text-[var(--ink)]">Blog</h1>
                    <p className="mt-2 text-[var(--color-muted)]">Our latest news & articles</p>

                    <div className="mt-12 text-center text-[var(--color-muted)]">
                        No blogs uploaded yet.
                    </div>
                </div>
            </div>
        );
    }

    const featured = posts[0];
    const rest = posts.slice(1);

    return (
        <div className="min-h-screen bg-[var(--bg)] py-12">
            <div className="max-w-[1120px] mx-auto px-5">
                <h1 className="text-4xl font-extrabold text-[var(--ink)]">Blog</h1>
                <p className="mt-2 text-[var(--color-muted)]">Our latest news & articles</p>

                {/* Featured */}
                <div className="mt-10">
                    <Link
                        href={`/blog/${featured.slug}`}
                        className="grid lg:grid-cols-[1.2fr_0.8fr] gap-6 bg-white border border-[var(--line)] rounded-2xl overflow-hidden hover:shadow-sm transition"
                    >
                        <div className="relative min-h-[260px] bg-slate-100">
                            {featured.coverImage ? (
                                <Image src={featured.coverImage} alt={featured.title} fill className="object-cover" />
                            ) : null}
                        </div>

                        <div className="p-6">
                            <div className="text-xs text-slate-500">
                                {new Date(featured.createdAt).toLocaleDateString()}
                            </div>
                            <h2 className="mt-2 text-2xl font-extrabold text-[var(--ink)]">
                                {featured.title}
                            </h2>
                            <p className="mt-3 text-[var(--color-muted)] leading-7">
                                {featured.excerpt}
                            </p>
                            <div className="mt-5 text-sm font-semibold text-[var(--color-accent)]">
                                Read more →
                            </div>
                        </div>
                    </Link>
                </div>

                {/* Grid */}
                <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {rest.map((p) => (
                        <Link
                            key={p.id}
                            href={`/blog/${p.slug}`}
                            className="bg-white border border-[var(--line)] rounded-2xl overflow-hidden hover:shadow-sm transition"
                        >
                            <div className="relative h-44 bg-slate-100">
                                {p.coverImage ? (
                                    <Image src={p.coverImage} alt={p.title} fill className="object-cover" />
                                ) : null}
                            </div>

                            <div className="p-5">
                                <div className="text-xs text-slate-500">
                                    {new Date(p.createdAt).toLocaleDateString()}
                                </div>
                                <div className="mt-2 font-extrabold text-[var(--ink)]">{p.title}</div>
                                <p className="mt-2 text-sm text-[var(--color-muted)] leading-7 line-clamp-3">
                                    {p.excerpt}
                                </p>
                                <div className="mt-4 text-sm font-semibold text-[var(--color-accent)]">
                                    Read more →
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
