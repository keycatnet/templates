"use client";

import { createContext, use, useState, type ReactNode } from "react";
import type { Cart } from "@/lib/cart";

type CartState = {
  initial: Promise<Cart>;
  latest: Cart | null;
  setLatest: (cart: Cart) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
};

const CartContext = createContext<CartState | null>(null);

export function CartProvider({ cart, children }: { cart: Promise<Cart>; children: ReactNode }) {
  // The server's cart arrives as a promise; after any change, the cart the
  // action returned is the truth until the next navigation re-reads it.
  const [latest, setLatest] = useState<Cart | null>(null);
  const [open, setOpen] = useState(false);
  return <CartContext value={{ initial: cart, latest, setLatest, open, setOpen }}>{children}</CartContext>;
}

function useCartState(): CartState {
  const state = use(CartContext);
  if (!state) throw new Error("Cart components must be inside CartProvider");
  return state;
}

/** The current cart. Suspends until the cookie has been read, so render it inside Suspense. */
export function useCart(): Cart {
  const state = useCartState();
  const initial = use(state.initial);
  return state.latest ?? initial;
}

/** Cart controls that never suspend, for buttons on prerendered pages. */
export function useCartControls() {
  const { setLatest, open, setOpen } = useCartState();
  return { update: setLatest, open, setOpen };
}
