/**
 * A public demo of this template sets `KEYCAT_DEMO_STORE=1`: it browses like a
 * real store and turns checkout off, so a visitor can never pay for products
 * that do not exist. A deployment without an API key is not a demo; it is a
 * store still being set up, and says so instead.
 */
export function isDemoStore(): boolean {
  return process.env.KEYCAT_DEMO_STORE === "1";
}

export const DEPLOY_URL = "https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fkeycatnet%2Ftemplates%2Ftree%2Fmain%2Fcommerce&project-name=keycat-commerce&env=KEYCAT_API_KEY,KEYCAT_WEBHOOK_SECRET&envDescription=Your%20Keycat%20secret%20API%20key%20and%20webhook%20signing%20secret&envLink=https%3A%2F%2Fdocs.keycat.net%2Fquickstart";
