import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import clsx from "clsx";
import { ProductGrid, ProductGridSkeleton } from "@/components/product-card";
import { COLLECTIONS, getProducts, SORTS, type Sort } from "@/lib/catalog";

export const metadata: Metadata = { title: "Shop" };

type SearchParams = Promise<{ q?: string | string[]; collection?: string | string[]; sort?: string | string[] }>;

const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

export default function SearchPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <div className="mx-auto max-w-6xl px-4 pt-8 sm:px-6">
      <Suspense fallback={<ProductGridSkeleton />}>
        <Results searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function Results({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const query = first(params.q)?.slice(0, 100);
  const collection = COLLECTIONS.find((candidate) => candidate.handle === first(params.collection));
  const sort = SORTS.find((candidate) => candidate.value === first(params.sort))?.value ?? "featured";
  const products = await getProducts({ query, collection: collection?.handle, sort });

  const href = (next: { collection?: string; sort?: Sort }) => {
    const search = new URLSearchParams();
    if (query) search.set("q", query);
    const nextCollection = "collection" in next ? next.collection : collection?.handle;
    if (nextCollection) search.set("collection", nextCollection);
    const nextSort = next.sort ?? sort;
    if (nextSort !== "featured") search.set("sort", nextSort);
    const value = search.toString();
    return value ? `/search?${value}` : "/search";
  };

  const pill = (active: boolean) => clsx("press rounded-full px-4 py-1.5 text-sm font-medium", active ? "bg-label text-background" : "bg-fill hover:bg-separator");

  return (
    <>
      <h1 className="mb-6 text-3xl font-semibold tracking-display">
        {query ? <>Results for “{query}”</> : collection?.title ?? "All products"}
      </h1>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <nav aria-label="Collections" className="flex flex-wrap gap-2">
          <Link href={href({ collection: undefined })} className={pill(!collection)}>All</Link>
          {COLLECTIONS.map((candidate) => (
            <Link key={candidate.handle} href={href({ collection: candidate.handle })} className={pill(candidate.handle === collection?.handle)}>{candidate.title}</Link>
          ))}
        </nav>
        <nav aria-label="Sort" className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
          {SORTS.map((candidate) => (
            <Link key={candidate.value} href={href({ sort: candidate.value })} aria-current={candidate.value === sort ? "true" : undefined} className="text-label-secondary hover:text-label aria-[current]:font-semibold aria-[current]:text-label">
              {candidate.title}
            </Link>
          ))}
        </nav>
      </div>
      {products.length ? <ProductGrid products={products} /> : <p className="py-16 text-center text-label-secondary">No products match. Try another search.</p>}
    </>
  );
}
