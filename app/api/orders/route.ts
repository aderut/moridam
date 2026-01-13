import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";
import { sendOrderEmail } from "@/app/lib/email";

type OrderBody = {
    fullName: string;
    phone: string;
    method: "delivery" | "pickup";
    address: string;
    note?: string;
    items: Array<{ id: string; title: string; price: number; qty: number }>;
    subtotal: number;
    deliveryFee: number;
    total: number;
};

// ✅ ADMIN: view all orders
export async function GET(req: NextRequest) {
    try {
        const isAdmin = req.cookies.get("admin_auth")?.value === "1";
        if (!isAdmin) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { data, error } = await supabaseAdmin
            .from("orders")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json(data ?? []);
    } catch (e: any) {
        return NextResponse.json({ error: e?.message || "Fetch failed" }, { status: 500 });
    }
}

// ✅ PUBLIC: place an order
export async function POST(req: NextRequest) {
    try {
        const body = (await req.json().catch(() => null)) as OrderBody | null;
        if (!body) return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });

        const fullName = String(body.fullName ?? "").trim();
        const phone = String(body.phone ?? "").trim();
        const method = body.method;
        const address = String(body.address ?? "").trim();
        const note = String(body.note ?? "").trim();
        const items = Array.isArray(body.items) ? body.items : [];

        const subtotal = Number(body.subtotal ?? 0);
        const deliveryFee = Number(body.deliveryFee ?? 0);
        const total = Number(body.total ?? 0);

        if (!fullName || !phone || !method || !address || items.length === 0) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const { data, error } = await supabaseAdmin
            .from("orders")
            .insert({
                full_name: fullName,
                phone,
                method,
                address,
                note: note || null,
                items,
                subtotal,
                delivery_fee: deliveryFee,
                total,
            })
            .select()
            .single();

        if (error) return NextResponse.json({ error: error.message }, { status: 500 });

        // Email notify (doesn't block order)
        try {
            await sendOrderEmail({
                orderId: data.id,
                fullName,
                phone,
                method,
                address,
                note,
                subtotal,
                deliveryFee,
                total,
                items: items.map((i) => ({ title: i.title, qty: i.qty, price: i.price })),
            });
        } catch (err) {
            console.log("Email failed:", err);
        }

        return NextResponse.json({ order: data }, { status: 201 });
    } catch (e: any) {
        return NextResponse.json({ error: e?.message || "Order failed" }, { status: 500 });
    }
}
