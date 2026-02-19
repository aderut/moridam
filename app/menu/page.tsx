"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/app/cart/CartProvider";

const CREAM = "#FBF4DE";
const INK = "#2B2B2B";

type MenuCategory =
  | "all"
  | "food"
  | "pastries"
  | "drinks"
  | "cakes"
  | "valentine"
  | "combo";

type DbMenuItem = {
  id: string;
  title: string;
  description: string | null;
  price: number;
  category: string;
  image: string | null;
};

type MenuItem = {
  id: string;
  title: string;
  description: string;
  price: number;
  category: MenuCategory;
  image?: string;
};

const tabs: { label: string; value: MenuCategory }[] = [
  { label: "All", value: "all" },
  { label: "Food", value: "food" },
  { label: "Pastries", value: "pastries" },
  { label: "Drinks", value: "drinks" },
  { label: "Cakes", value: "cakes" },
  { label: "Combo Deals", value: "combo" },
  { label: "Valentine Special", value: "valentine" },
];

function normalizeCategory(rawCategory: string): MenuCategory {
  const raw = String(rawCategory || "").toLowerCase().trim();

  if (
    raw === "valentine special" ||
    raw === "valentine_special" ||
    raw === "valentine-special"
  ) {
    return "valentine";
  }

  if (
    raw === "combo deals" ||
    raw === "combo_deals" ||
    raw === "combo-deals" ||
    raw === "combo"
  ) {
    return "combo";
  }

  const asCat = raw as MenuCategory;
  if (tabs.some((t) => t.value === asCat)) return asCat;

  return "food";
}

function toMenuItem(d: DbMenuItem): MenuItem {
  return {
    id: d.id,
    title: d.title,
    description: d.description ?? "",
    price: Number(d.price ?? 0),
    category: normalizeCategory(d.category),
    image: d.image ?? undefined,
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

export default function MenuPage() {
  const router = useRouter();
  const { add } = useCart(); // kept

  const [items, setItems] = useState<MenuItem[]>([]);
  const [active, setActive] = useState<MenuCategory>("all");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const res = await fetch("/api/menu", { cache: "no-store" });
        const data = await safeJson(res);

        if (!res.ok) {
          if (!alive) return;
          setLoadError((data as any)?.error || "Failed to load menu");
          return;
        }

        const list = Array.isArray(data) ? (data as DbMenuItem[]) : [];
        if (!alive) return;
        setItems(list.map(toMenuItem));
      } catch (e: any) {
        if (!alive) return;
        setLoadError(e?.message || "Failed to load menu");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  const filtered = useMemo(() => {
    if (active === "all") return items;
    return items.filter((i) => i.category === active);
  }, [items, active]);

  return (
    <div className="bg-[var(--bg)] min-h-screen pt-16 md:pt-20 pb-12 overflow-x-visible">
      <div className="max-w-[1120px] mx-auto px-4 sm:px-5">
        {/* Title */}
        <h1 className="mt-4 text-2xl sm:text-3xl md:text-4xl font-extrabold text-[var(--ink)]">
          Featured favorites
        </h1>

        {/* ✅ REAL horizontal category scroller */}
        <div className="mt-6 -mx-4 sm:mx-0">
          <div
            className="
              flex flex-nowrap gap-3
              px-4 sm:px-0
              overflow-x-auto
              max-w-full
              pb-3
              [-webkit-overflow-scrolling:touch]
            "
          >
            {tabs.map((t) => {
              const on = t.value === active;
              return (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setActive(t.value)}
                  className={`shrink-0 h-10 px-4 rounded-xl text-sm font-semibold border transition whitespace-nowrap ${
                    on
                      ? "border-transparent"
                      : "border-[var(--line)] bg-white hover:bg-slate-50"
                  }`}
                  style={on ? { backgroundColor: INK, color: "white" } : {}}
                >
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Grid */}
        {!loading && !loadError && (
          <div className="mt-6 sm:mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {filtered.map((item) => (
              <div
                key={item.id}
                onClick={() => router.push(`/product/${item.id}`)}
                className="rounded-2xl bg-white border border-[var(--line)] overflow-hidden cursor-pointer hover:shadow-sm transition flex flex-col"
              >
                {/* Image */}
                <div className="relative h-40 sm:h-44 bg-slate-100">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 grid place-items-center text-slate-400 text-sm">
                      No image
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4 flex flex-col flex-1">
                  <div className="font-extrabold text-[var(--ink)] line-clamp-2">
                    {item.title}
                  </div>

                  {/* Price */}
                  <div className="mt-auto pt-3">
                    <div
                      className="h-10 px-4 rounded-xl inline-flex items-center text-sm font-bold"
                      style={{ backgroundColor: CREAM, color: INK }}
                    >
                      ₦{item.price.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {loadError && (
          <div className="mt-10 text-center text-red-600 font-semibold">
            {loadError}
          </div>
        )}
      </div>
    </div>
  );
}  