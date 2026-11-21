import { DEPLOY_URL, isDemoStore } from "@/lib/demo";

export function DemoBanner() {
  if (!isDemoStore()) return null;
  return (
    <div className="bg-fill px-4 py-2 text-center text-sm text-label-secondary">
      This is a demo of Keycat's storefront template. Checkout is turned off.{" "}
      <a href={DEPLOY_URL} className="font-medium text-accent hover:underline" rel="noopener">Deploy your own</a>
    </div>
  );
}
