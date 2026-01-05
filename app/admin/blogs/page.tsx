"use client";

import Image from "next/image";
import { notFound, useParams } from "next/navigation";
import { getPostBySlug } from "@/app/components/blog/blogStore";

export default function BlogDetailsPage() {
    const params = useParams<{ slug: string }>();
    const slug = params?.slug;

    if (!slug) return notFound();

    const post = getPostBySlug(slug);
    if (!post) return notFound();

    return (
        <div className="min-h-screen bg-[var(--bg)] py-12">
            <div className="max-w-[900px] mx-auto px-5">
                <div className="text-sm text-slate-500">{post.date}</div>

                <h1 className="mt-2 text-4xl font-extrabold text-[var(--ink)]">
                    {post.title}
                </h1>

                {post.coverImage ? (
                    <div className="mt-6 relative h-[360px] rounded-2xl overflow-hidden border border-[var(--line)] bg-white">
                        <Image
                            src={post.coverImage}
                            alt={post.title}
                            fill
                            className="object-cover"
                        />
                    </div>
                ) : null}

                <div className="mt-8 space-y-5">
                    {post.blocks?.map((b, idx) => {
                        if (b.type === "paragraph") {
                            return (
                                <p key={idx} className="text-[var(--ink)] leading-8">
                                    {b.text}
                                </p>
                            );
                        }

                        if (b.type === "image") {
                            return (
                                <figure key={idx} className="space-y-2">
                                    <div className="relative w-full h-[360px] rounded-2xl overflow-hidden border border-[var(--line)] bg-white">
                                        <Image
                                            src={b.src}
                                            alt={b.alt || post.title}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    {b.caption ? (
                                        <figcaption className="text-sm text-[var(--color-muted)]">
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
