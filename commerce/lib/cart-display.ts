import type { PricedLine } from "./cart";

/**
 * The cart helpers the browser needs. Kept apart from cart.ts so client
 * components never import the catalog, and with it every price and product.
 */
export const MAX_QUANTITY = 99;

export function lineName(line: PricedLine): string {
  return line.variant.id === "default" ? line.product.title : `${line.product.title}, ${line.variant.title}`;
}
