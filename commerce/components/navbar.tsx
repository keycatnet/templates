import Link from "next/link";
import { CartButton, CartDrawer } from "./cart/cart-drawer";
import { COLLECTIONS } from "@/lib/catalog";

export function Navbar({ storeName }: { storeName: string }) {
  return (
    <header className="sticky top-0 z-40 border-b border-separator bg-background/80 backdrop-blur-xl backdrop-saturate-150">
      <nav className="mx-auto flex h-14 max-w-6xl items-center gap-6 px-4 sm:px-6" aria-label="Main">
        <Link href="/" className="shrink-0 font-semibold tracking-tight">{storeName}</Link>
        <ul className="hidden gap-5 text-sm text-label-secondary md:flex">
          <li><Link href="/search" className="hover:text-label">All</Link></li>
          {COLLECTIONS.map((collection) => (
            <li key={collection.handle}><Link href={`/search?collection=${collection.handle}`} className="hover:text-label">{collection.title}</Link></li>
          ))}
        </ul>
        <form action="/search" role="search" className="ml-auto w-full max-w-56">
          <label className="sr-only" htmlFor="q">Search products</label>
          <input id="q" name="q" type="search" placeholder="Search" className="w-full rounded-full bg-fill px-4 py-1.5 text-sm placeholder:text-label-tertiary focus:outline-none focus-visible:ring-2 focus-visible:ring-accent" />
        </form>
        <CartButton />
      </nav>
      <CartDrawer />
    </header>
  );
}
