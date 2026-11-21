// Points Keycat's webhook delivery at this store and prints the signing secret.
//
//   KEYCAT_API_KEY=sk_live_… npm run setup:webhook -- https://your-shop.example/api/keycat/webhook
//
// The secret is shown once. Running this again replaces both the URL and the
// secret immediately, so update KEYCAT_WEBHOOK_SECRET right after.
import { KeycatApiError, KeycatClient } from "@keycatpay/sdk";

const url = process.argv[2];
const apiKey = process.env.KEYCAT_API_KEY;

if (!apiKey) {
  console.error("Set KEYCAT_API_KEY first (in .env.local or the environment).");
  process.exit(1);
}
if (!url || !url.startsWith("https://")) {
  console.error("Usage: npm run setup:webhook -- https://your-shop.example/api/keycat/webhook");
  process.exit(1);
}

try {
  const keycat = new KeycatClient({ apiKey, baseUrl: process.env.KEYCAT_API_BASE_URL || undefined });
  const endpoint = await keycat.configureWebhookEndpoint({ url });
  console.error(`Webhooks now go to ${endpoint.url}.`);
  console.error("Set this as KEYCAT_WEBHOOK_SECRET, then redeploy:\n");
  // Only the secret goes to stdout, so it can be piped: … | vercel env add KEYCAT_WEBHOOK_SECRET production
  console.log(endpoint.secret);
} catch (error) {
  console.error(error instanceof KeycatApiError ? `Keycat refused: ${error.code}: ${error.message}` : error);
  process.exit(1);
}
