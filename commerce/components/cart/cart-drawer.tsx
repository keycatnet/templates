"use client";

import Image from "next/image";
import Link from "next/link";
import { Suspense, useActionState, useEffect, useRef, useTransition } from "react";
import { checkout, setQuantity } from "@/lib/actions";
import type { PricedLine } from "@/lib/cart";
import { lineName, MAX_QUANTITY } from "@/lib/cart-display";
import { formatPrice } from "@/lib/money";
import { useCart, useCartControls } from "./cart-context";

export function CartButton() {
  const { setOpen } = useCartControls();
  return (
    <button type="button" onClick={() => setOpen(true)} className="press relative flex size-10 items-center justify-center rounded-full hover:bg-fill" aria-label="Open cart">
      <BagIcon />
      <Suspense fallback={null}><CartCount /></Suspense>
    </button>
  );
}

function CartCount() {
  const { quantity } = useCart();
  if (!quantity) return null;
  return (
    <span className="absolute -top-0.5 -right-0.5 flex min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[0.6875rem] font-semibold leading-5 text-accent-contrast" aria-label={`${quantity} items`}>
      {quantity}
    </span>
  );
}

export function CartDrawer() {
  const { open, setOpen } = useCartControls();
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    if (open && !element.open) element.showModal();
    if (!open && element.open) element.close();
  }, [open]);

  return (
    <dialog
      ref={dialog}
      onClose={() => setOpen(false)}
      onClick={(event) => { if (event.target === event.currentTarget) setOpen(false); }}
      aria-label="Cart"
      className="fixed inset-y-0 right-0 left-auto m-0 h-dvh max-h-dvh w-full max-w-md translate-x-0 bg-surface p-0 text-label shadow-2xl transition-[translate,display,overlay] duration-300 ease-spring transition-discrete backdrop:bg-overlay starting:translate-x-full"
    >
      <div className="flex h-full flex-col">
        <header className="flex items-center justify-between border-b border-separator px-6 py-4">
          <h2 className="text-lg font-semibold">Cart</h2>
          <button type="button" onClick={() => setOpen(false)} className="press flex size-9 items-center justify-center rounded-full hover:bg-fill" aria-label="Close cart">
            <CloseIcon />
          </button>
        </header>
        <Suspense fallback={<p className="p-6 text-label-secondary">Loading…</p>}>
          <CartBody onNavigate={() => setOpen(false)} />
        </Suspense>
      </div>
    </dialog>
  );
}

function CartBody({ onNavigate }: { onNavigate: () => void }) {
  const cart = useCart();
  if (cart.lines.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
        <BagIcon className="size-10 text-label-tertiary" />
        <p className="text-label-secondary">Your cart is empty.</p>
        <Link href="/search" onClick={onNavigate} className="press rounded-full bg-fill px-5 py-2 font-medium">Browse products</Link>
      </div>
    );
  }
  return (
    <>
      <ul className="flex-1 divide-y divide-separator overflow-y-auto px-6">
        {cart.lines.map((line) => <CartLineRow key={`${line.handle}:${line.variant.id}`} line={line} onNavigate={onNavigate} />)}
      </ul>
      <footer className="border-t border-separator px-6 py-5">
        <div className="mb-1 flex justify-between text-label-secondary"><span>Shipping</span><span>Free</span></div>
        <div className="mb-4 flex justify-between text-lg font-semibold"><span>Total</span><span>{formatPrice(cart.total)}</span></div>
        <CheckoutButton />
        <p className="mt-3 text-center text-sm text-label-tertiary">Pay with USDC or other stablecoins from any chain.</p>
      </footer>
    </>
  );
}

function CartLineRow({ line, onNavigate }: { line: PricedLine; onNavigate: () => void }) {
  const { update } = useCartControls();
  const [pending, startTransition] = useTransition();
  const change = (quantity: number) => startTransition(async () => update(await setQuantity(line.handle, line.variant.id, quantity)));

  return (
    <li className={`flex gap-4 py-4 transition-opacity ${pending ? "opacity-50" : ""}`}>
      <Link href={`/product/${line.product.handle}`} onClick={onNavigate} className="relative size-20 shrink-0 overflow-hidden rounded-xl" style={{ backgroundColor: line.product.tint }}>
        <Image src={line.product.image} alt="" fill sizes="80px" className="object-contain p-2" unoptimized />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex justify-between gap-2">
          <Link href={`/product/${line.product.handle}`} onClick={onNavigate} className="truncate font-medium">{lineName(line)}</Link>
          <span className="shrink-0 font-medium">{formatPrice(line.lineTotal)}</span>
        </div>
        <span className="text-sm text-label-secondary">{formatPrice(line.variant.price)} each</span>
        <div className="mt-auto flex items-center justify-between">
          <div className="flex items-center rounded-full bg-fill">
            <button type="button" disabled={pending} onClick={() => change(line.quantity - 1)} className="press flex size-8 items-center justify-center" aria-label={`Remove one ${lineName(line)}`}>−</button>
            <span className="w-6 text-center text-sm tabular-nums" aria-live="polite">{line.quantity}</span>
            <button type="button" disabled={pending || line.quantity >= MAX_QUANTITY} onClick={() => change(line.quantity + 1)} className="press flex size-8 items-center justify-center disabled:opacity-40" aria-label={`Add one ${lineName(line)}`}>+</button>
          </div>
          <button type="button" disabled={pending} onClick={() => change(0)} className="text-sm text-label-secondary hover:text-danger">Remove</button>
        </div>
      </div>
    </li>
  );
}

function CheckoutButton() {
  const [state, action, pending] = useActionState(async () => checkout(), null);
  return (
    <form action={action}>
      <button type="submit" disabled={pending} className="press w-full rounded-full bg-accent py-3.5 font-semibold text-accent-contrast disabled:opacity-60">
        {pending ? "Starting checkout…" : "Check out"}
      </button>
      {state?.error ? <p role="alert" className="mt-3 text-center text-sm text-danger">{state.error}</p> : null}
    </form>
  );
}

function BagIcon({ className = "size-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M5 8h14l-1 12H6L5 8Z" /><path d="M9 8V6a3 3 0 0 1 6 0v2" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="size-4" aria-hidden>
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}
