import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendOrderEmail(payload: {
    orderId: string;
    fullName: string;
    phone: string;
    method: string;
    address: string;
    note?: string;
    subtotal: number;
    deliveryFee: number;
    total: number;
    items: Array<{ title: string; qty: number; price: number }>;
}) {
    const to = process.env.ORDERS_NOTIFY_EMAIL;
    if (!to) throw new Error("ORDERS_NOTIFY_EMAIL not set");
    if (!process.env.RESEND_API_KEY) throw new Error("RESEND_API_KEY not set");

    const itemsLines = payload.items
        .map((i) => `• ${i.title} x${i.qty} — ₦${(i.price * i.qty).toLocaleString()}`)
        .join("\n");

    const text = `New order received ✅

Order ID: ${payload.orderId}
Name: ${payload.fullName}
Phone: ${payload.phone}
Method: ${payload.method}
Address: ${payload.address}
Note: ${payload.note || "-"}

Items:
${itemsLines}

Subtotal: ₦${payload.subtotal.toLocaleString()}
Delivery: ₦${payload.deliveryFee.toLocaleString()}
Total: ₦${payload.total.toLocaleString()}
`;

    await resend.emails.send({
        from: "Moridam Orders <onboarding@resend.dev>",
        to,
        subject: `New Order — ₦${payload.total.toLocaleString()}`,
        text,
    });
}
