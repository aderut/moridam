"use client";

import { useMemo, useState } from "react";

const BEIGE = "#FBF4DE";
const INK = "#2B2B2B";

export default function ServiceBookingForm({ service }: { service: string }) {
    const [form, setForm] = useState({
        fullName: "",
        phone: "",
        email: "",
        eventDate: "",
        guests: 20,
        location: "",
        message: "",
    });

    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const serviceTitle = useMemo(() => {
        // Make it look nicer on UI
        const s = (service || "").replace(/[-_]/g, " ");
        return s ? s.charAt(0).toUpperCase() + s.slice(1) : "Service";
    }, [service]);

    function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
        setForm((p) => ({ ...p, [key]: value }));
    }

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const payload = { service, ...form };

            const res = await fetch("/api/bookings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                setError(data?.error || "Failed to send request");
                setLoading(false);
                return;
            }

            setSubmitted(true);
        } catch {
            setError("Failed to send request. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    if (submitted) {
        return (
            <div className="text-center">
                <div className="text-2xl font-extrabold text-[var(--ink)]">Request sent ✅</div>
                <p className="mt-2 text-[var(--color-muted)]">
                    We’ve received your booking request. We’ll reach out to confirm.
                </p>

                <div className="mt-6 rounded-2xl border border-[var(--line)] bg-white p-5 text-left">
                    <div className="font-extrabold text-[var(--ink)]">{serviceTitle} Booking</div>
                    <div className="mt-3 grid gap-2 text-sm text-slate-700">
                        <div>
                            <span className="font-semibold">Name:</span> {form.fullName}
                        </div>
                        <div>
                            <span className="font-semibold">Phone:</span> {form.phone}
                        </div>
                        <div>
                            <span className="font-semibold">Date:</span> {form.eventDate}
                        </div>
                        <div>
                            <span className="font-semibold">Guests:</span> {form.guests}
                        </div>
                        <div>
                            <span className="font-semibold">Location:</span> {form.location || "-"}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <form onSubmit={onSubmit} className="space-y-5">
            {/* Header strip */}
            <div className="rounded-2xl border border-[var(--line)] bg-white p-5">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                        <div className="text-sm font-semibold text-[var(--color-muted)]">Booking for</div>
                        <div className="text-2xl font-extrabold text-[var(--ink)]">{serviceTitle}</div>
                    </div>

                    <div
                        className="h-10 px-4 rounded-xl inline-flex items-center text-sm font-bold"
                        style={{ backgroundColor: BEIGE, color: INK }}
                    >
                        Fill this form
                    </div>
                </div>

                <p className="mt-3 text-sm text-[var(--color-muted)]">
                    Enter your details and we’ll email your request to Moridam Catering.
                </p>
            </div>

            {error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    {error}
                </div>
            )}

            {/* Form card */}
            <div className="rounded-2xl border border-[var(--line)] bg-white p-6">
                <div className="grid md:grid-cols-2 gap-4">
                    <Field label="Full Name">
                        <input
                            value={form.fullName}
                            onChange={(e) => update("fullName", e.target.value)}
                            className="w-full h-11 rounded-xl border border-[var(--line)] px-3 outline-none focus:ring-2 focus:ring-black/20"
                            placeholder="Your name"
                            required
                        />
                    </Field>

                    <Field label="Phone Number">
                        <input
                            value={form.phone}
                            onChange={(e) => update("phone", e.target.value)}
                            className="w-full h-11 rounded-xl border border-[var(--line)] px-3 outline-none focus:ring-2 focus:ring-black/20"
                            placeholder="+234..."
                            required
                        />
                    </Field>

                    <Field label="Email (optional)">
                        <input
                            value={form.email}
                            onChange={(e) => update("email", e.target.value)}
                            className="w-full h-11 rounded-xl border border-[var(--line)] px-3 outline-none focus:ring-2 focus:ring-black/20"
                            placeholder="you@email.com"
                            type="email"
                        />
                    </Field>

                    <Field label="Event Date">
                        <input
                            value={form.eventDate}
                            onChange={(e) => update("eventDate", e.target.value)}
                            className="w-full h-11 rounded-xl border border-[var(--line)] px-3 outline-none focus:ring-2 focus:ring-black/20"
                            type="date"
                            required
                        />
                    </Field>

                    <Field label="Number of Guests">
                        <input
                            value={form.guests}
                            onChange={(e) => update("guests", Number(e.target.value))}
                            className="w-full h-11 rounded-xl border border-[var(--line)] px-3 outline-none focus:ring-2 focus:ring-black/20"
                            type="number"
                            min={1}
                            max={2000}
                            required
                        />
                    </Field>

                    <Field label="Location (optional)">
                        <input
                            value={form.location}
                            onChange={(e) => update("location", e.target.value)}
                            className="w-full h-11 rounded-xl border border-[var(--line)] px-3 outline-none focus:ring-2 focus:ring-black/20"
                            placeholder="Port Harcourt..."
                        />
                    </Field>
                </div>

                <div className="mt-4">
                    <Field label="Message (optional)">
            <textarea
                value={form.message}
                onChange={(e) => update("message", e.target.value)}
                className="w-full min-h-[120px] rounded-xl border border-[var(--line)] p-3 outline-none focus:ring-2 focus:ring-black/20"
                placeholder="Tell us what you need (food preferences, time, theme, etc.)"
            />
                    </Field>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="mt-5 w-full h-12 rounded-full font-bold disabled:opacity-60"
                    style={{ backgroundColor: BEIGE, color: INK }}
                >
                    {loading ? "Sending..." : "Submit Request"}
                </button>

                <div className="mt-3 text-xs text-[var(--color-muted)] text-center">
                    By submitting, you agree Moridam Catering can contact you about your booking.
                </div>
            </div>
        </form>
    );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <label className="block">
            <div className="text-sm font-semibold text-[var(--ink)] mb-2">{label}</div>
            {children}
        </label>
    );
}
