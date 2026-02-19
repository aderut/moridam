"use client";

import { useEffect, useMemo, useState } from "react";

type SelectedOpt = { group?: string; label?: string; price?: number };

type OrderItem = {
  id: string;
  title: string;
  qty: number;
  unit_price: number;
  selected_options: SelectedOpt[] | null;
  checked: boolean;
};

type Order = {
  id: string;
  order_number: string | null;
  created_at: string;
  full_name: string | null;
  phone: string;
  method: string;
  address: string | null;
  note: string | null;
  subtotal: number;
  total: number;
  status: string;
  order_items: OrderItem[];
};

const money = (n: any) => `₦${Number(n || 0).toLocaleString()}`;
const PICKUP_LABEL = "Pickup (Rumuevorlu)";

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  async function load() {
    setLoading(true);
    setErr(null);

    try {
      const res = await fetch("/api/admin/orders", { cache: "no-store" });
      const text = await res.text();

      if (!res.ok) {
        console.error("ADMIN ORDERS API ERROR:", res.status, text);
        throw new Error(`API ${res.status}: ${text?.slice(0, 200) || "No response body"}`);
      }

      if (!text) throw new Error("API returned empty response (no JSON). Check server logs.");

      let json: any = null;
      try {
        json = JSON.parse(text);
      } catch {
        throw new Error(`API did not return JSON. First 200 chars: ${text.slice(0, 200)}`);
      }

      const list: any[] = Array.isArray(json) ? json : json?.orders ?? [];

      const normalized: Order[] = (list || []).map((o: any) => ({
        ...o,
        order_items: Array.isArray(o?.order_items) ? o.order_items : [],
      }));

      setOrders(normalized);
    } catch (e: any) {
      setErr(e?.message || "Failed to load orders");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return (orders || []).filter((o) => {
      const name = String(o.full_name ?? "").toLowerCase();

      const matchQ =
        !query ||
        name.includes(query) ||
        String(o.phone ?? "").toLowerCase().includes(query) ||
        String(o.order_number ?? "").toLowerCase().includes(query) ||
        String(o.id ?? "").toLowerCase().includes(query);

      const matchStatus = statusFilter === "all" ? true : o.status === statusFilter;
      return matchQ && matchStatus;
    });
  }, [orders, q, statusFilter]);

  function printSticker4x6(order: Order) {
    const label = order.order_number ?? `MC-${order.id.slice(0, 7).toUpperCase()}`;

    const name = String(order.full_name ?? "Customer").trim();
    const phone = String(order.phone ?? "").trim() || "—";
    const method = String(order.method ?? "").trim() || "—";

    const addressRaw = String(order.address ?? "").trim();
    const address = method === "pickup" ? PICKUP_LABEL : addressRaw || "—";

    const note = String(order.note ?? "").trim();

    const itemsText = (order.order_items || [])
      .map((it) => {
        const opts =
          Array.isArray(it.selected_options) && it.selected_options.length
            ? it.selected_options
                .map((x: any) => {
                  const g = String(x?.group ?? "").trim();
                  const l = String(x?.label ?? "").trim();
                  const p = Number(x?.price ?? 0);
                  const base = g && l ? `${g}: ${l}` : l || g;
                  return base ? `${base}${p ? ` (+₦${p.toLocaleString()})` : ""}` : "";
                })
                .filter(Boolean)
                .join(" • ")
            : "";

        return `${it.qty}× ${it.title}${opts ? `\n   + ${opts}` : ""}`;
      })
      .join("\n\n");

    const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    @page { size: 4in 6in; margin: 0.2in; }
    body {
      width: 4in;
      height: 6in;
      margin: 0;
      font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
      color: #000;
    }
    .wrap { padding: 0.2in; }
    .brand { font-size: 12px; font-weight: 800; letter-spacing: 0.4px; }
    .order { font-size: 28px; font-weight: 1000; margin-top: 6px; }
    .name { font-size: 18px; font-weight: 900; margin-top: 10px; }
    .sub { font-size: 13px; margin-top: 4px; }
    .muted { opacity: 0.85; }
    .divider { border-top: 2px solid #000; margin: 12px 0; }
    .items { white-space: pre-wrap; font-size: 14px; line-height: 1.25; }
    .note { margin-top: 10px; font-size: 13px; white-space: pre-wrap; }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="brand">MORIDAM CATERING</div>
    <div class="order">ORDER ${label}</div>

    <div class="name">${name}</div>
    <div class="sub muted">${phone}</div>

    <div class="sub"><b>${formatDate(order.created_at)}</b></div>
    <div class="sub"><b>Method:</b> ${method}</div>
    <div class="sub"><b>Address:</b> ${address}</div>

    <div class="divider"></div>

    <div class="items">${itemsText || "No items"}</div>

    ${note ? `<div class="divider"></div><div class="note"><b>Note:</b>\n${note}</div>` : ""}
  </div>

  <script>
    window.onload = () => { window.print(); window.close(); }
  </script>
</body>
</html>`;

    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(html);
    w.document.close();
  }

  return (
    <div className="min-h-screen bg-white text-[#2B2B2B]">
      <div className="max-w-[1120px] mx-auto px-5 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold">Admin · Orders</h1>
            <p className="text-sm opacity-70">View orders and their items. Print 4×6 stickers.</p>
          </div>

          <div className="flex gap-2 items-center">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search name / phone / order #"
              className="h-10 px-3 rounded-xl border border-black/15 bg-white"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 px-3 rounded-xl border border-black/15 bg-white"
            >
              <option value="all">All</option>
              <option value="new">New</option>
              <option value="prepping">Prepping</option>
              <option value="ready">Ready</option>
              <option value="completed">Completed</option>
            </select>
            <button onClick={load} className="h-10 px-4 rounded-xl border border-black/15 bg-white">
              Refresh
            </button>
          </div>
        </div>

        <div className="mt-6">
          {loading ? (
            <div className="opacity-70">Loading orders…</div>
          ) : err ? (
            <div className="text-red-600">
              {err}
              <div className="text-xs opacity-70 mt-2">Open DevTools → Console to see more.</div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="opacity-70">No orders found.</div>
          ) : (
            <div className="grid gap-4">
              {filtered.map((o) => (
                <div key={o.id} className="bg-white border border-black/10 rounded-2xl p-4">
                  <div className="flex justify-between gap-4">
                    <div>
                      <div className="font-bold">
                        Order {o.order_number ?? `MC-${o.id.slice(0, 7).toUpperCase()}`}
                      </div>
                      <div className="text-sm mt-1">
                        <div className="font-medium">{o.full_name ?? "Customer"}</div>
                        <div className="opacity-70">{o.phone}</div>
                      </div>
                      <div className="text-xs opacity-70 mt-1">
                        {o.method}
                        {o.address ? ` • ${o.address}` : ""}
                      </div>
                      <div className="text-xs opacity-60 mt-1">{formatDate(o.created_at)}</div>
                    </div>

                    <div className="flex items-start gap-2">
                      <button
                        onClick={() => printSticker4x6(o)}
                        className="h-9 px-3 rounded-lg border border-black/15 bg-white"
                      >
                        Print 4×6
                      </button>
                      <div className="text-right font-bold">Total: {money(o.total)}</div>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    {o.order_items.length === 0 ? (
                      <p className="text-sm text-gray-500">No items found</p>
                    ) : (
                      o.order_items.map((it) => (
                        <div
                          key={it.id}
                          className="flex justify-between text-sm p-3 rounded-xl border border-black/10"
                        >
                          <span className="font-semibold">
                            {it.qty}× {it.title}
                          </span>
                          <span className="font-semibold">{money(it.qty * it.unit_price)}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
