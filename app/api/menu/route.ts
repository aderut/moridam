import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";

export async function GET() {
    const { data, error } = await supabaseAdmin
        .from("menu_items")
        .select("id,title,description,price,category,image,created_at")
        .order("created_at", { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data ?? []);
}

export async function POST(req: NextRequest) {
    const authed = req.cookies.get("admin_auth")?.value === "1";
    if (!authed) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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
        .insert({
            title,
            description,
            category,
            price,
            image: image ? image : null,
        })
        .select("id,title,description,price,category,image,created_at")
        .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data, { status: 201 });
}