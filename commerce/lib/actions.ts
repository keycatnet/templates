"use server";

import { KeycatApiError, KeycatConnectionError, type Charge } from "@keycatpay/sdk";
import { redirect } from "next/navigation";
import { newCartId, normalizeLines, priceCart, type Cart, type CartLine } from "./cart";
import { lineName } from "./cart-display";
import { isDemoStore } from "./demo";
import { keycat } from "./keycat";
import { siteUrl } from "./site";
import { readCart, readOrder, writeCart, writeOrder } from "./session";

async function saveLines(lines: CartLine[]): Promise<Cart> {
  // A new id for new contents: the id is the checkout idempotency key.
  const cart = { id: newCartId(), lines: normalizeLines(lines) };
  await writeCart(cart);
  return priceCart(cart);
}

export async function addToCart(handle: string, variant: string, quantity = 1): Promise<Cart> {
  const current = await readCart();
  return saveLines([...current.lines, { handle, variant, quantity }]);
}

export async function setQuantity(handle: string, variant: string, quantity: number): Promise<Cart> {
  const current = await readCart();
  const lines = current.lines.map((line) => (line.handle === handle && line.variant === variant ? { ...line, quantity } : line));
  return saveLines(lines);
}

const open = (charge: Charge) => charge.status === "open" && (!charge.expires_at || Date.parse(charge.expires_at) > Date.now());

/**
 * Creates a Keycat charge for the cart and sends the customer to Keycat's
 * hosted checkout. Returns an error message instead when it cannot.
 */
export async function checkout(): Promise<{ error: string; demo?: boolean }> {
  if (isDemoStore()) return { error: "This is a demo store, so checkout is turned off. Deploy your own copy to take real payments.", demo: true };
  const client = keycat();
  if (!client) return { error: "Payments are not set up yet. Add KEYCAT_API_KEY to this deployment." };

  let stored = await readCart();
  let cart = priceCart(stored);
  if (cart.lines.length === 0) return { error: "Your cart is empty." };

  const origin = siteUrl();
  let charge: Charge;
  try {
    const create = () => client.createCharge({
      // Every amount comes from the server-side catalog, never from the browser.
      amount: cart.total,
      description: cart.quantity === 1 ? lineName(cart.lines[0]!) : `${cart.quantity} items`,
      items: cart.lines.map((line) => ({ name: lineName(line), qty: line.quantity, amount: line.variant.price })),
      reference: `order_${cart.id}`,
      redirect_url: origin ? `${origin}/order` : null,
    }, { idempotencyKey: `checkout_${cart.id}` });

    charge = await create();
    // The same cart within 24 hours replays its first charge. If that checkout
    // already closed (expired, or paid in another tab), start a fresh one.
    if (!open(charge)) {
      stored = { ...stored, id: newCartId() };
      await writeCart(stored);
      cart = priceCart(stored);
      charge = await create();
    }
  } catch (error) {
    if (error instanceof KeycatApiError) {
      console.error("Keycat rejected the charge", { status: error.status, code: error.code, message: error.message });
      return { error: error.retryable ? "Checkout is busy. Try again in a moment." : "Checkout could not be started." };
    }
    if (error instanceof KeycatConnectionError) {
      console.error("Keycat could not be reached", error);
      return { error: "Checkout could not be reached. Try again in a moment." };
    }
    throw error;
  }

  await writeOrder(charge.id);
  // redirect() throws to unwind the action, so it stays outside the try.
  redirect(charge.hosted_url);
}

/**
 * Empties the cart once its order is paid. The charge is re-read from Keycat
 * so a forged call cannot clear anyone's cart early, and only the cart that
 * produced the order is cleared, not one edited since.
 */
export async function clearPaidCart(): Promise<Cart | undefined> {
  const client = keycat();
  const chargeId = await readOrder();
  if (!client || !chargeId) return undefined;
  const [charge, cart] = await Promise.all([client.retrieveCharge(chargeId), readCart()]);
  if (charge.status !== "paid" || charge.reference !== `order_${cart.id}`) return undefined;
  return saveLines([]);
}
