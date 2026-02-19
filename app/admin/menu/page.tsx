"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabaseClient";

/** ================= TYPES ================= */
type MenuCategory = "food" | "pastries" | "drinks" | "cakes";

type OptionGroup = {
  name: string;
  type: "single" | "multi";
  required: boolean;
  choices: string[];
};

type DbMenuItem = {
  id: string;
  title: string;
  description: string | null;
  price: number;
  category: string;
  image: string | null;
  options: any | null; // jsonb
  created_at?: string;
};

type MenuItem = {
  id: string;
  title: string;
  description: string;
  price: number;
  category: MenuCategory;
  image?: string;
  options: OptionGroup[] | null;
};

const categories = [
  { label: "Food", value: "food" },
  { label: "Pastries", value: "pastries" },
  { label: "Drinks", value: "drinks" },
  { label: "Cakes", value: "cakes" },
] as const;

/** ================= OPTIONS HELPERS ================= */
function safeJsonParseOptions(raw: any): OptionGroup[] {
  if (!raw) return [];
  const asArray = Array.isArray(raw) ? raw : [raw];

  return asArray
    .map((g: any) => {
      const name = String(g?.name ?? "").trim();
      const type = g?.type === "multi" ? "multi" : "single";
      const required = Boolean(g?.required);

      let choices: string[] = [];
      if (Array.isArray(g?.choices)) {
        choices = g.choices.map((c: any) => String(c).trim()).filter(Boolean);
      } else if (typeof g?.choices === "string") {
        choices = g.choices
          .split(",")
          .map((s: string) => s.trim())
          .filter(Boolean);
      }

      if (!name || choices.length === 0) return null;
      return { name, type, required, choices } as OptionGroup;
    })
    .filter(Boolean) as OptionGroup[];
}

function toMenuItem(d: DbMenuItem): MenuItem {
  const cat = String(d.category || "food").toLowerCase() as MenuCategory;
  return {
    id: String(d.id),
    title: String(d.title),
    description: d.description ?? "",
    price: Number(d.price ?? 0),
    category: (categories.some((c) => c.value === cat) ? cat : "food") as MenuCategory,
    image: d.image ?? undefined,
    options: d.options ? safeJsonParseOptions(d.options) : null,
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

/** ================= SUPABASE STORAGE UPLOAD =================
 *  ✅ Bucket name: menu-images
 *  ✅ Path: menu/<random>.jpg
 *  ✅ Returns public URL saved into `image`
 */
async function uploadMenuImage(file: File) {
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const safeName = `${Date.now()}-${Math.random().toString(16).slice(2)}.${ext}`;
  const path = `menu/${safeName}`;

  const { data, error } = await supabase.storage
    .from("menu-images")
    .upload(path, file, { upsert: false });

  if (error) throw error;

  const { data: pub } = supabase.storage.from("menu-images").getPublicUrl(data.path);

  return pub.publicUrl;
}

/** ================= PAGE ================= */
export default function AdminMenuPage() {
  const router = useRouter();

  const [items, setItems] = useState<MenuItem[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [price, setPrice] = useState<number>(0);
  const [category, setCategory] = useState<MenuCategory>("food");
  const [image, setImage] = useState("");

  // ✅ NEW: upload state
  const [uploading, setUploading] = useState(false);

  // ✅ Options state
  const [options, setOptions] = useState<OptionGroup[]>([]);

  // Add-group UI state
  const [ogName, setOgName] = useState("");
  const [ogType, setOgType] = useState<"single" | "multi">("single");
  const [ogRequired, setOgRequired] = useState(false);
  const [ogChoicesText, setOgChoicesText] = useState("");

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const editing = useMemo(() => items.find((i) => i.id === editingId) ?? null, [items, editingId]);

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
  }, []);

  function resetForm() {
    setEditingId(null);
    setTitle("");
    setDesc("");
    setPrice(0);
    setCategory("food");
    setImage("");
    setOptions([]);

    setOgName("");
    setOgType("single");
    setOgRequired(false);
    setOgChoicesText("");
  }

  function startEdit(i: MenuItem) {
    setEditingId(i.id);
    setTitle(i.title);
    setDesc(i.description);
    setPrice(i.price);
    setCategory(i.category);
    setImage(i.image ?? "");
    setOptions(i.options ?? []);

    setOgName("");
    setOgType("single");
    setOgRequired(false);
    setOgChoicesText("");
  }

  function addOptionGroup() {
    const name = ogName.trim();
    const choices = ogChoicesText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    if (!name) {
      setError("Option Group name is required.");
      return;
    }
    if (choices.length === 0) {
      setError("Please enter at least one choice (comma separated).");
      return;
    }

    setError(null);
    setOptions((prev) => [...prev, { name, type: ogType, required: ogRequired, choices }]);

    setOgName("");
    setOgType("single");
    setOgRequired(false);
    setOgChoicesText("");
  }

  function removeGroup(idx: number) {
    setOptions((prev) => prev.filter((_, i) => i !== idx));
  }

  function updateGroup(idx: number, patch: Partial<OptionGroup>) {
    setOptions((prev) => prev.map((g, i) => (i === idx ? { ...g, ...patch } : g)));
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
      setError("Invalid item id. Refresh the page and try again.");
      return;
    }

    const cleanOptions = options
      .map((g) => ({
        name: String(g.name ?? "").trim(),
        type: g.type === "multi" ? "multi" : "single",
        required: Boolean(g.required),
        choices: Array.isArray(g.choices) ? g.choices.map((c) => String(c).trim()).filter(Boolean) : [],
      }))
      .filter((g) => g.name && g.choices.length > 0);

    const payload = {
      title: title.trim(),
      description: desc.trim(),
      price: safePrice,
      category,
      image: image.trim() ? image.trim() : null,
      options: cleanOptions.length ? cleanOptions : null,
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
        throw new Error((data as any)?.error || "Save failed");
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
              className="h-10 px-4 rounded-full border border-[var(--line)] bg-white font-semibold hover:bg-slate-50"
              type="button"
            >
              {loading ? "Loading..." : "Refresh"}
            </button>

            <button
              onClick={resetForm}
              className="h-10 px-4 rounded-full border border-[var(--line)] bg-white font-semibold hover:bg-slate-50"
              type="button"
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
          {/* Left list */}
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
                      editingId === i.id ? "border-[var(--color-accent)]" : "border-[var(--line)]",
                    ].join(" ")}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-bold text-[var(--ink)]">{i.title}</div>
                        <div className="mt-1 text-xs text-slate-500 uppercase">
                          {i.category} • ₦{i.price.toLocaleString()}
                        </div>
                        <div className="mt-1 text-xs text-slate-500">
                          Options: <b>{i.options?.length ?? 0}</b>
                        </div>
                      </div>

                      <div className="flex gap-2 flex-wrap justify-end">
                        <button
                          onClick={() => startEdit(i)}
                          className="h-9 px-3 rounded-full border border-[var(--line)] bg-white text-sm font-semibold hover:bg-slate-50"
                          type="button"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => router.push(`/admin/menu/${i.id}/options`)}
                          className="h-9 px-3 rounded-full border border-[var(--line)] bg-white text-sm font-semibold hover:bg-slate-50"
                          type="button"
                        >
                          Add-ons
                        </button>

                        <button
                          onClick={() => removeItem(i.id)}
                          disabled={saving}
                          className="h-9 px-3 rounded-full bg-[var(--color-accent)] text-white text-sm font-semibold hover:opacity-95 disabled:opacity-60"
                          type="button"
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    <p className="mt-2 text-sm text-[var(--color-muted)]">{i.description}</p>

                    {i.image && (
                      <div className="mt-2 flex items-center gap-3">
                        <img
                          src={i.image}
                          alt={i.title}
                          className="h-12 w-12 rounded-lg object-cover border border-[var(--line)]"
                        />
                        <div className="text-xs text-slate-500 break-all">
                          Image: <span className="font-semibold">{i.image}</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right form */}
          <div className="bg-white border border-[var(--line)] rounded-2xl p-5">
            <div className="font-extrabold text-[var(--ink)]">{editing ? "Edit Item" : "Create Item"}</div>

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
                    onChange={(e) => setCategory(e.target.value as MenuCategory)}
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

              {/* ✅ NEW: Image uploader + preview + URL */}
              <div className="rounded-2xl border border-[var(--line)] p-4">
                <div className="font-extrabold text-[var(--ink)]">Image (upload from gallery)</div>
                <div className="mt-1 text-sm text-[var(--color-muted)]">
                  Choose an image file and we’ll upload it to Supabase Storage and auto-fill the URL.
                </div>

                <div className="mt-3 flex flex-col gap-3">
                  <input
                    type="file"
                    accept="image/*"
                    disabled={uploading}
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;

                      try {
                        setError(null);
                        setUploading(true);
                        const url = await uploadMenuImage(file);
                        setImage(url);
                      } catch (err: any) {
                        setError(err?.message || "Upload failed");
                      } finally {
                        setUploading(false);
                        e.currentTarget.value = "";
                      }
                    }}
                  />

                  {uploading ? <div className="text-sm text-slate-500">Uploading…</div> : null}

                  {image ? (
                    <div className="flex items-center gap-3">
                      <img
                        src={image}
                        alt="Preview"
                        className="h-20 w-20 rounded-xl object-cover border border-[var(--line)]"
                      />
                      <div className="w-full">
                        <div className="text-xs text-slate-500 mb-1">Image URL</div>
                        <input
                          value={image}
                          onChange={(e) => setImage(e.target.value)}
                          className="w-full h-11 rounded-xl border border-[var(--line)] px-3 outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                          placeholder="https://..."
                        />
                        <button
                          type="button"
                          onClick={() => setImage("")}
                          className="mt-2 h-9 px-3 rounded-full border border-[var(--line)] bg-white text-sm font-semibold hover:bg-slate-50"
                        >
                          Remove image
                        </button>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>

              {/* ✅ OPTIONS BUILDER */}
              <div className="rounded-2xl border border-[var(--line)] p-4">
                <div className="font-extrabold text-[var(--ink)]">Options (checkbox / radio)</div>
                <div className="mt-1 text-sm text-[var(--color-muted)]">
                  Add option groups like Flavor, Spice level, Extras…
                </div>

                {options.length > 0 && (
                  <div className="mt-4 space-y-3">
                    {options.map((g, idx) => (
                      <div key={idx} className="rounded-xl border border-[var(--line)] p-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="font-bold text-[var(--ink)]">{g.name}</div>
                            <div className="text-xs text-slate-500 uppercase mt-1">
                              {g.type} • {g.required ? "required" : "optional"}
                            </div>
                            <div className="text-sm text-slate-700 mt-2 break-words">
                              Choices: <b>{g.choices.join(", ")}</b>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => removeGroup(idx)}
                            className="shrink-0 h-9 px-3 rounded-full border border-[var(--line)] bg-white text-sm font-semibold hover:bg-slate-50"
                          >
                            Remove
                          </button>
                        </div>

                        <div className="mt-3 grid sm:grid-cols-3 gap-3">
                          <select
                            value={g.type}
                            onChange={(e) => updateGroup(idx, { type: e.target.value as any })}
                            className="h-10 rounded-xl border border-[var(--line)] px-3 bg-white"
                          >
                            <option value="single">single (radio)</option>
                            <option value="multi">multi (checkbox)</option>
                          </select>

                          <label className="h-10 rounded-xl border border-[var(--line)] px-3 flex items-center gap-2 bg-white">
                            <input
                              type="checkbox"
                              checked={g.required}
                              onChange={(e) => updateGroup(idx, { required: e.target.checked })}
                            />
                            <span className="text-sm font-semibold">Required</span>
                          </label>

                          <input
                            className="h-10 rounded-xl border border-[var(--line)] px-3"
                            placeholder="Vanilla, Chocolate"
                            defaultValue={g.choices.join(", ")}
                            onBlur={(e) => {
                              const newChoices = e.target.value
                                .split(",")
                                .map((s) => s.trim())
                                .filter(Boolean);
                              updateGroup(idx, { choices: newChoices });
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-4 grid gap-3">
                  <div className="grid sm:grid-cols-2 gap-3">
                    <input
                      value={ogName}
                      onChange={(e) => setOgName(e.target.value)}
                      className="h-11 rounded-xl border border-[var(--line)] px-3"
                      placeholder="Option group name (e.g. Flavor)"
                    />
                    <select
                      value={ogType}
                      onChange={(e) => setOgType(e.target.value as any)}
                      className="h-11 rounded-xl border border-[var(--line)] px-3 bg-white"
                    >
                      <option value="single">single (radio)</option>
                      <option value="multi">multi (checkbox)</option>
                    </select>
                  </div>

                  <label className="rounded-xl border border-[var(--line)] px-3 py-3 flex items-center gap-2 bg-white">
                    <input
                      type="checkbox"
                      checked={ogRequired}
                      onChange={(e) => setOgRequired(e.target.checked)}
                    />
                    <span className="text-sm font-semibold">Required</span>
                  </label>

                  <input
                    value={ogChoicesText}
                    onChange={(e) => setOgChoicesText(e.target.value)}
                    className="h-11 rounded-xl border border-[var(--line)] px-3"
                    placeholder="Choices (comma separated) e.g. Vanilla, Chocolate, Red Velvet"
                  />

                  <button
                    type="button"
                    onClick={addOptionGroup}
                    className="h-11 px-5 rounded-full border border-[var(--line)] bg-white font-semibold hover:bg-slate-50"
                  >
                    Add option group
                  </button>
                </div>
              </div>

              <div className="flex gap-3 flex-wrap">
                <button
                  onClick={save}
                  disabled={saving || uploading}
                  className="h-11 px-6 rounded-full bg-[var(--color-accent)] text-white font-semibold hover:opacity-95 disabled:opacity-60"
                  type="button"
                >
                  {saving ? "Saving..." : editing ? "Update Item" : "Add Item"}
                </button>

                <button
                  onClick={resetForm}
                  className="h-11 px-6 rounded-full border border-[var(--line)] bg-white font-semibold hover:bg-slate-50"
                  type="button"
                >
                  Clear
                </button>
              </div>

              <div className="text-xs text-slate-500">
                Make sure you have a Supabase Storage bucket named <b>menu-images</b> (Public).
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
