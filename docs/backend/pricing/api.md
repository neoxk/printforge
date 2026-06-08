# Pricing HTTP API

All endpoints are prefixed with `/api/pricing`. Protected endpoints require `Authorization: Bearer <accessToken>`.

---

## Price Item Library

### Groups - `/api/pricing/groups`

```
GET    /api/pricing/groups              # list all groups
POST   /api/pricing/groups              # create group        { name }
GET    /api/pricing/groups/:id          # get group with its items
PUT    /api/pricing/groups/:id          # rename              { name }
DELETE /api/pricing/groups/:id          # delete (does not delete items)

POST   /api/pricing/groups/:id/items/:itemId   # add item to group
DELETE /api/pricing/groups/:id/items/:itemId   # remove item from group
```

All group endpoints require JWT auth.

---

### Items - `/api/pricing/items`

```
GET    /api/pricing/items               # list all items (?groupId= to filter)
POST   /api/pricing/items               # create item
GET    /api/pricing/items/:id           # get item
PUT    /api/pricing/items/:id           # update item
DELETE /api/pricing/items/:id           # delete item
```

All item endpoints require JWT auth.

**Item body (create / update):**
```json
{
  "name": "Coated 135g",
  "slug": "coated-135g",
  "priceUnit": 0.10,
  "calculationBasis": "YIELD_PCS",
  "lengthMm": 450,
  "widthMm": 330
}
```

`calculationBasis`: `YIELD_PCS | LINEAR_M | SQM | PERIMETER | PCS | ORDER | FREE`

`lengthMm` / `widthMm`: dimensions of the print sheet or roll - required for `YIELD_PCS`, `LINEAR_M`, `SQM`, `PERIMETER`.

---

## Product Pricing Setup

Container and item-in-container endpoints live under `/api/products`. See [products/api.md](../products/api.md) for the full reference.

### Containers - `/api/products/:productId/containers`

A container is a named selection group owned by a product (e.g. "Paper type", "Finish").
Each product has many containers. Containers are not shared across products.

```
GET    /api/products/:id/containers              # list containers on this product (ordered)
POST   /api/products/:id/containers              # create container
GET    /api/products/:id/containers/:cid         # get container with its item slots
PUT    /api/products/:id/containers/:cid         # update container
DELETE /api/products/:id/containers/:cid         # delete container and its slots
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

`containerType`: `SINGLE_SELECT | MULTI_SELECT | AUTO_APPLIED`

---

### Items in a container - `/api/products/:productId/containers/:cid/items`

```
GET    /api/products/:id/containers/:cid/items              # list item slots (ordered)
POST   /api/products/:id/containers/:cid/items              # add item to container
DELETE /api/products/:id/containers/:cid/items/:itemId      # remove item from container
PATCH  /api/products/:id/containers/:cid/items/:itemId      # update per-container overrides
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

`priceUnit` and `name` are optional per-container overrides - the same `OptionItem` can appear in multiple containers with different prices or display names.

---

## Calculation

### Calculate price - `POST /api/pricing/calculate`

Public endpoint - no auth required. Called by the customer-facing configurator in real time as the customer selects options.

**Request:**
```json
{
  "productId": "uuid",
  "selectedItemIds": ["uuid-1", "uuid-2"],
  "context": {
    "widthMm": 85,
    "heightMm": 55,
    "quantity": 500
  }
}
```

**Response:**
```json
{
  "total": 8.10,
  "breakdown": [
    { "itemId": "...", "name": "Coated 135g",   "calculationBasis": "YIELD_PCS", "cost": 0.80 },
    { "itemId": "...", "name": "Digital print",  "calculationBasis": "YIELD_PCS", "cost": 0.80 },
    { "itemId": "...", "name": "Gloss lam",      "calculationBasis": "LINEAR_M",  "cost": 1.20 },
    { "itemId": "...", "name": "Cutting",        "calculationBasis": "PCS",       "cost": 0.30 },
    { "itemId": "...", "name": "Preflight",      "calculationBasis": "ORDER",     "cost": 5.00 }
  ]
}
```

---

### Quantity price table - `POST /api/pricing/quantity-table`

Public endpoint - no auth required. Called by the configurator to render a price table showing costs for several quantities at once.

**Request:**
```json
{
  "productId": "uuid",
  "selectedItemIds": ["uuid-1", "uuid-2"],
  "context": {
    "widthMm": 85,
    "heightMm": 55,
    "quantity": 100
  },
  "quantities": [10, 25, 50, 100, 200, 400, 600]
}
```

**Response:** array of `{ quantity, total, breakdown }` - one entry per requested quantity, same shape as the single calculate response.
