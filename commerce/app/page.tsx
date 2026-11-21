import Link from "next/link";
import { ProductCard, ProductGrid } from "@/components/product-card";
import { getProducts } from "@/lib/catalog";

export default async function HomePage() {
  const products = await getProducts();
  const [hero, ...featured] = products.filter((product) => product.featured);

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6">
      <section className="pt-10 pb-8 sm:pt-16">
        <h1 className="max-w-2xl text-[clamp(2.25rem,6vw,3.75rem)] font-semibold tracking-display">Good things, paid for simply.</h1>
        <p className="mt-4 max-w-xl text-lg text-label-secondary">Check out with USDC or other stablecoins from any wallet or exchange, on any chain. It settles in seconds.</p>
      </section>

      {hero ? (
        <section className="grid gap-3 sm:grid-cols-3 sm:grid-rows-2 sm:gap-4" aria-label="Featured">
          <div className="sm:col-span-2 sm:row-span-2"><ProductCard product={hero} size="large" priority /></div>
          {featured.slice(0, 2).map((product) => <ProductCard key={product.handle} product={product} priority />)}
        </section>
      ) : null}

      <section className="mt-16">
        <div className="mb-5 flex items-baseline justify-between">
          <h2 className="text-2xl font-semibold tracking-tight">All products</h2>
          <Link href="/search" className="text-accent hover:underline">Browse</Link>
        </div>
        <ProductGrid products={products} />
      </section>
    </div>
  );
}
