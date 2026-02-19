"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const TEXT = "#2B2B2B";

export default function CheckoutSuccessPage() {
  const [orderNumber, setOrderNumber] = useState<string>("");
  const [whatsappHref, setWhatsappHref] = useState<string>("");

  useEffect(() => {
    try {
      const n = sessionStorage.getItem("mc_last_order_number") || "";
      const w = sessionStorage.getItem("mc_last_whatsapp_href") || "";
      setOrderNumber(n);
      setWhatsappHref(w);
    } catch {
      // ignore
    }
  }, []);

  return (
    <div className="min-h-screen bg-white" style={{ color: TEXT }}>
      <div className="max-w-[900px] mx-auto px-5 py-12">
        <div className="border border-black/10 rounded-2xl p-6 bg-black/5">
          <h1 className="text-2xl font-extrabold">Order placed successfully ✅</h1>

          <p className="mt-2 opacity-80">
            {orderNumber ? (
              <>
                Your order number is <b>{orderNumber}</b>.
              </>
            ) : (
              <>Your order has been saved.</>
            )}
          </p>

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <a
              href={whatsappHref || "https://wa.me/2348142517798"}
              target="_blank"
              rel="noreferrer"
              className="h-11 px-5 rounded-xl bg-white border border-black/15 inline-flex items-center justify-center font-semibold"
            >
              Send a DM on WhatsApp
            </a>

            <Link
              href="/menu"
              className="h-11 px-5 rounded-xl border border-black bg-[#FBF4DE] inline-flex items-center justify-center font-semibold"
            >
              Back to Menu
            </Link>
          </div>

          <p className="text-xs opacity-60 mt-4">
            If WhatsApp didn’t open, click the button again.
          </p>
        </div>
      </div>
    </div>
  );
}
