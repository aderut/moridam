import { NextResponse } from "next/server";
import { Resend } from "resend";

export const runtime = "nodejs"; // IMPORTANT for Resend on Vercel

export async function GET() {
    return NextResponse.json({ ok: true, route: "service-booking" });
}

export async function POST(req: Request) {
    try {
        const body = await req.json().catch(() => null);
        if (!body) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });

        const service = String(body.service ?? "").trim();
        const fullName = String(body.fullName ?? "").trim();
        const phone = String(body.phone ?? "").trim();
        const email = String(body.email ?? "").trim();
        const eventDate = String(body.eventDate ?? "").trim();
        const guests = Number(body.guests ?? 0);
        const location = String(body.location ?? "").trim();
        const notes = String(body.notes ?? "").trim();

        if (!service) return NextResponse.json({ error: "Service is required" }, { status: 400 });
        if (!fullName) return NextResponse.json({ error: "Full name is required" }, { status: 400 });
        if (!phone) return NextResponse.json({ error: "Phone is required" }, { status: 400 });
        if (!eventDate) return NextResponse.json({ error: "Event date is required" }, { status: 400 });
        if (!Number.isFinite(guests) || guests < 1) {
            return NextResponse.json({ error: "Guests must be a valid number" }, { status: 400 });
        }

        const apiKey = process.env.RESEND_API_KEY;
        if (!apiKey) return NextResponse.json({ error: "RESEND_API_KEY not set" }, { status: 500 });

        const to = process.env.ORDERS_NOTIFY_EMAIL;
        if (!to) return NextResponse.json({ error: "ORDERS_NOTIFY_EMAIL not set" }, { status: 500 });

        const resend = new Resend(apiKey);

        const text = `New service booking ✅

Service: ${service}
Name: ${fullName}
Phone: ${phone}
Email: ${email || "-"}
Event Date: ${eventDate}
Guests: ${guests}
Location: ${location || "-"}
Notes: ${notes || "-"}
`;

        await resend.emails.send({
            from: "Moridam Catering <onboarding@resend.dev>",
            to,
            subject: `New Service Booking — ${service}`,
            text,
        });

        return NextResponse.json({ ok: true }, { status: 201 });
    } catch (err: any) {
        return NextResponse.json({ error: err?.message || "Server error" }, { status: 500 });
    }
}
