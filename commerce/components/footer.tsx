import Link from "next/link";
import { COLLECTIONS } from "@/lib/catalog";

export function Footer({ storeName }: { storeName: string }) {
  return (
    <footer className="mt-24 border-t border-separator text-sm text-label-secondary">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-3 sm:px-6">
        <div>
          <p className="font-semibold text-label">{storeName}</p>
          <p className="mt-2 max-w-xs">Pay by card or in the coin you hold. Payments settle in USDC on Base, straight to the store.</p>
        </div>
        <ul className="flex flex-col gap-2">
          {COLLECTIONS.map((collection) => (
            <li key={collection.handle}><Link href={`/search?collection=${collection.handle}`} className="hover:text-label">{collection.title}</Link></li>
          ))}
        </ul>
        <p className="sm:text-right">
          Payments by <a href="https://keycat.net" className="font-medium text-label hover:underline" rel="noopener">Keycat</a>
        </p>
      </div>
    </footer>
  );
}
