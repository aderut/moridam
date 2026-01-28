import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";

type OptionGroup = {
    name: string;
    type: "single" | "multi";
    required?: boolean;
    choices: string[];
};

function badId(id: string) {
    return !id || id === "undefined" || id === "null";
}

function isValidOptionGroups(v: any): v is OptionGroup[] {
    if (v == null) return true; // allow null
    if (!Array.isArray(v)) return false;

    for (const g of v) {
        if (!g || typeof g !== "object") return false;
        if (typeof g.name !== "string" || !g.name.trim()) return false;
        if (g.type !== "single" && g.type !== "multi") return false;
        if (g.required != null && typeof g.required !== "boolean") return false;

        if (!Array.isArray(g.choices)) return false;
        const cleaned = g.choices
            .map((x: any) => String(x).trim())
            .filter(Boolean);

        if (cleaned.length < 2) return false;
    }

    return true;
}

function requireAdmin(req: NextRequest) {
    return req.cookies.get("admin_auth")?.value === "1";
}

export async function GET(_: NextRequest, ctx: { params: Promise<{ id: string }> }) {
    const { id } = await ctx.params;

    if (badId(id)) {
        return NextResponse.json({ error: "Valid id is required" }, { status: 400 });
    }

    // ✅ Make sure this table name matches what your /api/menu uses:
    // If your main menu API uses "menu", change "menu_items" to "menu".
    const { data, error } = await supabaseAdmin
        .from("menu_items")
        .select("id,title,description,price,category,image,options,created_at")
        .eq("id", id)
        .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
}

export async function PUT(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
    if (!requireAdmin(req)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await ctx.params;
    if (badId(id)) return NextResponse.json({ error: "Valid id is required" }, { status: 400 });

    const body = await req.json().catch(() => null);
    if (!body) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });

    const title = String(body.title ?? "").trim();
    const description = String(body.description ?? "").trim();
    const category = String(body.category ?? "").trim().toLowerCase();
    const imageRaw = body.image == null ? "" : String(body.image).trim();
    const price = Number(body.price ?? 0);

    // ✅ options jsonb from admin
    const options = body.options ?? null;

    if (!title) return NextResponse.json({ error: "Title is required" }, { status: 400 });
    if (!description) return NextResponse.json({ error: "Description is required" }, { status: 400 });
    if (!category) return NextResponse.json({ error: "Category is required" }, { status: 400 });
    if (!Number.isFinite(price) || price < 0) {
        return NextResponse.json({ error: "Price must be a valid number" }, { status: 400 });
    }
    if (!isValidOptionGroups(options)) {
        return NextResponse.json(
            {
                error:
                    "Invalid options. Each group needs: name, type(single|multi), choices (at least 2), and optional required.",
            },
            { status: 400 }
        );
    }

    // Normalize options choices (trim)
    const normalizedOptions =
        options == null
            ? null
            : (options as OptionGroup[]).map((g) => ({
                name: g.name.trim(),
                type: g.type,
                required: g.required ? true : undefined,
                choices: g.choices.map((c) => String(c).trim()).filter(Boolean),
            }));

    const { data, error } = await supabaseAdmin
        .from("menu_items")
        .update({
            title,
            description,
            category,
            price,
            image: imageRaw ? imageRaw : null,
            options: normalizedOptions, // ✅ jsonb
        })
        .eq("id", id)
        .select("id,title,description,price,category,image,options,created_at")
        .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
}

export async function DELETE(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
    if (!requireAdmin(req)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await ctx.params;
    if (badId(id)) return NextResponse.json({ error: "Valid id is required" }, { status: 400 });

    const { error } = await supabaseAdmin.from("menu_items").delete().eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ ok: true });
}
