/**
 * Prices are dollars-and-cents strings, the format Keycat's API takes, and all
 * arithmetic happens in integer cents so a cart total never picks up a float
 * rounding error.
 */

export function toCents(amount: string): number {
  if (!/^\d+(\.\d{1,2})?$/.test(amount)) throw new Error(`Not a price: ${amount}`);
  const [whole = "0", fraction = ""] = amount.split(".");
  return Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
}

export function fromCents(cents: number): string {
  return `${Math.floor(cents / 100)}.${String(cents % 100).padStart(2, "0")}`;
}

const formatter = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

export function formatPrice(amount: string): string {
  return formatter.format(toCents(amount) / 100);
}
