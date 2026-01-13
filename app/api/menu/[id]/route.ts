import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
    const { data, error } = await supabaseAdmin
        .from("menu_items")
        .select("*")
        .eq("id", params.id)
        .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
    const authed = req.cookies.get("admin_auth")?.value === "1";
    if (!authed) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json().catch(() => null);

    const { data, error } = await supabaseAdmin
        .from("menu_items")
        .update({
            title: body?.title,
            description: body?.description ?? null,
            price: Number(body?.price ?? 0),
            category: body?.category,
            image: body?.image ?? null,
        })
        .eq("id", params.id)
        .select()
        .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    const authed = req.cookies.get("admin_auth")?.value === "1";
    if (!authed) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { error } = await supabaseAdmin.from("menu_items").delete().eq("id", params.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ ok: true });
}
