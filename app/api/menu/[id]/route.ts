import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";

function isUuid(v: string) {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);
}

export async function PUT(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const isAdmin = req.cookies.get("admin_auth")?.value === "1";
        if (!isAdmin) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // ✅ Next 16: params is a Promise
        const { id } = await context.params;

        if (!id || id === "undefined" || !isUuid(id)) {
            return NextResponse.json({ error: "Invalid id" }, { status: 400 });
        }

        const body = await req.json().catch(() => null);
        if (!body) {
            return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
        }

        const { data, error } = await supabaseAdmin
            .from("menu_items")
            .update({
                title: body.title,
                description: body.description,
                price: body.price,
                category: body.category,
                image: body.image ?? null,
            })
            .eq("id", id)
            .select()
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data);
    } catch (e: any) {
        return NextResponse.json(
            { error: e?.message || "Server error" },
            { status: 500 }
        );
    }
}

export async function DELETE(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const isAdmin = req.cookies.get("admin_auth")?.value === "1";
        if (!isAdmin) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // ✅ Next 16: params is a Promise
        const { id } = await context.params;

        if (!id || id === "undefined" || !isUuid(id)) {
            return NextResponse.json({ error: "Invalid id" }, { status: 400 });
        }

        const { error } = await supabaseAdmin.from("menu_items").delete().eq("id", id);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        return NextResponse.json({ success: true });
    } catch (e: any) {
        return NextResponse.json(
            { error: e?.message || "Delete failed" },
            { status: 500 }
        );
    }
}
