import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    const isAdminRoute =
        pathname.startsWith("/admin") || pathname.startsWith("/api/admin");

    // Allow the login page + login api
    if (pathname === "/admin/login" || pathname === "/api/admin/login") {
        return NextResponse.next();
    }

    if (!isAdminRoute) return NextResponse.next();

    const authed = req.cookies.get("admin_auth")?.value === "1";
    if (authed) return NextResponse.next();

    const url = req.nextUrl.clone();
    url.pathname = "/admin/login";
    return NextResponse.redirect(url);
}

export const config = {
    matcher: ["/admin/:path*", "/api/admin/:path*"],
};
