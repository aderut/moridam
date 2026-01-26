import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";
import { sendOrderEmail } from "@/app/lib/email";

export const runtime = "nodejs";

export async function POST(req: Request) {
    try {
        const body = await req.json().catch(() => null);
        if (!body) {
            return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
        }

        const fullName = String(body.fullName ?? "").trim();
        const phone = String(body.phone ?? "").trim();
        const method = String(body.method ?? "").trim(); // "delivery" | "pickup"
        const address = String(body.address ?? "").trim();
        const note = String(body.note ?? "").trim();

        const items = Array.isArray(body.items) ? body.items : [];
        const subtotal = Number(body.subtotal ?? 0);
        const total = Number(body.total ?? subtotal);

        if (!fullName) return NextResponse.json({ error: "Full name is required" }, { status: 400 });
        if (!phone) return NextResponse.json({ error: "Phone is required" }, { status: 400 });
        if (!method) return NextResponse.json({ error: "Method is required" }, { status: 400 });
        if (!address) return NextResponse.json({ error: "Address is required" }, { status: 400 });
        if (items.length === 0) return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
        if (!Number.isFinite(subtotal) || subtotal < 0)
            return NextResponse.json({ error: "Subtotal is invalid" }, { status: 400 });
        if (!Number.isFinite(total) || total < 0)
            return NextResponse.json({ error: "Total is invalid" }, { status: 400 });

        // ✅ Normalize items (so email and DB are consistent)
        const cleanItems = items.map((i: any) => ({
            title: String(i?.title ?? "").trim(),
            qty: Number(i?.qty ?? 1),
            price: Number(i?.price ?? 0),
        }));

        // Basic validation per item
        for (const it of cleanItems) {
            if (!it.title) return NextResponse.json({ error: "Item title missing" }, { status: 400 });
            if (!Number.isFinite(it.qty) || it.qty < 1) return NextResponse.json({ error: "Item qty invalid" }, { status: 400 });
            if (!Number.isFinite(it.price) || it.price < 0) return NextResponse.json({ error: "Item price invalid" }, { status: 400 });
        }

        // ✅ Save order (delivery_fee forced to 0)
        const { data: order, error } = await supabaseAdmin
            .from("orders")
            .insert({
                full_name: fullName,
                phone,
                method,
                address,
                note: note || null,
                subtotal,
                delivery_fee: 0, // ✅ always 0 now
                total,
                items: cleanItems, // assuming your orders table has jsonb 'items'
            })
            .select()
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // ✅ Email notify (deliveryFee is 0)
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

        return NextResponse.json({ ok: true, order }, { status: 201 });
    } catch (err: any) {
        return NextResponse.json(
            { error: err?.message || "Server error" },
            { status: 500 }
        );
    }
}
