export type BlogBlock =
    | { type: "paragraph"; text: string }
    | { type: "image"; src: string; alt?: string; caption?: string };

export type BlogPost = {
    id: string;
    slug: string;
    title: string;
    excerpt: string;
    date: string;

    // ✅ images
    coverImage?: string; // base64 or url
    blocks: BlogBlock[]; // content as rich blocks

    // optional “pro” fields
    tags?: string[];
};

const STORAGE_KEY = "superfood_blog_posts_v2";

export function loadPosts(): BlogPost[] {
    if (typeof window === "undefined") return [];
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
}

export function savePosts(posts: BlogPost[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
}

export function getPostBySlug(slug: string): BlogPost | undefined {
    return loadPosts().find((p) => p.slug === slug);
}
