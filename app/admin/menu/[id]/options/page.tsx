"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Choice = { label: string; price: number };

type OptionGroup = {
  name: string;
  type: "single" | "multi";
  required: boolean;
  choices: Choice[];
};

type DbMenuItem = {
  id: string;
  title: string;
  description: string | null;
  price: number;
  category: string;
  image: string | null;
  options: any | null;
};

async function safeJson(res: Response) {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return { error: text };
  }
}

// ✅ supports old format choices: ["oreo","biscoff"] or "oreo, biscoff"
// ✅ and new format: [{label,price}]
function normalizeOptions(raw: any): OptionGroup[] {
  if (!raw) return [];
  const arr = Array.isArray(raw) ? raw : [raw];

  return arr
    .map((g: any) => {
      const name = String(g?.name ?? "").trim();
      const type: "single" | "multi" = g?.type === "multi" ? "multi" : "single";
      const required = Boolean(g?.required);

      let choices: Choice[] = [];

      if (Array.isArray(g?.choices)) {
        if (g.choices.length && typeof g.choices[0] === "object") {
          // new format
          choices = g.choices
            .map((c: any) => ({
              label: String(c?.label ?? "").trim(),
              price: Number(c?.price ?? 0),
            }))
            .filter((c: Choice) => c.label);
        } else {
          // old format array of strings
          choices = g.choices
            .map((x: any) => String(x).trim())
            .filter(Boolean)
            .map((label: string) => ({ label, price: 0 }));
        }
      } else if (typeof g?.choices === "string") {
        // old format "oreo, biscoff"
        choices = g.choices
          .split(",")
          .map((x: string) => x.trim())
          .filter(Boolean)
          .map((label: string) => ({ label, price: 0 }));
      }

      if (!name) return null;

      return { name, type, required, choices } as OptionGroup;
    })
    .filter(Boolean) as OptionGroup[];
}

export default function AdminOptionsPage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  const router = useRouter();

  const [item, setItem] = useState<DbMenuItem | null>(null);
  const [groups, setGroups] = useState<OptionGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ✅ Add group form
  const [ogName, setOgName] = useState("");
  const [ogType, setOgType] = useState<"single" | "multi">("single");
  const [ogRequired, setOgRequired] = useState(false);

  // ✅ Choice inputs for new group
  const [newChoiceLabel, setNewChoiceLabel] = useState("");
  const [newChoicePrice, setNewChoicePrice] = useState<number>(0);
  const [newGroupChoices, setNewGroupChoices] = useState<Choice[]>([]);

  useEffect(() => {
    let alive = true;

    (async () => {
      const p = typeof (params as any)?.then === "function" ? await (params as any) : params;
      const id = p?.id;

      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`/api/menu/${id}`, { cache: "no-store" });
        const data = await safeJson(res);

        if (!res.ok) {
          setError((data as any)?.error || "Failed to load item");
          return;
        }

        if (!alive) return;

        const db = data as DbMenuItem;
        setItem(db);
        setGroups(normalizeOptions(db.options));
      } catch (e: any) {
        if (!alive) return;
        setError(e?.message || "Failed to load item");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [params]);

  function addChoiceToNewGroup() {
    setError(null);

    const label = newChoiceLabel.trim();
    const price = Number(newChoicePrice);

    if (!label) return setError("Choice label is required.");
    if (!Number.isFinite(price) || price < 0) return setError("Choice price must be 0 or more.");

    setNewGroupChoices((prev) => [...prev, { label, price }]);
    setNewChoiceLabel("");
    setNewChoicePrice(0);
  }

  function removeNewChoice(idx: number) {
    setNewGroupChoices((prev) => prev.filter((_, i) => i !== idx));
  }

  function addGroup() {
    setError(null);

    const name = ogName.trim();
    if (!name) return setError("Option group title is required.");
    if (newGroupChoices.length === 0) return setError("Add at least 1 choice (with price).");

    setGroups((prev) => [
      ...prev,
      { name, type: ogType, required: ogRequired, choices: newGroupChoices },
    ]);

    // reset new group form
    setOgName("");
    setOgType("single");
    setOgRequired(false);
    setNewGroupChoices([]);
    setNewChoiceLabel("");
    setNewChoicePrice(0);
  }

  function removeGroup(idx: number) {
    setGroups((prev) => prev.filter((_, i) => i !== idx));
  }

  function updateGroup(idx: number, patch: Partial<OptionGroup>) {
    setGroups((prev) => prev.map((g, i) => (i === idx ? { ...g, ...patch } : g)));
  }

  function updateChoice(gIdx: number, cIdx: number, patch: Partial<Choice>) {
    setGroups((prev) =>
      prev.map((g, i) => {
        if (i !== gIdx) return g;
        const nextChoices = g.choices.map((c, j) => (j === cIdx ? { ...c, ...patch } : c));
        return { ...g, choices: nextChoices };
      })
    );
  }

  function removeChoice(gIdx: number, cIdx: number) {
    setGroups((prev) =>
      prev.map((g, i) => {
        if (i !== gIdx) return g;
        return { ...g, choices: g.choices.filter((_, j) => j !== cIdx) };
      })
    );
  }

  async function save() {
    setError(null);

    if (!item) return;

    // ✅ validate existing groups only (NOT the empty add form)
    for (const g of groups) {
      if (!g.name.trim()) return setError("Every option group must have a title.");
      if (!g.choices || g.choices.length === 0) return setError(`"${g.name}" must have at least 1 choice.`);
      for (const c of g.choices) {
        if (!c.label.trim()) return setError(`"${g.name}" has an empty choice label.`);
        if (!Number.isFinite(c.price) || c.price < 0) return setError(`"${g.name}" has an invalid price.`);
      }
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/menu/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: item.title,
          description: item.description ?? "",
          price: item.price ?? 0,
          category: item.category ?? "food",
          image: item.image ?? null,
          options: groups, // ✅ includes prices
        }),
      });

      const data = await safeJson(res);
      if (!res.ok) {
        if (res.status === 401) router.replace("/admin/login");
        throw new Error((data as any)?.error || "Save failed");
      }

      router.push("/admin/menu");
    } catch (e: any) {
      setError(e?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="bg-[var(--bg)] min-h-screen pt-24 pb-12">
        <div className="max-w-[1120px] mx-auto px-5 text-[var(--color-muted)]">Loading…</div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="bg-[var(--bg)] min-h-screen pt-24 pb-12">
        <div className="max-w-[1120px] mx-auto px-5 text-red-600 font-semibold">
          {error || "Item not found"}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--bg)] min-h-screen py-10">
      <div className="max-w-[1120px] mx-auto px-5">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-4xl font-extrabold text-[var(--ink)]">Add-ons / Options</h1>
            <div className="text-sm text-[var(--color-muted)] mt-1">
              For: <b>{item.title}</b>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => router.back()}
              className="h-10 px-5 rounded-full border border-[var(--line)] bg-white font-semibold"
            >
              Back
            </button>
            <button
              type="button"
              onClick={save}
              disabled={saving}
              className="h-10 px-5 rounded-full bg-[var(--color-accent)] text-white font-semibold disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-4 bg-white border border-red-200 rounded-xl p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Current groups */}
        <div className="mt-6 bg-white border border-[var(--line)] rounded-2xl p-5">
          <div className="font-extrabold text-[var(--ink)]">Current option groups</div>

          {groups.length === 0 ? (
            <div className="mt-4 text-sm text-[var(--color-muted)]">No option groups yet.</div>
          ) : (
            <div className="mt-4 space-y-4">
              {groups.map((g, gIdx) => (
                <div key={gIdx} className="rounded-2xl border border-[var(--line)] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-bold text-[var(--ink)]">{g.name}</div>
                      <div className="text-xs text-slate-500 uppercase mt-1">
                        {g.type} • {g.required ? "required" : "optional"}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeGroup(gIdx)}
                      className="h-9 px-4 rounded-full border border-[var(--line)] bg-white font-semibold"
                    >
                      Remove
                    </button>
                  </div>

                  <div className="mt-3 grid sm:grid-cols-3 gap-3">
                    <select
                      value={g.type}
                      onChange={(e) => updateGroup(gIdx, { type: e.target.value as any })}
                      className="h-10 rounded-xl border border-[var(--line)] px-3 bg-white"
                    >
                      <option value="single">single (radio)</option>
                      <option value="multi">multi (checkbox)</option>
                    </select>

                    <label className="h-10 rounded-xl border border-[var(--line)] px-3 flex items-center gap-2 bg-white">
                      <input
                        type="checkbox"
                        checked={g.required}
                        onChange={(e) => updateGroup(gIdx, { required: e.target.checked })}
                      />
                      <span className="text-sm font-semibold">Required</span>
                    </label>

                    <input
                      value={g.name}
                      onChange={(e) => updateGroup(gIdx, { name: e.target.value })}
                      className="h-10 rounded-xl border border-[var(--line)] px-3"
                      placeholder="Group title (e.g. Flavor)"
                    />
                  </div>

                  <div className="mt-4">
                    <div className="text-sm font-bold text-[var(--ink)]">Choices + prices</div>

                    <div className="mt-3 grid gap-2">
                      {g.choices.map((c, cIdx) => (
                        <div key={cIdx} className="grid grid-cols-[1fr_160px_auto] gap-2">
                          <input
                            value={c.label}
                            onChange={(e) => updateChoice(gIdx, cIdx, { label: e.target.value })}
                            className="h-10 rounded-xl border border-[var(--line)] px-3"
                            placeholder="Choice label (e.g. oreo)"
                          />
                          <input
                            value={c.price}
                            type="number"
                            min={0}
                            onChange={(e) => updateChoice(gIdx, cIdx, { price: Number(e.target.value) })}
                            className="h-10 rounded-xl border border-[var(--line)] px-3"
                            placeholder="Price"
                          />
                          <button
                            type="button"
                            onClick={() => removeChoice(gIdx, cIdx)}
                            className="h-10 px-4 rounded-xl border border-[var(--line)] bg-white font-semibold"
                          >
                            X
                          </button>
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      className="mt-3 h-10 px-4 rounded-xl border border-[var(--line)] bg-white font-semibold"
                      onClick={() =>
                        updateGroup(gIdx, { choices: [...g.choices, { label: "", price: 0 }] })
                      }
                    >
                      + Add choice
                    </button>

                    <div className="mt-2 text-xs text-slate-500">Set price to 0 if included.</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add new option group */}
        <div className="mt-6 bg-white border border-[var(--line)] rounded-2xl p-5">
          <div className="font-extrabold text-[var(--ink)]">Add new option group</div>

          <div className="mt-4 grid gap-3">
            <div className="grid sm:grid-cols-2 gap-3">
              <input
                value={ogName}
                onChange={(e) => setOgName(e.target.value)}
                className="h-11 rounded-xl border border-[var(--line)] px-3"
                placeholder="Option group title (e.g. Topping)"
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

            {/* Add choices with price */}
            <div className="rounded-2xl border border-[var(--line)] p-4">
              <div className="font-bold text-[var(--ink)]">Choices (with price)</div>

              <div className="mt-3 grid grid-cols-[1fr_160px_auto] gap-2">
                <input
                  value={newChoiceLabel}
                  onChange={(e) => setNewChoiceLabel(e.target.value)}
                  className="h-11 rounded-xl border border-[var(--line)] px-3"
                  placeholder="Choice label (e.g. oreo)"
                />
                <input
                  value={newChoicePrice}
                  onChange={(e) => setNewChoicePrice(Number(e.target.value))}
                  type="number"
                  min={0}
                  className="h-11 rounded-xl border border-[var(--line)] px-3"
                  placeholder="Price"
                />
                <button
                  type="button"
                  onClick={addChoiceToNewGroup}
                  className="h-11 px-4 rounded-xl border border-[var(--line)] bg-white font-semibold"
                >
                  Add
                </button>
              </div>

              {newGroupChoices.length > 0 && (
                <div className="mt-3 space-y-2">
                  {newGroupChoices.map((c, idx) => (
                    <div key={idx} className="flex items-center justify-between rounded-xl border border-[var(--line)] px-4 py-2">
                      <div className="text-sm font-semibold">
                        {c.label} <span className="text-slate-500">(+₦{c.price.toLocaleString()})</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeNewChoice(idx)}
                        className="text-sm font-semibold underline"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={addGroup}
              className="h-11 px-5 rounded-full border border-[var(--line)] bg-white font-semibold"
            >
              Add option group
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
