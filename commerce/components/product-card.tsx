import Image from "next/image";
import Link from "next/link";
import clsx from "clsx";
import { lowestPrice, type Product } from "@/lib/catalog";
import { formatPrice } from "@/lib/money";

export function ProductCard({ product, size = "default", priority = false }: { product: Product; size?: "default" | "large"; priority?: boolean }) {
  const from = product.variants.some((variant) => variant.price !== product.variants[0]!.price);
  return (
    <Link href={`/product/${product.handle}`} className="group press block h-full">
      <div className={clsx("relative h-full overflow-hidden rounded-3xl", size === "large" ? "min-h-80 sm:min-h-[28rem]" : "aspect-square")} style={{ backgroundColor: product.tint }}>
        <Image
          src={product.image}
          alt={product.title}
          fill
          sizes={size === "large" ? "(min-width: 640px) 66vw, 100vw" : "(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"}
          className="object-contain p-10 transition-transform duration-500 ease-spring group-hover:scale-105"
          priority={priority}
          unoptimized
        />
        <div className="absolute inset-x-3 bottom-3 flex items-center justify-between gap-2 rounded-full bg-white/80 py-1.5 pr-1.5 pl-4 text-sm text-[#1d1d1f] backdrop-blur-md">
          <span className="truncate font-medium">{product.title}</span>
          <span className="shrink-0 rounded-full bg-[#1d1d1f] px-3 py-1 font-medium text-white">
            {from ? "From " : ""}{formatPrice(lowestPrice(product))}
          </span>
        </div>
      </div>
    </Link>
  );
}

export function ProductGrid({ products }: { products: Product[] }) {
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
      {products.map((product) => <li key={product.handle}><ProductCard product={product} /></li>)}
    </ul>
  );
}

export function ProductGridSkeleton() {
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4" aria-hidden>
      {Array.from({ length: 8 }, (_, index) => <li key={index} className="aspect-square animate-pulse rounded-3xl bg-fill" />)}
    </ul>
  );
}
