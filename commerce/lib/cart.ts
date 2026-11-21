import "server-only";
import { MAX_QUANTITY } from "./cart-display";
import { findVariant, type Product, type Variant } from "./catalog";
import { fromCents, toCents } from "./money";

/** What the cookie holds: references and quantities, never prices. */
export type CartLine = { handle: string; variant: string; quantity: number };
export type StoredCart = {
  /**
   * Changes whenever the contents change. Checkout uses it as the Keycat
   * idempotency key, so a double-clicked checkout makes one charge, and an
   * edited cart makes a new one.
   */
  id: string;
  lines: CartLine[];
};

export type PricedLine = Omit<CartLine, "variant"> & { product: Product; variant: Variant; lineTotal: string };
export type Cart = { id: string; lines: PricedLine[]; quantity: number; total: string };

/** Keycat accepts up to 50 line items on a charge. */
export const MAX_LINES = 50;

export function newCartId(): string {
  return crypto.randomUUID().replaceAll("-", "");
}

/**
 * Parses an untrusted cookie value; anything malformed is an empty cart. An
 * empty cart has no id: nothing checks it out, and every write mints one. A
 * random id here would run inside a prerender, which Cache Components refuses.
 */
export function parseStoredCart(value: string | undefined): StoredCart {
  try {
    const parsed = JSON.parse(value ?? "") as Partial<StoredCart>;
    if (typeof parsed.id !== "string" || !/^[0-9a-f]{32}$/.test(parsed.id) || !Array.isArray(parsed.lines)) throw new Error("Invalid cart");
    return { id: parsed.id, lines: normalizeLines(parsed.lines) };
  } catch {
    return { id: "", lines: [] };
  }
}

/** Drops unknown or sold-out variants, merges duplicates, and clamps quantities. */
export function normalizeLines(lines: unknown[]): CartLine[] {
  const merged = new Map<string, CartLine>();
  for (const raw of lines) {
    if (!raw || typeof raw !== "object") continue;
    const { handle, variant, quantity } = raw as Record<string, unknown>;
    if (typeof handle !== "string" || typeof variant !== "string" || !Number.isInteger(quantity)) continue;
    if (!findVariant(handle, variant)?.variant.available) continue;
    const key = `${handle}:${variant}`;
    const total = (merged.get(key)?.quantity ?? 0) + (quantity as number);
    if (total < 1) { merged.delete(key); continue; }
    merged.set(key, { handle, variant, quantity: Math.min(total, MAX_QUANTITY) });
  }
  return [...merged.values()].slice(0, MAX_LINES);
}

export function priceCart(cart: StoredCart): Cart {
  const lines: PricedLine[] = [];
  let totalCents = 0;
  let quantity = 0;
  for (const line of cart.lines) {
    const found = findVariant(line.handle, line.variant);
    if (!found) continue;
    const lineCents = toCents(found.variant.price) * line.quantity;
    totalCents += lineCents;
    quantity += line.quantity;
    lines.push({ ...line, product: found.product, variant: found.variant, lineTotal: fromCents(lineCents) });
  }
  return { id: cart.id, lines, quantity, total: fromCents(totalCents) };
}
