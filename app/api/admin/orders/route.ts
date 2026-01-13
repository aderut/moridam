import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";

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
