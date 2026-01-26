import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";

function badId(id: string) {
    return !id || id === "undefined" || id === "null";
}

export async function GET(_: NextRequest, ctx: { params: Promise<{ id: string }> }) {
    const { id } = await ctx.params;

    if (badId(id)) {
        return NextResponse.json({ error: "Valid id is required" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
        .from("menu_items")
        .select("id,title,description,price,category,image,created_at")
        .eq("id", id)
        .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
}

export async function PUT(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
    const authed = req.cookies.get("admin_auth")?.value === "1";
    if (!authed) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await ctx.params;
    if (badId(id)) return NextResponse.json({ error: "Valid id is required" }, { status: 400 });

    const body = await req.json().catch(() => null);
    if (!body) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });

    const title = String(body.title ?? "").trim();
    const description = String(body.description ?? "").trim();
    const category = String(body.category ?? "").trim();
    const image = String(body.image ?? "").trim();
    const price = Number(body.price ?? 0);

    if (!title) return NextResponse.json({ error: "Title is required" }, { status: 400 });
    if (!description) return NextResponse.json({ error: "Description is required" }, { status: 400 });
    if (!category) return NextResponse.json({ error: "Category is required" }, { status: 400 });
    if (!Number.isFinite(price) || price < 0) {
        return NextResponse.json({ error: "Price must be a valid number" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
        .from("menu_items")
        .update({
            title,
            description,
            category,
            price,
            image: image ? image : null,
        })
        .eq("id", id)
        .select("id,title,description,price,category,image,created_at")
        .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
}

export async function DELETE(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
    const authed = req.cookies.get("admin_auth")?.value === "1";
    if (!authed) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await ctx.params;
    if (badId(id)) return NextResponse.json({ error: "Valid id is required" }, { status: 400 });

    const { error } = await supabaseAdmin.from("menu_items").delete().eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ ok: true });
}
