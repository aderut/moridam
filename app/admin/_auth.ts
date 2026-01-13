// app/admin/_auth.ts
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function requireAdmin() {
    const cookieStore = await cookies();
    const authed = cookieStore.get("admin_auth")?.value === "1";
    if (!authed) redirect("/admin/login");
}
