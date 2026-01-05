import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET /api/menu  (public)
export async function GET() {
    try {
        const { data, error } = await supabase
            .from("menu_items")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data ?? []);
    } catch (e: any) {
        return NextResponse.json(
            { error: e?.message || "Fetch failed" },
            { status: 500 }
        );
    }
}

// POST /api/menu (admin only)
export async function POST(req: NextRequest) {
    try {
        // ✅ IMPORTANT: use req.cookies (NOT cookies() from next/headers)
        const isAdmin = req.cookies.get("admin_auth")?.value === "1";
        if (!isAdmin) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // ✅ safe parse (prevents “Unexpected end of JSON input”)
        const body = await req.json().catch(() => null);
        if (!body) {
            return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
        }

        const title = String(body.title ?? "").trim();
        const description = String(body.description ?? "").trim();
        const price = Number(body.price ?? 0);
        const category = String(body.category ?? "").trim();
        const image = body.image ? String(body.image).trim() : null;

        if (!title || !description || !category) {
            return NextResponse.json(
                { error: "title, description, and category are required" },
                { status: 400 }
            );
        }

        if (!Number.isFinite(price) || price < 0) {
            return NextResponse.json({ error: "Invalid price" }, { status: 400 });
        }

        const { data, error } = await supabase
            .from("menu_items")
            .insert({ title, description, price, category, image })
            .select()
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data);
    } catch (e: any) {
        return NextResponse.json(
            { error: e?.message || "Insert failed" },
            { status: 500 }
        );
    }
}
