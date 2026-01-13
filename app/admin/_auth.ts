import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export function requireAdmin() {
    const authed = cookies().get("admin_auth")?.value === "1";
    if (!authed) redirect("/admin/login");
}
