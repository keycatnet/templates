"use client";

import { useState, useTransition } from "react";
import { addToCart } from "@/lib/actions";
import type { Product } from "@/lib/catalog";
import { formatPrice } from "@/lib/money";
import { useCartControls } from "./cart-context";

/** Variant choice and the add button. Client state, so the product page stays static. */
export function AddToCart({ product }: { product: Product }) {
  const { update, setOpen } = useCartControls();
  const firstAvailable = product.variants.find((variant) => variant.available) ?? product.variants[0]!;
  const [selected, setSelected] = useState(firstAvailable.id);
  const [pending, startTransition] = useTransition();
  const variant = product.variants.find((candidate) => candidate.id === selected) ?? firstAvailable;
  const choosable = product.variants.length > 1;

  const add = () => startTransition(async () => {
    update(await addToCart(product.handle, variant.id));
    setOpen(true);
  });

  return (
    <div className="flex flex-col gap-6">
      <p className="text-2xl font-semibold">{formatPrice(variant.price)}</p>
      {choosable ? (
        <fieldset>
          <legend className="mb-2 text-sm font-medium text-label-secondary">Size</legend>
          <div className="flex flex-wrap gap-2">
            {product.variants.map((option) => (
              <button
                key={option.id}
                type="button"
                disabled={!option.available}
                aria-pressed={option.id === variant.id}
                onClick={() => setSelected(option.id)}
                className="press min-w-14 rounded-full border border-separator px-4 py-2 text-sm font-medium aria-pressed:border-label aria-pressed:bg-label aria-pressed:text-background disabled:cursor-not-allowed disabled:text-label-tertiary disabled:line-through"
              >
                {option.title}
              </button>
            ))}
          </div>
        </fieldset>
      ) : null}
      <button type="button" onClick={add} disabled={pending || !variant.available} className="press w-full rounded-full bg-accent py-3.5 font-semibold text-accent-contrast disabled:opacity-60 sm:max-w-xs">
        {!variant.available ? "Sold out" : pending ? "Adding…" : "Add to cart"}
      </button>
    </div>
  );
}
