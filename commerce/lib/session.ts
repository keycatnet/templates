import "server-only";
import { cookies } from "next/headers";
import { parseStoredCart, type StoredCart } from "./cart";

const CART_COOKIE = "cart";
const ORDER_COOKIE = "keycat_order";

const options = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
};

export async function readCart(): Promise<StoredCart> {
  return parseStoredCart((await cookies()).get(CART_COOKIE)?.value);
}

export async function writeCart(cart: StoredCart): Promise<void> {
  (await cookies()).set(CART_COOKIE, JSON.stringify(cart), { ...options, maxAge: 60 * 60 * 24 * 30 });
}

/** The charge this browser last checked out with, so the return page can find it. */
export async function readOrder(): Promise<string | undefined> {
  const value = (await cookies()).get(ORDER_COOKIE)?.value;
  return value && /^chg_[a-z0-9]{1,64}$/.test(value) ? value : undefined;
}

export async function writeOrder(chargeId: string): Promise<void> {
  (await cookies()).set(ORDER_COOKIE, chargeId, { ...options, maxAge: 60 * 60 * 24 * 7 });
}
