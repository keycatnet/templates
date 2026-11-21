"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import type { ChargeStatus } from "@keycatpay/sdk";
import { clearPaidCart } from "@/lib/actions";
import { useCartControls } from "./cart/cart-context";

/**
 * Refreshes the order page while a payment is still settling, and empties the
 * cart once it is paid.
 */
export function OrderWatcher({ status }: { status: ChargeStatus }) {
  const router = useRouter();
  const { update } = useCartControls();
  const cleared = useRef(false);

  useEffect(() => {
    if (status !== "open") return;
    const timer = setInterval(() => router.refresh(), 5_000);
    return () => clearInterval(timer);
  }, [status, router]);

  useEffect(() => {
    if (status !== "paid" || cleared.current) return;
    cleared.current = true;
    void clearPaidCart().then((cart) => { if (cart) update(cart); });
  }, [status, update]);

  return null;
}
