import { constructWebhookEvent, KeycatSignatureVerificationError } from "@keycatpay/sdk";
import { handleEvent } from "@/lib/fulfillment";

export async function POST(request: Request): Promise<Response> {
  const secret = process.env.KEYCAT_WEBHOOK_SECRET;
  // Without a secret nothing can be verified. 503 tells Keycat to retry once
  // the deployment is configured, instead of dropping the event.
  if (!secret) return new Response("Webhook secret is not configured", { status: 503 });

  let event;
  try {
    event = await constructWebhookEvent({
      // The raw body: re-serialised JSON has different bytes and will not verify.
      rawBody: await request.text(),
      signature: request.headers.get("x-keycat-signature"),
      secret,
    });
  } catch (error) {
    if (error instanceof KeycatSignatureVerificationError) {
      console.warn("Rejected Keycat webhook", { reason: error.reason });
      return new Response(null, { status: 400 });
    }
    throw error;
  }

  await handleEvent(event);
  return new Response(null, { status: 204 });
}
