import { Suspense } from "react";
import AdminLoginClient from "./AdminLoginClient";

export const dynamic = "force-dynamic"; // avoids prerender issues for auth pages

export default function AdminLoginPage() {
    return (
        <Suspense fallback={<div className="min-h-screen grid place-items-center">Loading…</div>}>
            <AdminLoginClient />
        </Suspense>
    );
}
