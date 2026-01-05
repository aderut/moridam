export type MenuCategory = "all" | "food" | "pastries" | "drinks" | "cakes";

export type MenuItem = {
    id: string;
    title: string;
    description: string;
    price: number;
    category: Exclude<MenuCategory, "all">;
    image?: string;
    created_at?: string;
};

async function safeJson<T>(res: Response): Promise<T> {
    const text = await res.text();
    if (!res.ok) throw new Error(text || `Request failed (${res.status})`);
    return (text ? JSON.parse(text) : ([] as unknown)) as T;
}

export async function loadMenu(): Promise<MenuItem[]> {
    const res = await fetch("/api/menu", { cache: "no-store" });
    return safeJson<MenuItem[]>(res);
}

export async function createMenuItem(input: Omit<MenuItem, "id">) {
    const res = await fetch("/api/menu", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
    });
    return safeJson<MenuItem>(res);
}

export async function updateMenuItem(id: string, patch: Partial<Omit<MenuItem, "id">>) {
    const res = await fetch(`/api/menu?id=${encodeURIComponent(id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
    });
    return safeJson<MenuItem>(res);
}

export async function deleteMenuItem(id: string) {
    const res = await fetch(`/api/menu?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
    });
    return safeJson<{ ok: true }>(res);
}
