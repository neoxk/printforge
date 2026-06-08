# PrintForge - Authorization

PrintForge uses two distinct authorization mechanisms depending on who is making the request.

---

## 1. Admin SPA - JWT

Requests from the Admin SPA to protected backend endpoints are authorized with a **JWT access token**.

- The store owner logs in via `POST /api/auth/login` and receives an `accessToken` (short-lived) and a `refreshToken` (long-lived)
- Every protected API call includes `Authorization: Bearer <accessToken>`
- When the access token expires, the Admin SPA automatically exchanges the refresh token for a new one via `POST /api/auth/refresh`
- Protected routes use the `preHandler: authenticate` middleware, which verifies the token with `JWT_SECRET`

Unprotected routes (public endpoints used by the customer-facing configurator) do not require a token:

| Endpoint | Reason |
|---|---|
| `GET /api/products/:id/config` | Configurator reads product options |
| `GET /api/products/woo/:id/config` | Same, by WooCommerce product ID |
| `GET /api/products/:id/print-areas` | Designer reads print area config |
| `GET /api/products/woo/:id/print-areas` | Same, by WooCommerce product ID |
| `POST /api/pricing/calculate` | Real-time price calculation |
| `POST /api/pricing/quantity-table` | Quantity price table |
| `POST /api/storage/temp/:sessionId` | Customer uploads design preview |
| `POST /api/auth/register` | First-time setup only |
| `POST /api/auth/login` | Login |
| `POST /api/auth/refresh` | Token refresh |
| `GET /api/auth/firstTime` | Check if system is initialized |

---

## 2. WooCommerce Plugin - Shared Secret (`x-printforge-secret`)

Server-to-server calls from the WordPress plugins to the Fastify backend are authorized with a **webhook secret** - a random string stored in the `IntegrationConnection` record in the database.

**How it works:**

1. When a `IntegrationConnection` is created or first saved, Fastify auto-generates a random `webhookSecret` for that connection
2. The store owner copies this secret from the Admin UI (Integration settings page) into the WordPress plugin settings
3. On every server-to-server API call, the plugin sends the secret in the `x-printforge-secret` request header
4. The `authenticateWebhook` middleware looks up all integration connections and checks whether any holds a matching secret
5. If a match is found, the request is authorized; otherwise `401 Unauthorized` is returned

**Protected endpoints** (called server-side by the WooCommerce plugins):

| Endpoint | Purpose |
|---|---|
| `POST /api/storage/orders/:orderId/assign` | Move temp design files to a confirmed order |
| `GET /api/storage/orders/:orderId/:sessionId` | List design files for an order line item |
| `GET /api/storage/orders/:orderId/:sessionId/:filename` | Download a single design file |

**Secret lifecycle:**

- **Setup:** Fastify generates the secret automatically when the integration is configured. The store owner copies it once from the Admin UI into the plugin settings.
- **Rotation:** A new secret can be generated from the Admin UI. The plugin settings must be updated manually to match. The old secret stops working immediately.

---

## Summary

| Who calls | Authorization method | Header |
|---|---|---|
| Admin SPA | JWT Bearer token | `Authorization: Bearer <token>` |
| WooCommerce plugin (server-to-server) | Shared secret | `x-printforge-secret: <secret>` |
| Customer-facing configurator iframe | None (public endpoint) | - |
