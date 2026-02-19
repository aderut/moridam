import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("orders")
      .select(
        `
        id,
        order_number,
        created_at,
        full_name,
        phone,
        method,
        address,
        note,
        subtotal,
        total,
        status,
        order_items:order_items (
          id,
          order_id,
          title,
          qty,
          unit_price,
          selected_options,
          checked
        )
      `
      )
      .order("created_at", { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const shaped = (data ?? []).map((o: any) => ({
      ...o,
      order_items: Array.isArray(o.order_items) ? o.order_items : [],
    }));

    return NextResponse.json({ orders: shaped }, { status: 200 });
  } catch (e: any) {
    console.error("ADMIN ORDERS GET ERROR:", e, e?.cause);
    return NextResponse.json({ error: e?.message || "Failed to load orders" }, { status: 500 });
  }
}
