# PrintForge — Designer S3 Flow

## Overview

- Design state lives entirely on the client (browser) during the design session
- Files are uploaded to S3 when the customer clicks Add to Cart — not during design, not at checkout
- S3 storage is split by company, then by order
- Each cart item has its own unique session ID and its own folder in S3
- The flow is fully reliable after upload — no browser dependency once files are in S3

---

## S3 Structure

```
designs/
  {company_id}/
    temp/
      {session_id}/        ← uploaded at Add to Cart, before order exists
    orders/
      {order_id}/
        {session_id}/      ← moved here after order is confirmed
```

---

## Full Flow

### 1. Customer designs in the designer
- All design state (canvas, text, uploaded images) is kept in the browser only
- Nothing is sent to the server or S3 during this phase

### 2. Customer clicks Add to Cart
- The designer requests a presigned upload URL from Fastify
  - Includes: product ID, token (for authorization)
  - Fastify verifies the token (see Authorization doc)
  - Fastify checks IP rate limit
  - Fastify resolves company ID from product ID
  - Fastify generates a session ID
  - Fastify loads the correct S3 credentials for that company
  - Fastify creates a presigned URL pointing to `designs/{company_id}/temp/{session_id}/`
  - Fastify inserts a record in the `designs` table with status `pending`
  - Fastify returns the presigned URL and session ID to the designer
- The designer uploads the design files directly to S3 using the presigned URL
- The designer notifies Fastify that the upload is complete
  - Fastify updates the `designs` record status to `uploaded`
- The designer passes the session ID to WordPress via `postMessage`
- WordPress attaches the session ID to the cart item meta

### 3. Customer checks out and pays
- WooCommerce creates the order with all session IDs stored in order item meta
- WooCommerce fires a webhook to Fastify containing the order ID and all session IDs
- Fastify verifies the webhook signature (see Authorization doc)

### 4. Fastify processes the order
- For each cart item, Fastify moves the files in S3:
  - From: `designs/{company_id}/temp/{session_id}/`
  - To: `designs/{company_id}/orders/{order_id}/{session_id}/`
- Fastify updates each `designs` record — sets order ID, final S3 path, status `confirmed`
- Fastify writes the S3 path back to the WooCommerce order item meta via the WC REST API

### 5. Cleanup
- An S3 lifecycle rule automatically deletes anything under `designs/{company_id}/temp/` older than 48 hours
- This covers abandoned carts, failed payments, and anything that never received an order
- No manual cleanup job required

---

## Designs Table — Status Flow

| Status | Meaning |
|---|---|
| `pending` | Presign issued, upload not yet confirmed |
| `uploaded` | Client confirmed upload, waiting for order |
| `confirmed` | Order received, files moved to final location |
| `failed` | Something went wrong during move or order processing |

---

## S3 Credentials

- **Default (your S3):** credentials stored in Fastify `.env`, files stored under `designs/{company_id}/` in the shared bucket
- **Custom (company's own S3):** credentials stored encrypted in the `company_s3` table, loaded at runtime based on company ID

---

## Key Properties

- The customer's browser only ever interacts with S3 via a short-lived presigned URL — credentials are never exposed
- After the upload completes, all remaining steps are server-side and fully reliable
- Each cart item is independent — its own session ID, its own S3 folder
- Abuse is limited by IP rate limiting on the presign endpoint and the 48-hour temp cleanup

---

## Why Upload at Add to Cart — Not Later

### Why not keep designs in localStorage until purchase?

The browser is not reliable enough for something the customer has already paid for. Failure scenarios:

- Customer pays, lands on the thank-you page, and closes the tab before any upload runs
- Browser crashes after payment completes
- Mobile Safari clears storage mid-session
- An ad blocker or privacy extension kills the upload script on the thank-you page
- Customer switches devices between designing and paying
- Thank-you page fails to load due to a network hiccup right after payment

In all of these cases the order exists, the payment went through, and the design is gone with no way to recover it. For a print shop, the design is the actual product the customer paid for — losing it is not acceptable.

### Why not upload right before payment?

The customer is at the most critical moment of the checkout flow. Problems that still apply:

- The upload may still be in progress when the customer clicks Pay — blocking payment until it finishes introduces latency and potential timeouts
- Payment can complete faster than the upload — design still not in S3
- A network drop at that exact moment loses the design
- Running a background upload during a payment redirect is unreliable, especially on mobile

There is also a UX problem — checkout is the worst possible moment to introduce any failure point.

### Why Add to Cart is the right moment

- The customer is not in a hurry
- No payment has happened yet — nothing is at stake
- It is a clean, unambiguous trigger with no competing processes
- If the upload fails, the customer can be informed immediately before they proceed
- The design is safely in S3 long before any money changes hands

The earlier the design leaves the browser, the safer the system. Add to Cart is the earliest natural trigger that makes sense.
