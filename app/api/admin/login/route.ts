import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json().catch(() => null);
        const password = body?.password;

        if (!process.env.ADMIN_PASSWORD) {
            return NextResponse.json(
                { error: "ADMIN_PASSWORD not set" },
                { status: 500 }
            );
        }

        if (!password) {
            return NextResponse.json(
                { error: "Password is required" },
                { status: 400 }
            );
        }

        if (password !== process.env.ADMIN_PASSWORD) {
            return NextResponse.json(
                { error: "Wrong password" },
                { status: 401 }
            );
        }

        const res = NextResponse.json({ ok: true });

        res.cookies.set("admin_auth", "1", {
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
            path: "/",
            maxAge: 60 * 60 * 12, // 12 hours
        });

        return res;
    } catch (e: any) {
        return NextResponse.json(
            { error: e?.message || "Login failed" },
            { status: 500 }
        );
    }
}
