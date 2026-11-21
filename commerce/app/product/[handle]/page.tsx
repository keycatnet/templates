import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToCart } from "@/components/cart/add-to-cart";
import { ProductGrid } from "@/components/product-card";
import { COLLECTIONS, getProduct, getProducts, lowestPrice } from "@/lib/catalog";

type Props = { params: Promise<{ handle: string }> };

export async function generateStaticParams() {
  return (await getProducts()).map((product) => ({ handle: product.handle }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getProduct((await params).handle);
  if (!product) return {};
  return { title: product.title, description: product.description, openGraph: { images: [product.image] } };
}

export default async function ProductPage({ params }: Props) {
  const product = await getProduct((await params).handle);
  if (!product) notFound();
  const collection = COLLECTIONS.find((candidate) => candidate.handle === product.collection);
  const related = (await getProducts({ collection: product.collection })).filter((candidate) => candidate.handle !== product.handle);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description,
    offers: { "@type": "AggregateOffer", priceCurrency: "USD", lowPrice: lowestPrice(product), availability: product.variants.some((variant) => variant.available) ? "https://schema.org/InStock" : "https://schema.org/OutOfStock" },
  };

  return (
    <div className="mx-auto max-w-6xl px-4 pt-6 sm:px-6 sm:pt-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replaceAll("<", "\\u003c") }} />
      <nav aria-label="Breadcrumb" className="mb-6 text-sm text-label-secondary">
        <Link href="/search" className="hover:text-label">Shop</Link>
        {collection ? <> / <Link href={`/search?collection=${collection.handle}`} className="hover:text-label">{collection.title}</Link></> : null}
      </nav>
      <div className="grid gap-8 md:grid-cols-2 md:gap-12">
        <div className="relative aspect-square overflow-hidden rounded-3xl" style={{ backgroundColor: product.tint }}>
          <Image src={product.image} alt={product.title} fill sizes="(min-width: 768px) 50vw, 100vw" className="object-contain p-12" priority unoptimized />
        </div>
        <div className="flex flex-col gap-6 md:pt-6">
          <h1 className="text-4xl font-semibold tracking-display">{product.title}</h1>
          <AddToCart product={product} />
          <p className="max-w-prose text-label-secondary">{product.description}</p>
          <ul className="space-y-1 text-sm text-label-secondary">
            <li>Free shipping on every order</li>
            <li>Pay by card, or in the coin you hold</li>
          </ul>
        </div>
      </div>
      {related.length ? (
        <section className="mt-20">
          <h2 className="mb-5 text-2xl font-semibold tracking-tight">More from {collection?.title ?? "the shop"}</h2>
          <ProductGrid products={related} />
        </section>
      ) : null}
    </div>
  );
}
