import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center sm:px-6">
      <h1 className="text-3xl font-semibold tracking-display">Not found</h1>
      <p className="mt-3 text-label-secondary">That page doesn't exist, or the product is no longer sold.</p>
      <Link href="/" className="press mt-8 inline-block rounded-full bg-fill px-5 py-2.5 font-medium">Go to the shop</Link>
    </div>
  );
}
