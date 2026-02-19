"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/app/cart/CartProvider";

const TEXT = "#2B2B2B";
const PICKUP_LABEL = "Pickup (Rumuevorlu)";
type Method = "delivery" | "pickup";

declare global {
  interface Window {
    PaystackPop?: any;
  }
}

function buildOrderDetailsText(params: {
  orderId: string | null;
  orderNumber?: string | null;
  method: Method;
  fullName: string;
  phone: string;
  email: string;
  address: string;
  note: string;
  items: any[];
  total: number;
}) {
  const { orderId, orderNumber, method, fullName, phone, email, address, note, items, total } = params;

  const lines =
    (items || [])
      .map((it: any, idx: number) => {
        const qty = Number(it?.qty ?? 1);
        const unitPrice = Number(it?.unit_price ?? it?.price ?? 0);
        const lineTotal = unitPrice * qty;

        const addonsArr = Array.isArray(it?.selected_options) ? it.selected_options : [];
        const addonsText =
          addonsArr.length > 0
            ? addonsArr
                .map((d: any) => {
                  const group = String(d?.group ?? "").trim();
                  const label = String(d?.label ?? "").trim();
                  const p = Number(d?.price ?? 0);
                  return `- ${group}: ${label}${p ? ` (+₦${p.toLocaleString()})` : ""}`;
                })
                .join("\n")
            : "";

        return `${idx + 1}. ${String(it?.title ?? "Item").trim()} x${qty} — ₦${lineTotal.toLocaleString()}${
          addonsText ? `\n${addonsText}` : ""
        }`;
      })
      .join("\n\n") || "No items";

  const noteLine = note?.trim() ? `\nNote: ${note.trim()}` : "";

  return `Hello Moridam Catering 👋

I have placed an order successfully.

Order: ${orderNumber ?? orderId ?? "N/A"}
Order Method: ${method}

Customer:
Name: ${fullName}
Phone: ${phone}
Email: ${email}

Address:
${address}${noteLine}

Items:
${lines}

Total: ₦${Number(total || 0).toLocaleString()}
`;
}

async function safeJson(res: Response) {
  const text = await res.text();
  if (!text) return { json: null, text: "" };
  try {
    return { json: JSON.parse(text), text };
  } catch {
    return { json: null, text };
  }
}

function loadPaystackScript() {
  return new Promise<void>((resolve, reject) => {
    if (typeof window === "undefined") return reject(new Error("No window"));
    if (window.PaystackPop) return resolve();

    const existing = document.querySelector('script[src="https://js.paystack.co/v1/inline.js"]');
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("Failed to load Paystack script")));
      return;
    }

    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v1/inline.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Paystack script"));
    document.body.appendChild(script);
  });
}

export default function CheckoutPage() {
  const router = useRouter();
  const cart = useCart() as any;

  const rawItems = cart?.items ?? cart?.cartItems ?? [];
  const total = cart?.total ?? cart?.grandTotal ?? cart?.subtotal ?? 0;

  // ✅ supports both clearCart() and clear()
  const clearCartFn = cart?.clearCart ?? cart?.clear;

  const [method, setMethod] = useState<Method>("delivery");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");

  const [loading, setLoading] = useState(false);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [paidRef, setPaidRef] = useState<string | null>(null);

  const finalAddress = method === "pickup" ? PICKUP_LABEL : address;

  const items = useMemo(() => {
    return (rawItems || []).map((it: any) => {
      const qty = Number(it?.qty ?? it?.quantity ?? 1);
      const base = Number(it?.price ?? it?.unit_price ?? 0);

      const addonsArr = Array.isArray(it?.selectedOptionDetails)
        ? it.selectedOptionDetails
        : Array.isArray(it?.selected_options)
        ? it.selected_options
        : [];

      const addonsSum = addonsArr.reduce((s: number, a: any) => s + Number(a?.price ?? 0), 0);

      return {
        title: String(it?.title ?? it?.name ?? "Item").trim(),
        qty,
        unit_price: base + addonsSum,
        selected_options: addonsArr,
      };
    });
  }, [rawItems]);

  const canSubmit = useMemo(() => {
    if (!fullName.trim()) return false;
    if (!phone.trim()) return false;
    if (!email.trim()) return false;
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return false;
    if (!items || items.length === 0) return false;
    if (method === "delivery" && !address.trim()) return false;
    if (!Number.isFinite(Number(total)) || Number(total) <= 0) return false;
    return true;
  }, [fullName, phone, email, items, method, address, total]);

  async function placeOrderAfterPayment(reference: string) {
    const payload = {
      full_name: fullName,
      phone,
      method,
      address: finalAddress,
      note,
      items,
      total,
      paid: true,
      payment_provider: "paystack",
      payment_reference: reference,
    };

    const res = await fetch("/api/checkout/place-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const { json, text } = await safeJson(res);

    if (!res.ok) {
      console.error("ORDER API ERROR:", { status: res.status, body: json ?? text });
      throw new Error(json?.error || `Order failed (HTTP ${res.status})`);
    }

    // ✅ clear cart
    if (typeof clearCartFn === "function") clearCartFn();

    // ✅ build WhatsApp link
    const whatsappTextNow = buildOrderDetailsText({
      orderId: json.orderId ?? null,
      orderNumber: json.orderNumber ?? null,
      method,
      fullName,
      phone,
      email,
      address: finalAddress,
      note,
      items,
      total,
    });

    const whatsappHrefNow = `https://wa.me/2348142517798?text=${encodeURIComponent(whatsappTextNow)}`;

    // ✅ save for success page
    sessionStorage.setItem("mc_last_order_number", String(json.orderNumber ?? json.orderId ?? ""));
    sessionStorage.setItem("mc_last_whatsapp_href", whatsappHrefNow);

    // ✅ clear form
    setFullName("");
    setPhone("");
    setEmail("");
    setAddress("");
    setNote("");
    setMethod("delivery");
    setPaidRef(reference);

    router.push("/checkout/success");
  }

  async function onPayWithPaystack(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!canSubmit) {
      setError("Please fill in your details (and address for delivery).");
      return;
    }

    const key = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;
    if (!key) {
      setError("Missing Paystack public key. Add NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY to .env.local");
      return;
    }

    setPaying(true);

    try {
      await loadPaystackScript();

      const amountKobo = Math.round(Number(total) * 100);

      // ✅ FIX: inline.js uses setup(), not newTransaction()
      const PaystackPop = window.PaystackPop;

      if (!PaystackPop || typeof PaystackPop.setup !== "function") {
        throw new Error("Paystack script not loaded. Disable adblock and refresh.");
      }

      const handler = PaystackPop.setup({
        key,
        email: email.trim(),
        amount: amountKobo,
        currency: "NGN",
        metadata: {
          custom_fields: [
            { display_name: "Full Name", variable_name: "full_name", value: fullName },
            { display_name: "Phone", variable_name: "phone", value: phone },
            { display_name: "Method", variable_name: "method", value: method },
          ],
        },

        // ✅ callback MUST be a normal function
        callback: (response: any) => {
          const ref = String(response?.reference ?? "").trim();
          if (!ref) {
            setError("Payment completed but no reference returned.");
            setPaying(false);
            return;
          }

          setLoading(true);
          placeOrderAfterPayment(ref)
            .catch((err: any) => setError(err?.message || "Payment succeeded but order save failed"))
            .finally(() => {
              setLoading(false);
              setPaying(false);
            });
        },

        onClose: () => {
          setPaying(false);
        },
      });

      handler.openIframe();
    } catch (err: any) {
      setError(err?.message || "Failed to start Paystack");
      setPaying(false);
    }
  }

  return (
    <div className="min-h-screen bg-white" style={{ color: TEXT }}>
      <div className="max-w-[900px] mx-auto px-5 py-10">
        <h1 className="text-2xl font-extrabold">Checkout</h1>

        <form
          onSubmit={onPayWithPaystack}
          className="mt-6 bg-white rounded-2xl border border-black/10 p-5 space-y-4"
        >
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-semibold">Full name</label>
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="mt-1 w-full h-11 px-3 rounded-xl border border-black/15"
                placeholder="Your name"
              />
            </div>

            <div>
              <label className="text-sm font-semibold">Phone</label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-1 w-full h-11 px-3 rounded-xl border border-black/15"
                placeholder="080..."
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold">Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full h-11 px-3 rounded-xl border border-black/15"
              placeholder="you@email.com"
              type="email"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-semibold">Method</label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value as Method)}
                className="mt-1 w-full h-11 px-3 rounded-xl border border-black/15 bg-white"
              >
                <option value="delivery">Delivery</option>
                <option value="pickup">Pickup</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-semibold">Address</label>
              <input
                value={method === "pickup" ? PICKUP_LABEL : address}
                onChange={(e) => setAddress(e.target.value)}
                disabled={method === "pickup"}
                className="mt-1 w-full h-11 px-3 rounded-xl border border-black/15 disabled:bg-black/5"
                placeholder="Delivery address"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold">Note (optional)</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="mt-1 w-full min-h-[90px] p-3 rounded-xl border border-black/15"
              placeholder="Any special instructions?"
            />
          </div>

          {/* PAYMENT AREA */}
          <div className="rounded-2xl border border-black/10 p-4 bg-black/5">
            <div className="font-bold">Payment</div>
            <div className="text-sm opacity-70 mt-1">
              Total to pay: <b>₦{Number(total || 0).toLocaleString()}</b>
            </div>

            {paidRef ? (
              <div className="text-sm mt-2">
                Paid ✅ Reference: <b>{paidRef}</b>
              </div>
            ) : (
              <div className="text-sm mt-2 opacity-80">Click the button below to pay with Paystack.</div>
            )}

            <button
              type="submit"
              disabled={paying || loading || !canSubmit}
              className="mt-3 h-11 px-6 rounded-xl border border-black bg-[#FBF4DE] text-black font-semibold disabled:opacity-50 hover:opacity-90 transition"
            >
              {paying ? "Opening Paystack..." : loading ? "Saving order..." : "Pay with Paystack"}
            </button>
          </div>

          {error ? (
            <div className="text-sm text-red-600">
              {error}
              <div className="mt-1 text-xs opacity-70">
                Open DevTools → Console. Look for <b>ORDER API ERROR</b>.
              </div>
            </div>
          ) : null}
        </form>
      </div>
    </div>
  );
}
