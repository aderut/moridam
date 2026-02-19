"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/app/cart/CartProvider";

const BEIGE = "#FBF4DE";

function formatNaira(n: number) {
  return `₦${Number(n || 0).toLocaleString()}`;
}

export default function CartPage() {
  const { items, total, remove, setQty, clear } = useCart();

  return (
    <div className="bg-[var(--bg)] min-h-screen pt-16 pb-12">
      <div className="max-w-[1120px] mx-auto px-4 sm:px-5">
        <h1 className="text-3xl sm:text-5xl font-extrabold text-[var(--ink)]">Your Cart</h1>

        {items.length === 0 ? (
          <div className="mt-8 bg-white border border-[var(--line)] rounded-2xl p-8 sm:p-10 text-center">
            <div className="text-lg font-extrabold text-[var(--ink)]">Cart is empty</div>
            <p className="mt-2 text-[var(--color-muted)]">Add items from the menu.</p>

            <Link
              href="/menu"
              className="mt-5 inline-flex h-11 px-6 rounded-full font-semibold items-center justify-center"
              style={{ backgroundColor: BEIGE, color: "#000" }}
            >
              Go to Menu
            </Link>
          </div>
        ) : (
          <div className="mt-6 grid lg:grid-cols-[1fr_360px] gap-5 sm:gap-6">
            {/* Items */}
            <div className="bg-white border border-[var(--line)] rounded-2xl divide-y overflow-hidden">
              {items.map((i) => (
                <div key={i.lineId} className="p-4 sm:p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                    {/* Image + title */}
                    <div className="flex items-start gap-3">
                      <div className="relative h-16 w-16 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                        {i.image ? (
                          <Image src={i.image} alt={i.title} fill className="object-cover" />
                        ) : null}
                      </div>

                      <div className="min-w-0">
                        <div className="font-extrabold text-[var(--ink)] leading-tight break-words">
                          {i.title}
                        </div>

                        {/* ✅ addon breakdown */}
                        {i.selectedOptionDetails && i.selectedOptionDetails.length > 0 ? (
                          <div className="mt-1 space-y-1">
                            {i.selectedOptionDetails.map((d, idx) => (
                              <div key={`${d.group}-${d.label}-${idx}`} className="text-sm text-slate-600">
                                <span className="capitalize">{d.group}:</span>{" "}
                                <span className="font-semibold text-[var(--ink)]">{d.label}</span>
                                {d.price > 0 ? (
                                  <span className="ml-2 text-slate-500 font-semibold">
                                    +{formatNaira(d.price)}
                                  </span>
                                ) : null}
                              </div>
                            ))}
                          </div>
                        ) : null}

                        {/* price (final per one qty) */}
                        <div className="mt-1 text-sm text-[var(--color-muted)]">
                          {formatNaira(i.price)}
                        </div>
                      </div>
                    </div>

                    {/* Controls */}
                    <div className="sm:ml-auto flex items-center justify-between sm:justify-end gap-3">
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          className="h-9 w-9 rounded-full border border-[var(--line)] font-bold"
                          onClick={() => setQty(i.lineId, i.qty - 1)}
                          aria-label="Decrease quantity"
                        >
                          −
                        </button>
                        <div className="w-8 text-center font-bold">{i.qty}</div>
                        <button
                          type="button"
                          className="h-9 w-9 rounded-full border border-[var(--line)] font-bold"
                          onClick={() => setQty(i.lineId, i.qty + 1)}
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => remove(i.lineId)}
                        className="text-sm font-semibold underline underline-offset-4 whitespace-nowrap"
                        style={{ color: "#000" }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="bg-white border border-[var(--line)] rounded-2xl p-5 sm:p-6 h-fit">
              <div className="flex items-center justify-between">
                <div className="font-bold text-[var(--ink)]">Total</div>
                <div className="font-extrabold text-[var(--ink)]">{formatNaira(total)}</div>
              </div>

              <Link
                href="/checkout"
                className="mt-4 w-full h-11 rounded-full font-semibold inline-flex items-center justify-center"
                style={{ backgroundColor: BEIGE, color: "#000" }}
              >
                Checkout
              </Link>

              <button
                type="button"
                onClick={clear}
                className="mt-3 w-full h-11 rounded-full border border-[var(--line)] font-semibold"
              >
                Clear Cart
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
