/**
 * The public HTTPS origin Keycat should send customers back to after paying.
 * Keycat accepts only HTTPS redirects, so local development gets none and the
 * customer simply stays on the Keycat receipt.
 */
export function siteUrl(): string | undefined {
  const configured = process.env.NEXT_PUBLIC_SITE_URL
    || (process.env.VERCEL_PROJECT_PRODUCTION_URL && `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`)
    || (process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}`);
  if (!configured) return undefined;
  try {
    const url = new URL(configured);
    return url.protocol === "https:" ? url.origin : undefined;
  } catch {
    return undefined;
  }
}
