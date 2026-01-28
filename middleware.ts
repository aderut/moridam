import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    // Protect admin routes (except login)
    if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
        const auth = req.cookies.get("admin_auth")?.value;
        if (auth !== "1") {
            const url = req.nextUrl.clone();
            url.pathname = "/admin/login";
            return NextResponse.redirect(url);
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/admin/:path*"],
};
