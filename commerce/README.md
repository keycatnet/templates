# Keycat Commerce

A small storefront that takes payments by card, or in any coin from any
wallet or exchange on a supported network. Payments settle in USDC on Base,
straight into your own Keycat business account. Built with Next.js 16, React 19, Tailwind CSS 4, and
[`@keycatpay/sdk`](https://www.npmjs.com/package/@keycatpay/sdk).

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fkeycatnet%2Ftemplates%2Ftree%2Fmain%2Fcommerce&project-name=keycat-commerce&env=KEYCAT_API_KEY,KEYCAT_WEBHOOK_SECRET&envDescription=Your%20Keycat%20secret%20API%20key%20and%20webhook%20signing%20secret&envLink=https%3A%2F%2Fdocs.keycat.net%2Fquickstart)

## What's included

- A home page, product pages with sizes, and search with collection filters
  and sorting. All of them prerender.
- A cart drawer kept in an httpOnly cookie that holds only product references,
  never prices.
- Checkout that creates a Keycat charge from server-side prices and sends the
  customer to Keycat's hosted checkout.
- An order page the customer returns to after paying. It reads the charge from
  Keycat, updates itself while the payment settles, and empties the cart once
  the order is paid.
- A webhook route, `/api/keycat/webhook`, that verifies each signature and
  passes the event to `lib/fulfillment.ts`.
- Light and dark mode, reduced motion, keyboard and screen-reader support, and
  product structured data.

## Set up

1. **Get an API key.** Open your business account at
   [app.keycat.net](https://app.keycat.net) and create a key under
   **Integrate**. It is shown once.

2. **Deploy.** Use the button above, or run locally:

   ```bash
   cp .env.example .env.local   # add KEYCAT_API_KEY
   npm install
   npm run dev
   ```

3. **Connect webhooks** once you have a public URL:

   ```bash
   npm run setup:webhook -- https://your-shop.example/api/keycat/webhook
   ```

   It prints the signing secret, which Keycat shows only this once. Set it as
   `KEYCAT_WEBHOOK_SECRET` in Vercel and redeploy. Running the script again
   replaces the secret immediately.

The store builds and browses without any keys. Checkout says payments are not
set up until `KEYCAT_API_KEY` exists.

## Environment

| Variable | Required | Purpose |
| --- | --- | --- |
| `KEYCAT_API_KEY` | Yes | Secret key (`sk_…`). Server-only. |
| `KEYCAT_WEBHOOK_SECRET` | For fulfilment | Verifies webhook deliveries (`whsec_…`). |
| `NEXT_PUBLIC_SITE_URL` | No | Public HTTPS origin for the after-payment redirect. On Vercel the production domain is used when unset. |
| `NEXT_PUBLIC_STORE_NAME` | No | Shown in the header, footer, and page titles. |
| `KEYCAT_API_BASE_URL` | No | A local Keycat API, for development. |
| `KEYCAT_DEMO_STORE` | No | Set to `1` for a public demo: a banner says so and checkout is turned off, so nobody pays for products that do not exist. |

## Make it yours

- Products live in `lib/catalog.ts`. Everything else reads them through
  `getProducts`, `getProduct`, and `findVariant`, so you can swap in a CMS or a
  database there.
- `lib/fulfillment.ts` gets every verified event. `charge.paid` means ship it.
  `charge.underpaid` means money arrived short, so do not ship.
  `charge.reversed` means a settled payment was undone by a reorganisation of
  the Base network, so hold the order. `refund.succeeded` and `refund.failed`
  report refunds you issued from the dashboard. Delivery is at least once:
  make each handler idempotent on `event.id`.
- Colours are semantic tokens in `app/globals.css`, with light and dark
  values.

## How payment works

1. Checkout (`lib/actions.ts`) re-prices the cart from the catalog. It
   creates a charge with the line items and the reference `order_<cart id>`,
   uses the cart id as the idempotency key, and redirects to `charge.hosted_url`.
   A double-clicked checkout makes one charge. Any change to the cart rotates its
   id, so an edited cart gets a new charge. If the replayed charge has already
   closed, checkout starts a fresh one.
2. The customer pays on Keycat's hosted checkout, by card or from any
   supported network. Keycat routes the payment and settles USDC on Base to
   you.
3. The customer comes back to `/order`, which shows the charge's real
   status. Your webhook handler is what fulfils, so an order ships even if the
   customer closes the tab before returning.
4. You issue refunds from [app.keycat.net](https://app.keycat.net). Each
   one is confirmed with your passkey, because only you can move money out of
   your account.
