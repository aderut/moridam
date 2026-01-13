"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const BEIGE = "#F7EED9";
const TEXT = "#2B2B2B";

export default function AdminLoginPage() {
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const router = useRouter();
    const searchParams = useSearchParams();

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const res = await fetch("/api/admin/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include", // ✅ IMPORTANT: allow Set-Cookie to persist
                body: JSON.stringify({ password }),
            });

            // ✅ safe parse (prevents "Unexpected end of JSON input")
            const text = await res.text();
            const data = text ? JSON.parse(text) : {};

            if (!res.ok) {
                setError(data?.error || "Invalid password");
                setLoading(false);
                return;
            }

            // ✅ after cookie is set, do a HARD navigation so middleware sees it immediately
            const next = searchParams.get("next") || "/admin/menu";
            window.location.href = next;
        } catch (err: any) {
            setError(err?.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-[var(--bg)] pt-24 pb-12">
            <div className="max-w-[480px] mx-auto px-5">
                <div className="bg-white border border-[var(--line)] rounded-2xl p-6">
                    <h1 className="text-3xl font-extrabold text-[var(--ink)]">
                        Admin Login
                    </h1>

                    <p className="mt-2 text-[var(--color-muted)]">
                        Enter your admin password to manage the website.
                    </p>

                    {error && (
                        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                        <label className="block">
                            <div className="text-sm font-semibold text-[var(--ink)] mb-2">
                                Password
                            </div>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full h-11 rounded-xl border border-[var(--line)] px-3 outline-none focus:ring-2"
                                placeholder="••••••••"
                                required
                            />
                        </label>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-11 rounded-full font-semibold transition disabled:opacity-60"
                            style={{ backgroundColor: BEIGE, color: TEXT }}
                        >
                            {loading ? "Signing in..." : "Sign In"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
