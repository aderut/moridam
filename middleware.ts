import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    const isAdminPage = pathname.startsWith("/admin");
    const isAdminApi =
        pathname.startsWith("/api/admin") ||
        pathname.startsWith("/api/orders");

    // ✅ Allow public order placement (checkout)
    if (pathname === "/api/orders" && req.method === "POST") {
        return NextResponse.next();
    }

    // Allow public routes
    if (!isAdminPage && !isAdminApi) {
        return NextResponse.next();
    }

    // Allow login page + login API
    if (pathname === "/admin/login" || pathname === "/api/admin/login") {
        return NextResponse.next();
    }

    const authed = req.cookies.get("admin_auth")?.value === "1";
    if (authed) return NextResponse.next();

    // Redirect page requests
    if (isAdminPage) {
        const url = req.nextUrl.clone();
        url.pathname = "/admin/login";
        return NextResponse.redirect(url);
    }

    // Block API requests
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export const config = {
    matcher: ["/admin/:path*", "/api/admin/:path*", "/api/orders/:path*"],
};
