import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";

export const runtime = "nodejs";

export async function PATCH(req: NextRequest) {
  try {
    const isAdmin = req.cookies.get("admin_auth")?.value === "1";
    if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json().catch(() => null);
    const itemId = String(body?.itemId ?? "");
    const checked = Boolean(body?.checked);

    if (!itemId) return NextResponse.json({ error: "itemId required" }, { status: 400 });

    const { error } = await supabaseAdmin
      .from("order_items")
      .update({ checked })
      .eq("id", itemId);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Update failed" }, { status: 500 });
  }
}