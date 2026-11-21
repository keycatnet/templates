/**
 * The catalog. Replace this file with your own products, or with reads from a
 * CMS or database: the rest of the store only uses the functions below.
 *
 * Prices live here, on the server, and nowhere else. The cart a browser sends
 * holds product handles, variant ids, and quantities; checkout re-prices every
 * line from this catalog, so an edited cookie cannot change what a customer pays.
 */

export type Variant = { id: string; title: string; price: string; available: boolean };

export type Product = {
  handle: string;
  title: string;
  description: string;
  collection: CollectionHandle;
  image: string;
  /** Shown as the product's background, behind its transparent image. */
  tint: string;
  variants: Variant[];
  featured?: boolean;
};

export const COLLECTIONS = [
  { handle: "apparel", title: "Apparel" },
  { handle: "accessories", title: "Accessories" },
  { handle: "stationery", title: "Stationery" },
] as const;

export type CollectionHandle = (typeof COLLECTIONS)[number]["handle"];

const sizes = (price: string, soldOut: string[] = []): Variant[] =>
  ["S", "M", "L", "XL"].map((size) => ({ id: size.toLowerCase(), title: size, price, available: !soldOut.includes(size) }));

const one = (price: string): Variant[] => [{ id: "default", title: "Default", price, available: true }];

const PRODUCTS: Product[] = [
  {
    handle: "everyday-tee",
    title: "Everyday Tee",
    description: "Heavyweight organic cotton with a relaxed fit. Garment-dyed, so it is soft on the first wear and stays that way.",
    collection: "apparel",
    image: "/products/tee.svg",
    tint: "#E8F0FE",
    variants: sizes("32.00", ["XL"]),
    featured: true,
  },
  {
    handle: "studio-hoodie",
    title: "Studio Hoodie",
    description: "Brushed fleece, a lined hood, and a kangaroo pocket deep enough for a phone. Made to be worn every day for years.",
    collection: "apparel",
    image: "/products/hoodie.svg",
    tint: "#FDECEA",
    variants: sizes("78.00"),
    featured: true,
  },
  {
    handle: "crew-socks",
    title: "Crew Socks",
    description: "Combed cotton with a cushioned sole and a rib that stays up. Sold as a pair.",
    collection: "apparel",
    image: "/products/socks.svg",
    tint: "#E6F4EA",
    variants: [
      { id: "s-m", title: "S–M", price: "14.00", available: true },
      { id: "l-xl", title: "L–XL", price: "14.00", available: true },
    ],
  },
  {
    handle: "field-cap",
    title: "Field Cap",
    description: "Six-panel washed twill with a brass buckle. Unstructured, so it packs flat.",
    collection: "accessories",
    image: "/products/cap.svg",
    tint: "#FEF7E0",
    variants: one("28.00"),
    featured: true,
  },
  {
    handle: "market-tote",
    title: "Market Tote",
    description: "12 oz canvas with a gusseted base and long handles that sit comfortably on a shoulder.",
    collection: "accessories",
    image: "/products/tote.svg",
    tint: "#F3E8FD",
    variants: one("24.00"),
  },
  {
    handle: "ceramic-mug",
    title: "Ceramic Mug",
    description: "Stoneware with a matte glaze outside and gloss inside. Holds 12 oz; dishwasher and microwave safe.",
    collection: "accessories",
    image: "/products/mug.svg",
    tint: "#E8F0FE",
    variants: one("22.00"),
  },
  {
    handle: "dot-grid-notebook",
    title: "Dot Grid Notebook",
    description: "A5, 192 numbered pages of 100 gsm paper that takes fountain pen without bleeding. Lies flat.",
    collection: "stationery",
    image: "/products/notebook.svg",
    tint: "#FDECEA",
    variants: one("18.00"),
  },
  {
    handle: "sticker-sheet",
    title: "Sticker Sheet",
    description: "Eight die-cut vinyl stickers, weatherproof and laptop-safe.",
    collection: "stationery",
    image: "/products/stickers.svg",
    tint: "#E6F4EA",
    variants: one("6.00"),
  },
];

export type Sort = "featured" | "price-asc" | "price-desc" | "name";

export const SORTS: Array<{ value: Sort; title: string }> = [
  { value: "featured", title: "Featured" },
  { value: "price-asc", title: "Price: low to high" },
  { value: "price-desc", title: "Price: high to low" },
  { value: "name", title: "Name" },
];

export function lowestPrice(product: Product): string {
  return product.variants.reduce((lowest, variant) => (Number(variant.price) < Number(lowest) ? variant.price : lowest), product.variants[0]!.price);
}

export async function getProducts(options: { query?: string; collection?: string; sort?: Sort } = {}): Promise<Product[]> {
  "use cache";
  const query = options.query?.trim().toLowerCase();
  let products = PRODUCTS.filter((product) =>
    (!options.collection || product.collection === options.collection)
    && (!query || `${product.title} ${product.description}`.toLowerCase().includes(query)));
  switch (options.sort) {
    case "price-asc": products = products.toSorted((a, b) => Number(lowestPrice(a)) - Number(lowestPrice(b))); break;
    case "price-desc": products = products.toSorted((a, b) => Number(lowestPrice(b)) - Number(lowestPrice(a))); break;
    case "name": products = products.toSorted((a, b) => a.title.localeCompare(b.title)); break;
    default: products = products.toSorted((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)));
  }
  return products;
}

export async function getProduct(handle: string): Promise<Product | undefined> {
  "use cache";
  return PRODUCTS.find((product) => product.handle === handle);
}

/** Synchronous lookup for pricing a cart, where a cached read adds nothing. */
export function findVariant(handle: string, variantId: string): { product: Product; variant: Variant } | undefined {
  const product = PRODUCTS.find((candidate) => candidate.handle === handle);
  const variant = product?.variants.find((candidate) => candidate.id === variantId);
  return product && variant ? { product, variant } : undefined;
}
