"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { loadPosts } from "@/app/components/blog/blogStore";
import type { BlogPost } from "@/app/components/blog/blogStore";

export default function BlogDetailsPage() {
    const params = useParams<{ slug: string }>();
    const slug = params?.slug;

    const [posts, setPosts] = useState<BlogPost[]>([]);

    useEffect(() => {
        setPosts(loadPosts()); // ✅ reads localStorage on the client
    }, []);

    const post = useMemo(() => {
        if (!slug) return undefined;
        return posts.find((p) => p.slug === slug);
    }, [posts, slug]);

    if (!slug) {
        return (
            <div className="min-h-screen bg-[var(--bg)] grid place-items-center text-[var(--color-muted)]">
                Invalid blog link
            </div>
        );
    }

    // still loading localStorage
    if (posts.length === 0) {
        return (
            <div className="min-h-screen bg-[var(--bg)] py-12">
                <div className="max-w-[900px] mx-auto px-5 text-[var(--color-muted)]">
                    Loading article...
                </div>
            </div>
        );
    }

    // not found
    if (!post) {
        return (
            <div className="min-h-screen bg-[var(--bg)] py-12">
                <div className="max-w-[900px] mx-auto px-5">
                    <div className="text-[var(--color-muted)]">Article not found.</div>
                    <Link
                        href="/blog"
                        className="mt-4 inline-flex text-sm font-semibold text-[var(--color-accent)] hover:underline"
                    >
                        ← Back to Blog
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[var(--bg)] py-12">
            <div className="max-w-[900px] mx-auto px-5">
                <Link
                    href="/blog"
                    className="text-sm font-semibold text-[var(--color-accent)] hover:underline"
                >
                    ← Back to Blog
                </Link>

                <div className="mt-6 text-sm text-slate-500">{post.date}</div>

                <h1 className="mt-2 text-4xl md:text-5xl font-extrabold text-[var(--ink)]">
                    {post.title}
                </h1>

                {post.coverImage ? (
                    <div className="mt-8 relative h-[360px] rounded-2xl overflow-hidden border border-[var(--line)] bg-slate-100">
                        <Image
                            src={post.coverImage}
                            alt={post.title}
                            fill
                            className="object-cover"
                        />
                    </div>
                ) : null}

                <div className="mt-10 bg-white border border-[var(--line)] rounded-2xl p-6 md:p-8 space-y-6">
                    {post.blocks?.map((b, idx) => {
                        if (b.type === "paragraph") {
                            return (
                                <p
                                    key={idx}
                                    className="text-[var(--color-muted)] leading-8 whitespace-pre-wrap"
                                >
                                    {b.text}
                                </p>
                            );
                        }

                        if (b.type === "image") {
                            return (
                                <figure key={idx} className="space-y-3">
                                    <div className="relative w-full h-[320px] rounded-2xl overflow-hidden border border-[var(--line)] bg-slate-100">
                                        <Image
                                            src={b.src}
                                            alt={b.alt || post.title}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    {b.caption ? (
                                        <figcaption className="text-sm text-slate-500">
                                            {b.caption}
                                        </figcaption>
                                    ) : null}
                                </figure>
                            );
                        }

                        return null;
                    })}
                </div>
            </div>
        </div>
    );
}
