import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

type SelectedOptionDetail = {
  group: string;
  label: string;
  price: number;
};

type OrderItem = {
  title: string;
  qty: number;

  // final unit price (base + addons)
  price: number;

  // addon breakdown (optional but recommended)
  basePrice?: number;
  addonsTotal?: number;

  // best for printing (what user picked)
  selectedOptionDetails?: SelectedOptionDetail[];

  // fallback if you only have this
  selectedOptions?: Record<string, string[]>;
};

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
  items: OrderItem[];
}) {
  const to = process.env.ORDERS_NOTIFY_EMAIL;
  if (!to) throw new Error("ORDERS_NOTIFY_EMAIL not set");
  if (!process.env.RESEND_API_KEY) throw new Error("RESEND_API_KEY not set");

  const formatMoney = (n: number) => `₦${Number(n || 0).toLocaleString()}`;

  function formatOptions(item: OrderItem) {
    const lines: string[] = [];

    // ✅ preferred: selectedOptionDetails
    if (Array.isArray(item.selectedOptionDetails) && item.selectedOptionDetails.length > 0) {
      for (const d of item.selectedOptionDetails) {
        if (!d?.label) continue;
        const pricePart = Number(d.price || 0) > 0 ? ` +${formatMoney(d.price)}` : "";
        lines.push(`   - ${d.group}: ${d.label}${pricePart}`);
      }
      return lines.join("\n");
    }

    // ✅ fallback: selectedOptions object
    if (item.selectedOptions && typeof item.selectedOptions === "object") {
      const groups = Object.keys(item.selectedOptions);
      for (const g of groups) {
        const picks = item.selectedOptions[g] || [];
        for (const label of picks) {
          lines.push(`   - ${g}: ${label}`);
        }
      }
      return lines.length ? lines.join("\n") : "";
    }

    return "";
  }

  const itemsLines = payload.items
    .map((i) => {
      const lineTotal = Number(i.price || 0) * Number(i.qty || 1);
      const optionsBlock = formatOptions(i);

      const breakdown =
        Number(i.addonsTotal || 0) > 0 || Number(i.basePrice || 0) > 0
          ? `   Base: ${formatMoney(i.basePrice || 0)} | Add-ons: ${formatMoney(i.addonsTotal || 0)}`
          : "";

      return [
        `• ${i.title} x${i.qty} — ${formatMoney(lineTotal)}`,
        breakdown ? breakdown : null,
        optionsBlock ? `   Options:\n${optionsBlock}` : null,
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n\n");

  const text = `New order received ✅

Order ID: ${payload.orderId}
Name: ${payload.fullName}
Phone: ${payload.phone}
Method: ${payload.method}
Address: ${payload.address}
Note: ${payload.note || "-"}

Items:
${itemsLines}

Subtotal: ${formatMoney(payload.subtotal)}
Delivery: ${formatMoney(payload.deliveryFee || 0)}
Total: ${formatMoney(payload.total)}
`;

  await resend.emails.send({
    from: "Moridam Orders <onboarding@resend.dev>",
    to,
    subject: `New Order — ${formatMoney(payload.total)}`,
    text,
  });
}
