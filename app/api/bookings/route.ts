
import { NextResponse } from "next/server";
import { Resend } from "resend";

export const runtime = "nodejs";

const resend = new Resend(process.env.RESEND_API_KEY);

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
        const message = String(body.message ?? "").trim();

        if (!service) return NextResponse.json({ error: "Service is required" }, { status: 400 });
        if (!fullName) return NextResponse.json({ error: "Full name is required" }, { status: 400 });
        if (!phone) return NextResponse.json({ error: "Phone is required" }, { status: 400 });
        if (!eventDate) return NextResponse.json({ error: "Event date is required" }, { status: 400 });
        if (!Number.isFinite(guests) || guests < 1)
            return NextResponse.json({ error: "Guests must be a valid number" }, { status: 400 });

        if (!process.env.RESEND_API_KEY)
            return NextResponse.json({ error: "RESEND_API_KEY not set" }, { status: 500 });

        // ✅ send to your business email
        const to = process.env.BOOKINGS_NOTIFY_EMAIL || process.env.ORDERS_NOTIFY_EMAIL;
        if (!to) return NextResponse.json({ error: "BOOKINGS_NOTIFY_EMAIL not set" }, { status: 500 });

        const textToBusiness = `New service booking ✅

Service: ${service}
Name: ${fullName}
Phone: ${phone}
Email: ${email || "-"}
Event Date: ${eventDate}
Guests: ${guests}
Location: ${location || "-"}

Message:
${message || "-"}
`;

        await resend.emails.send({
            from: "Moridam Catering <onboarding@resend.dev>",
            to,
            subject: `New Booking — ${service}`,
            text: textToBusiness,
        });

        // ✅ optional: confirmation to customer
        if (email) {
            const textToCustomer = `Hi ${fullName},

We received your booking request for: ${service} ✅

Event Date: ${eventDate}
Guests: ${guests}
Location: ${location || "-"}

We will contact you shortly to confirm.

— Moridam Catering`;

            await resend.emails.send({
                from: "Moridam Catering <onboarding@resend.dev>",
                to: email,
                subject: `Booking received — ${service}`,
                text: textToCustomer,
            });
        }

        return NextResponse.json({ ok: true }, { status: 201 });
    } catch (err: any) {
        return NextResponse.json({ error: err?.message || "Server error" }, { status: 500 });
    }
}



