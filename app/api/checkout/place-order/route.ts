import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type IncomingItem = {
  title: string;
  qty: number;
  unit_price: number;
  selected_options?: any[] | null;
};

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });

    const full_name = String(body.full_name ?? body.fullName ?? "").trim();
    const phone = String(body.phone ?? "").trim();
    const method = String(body.method ?? "").trim();
    const address = body.address ? String(body.address).trim() : null;
    const note = body.note ? String(body.note).trim() : null;

    const items: IncomingItem[] = Array.isArray(body.items) ? body.items : [];
    const total = Number(body.total ?? 0);

    const paid = Boolean(body.paid);
    const payment_provider = String(body.payment_provider ?? "paystack").trim();
    const payment_reference = body.payment_reference ? String(body.payment_reference).trim() : "";

    if (!full_name) return NextResponse.json({ error: "Full name is required" }, { status: 400 });
    if (!phone) return NextResponse.json({ error: "Phone is required" }, { status: 400 });
    if (!method) return NextResponse.json({ error: "Method is required" }, { status: 400 });
    if (!items.length) return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    if (!Number.isFinite(total) || total < 0) return NextResponse.json({ error: "Invalid total" }, { status: 400 });

    // Require payment (keep this if you want Paystack before order is created)
    if (!paid) return NextResponse.json({ error: "Payment required" }, { status: 400 });
    if (!payment_reference) return NextResponse.json({ error: "Missing payment reference" }, { status: 400 });

    // Prevent duplicate order if same reference reused
    const { data: existing } = await supabaseAdmin
      .from("orders")
      .select("id, order_number")
      .eq("payment_reference", payment_reference)
      .maybeSingle();

    if (existing?.id) {
      return NextResponse.json({ orderId: existing.id, orderNumber: existing.order_number }, { status: 200 });
    }

    // 1) create order
    const { data: order, error: orderErr } = await supabaseAdmin
      .from("orders")
      .insert({
        full_name,
        phone,
        method,
        address,
        note,
        total,
        subtotal: total,
        status: "new",
        paid: true,
        payment_provider,
        payment_reference,
      })
      .select("id, order_number")
      .single();

    if (orderErr || !order) {
      return NextResponse.json({ error: orderErr?.message || "Failed to create order" }, { status: 500 });
    }

    // 2) create order items
    const rows = items.map((it) => ({
      order_id: order.id,
      title: String(it.title ?? "Item").trim(),
      qty: Math.max(1, Number(it.qty ?? 1)),
      unit_price: Number(it.unit_price ?? 0),
      selected_options: it.selected_options ?? null,
      checked: false,
    }));

    const { error: itemsErr } = await supabaseAdmin.from("order_items").insert(rows);

    if (itemsErr) {
      await supabaseAdmin.from("orders").delete().eq("id", order.id);
      return NextResponse.json({ error: itemsErr.message }, { status: 500 });
    }

    return NextResponse.json({ orderId: order.id, orderNumber: order.order_number }, { status: 201 });
  } catch (e: any) {
    console.error("PLACE ORDER ERROR:", e);
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}
