"use client";

import { useState } from "react";

export default function ServiceBookingForm({ service }: { service: string }) {
    const [form, setForm] = useState({
        fullName: "",
        phone: "",
        email: "",
        eventDate: "",
        guests: 20,
        location: "",
        notes: "",
    });

    const [submitted, setSubmitted] = useState(false);

    function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
        setForm((p) => ({ ...p, [key]: value }));
    }

    function onSubmit(e: React.FormEvent) {
        e.preventDefault();

        // For now: just save locally (later you can send to API)
        const payload = { service, ...form, createdAt: new Date().toISOString() };
        localStorage.setItem("last_service_booking", JSON.stringify(payload));

        setSubmitted(true);
    }

    if (submitted) {
        return (
            <div>
                <div className="text-xl font-extrabold text-[var(--ink)]">
                    Request sent ✅
                </div>
                <p className="mt-2 text-[var(--color-muted)]">
                    We saved your request. Next step is connecting this to email or a database.
                </p>

                <div className="mt-5 rounded-xl bg-slate-50 border border-[var(--line)] p-4 text-sm">
                    <div className="font-bold text-[var(--ink)] capitalize">
                        {service} booking
                    </div>
                    <div className="mt-2 text-slate-700">
                        Guests: <span className="font-semibold">{form.guests}</span>
                    </div>
                    <div className="text-slate-700">
                        Date: <span className="font-semibold">{form.eventDate || "Not set"}</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
                <Field label="Full Name">
                    <input
                        value={form.fullName}
                        onChange={(e) => update("fullName", e.target.value)}
                        className="w-full h-11 rounded-xl border border-[var(--line)] px-3 outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                        placeholder="Your name"
                        required
                    />
                </Field>

                <Field label="Phone Number">
                    <input
                        value={form.phone}
                        onChange={(e) => update("phone", e.target.value)}
                        className="w-full h-11 rounded-xl border border-[var(--line)] px-3 outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                        placeholder="+234..."
                        required
                    />
                </Field>

                <Field label="Email (optional)">
                    <input
                        value={form.email}
                        onChange={(e) => update("email", e.target.value)}
                        className="w-full h-11 rounded-xl border border-[var(--line)] px-3 outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                        placeholder="you@email.com"
                        type="email"
                    />
                </Field>

                <Field label="Event Date">
                    <input
                        value={form.eventDate}
                        onChange={(e) => update("eventDate", e.target.value)}
                        className="w-full h-11 rounded-xl border border-[var(--line)] px-3 outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                        type="date"
                        required
                    />
                </Field>

                <Field label="Number of Guests">
                    <input
                        value={form.guests}
                        onChange={(e) => update("guests", Number(e.target.value))}
                        className="w-full h-11 rounded-xl border border-[var(--line)] px-3 outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
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
                        className="w-full h-11 rounded-xl border border-[var(--line)] px-3 outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                        placeholder="Lagos, Abuja..."
                    />
                </Field>
            </div>

            <Field label="Extra Notes (optional)">
        <textarea
            value={form.notes}
            onChange={(e) => update("notes", e.target.value)}
            className="w-full min-h-[110px] rounded-xl border border-[var(--line)] p-3 outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
            placeholder="Tell us what you need (food preferences, time, theme, etc.)"
        />
            </Field>

            <button
                type="submit"
                className="h-11 px-6 rounded-full bg-[var(--color-accent)] text-white font-semibold hover:opacity-95"
            >
                Submit Request
            </button>
        </form>
    );
}

function Field({
                   label,
                   children,
               }: {
    label: string;
    children: React.ReactNode;
}) {
    return (
        <label className="block">
            <div className="text-sm font-semibold text-[var(--ink)] mb-2">{label}</div>
            {children}
        </label>
    );
}
