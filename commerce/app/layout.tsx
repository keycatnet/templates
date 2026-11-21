import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { CartProvider } from "@/components/cart/cart-context";
import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import { priceCart } from "@/lib/cart";
import { readCart } from "@/lib/session";
import { siteUrl } from "@/lib/site";
import "./globals.css";

const name = process.env.NEXT_PUBLIC_STORE_NAME || "Keycat Store";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl() ?? "http://localhost:3000"),
  title: { default: name, template: `%s · ${name}` },
  description: "A storefront that takes stablecoin payments from any chain, settled in USDC on Base with Keycat.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f5f7" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  // The cart reads a cookie, so it streams in; everything else prerenders.
  const cart = readCart().then(priceCart);
  return (
    <html lang="en">
      <body className="flex min-h-dvh flex-col">
        <CartProvider cart={cart}>
          <Navbar storeName={name} />
          <main className="flex-1">{children}</main>
          <Footer storeName={name} />
        </CartProvider>
      </body>
    </html>
  );
}
