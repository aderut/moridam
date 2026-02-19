"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useCart } from "@/app/cart/CartProvider";

type OptionChoice = { label: string; price: number };

type OptionGroup = {
  name: string;
  type: "single" | "multi";
  required?: boolean;
  choices: OptionChoice[];
};

type Product = {
  id: string;
  title: string;
  description: string | null;
  price: number;
  category: string;
  image: string | null;
  options: OptionGroup[] | null;
};

function getImageSrc(image?: string | null) {
  if (!image) return "/images/placeholder.png";
  const s = String(image).trim();
  if (!s) return "/images/placeholder.png";
  if (s.startsWith("http://") || s.startsWith("https://")) return s;
  if (!s.includes("/")) return `/images/${s}`;
  return s.startsWith("/") ? s : `/${s}`;
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

function calculateAddonsTotal(product: Product, selected: Record<string, string[]>) {
  let total = 0;
  for (const group of product.options || []) {
    const picks = selected[group.name] || [];
    for (const label of picks) {
      const found = group.choices?.find((c) => c.label === label);
      if (found) total += Number(found.price || 0);
    }
  }
  return total;
}

function buildSelectedOptionDetails(product: Product, selected: Record<string, string[]>) {
  const details: { group: string; label: string; price: number }[] = [];
  for (const group of product.options || []) {
    const picks = selected[group.name] || [];
    for (const label of picks) {
      const found = group.choices?.find((c) => c.label === label);
      details.push({
        group: group.name,
        label,
        price: Number(found?.price || 0),
      });
    }
  }
  return details;
}

// stable stringify for lineId
function stableStringify(obj: any) {
  if (!obj) return "";
  if (Array.isArray(obj)) return `[${obj.map(stableStringify).join(",")}]`;
  if (typeof obj === "object") {
    const keys = Object.keys(obj).sort();
    return `{${keys.map((k) => `"${k}":${stableStringify(obj[k])}`).join(",")}}`;
  }
  return JSON.stringify(obj);
}
function makeLineId(productId: string, selectedOptions?: Record<string, string[]>) {
  const base = stableStringify(selectedOptions || {});
  return `${productId}__${base}`;
}

export default function ProductClient({ id }: { id: string }) {
  const { add } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [imgSrc, setImgSrc] = useState("/images/placeholder.png");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [selected, setSelected] = useState<Record<string, string[]>>({});
  const [optError, setOptError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;

    (async () => {
      if (!id) {
        setErr("Missing product id");
        setLoading(false);
        return;
      }

      setLoading(true);
      setErr(null);

      try {
        const res = await fetch(`/api/menu/${id}`, { cache: "no-store" });
        const data = await safeJson(res);

        if (!res.ok) {
          if (!alive) return;
          setErr((data as any)?.error || "Failed to load product");
          setProduct(null);
          return;
        }

        if (!alive) return;

        const p = data as Product;
        const fixed: Product = { ...p, options: Array.isArray(p.options) ? p.options : null };

        setProduct(fixed);
        setImgSrc(getImageSrc(fixed.image));

        const initial: Record<string, string[]> = {};
        (fixed.options || []).forEach((g) => (initial[g.name] = []));
        setSelected(initial);
      } catch (e: any) {
        if (!alive) return;
        setErr(e?.message || "Failed to load product");
        setProduct(null);
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [id]);

  function toggleChoice(group: OptionGroup, label: string) {
    setOptError(null);

    setSelected((prev) => {
      const current = prev[group.name] || [];

      if (group.type === "single") {
        return { ...prev, [group.name]: current[0] === label ? [] : [label] };
      }

      if (current.includes(label)) {
        return { ...prev, [group.name]: current.filter((x) => x !== label) };
      }

      return { ...prev, [group.name]: [...current, label] };
    });
  }

  function validateRequired(p: Product) {
    for (const g of p.options || []) {
      if (g.required) {
        const picked = selected[g.name] || [];
        if (picked.length === 0) return `Please select ${g.name}.`;
      }
    }
    return null;
  }

  const addonsTotal = useMemo(() => {
    if (!product) return 0;
    return calculateAddonsTotal(product, selected);
  }, [product, selected]);

  const basePrice = Number(product?.price || 0);
  const totalPrice = basePrice + addonsTotal;
  const hasOptions = (product?.options || []).length > 0;

  if (loading) {
    return (
      <div className="bg-[var(--bg)] min-h-screen pt-24 pb-12">
        <div className="max-w-[1120px] mx-auto px-5 text-[var(--color-muted)]">Loading…</div>
      </div>
    );
  }

  if (err || !product) {
    return (
      <div className="bg-[var(--bg)] min-h-screen pt-24 pb-12">
        <div className="max-w-[1120px] mx-auto px-5">
          <p className="text-red-600 font-semibold">{err || "Product not found"}</p>
          <Link href="/menu" className="underline mt-3 inline-block">
            Back to menu
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--bg)] min-h-screen pt-20 pb-12">
      <div className="max-w-[1120px] mx-auto px-5">
        <Link href="/menu" className="inline-flex items-center gap-2 font-semibold text-[var(--ink)]">
          ← Back
        </Link>

        {/* ✅ border removed */}
        <div className="mt-6 bg-white rounded-2xl p-0 overflow-hidden">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-stretch">
            {/* IMAGE */}
            <div className="bg-slate-100">
              <div className="h-[520px] lg:h-[560px] w-full">
                <img
                  src={imgSrc}
                  alt={product.title}
                  className="w-full h-full object-cover"
                  onError={() => setImgSrc("/images/placeholder.png")}
                />
              </div>
            </div>

            {/* RIGHT */}
            <div className="p-7 flex flex-col">
              <h1 className="text-4xl font-extrabold text-[var(--ink)]">{product.title}</h1>
              <p className="mt-2 text-[var(--color-muted)]">{product.description || ""}</p>

              {/* price pills */}
              <div className="mt-5 flex items-center gap-3 flex-wrap">
                <div className="h-11 px-5 rounded-xl inline-flex items-center font-extrabold bg-[#FBF4DE] text-[#2B2B2B]">
                  Base: ₦{basePrice.toLocaleString()}
                </div>
                <div className="h-11 px-5 rounded-xl inline-flex items-center font-extrabold border border-[var(--line)]">
                  Add-ons: ₦{addonsTotal.toLocaleString()}
                </div>
                <div className="h-11 px-5 rounded-xl inline-flex items-center font-extrabold bg-black text-white">
                  Total: ₦{totalPrice.toLocaleString()}
                </div>
              </div>

              {/* OPTIONS */}
              {hasOptions && (
                <div className="mt-8">
                  <div className="text-lg font-extrabold text-[var(--ink)]">Options</div>

                  {optError && (
                    <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                      {optError}
                    </div>
                  )}

                  <div className="mt-5 space-y-6">
                    {(product.options || []).map((group, gIdx) => (
                      <div key={`${group.name}-${gIdx}`}>
                        <div className="flex items-center gap-2">
                          <div className="font-bold text-[var(--ink)]">{group.name}</div>
                          {group.required ? (
                            <span className="text-xs font-semibold text-red-600">Required</span>
                          ) : (
                            <span className="text-xs text-[var(--color-muted)]">Optional</span>
                          )}
                        </div>

                        <div className="mt-3 grid sm:grid-cols-2 gap-3">
                          {(group.choices || []).map((choice, i) => {
                            const checked = (selected[group.name] || []).includes(choice.label);
                            const key = `${group.name}-${choice.label}-${i}`;
                            const inputType = group.type === "single" ? "radio" : "checkbox";

                            return (
                              <label
                                key={key}
                                className="flex items-center justify-between gap-3 rounded-xl border border-[var(--line)] bg-white px-4 py-3 cursor-pointer hover:bg-slate-50"
                              >
                                <div className="flex items-center gap-3">
                                  <input
                                    type={inputType}
                                    name={group.name}
                                    checked={checked}
                                    onChange={() => toggleChoice(group, choice.label)}
                                    className="h-4 w-4"
                                  />
                                  <span className="text-sm font-semibold text-[var(--ink)]">
                                    {choice.label}
                                  </span>
                                </div>

                                <span className="text-xs font-semibold text-slate-600">
                                  +₦{Number(choice.price || 0).toLocaleString()}
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {!hasOptions && (
                <div className="mt-8 text-sm text-[var(--color-muted)]">No options for this item.</div>
              )}

              {/* ✅ ADD TO CART moved down (mt increased) */}
              <button
                type="button"
                className="mt-10 w-full h-12 rounded-xl font-semibold text-white bg-black"
                onClick={() => {
                  setOptError(null);
                  const msg = validateRequired(product);
                  if (msg) return setOptError(msg);

                  const selectedOptionDetails = buildSelectedOptionDetails(product, selected);
                  const lineId = makeLineId(product.id, selected);

                  add({
                    lineId,
                    id: product.id,
                    title: product.title,
                    category: product.category,
                    description: product.description ?? "",
                    image: getImageSrc(product.image),
                    selectedOptions: selected,
                    selectedOptionDetails,
                    basePrice,
                    addonsTotal,
                    price: totalPrice,
                  });
                }}
              >
                Add to cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
