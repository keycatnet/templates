import "server-only";
import type { KeycatEvent } from "@keycatpay/sdk";

/**
 * Where your business logic goes. Each handler receives a verified event.
 *
 * Delivery is at least once, so make each handler idempotent on `event.id`:
 * record it in your database inside the same transaction as the side effect,
 * and skip it when it is already there. Throwing makes Keycat retry later.
 *
 * Find the order by the charge id you stored when you created the charge, and
 * compare `paid_total` with the order total before shipping. Events with
 * `source: "handle_page"` come from visitors to your payment page, who choose
 * the amount; they belong to no order. Retrieve the charge with the SDK for its
 * line items.
 */
export async function handleEvent(event: KeycatEvent): Promise<void> {
  switch (event.type) {
    case "charge.paid":
      // Payments now cover the order. Ship it.
      console.info("Fulfil order", { event: event.id, charge: event.data.charge, paid: event.data.paid_total });
      return;
    case "charge.underpaid":
      // Money arrived but less than the total. Contact the customer, or refund
      // from app.keycat.net. Do not ship.
      console.warn("Order underpaid", { event: event.id, charge: event.data.charge, paid: event.data.paid_total, amount: event.data.amount });
      return;
    case "charge.reversed":
      // A settled payment was undone by a chain reorganisation. Treat the
      // order as unpaid: stop or reverse fulfilment.
      console.warn("Hold order: payment reversed", { event: event.id, charge: event.data.charge });
      return;
    case "charge.expired":
      // The checkout window closed with nothing paid. Release any reserved stock.
      console.info("Checkout expired", { event: event.id, charge: event.data.charge });
      return;
    case "charge.pending":
    case "refund.succeeded":
    case "refund.failed":
      return;
    default:
      // A newer event type. Acknowledge it so delivery does not retry forever.
      return;
  }
}
