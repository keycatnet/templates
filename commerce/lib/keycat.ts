import "server-only";
import { KeycatClient } from "@keycatpay/sdk";

let client: KeycatClient | null | undefined;

/**
 * The Keycat client, or `null` when no API key is configured. Without a key
 * the store still renders and checkout says payments are not set up, rather
 * than the build failing on a fresh deploy.
 */
export function keycat(): KeycatClient | null {
  if (client !== undefined) return client;
  const apiKey = process.env.KEYCAT_API_KEY;
  client = apiKey ? new KeycatClient({ apiKey, baseUrl: process.env.KEYCAT_API_BASE_URL || undefined }) : null;
  return client;
}
