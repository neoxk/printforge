# Products HTTP API

All endpoints are prefixed with `/api/products`. Protected endpoints require `Authorization: Bearer <accessToken>`.

---

## Product list and dimensions

```
GET   /api/products          # list all synced products for the current integration (JWT)
PATCH /api/products/:id      # update product dimensions (JWT)
```

**PATCH body:**
```json
{
  "widthMm": 85,
  "heightMm": 55
}
```

Both fields are nullable - pass `null` to clear a fixed dimension and switch the product to custom-dimension mode.

---

## Public configuration endpoints

These are called by the customer-facing configurator iframe. No auth required.

```
GET /api/products/:id/config
GET /api/products/woo/:wooProductId/config
```

Both return the same shape. The `/woo/` variant resolves the product by WooCommerce product ID instead of the PrintForge UUID.

**Response:**
```json
{
  "dimensions": { "type": "fixed", "widthMm": 85, "heightMm": 55 },
  "containers": [
    {
      "id": "uuid",
      "name": "Paper type",
      "containerType": "SINGLE_SELECT",
      "sortOrder": 0,
      "isHidden": false,
      "isRequired": true,
      "defaultItemId": "uuid-or-null",
      "items": [
        {
          "id": "uuid",
          "name": "Coated 135g",
          "slug": "coated-135g",
          "priceUnit": 0.10,
          "calculationBasis": "YIELD_PCS",
          "lengthMm": 450,
          "widthMm": 330,
          "sortOrder": 0
        }
      ]
    }
  ]
}
```

**`dimensions` field:**

| `type` | Shape | Meaning |
|---|---|---|
| `"fixed"` | `{ type, widthMm, heightMm }` | Dimensions are predetermined; configurator does not show dimension inputs |
| `"custom"` | `{ type }` | Customer must enter dimensions; configurator shows width × height inputs |

**Container fields:**

| Field | Type | Description |
|---|---|---|
| `id` | `string (uuid)` | Container ID |
| `name` | `string` | Display label for this selection group |
| `containerType` | `SINGLE_SELECT \| MULTI_SELECT \| AUTO_APPLIED` | Selection mechanic |
| `isHidden` | `boolean` | If `true`, container is not shown in the customer UI |
| `isRequired` | `boolean` | If `true`, customer must select at least one item before proceeding |
| `defaultItemId` | `string (uuid) \| null` | Item pre-selected on load; `null` means no default |
| `items` | `array` | Ordered list of items in this container |

**Item fields:**

| Field | Type | Description |
|---|---|---|
| `id` | `string (uuid)` | `OptionItem` ID - pass this in `selectedItemIds[]` to `POST /api/pricing/calculate` |
| `name` | `string` | Display label (container-level override applied if set, otherwise the library item name) |
| `slug` | `string` | Stable readable identifier from the item library |
| `priceUnit` | `number` | Price per calculation unit |
| `calculationBasis` | `string` | How the price is calculated - see [pricing/overview.md](../pricing/overview.md) |
| `lengthMm` / `widthMm` | `number \| null` | Sheet or roll dimensions used by the pricing engine |

**Errors:**

| Status | Condition |
|---|---|
| `404` | Product not found |

---

## Print areas

```
GET /api/products/:id/print-areas               # get print area config (no auth - public)
GET /api/products/woo/:wooProductId/print-areas # same, by WooCommerce product ID (no auth)
PUT /api/products/:id/print-areas               # save print area config (JWT)
```

The `views` field is a JSON blob describing all canvas views, their background images, canvas dimensions, and the print area rectangles within each view. The designer iframe reads the public GET to render the canvas; the admin uses PUT to save changes.

---

## Containers

All container endpoints require JWT auth.

```
GET    /api/products/:id/containers              # list containers ordered by sortOrder
POST   /api/products/:id/containers              # create container
GET    /api/products/:id/containers/:cid         # get single container with its items
PUT    /api/products/:id/containers/:cid         # update container
DELETE /api/products/:id/containers/:cid         # delete container and all its item slots
```

**Create / update body:**
```json
{
  "name": "Paper type",
  "containerType": "SINGLE_SELECT",
  "sortOrder": 0,
  "defaultItemId": "uuid-or-null",
  "isHidden": false,
  "isRequired": true
}
```

`containerType` values:

| Value | Meaning |
|---|---|
| `SINGLE_SELECT` | Customer picks exactly one item |
| `MULTI_SELECT` | Customer can pick multiple items |
| `AUTO_APPLIED` | Item is always included, not shown as a choice |

---

## Items within a container

All item endpoints require JWT auth.

```
GET    /api/products/:id/containers/:cid/items              # list item slots
POST   /api/products/:id/containers/:cid/items              # add an OptionItem to this container
PATCH  /api/products/:id/containers/:cid/items/:itemId      # override priceUnit or name for this slot
DELETE /api/products/:id/containers/:cid/items/:itemId      # remove item from container
```

**Add item body:**
```json
{
  "itemId": "uuid",
  "sortOrder": 0,
  "priceUnit": 0.09,
  "name": "Custom label"
}
```

`priceUnit` and `name` are optional per-container overrides. The same `OptionItem` from the global library can appear in multiple containers with different prices or display names without modifying the original item.
