import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { KeycatApiError, type Charge } from "@keycatpay/sdk";
import { OrderWatcher } from "@/components/order-watcher";
import { keycat } from "@/lib/keycat";
import { formatPrice, fromCents, toCents } from "@/lib/money";
import { readOrder } from "@/lib/session";

export const metadata: Metadata = { title: "Your order", robots: { index: false } };

export default function OrderPage() {
  return (
    <div className="mx-auto max-w-xl px-4 pt-12 sm:px-6">
      <Suspense fallback={<div className="h-64 animate-pulse rounded-3xl bg-fill" />}>
        <OrderStatus />
      </Suspense>
    </div>
  );
}

/**
 * Keycat sends the customer here after paying. The charge is read from Keycat
 * directly, so this page shows what actually settled rather than trusting the
 * redirect; your webhook handler is what fulfils the order.
 */
async function OrderStatus() {
  const client = keycat();
  const chargeId = await readOrder();
  if (!client || !chargeId) return <Message title="No recent order" body="Orders you check out from this browser appear here." />;

  let charge: Charge;
  try {
    charge = await client.retrieveCharge(chargeId);
  } catch (error) {
    if (error instanceof KeycatApiError && error.status === 404) return <Message title="No recent order" body="That order could not be found." />;
    throw error;
  }

  const view = describe(charge);
  return (
    <section className="rounded-3xl bg-surface p-6 sm:p-8">
      <OrderWatcher status={charge.status} />
      <p className={`text-sm font-semibold ${view.tone}`}>{view.label}</p>
      <h1 className="mt-1 text-3xl font-semibold tracking-display">{view.title}</h1>
      <p className="mt-3 text-label-secondary">{view.body}</p>
      <ul className="mt-6 divide-y divide-separator border-y border-separator">
        {charge.items.map((item, index) => (
          <li key={index} className="flex justify-between gap-4 py-3">
            <span>{item.name}{item.qty > 1 ? <span className="text-label-secondary"> × {item.qty}</span> : null}</span>
            <span className="tabular-nums">{formatPrice(fromCents(toCents(item.amount) * item.qty))}</span>
          </li>
        ))}
      </ul>
      {charge.amount ? <p className="mt-4 flex justify-between text-lg font-semibold"><span>Total</span><span>{formatPrice(charge.amount)}</span></p> : null}
      <div className="mt-8 flex flex-wrap gap-3">
        {charge.status === "open" ? <a href={charge.hosted_url} className="press rounded-full bg-accent px-5 py-2.5 font-semibold text-accent-contrast">Continue to payment</a> : null}
        {charge.status === "paid" ? <a href={charge.receipt_url} className="press rounded-full bg-fill px-5 py-2.5 font-medium">View receipt</a> : null}
        <Link href="/" className="press rounded-full bg-fill px-5 py-2.5 font-medium">Keep shopping</Link>
      </div>
    </section>
  );
}

function describe(charge: Charge): { label: string; title: string; body: string; tone: string } {
  switch (charge.status) {
    case "paid":
      return { label: "Paid", title: "Thank you for your order", body: "Your payment has settled. We'll email you when it ships.", tone: "text-success" };
    case "open":
      return { label: "Waiting for payment", title: "Almost there", body: "This page updates by itself once your payment settles. Payments from an exchange can take a few minutes.", tone: "text-accent" };
    case "underpaid":
      return { label: "Partly paid", title: "Your payment arrived short", body: "We received less than the order total. Contact us and we'll sort it out; nothing has been lost.", tone: "text-warning" };
    case "reversed":
      return { label: "On hold", title: "Your payment was reversed", body: "The network undid this payment after it settled. Your order is on hold; contact us if you were charged.", tone: "text-danger" };
    default:
      return { label: "Closed", title: "This checkout closed", body: "Nothing was charged. Your cart is still saved if you'd like to try again.", tone: "text-label-secondary" };
  }
}

function Message({ title, body }: { title: string; body: string }) {
  return (
    <section className="rounded-3xl bg-surface p-8 text-center">
      <h1 className="text-2xl font-semibold">{title}</h1>
      <p className="mt-2 text-label-secondary">{body}</p>
      <Link href="/" className="press mt-6 inline-block rounded-full bg-fill px-5 py-2.5 font-medium">Go to the shop</Link>
    </section>
  );
}
