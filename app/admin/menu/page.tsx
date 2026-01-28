"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { MenuItem } from "@/app/components/menu/menuStore";

const categories = [
    { label: "Food", value: "food" },
    { label: "Pastries", value: "pastries" },
    { label: "Drinks", value: "drinks" },
    { label: "Cakes", value: "cakes" },
] as const;

type CategoryValue = (typeof categories)[number]["value"];

export type OptionGroup = {
    name: string; // e.g. "Flavor"
    type: "single" | "multi"; // single = radio, multi = checkbox
    required?: boolean;
    choices: string[]; // e.g. ["Vanilla","Chocolate"]
};

type DbMenuItem = {
    id: string;
    title: string;
    description: string | null;
    price: number;
    category: string;
    image: string | null;
    options?: OptionGroup[] | null;
    created_at?: string;
};

function toMenuItem(d: DbMenuItem): (MenuItem & { options?: OptionGroup[] | null }) {
    return {
        id: String(d.id),
        title: String(d.title),
        description: d.description ?? "",
        price: Number(d.price ?? 0),
        category: d.category as any,
        image: d.image ?? undefined,
        options: Array.isArray(d.options) ? d.options : null,
    };
}

async function safeJson(res: Response) {
    const text = await res.text();
    if (!text) return null;
    try {
        return JSON.parse(text);
    } catch {
        return { error: text };
    }
}

function badId(id: unknown) {
    const s = String(id ?? "");
    return !s || s === "undefined" || s === "null";
}

function normalizeChoices(input: string) {
    return input
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean);
}

export default function AdminMenuPage() {
    const router = useRouter();

    const [items, setItems] = useState<(MenuItem & { options?: OptionGroup[] | null })[]>([]);
    const [editingId, setEditingId] = useState<string | null>(null);

    // Form fields
    const [title, setTitle] = useState("");
    const [desc, setDesc] = useState("");
    const [price, setPrice] = useState<number>(0);
    const [category, setCategory] = useState<CategoryValue>("food");
    const [image, setImage] = useState("");

    // ✅ Options for this item
    const [options, setOptions] = useState<OptionGroup[]>([]);

    // ✅ Option builder inputs
    const [optName, setOptName] = useState("");
    const [optType, setOptType] = useState<"single" | "multi">("single");
    const [optRequired, setOptRequired] = useState(false);
    const [optChoices, setOptChoices] = useState("");

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const editing = useMemo(
        () => items.find((i) => i.id === editingId) ?? null,
        [items, editingId]
    );

    async function refresh() {
        setLoading(true);
        setError(null);

        try {
            const res = await fetch("/api/menu", { cache: "no-store" });
            const data = await safeJson(res);

            if (!res.ok) {
                if (res.status === 401) router.replace("/admin/login");
                throw new Error((data as any)?.error || "Failed to load menu");
            }

            const list = Array.isArray(data) ? (data as DbMenuItem[]) : [];
            setItems(list.map(toMenuItem));
        } catch (e: any) {
            setError(e?.message || "Failed to load menu");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        refresh();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    function resetForm() {
        setEditingId(null);
        setTitle("");
        setDesc("");
        setPrice(0);
        setCategory("food");
        setImage("");

        setOptions([]);
        setOptName("");
        setOptType("single");
        setOptRequired(false);
        setOptChoices("");
    }

    function startEdit(i: MenuItem & { options?: OptionGroup[] | null }) {
        setEditingId(i.id);
        setTitle(i.title);
        setDesc(i.description);
        setPrice(i.price);
        setCategory(i.category as CategoryValue);
        setImage(i.image ?? "");

        setOptions(Array.isArray(i.options) ? i.options : []);
        setOptName("");
        setOptType("single");
        setOptRequired(false);
        setOptChoices("");
    }

    function addOptionGroup() {
        setError(null);

        const name = optName.trim();
        const choices = normalizeChoices(optChoices);

        if (!name) {
            setError("Option group name is required (e.g. Flavor).");
            return;
        }
        if (choices.length < 2) {
            setError("Please add at least 2 choices (comma separated).");
            return;
        }

        // prevent duplicates by name (case-insensitive)
        if (options.some((g) => g.name.toLowerCase() === name.toLowerCase())) {
            setError("That option group already exists for this item.");
            return;
        }

        const group: OptionGroup = {
            name,
            type: optType,
            required: optRequired || undefined,
            choices,
        };

        setOptions((prev) => [...prev, group]);

        // reset builder
        setOptName("");
        setOptType("single");
        setOptRequired(false);
        setOptChoices("");
    }

    function removeOptionGroup(name: string) {
        setOptions((prev) => prev.filter((g) => g.name !== name));
    }

    async function save() {
        setError(null);

        if (!title.trim() || !desc.trim()) {
            setError("Title and description are required.");
            return;
        }

        const safePrice = Number(price);
        if (!Number.isFinite(safePrice) || safePrice < 0) {
            setError("Price must be a valid number.");
            return;
        }

        if (editingId && badId(editingId)) {
            setError("Invalid item id. Refresh and try again.");
            return;
        }

        const payload = {
            title: title.trim(),
            description: desc.trim(),
            price: safePrice,
            category,
            image: image.trim() ? image.trim() : null,
            options: options.length > 0 ? options : null, // ✅ jsonb
        };

        setSaving(true);

        try {
            const res = await fetch(editingId ? `/api/menu/${editingId}` : "/api/menu", {
                method: editingId ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await safeJson(res);

            if (!res.ok) {
                if (res.status === 401) router.replace("/admin/login");
                throw new Error(
                    (data as any)?.error ||
                    (editingId ? "Failed to update item" : "Failed to create item")
                );
            }

            await refresh();
            resetForm();
        } catch (e: any) {
            setError(e?.message || "Save failed");
        } finally {
            setSaving(false);
        }
    }

    async function removeItem(id: string) {
        setError(null);

        if (badId(id)) {
            setError("This item has no valid id. Refresh and try again.");
            return;
        }

        setSaving(true);
        try {
            const res = await fetch(`/api/menu/${id}`, { method: "DELETE" });
            const data = await safeJson(res);

            if (!res.ok) {
                if (res.status === 401) router.replace("/admin/login");
                throw new Error((data as any)?.error || "Failed to delete item");
            }

            await refresh();
            if (editingId === id) resetForm();
        } catch (e: any) {
            setError(e?.message || "Delete failed");
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="bg-[var(--bg)] min-h-screen py-10">
            <div className="max-w-[1120px] mx-auto px-5">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                    <h1 className="text-3xl font-extrabold text-[var(--ink)]">Admin Menu</h1>

                    <div className="flex gap-2">
                        <button
                            onClick={refresh}
                            type="button"
                            className="h-10 px-4 rounded-full border border-[var(--line)] bg-white font-semibold hover:bg-slate-50"
                        >
                            {loading ? "Loading..." : "Refresh"}
                        </button>

                        <button
                            onClick={resetForm}
                            type="button"
                            className="h-10 px-4 rounded-full border border-[var(--line)] bg-white font-semibold hover:bg-slate-50"
                        >
                            New Item
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="mt-4 bg-white border border-red-200 rounded-xl p-4 text-sm text-red-600">
                        {error}
                    </div>
                )}

                <div className="mt-8 grid lg:grid-cols-[0.95fr_1.05fr] gap-6">
                    {/* LEFT: LIST */}
                    <div className="bg-white border border-[var(--line)] rounded-2xl p-5">
                        <div className="font-extrabold text-[var(--ink)]">Menu Items</div>

                        {items.length === 0 ? (
                            <div className="mt-4 text-sm text-[var(--color-muted)]">
                                {loading ? "Loading items..." : "No items yet."}
                            </div>
                        ) : (
                            <div className="mt-4 space-y-3">
                                {items.map((i) => (
                                    <div
                                        key={i.id}
                                        className={[
                                            "rounded-xl border p-4",
                                            editingId === i.id
                                                ? "border-[var(--color-accent)]"
                                                : "border-[var(--line)]",
                                        ].join(" ")}
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <div className="font-bold text-[var(--ink)]">{i.title}</div>
                                                <div className="mt-1 text-xs text-slate-500 uppercase">
                                                    {i.category} • ₦{i.price.toLocaleString()}
                                                </div>
                                            </div>

                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => startEdit(i)}
                                                    type="button"
                                                    className="h-9 px-3 rounded-full border border-[var(--line)] bg-white text-sm font-semibold hover:bg-slate-50"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => removeItem(i.id)}
                                                    disabled={saving}
                                                    type="button"
                                                    className="h-9 px-3 rounded-full bg-[var(--color-accent)] text-white text-sm font-semibold hover:opacity-95 disabled:opacity-60"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>

                                        <p className="mt-2 text-sm text-[var(--color-muted)]">{i.description}</p>

                                        {Array.isArray(i.options) && i.options.length > 0 && (
                                            <div className="mt-3 text-xs text-slate-600">
                                                <div className="font-semibold">Options:</div>
                                                <ul className="mt-1 list-disc pl-5 space-y-1">
                                                    {i.options.map((g) => (
                                                        <li key={g.name}>
                                                            <b>{g.name}</b> ({g.type}
                                                            {g.required ? ", required" : ""}) — {g.choices.join(", ")}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {i.image && (
                                            <div className="mt-2 text-xs text-slate-500">
                                                Image: <span className="font-semibold">{i.image}</span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* RIGHT: EDITOR */}
                    <div className="bg-white border border-[var(--line)] rounded-2xl p-5">
                        <div className="font-extrabold text-[var(--ink)]">
                            {editing ? "Edit Item" : "Create Item"}
                        </div>

                        <div className="mt-4 grid gap-4">
                            <Field label="Title">
                                <input
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full h-11 rounded-xl border border-[var(--line)] px-3 outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                                    placeholder="e.g. Puff Puff"
                                />
                            </Field>

                            <Field label="Description">
                                <input
                                    value={desc}
                                    onChange={(e) => setDesc(e.target.value)}
                                    className="w-full h-11 rounded-xl border border-[var(--line)] px-3 outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                                    placeholder="Short description..."
                                />
                            </Field>

                            <div className="grid sm:grid-cols-2 gap-4">
                                <Field label="Price (₦)">
                                    <input
                                        value={price}
                                        onChange={(e) => setPrice(Number(e.target.value))}
                                        type="number"
                                        min={0}
                                        className="w-full h-11 rounded-xl border border-[var(--line)] px-3 outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                                        placeholder="1500"
                                    />
                                </Field>

                                <Field label="Category">
                                    <select
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value as CategoryValue)}
                                        className="w-full h-11 rounded-xl border border-[var(--line)] px-3 outline-none focus:ring-2 focus:ring-[var(--color-accent)] bg-white"
                                    >
                                        {categories.map((c) => (
                                            <option key={c.value} value={c.value}>
                                                {c.label}
                                            </option>
                                        ))}
                                    </select>
                                </Field>
                            </div>

                            <Field label='Image path (optional) e.g. "/images/menu/puffpuff.jpg"'>
                                <input
                                    value={image}
                                    onChange={(e) => setImage(e.target.value)}
                                    className="w-full h-11 rounded-xl border border-[var(--line)] px-3 outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                                    placeholder="/images/menu/item.jpg"
                                />
                            </Field>

                            {/* ✅ OPTIONS UI */}
                            <div className="rounded-2xl border border-[var(--line)] p-4">
                                <div className="font-extrabold text-[var(--ink)]">Options</div>
                                <p className="mt-1 text-sm text-[var(--color-muted)]">
                                    Add option groups like Flavor, Spice Level, Size, Extras, etc.
                                </p>

                                <div className="mt-4 grid gap-3">
                                    <Field label="Option Group name (e.g. Flavor)">
                                        <input
                                            value={optName}
                                            onChange={(e) => setOptName(e.target.value)}
                                            className="w-full h-11 rounded-xl border border-[var(--line)] px-3 outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                                            placeholder="Flavor"
                                        />
                                    </Field>

                                    <div className="grid sm:grid-cols-2 gap-3">
                                        <Field label="Type (single or multi)">
                                            <select
                                                value={optType}
                                                onChange={(e) => setOptType(e.target.value as "single" | "multi")}
                                                className="w-full h-11 rounded-xl border border-[var(--line)] px-3 bg-white outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                                            >
                                                <option value="single">Single (radio)</option>
                                                <option value="multi">Multi (checkbox)</option>
                                            </select>
                                        </Field>

                                        <div className="flex items-end">
                                            <label className="flex items-center gap-2 text-sm font-semibold text-[var(--ink)]">
                                                <input
                                                    type="checkbox"
                                                    checked={optRequired}
                                                    onChange={(e) => setOptRequired(e.target.checked)}
                                                />
                                                Required
                                            </label>
                                        </div>
                                    </div>

                                    <Field label="Choices (comma separated)">
                                        <input
                                            value={optChoices}
                                            onChange={(e) => setOptChoices(e.target.value)}
                                            className="w-full h-11 rounded-xl border border-[var(--line)] px-3 outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                                            placeholder="Vanilla, Chocolate, Red Velvet"
                                        />
                                    </Field>

                                    <button
                                        type="button"
                                        onClick={addOptionGroup}
                                        className="h-11 px-6 rounded-full font-semibold bg-white border border-[var(--line)] hover:bg-slate-50"
                                    >
                                        Add Option Group
                                    </button>

                                    {options.length > 0 && (
                                        <div className="mt-2 space-y-2">
                                            {options.map((g) => (
                                                <div
                                                    key={g.name}
                                                    className="rounded-xl border border-[var(--line)] p-3 flex items-start justify-between gap-3"
                                                >
                                                    <div className="text-sm">
                                                        <div className="font-bold text-[var(--ink)]">
                                                            {g.name}{" "}
                                                            <span className="text-xs text-slate-500">
                                ({g.type}{g.required ? ", required" : ""})
                              </span>
                                                        </div>
                                                        <div className="mt-1 text-[var(--color-muted)]">
                                                            {g.choices.join(", ")}
                                                        </div>
                                                    </div>

                                                    <button
                                                        type="button"
                                                        onClick={() => removeOptionGroup(g.name)}
                                                        className="h-9 px-3 rounded-full border border-[var(--line)] text-sm font-semibold hover:bg-slate-50"
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-3 flex-wrap">
                                <button
                                    onClick={save}
                                    disabled={saving}
                                    type="button"
                                    className="h-11 px-6 rounded-full bg-[var(--color-accent)] text-white font-semibold hover:opacity-95 disabled:opacity-60"
                                >
                                    {saving ? "Saving..." : editing ? "Update Item" : "Add Item"}
                                </button>

                                <button
                                    onClick={resetForm}
                                    type="button"
                                    className="h-11 px-6 rounded-full border border-[var(--line)] bg-white font-semibold hover:bg-slate-50"
                                >
                                    Clear
                                </button>
                            </div>

                            <div className="text-xs text-slate-500">
                                Put your images in <b>public/images/menu</b> then use paths like{" "}
                                <b>/images/menu/pizza.jpg</b>.
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <label className="block">
            <div className="text-sm font-semibold text-[var(--ink)] mb-2">{label}</div>
            {children}
        </label>
    );
}
