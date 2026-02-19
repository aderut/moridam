import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";
import { sendOrderEmail } from "@/app/lib/email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type SelectedOptionDetail = { group: string; label: string; price: number };

type CleanItem = {
  id: string | null;
  lineId: string | null;
  title: string;
  qty: number;
  price: number;
  basePrice: number;
  addonsTotal: number;
  selectedOptions: Record<string, string[]>;
  selectedOptionDetails: SelectedOptionDetail[];
  category: string | null;
  image: string | null;
};

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });

    const fullName = String(body.fullName ?? "").trim();
    const phone = String(body.phone ?? "").trim();
    const method = String(body.method ?? "").trim();
    const address = String(body.address ?? "").trim();
    const note = String(body.note ?? "").trim();

    const items = Array.isArray(body.items) ? body.items : [];
    const subtotal = Number(body.subtotal ?? 0);
    const total = Number(body.total ?? subtotal);

    if (!fullName) return NextResponse.json({ error: "Full name is required" }, { status: 400 });
    if (!phone) return NextResponse.json({ error: "Phone is required" }, { status: 400 });
    if (!method) return NextResponse.json({ error: "Method is required" }, { status: 400 });
    if (!address) return NextResponse.json({ error: "Address is required" }, { status: 400 });
    if (!items.length) return NextResponse.json({ error: "Cart is empty" }, { status: 400 });

    const cleanItems: CleanItem[] = items.map((i: any) => {
      const selectedOptions =
        i?.selectedOptions && typeof i.selectedOptions === "object" ? i.selectedOptions : {};

      const selectedOptionDetails: SelectedOptionDetail[] = Array.isArray(i?.selectedOptionDetails)
        ? i.selectedOptionDetails.map((d: any) => ({
            group: String(d?.group ?? "").trim(),
            label: String(d?.label ?? "").trim(),
            price: Number(d?.price ?? 0),
          }))
        : [];

      return {
        id: String(i?.id ?? "").trim() || null,
        lineId: String(i?.lineId ?? "").trim() || null,
        title: String(i?.title ?? "").trim(),
        qty: Number(i?.qty ?? 1),
        price: Number(i?.price ?? 0),
        basePrice: Number(i?.basePrice ?? 0),
        addonsTotal: Number(i?.addonsTotal ?? 0),
        selectedOptions,
        selectedOptionDetails,
        category: String(i?.category ?? "").trim() || null,
        image: String(i?.image ?? "").trim() || null,
      };
    });

    const { data: order, error } = await supabaseAdmin
      .from("orders")
      .insert({
        full_name: fullName,
        phone,
        method,
        address,
        note: note || null,
        subtotal,
        delivery_fee: 0,
        total,
        items: cleanItems, // keep jsonb too
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    await sendOrderEmail({
      orderId: order.id,
      fullName,
      phone,
      method,
      address,
      note,
      subtotal,
      deliveryFee: 0,
      total,
      items: cleanItems,
    });

    return NextResponse.json({ ok: true, orderId: order.id }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Server error" }, { status: 500 });
  }
}
