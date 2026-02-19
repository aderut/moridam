import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";

export const runtime = "nodejs";

const allowed = new Set(["new", "prepping", "ready", "completed", "cancelled"]);

export async function PATCH(req: NextRequest) {
  try {
    const isAdmin = req.cookies.get("admin_auth")?.value === "1";
    if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json().catch(() => null);
    const orderId = String(body?.orderId ?? "");
    const status = String(body?.status ?? "");

    if (!orderId) return NextResponse.json({ error: "orderId required" }, { status: 400 });
    if (!allowed.has(status)) return NextResponse.json({ error: "invalid status" }, { status: 400 });

    const { error } = await supabaseAdmin.from("orders").update({ status }).eq("id", orderId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Update failed" }, { status: 500 });
  }
}
