## Price Item Library

### Groups — `/price/groups`

```
GET    /price/groups              # list all groups
POST   /price/groups              # create group        { name }
GET    /price/groups/:id          # get group with its items
PUT    /price/groups/:id          # rename              { name }
DELETE /price/groups/:id          # delete (does not delete items)
```

### Items — `/price/items`

```
GET    /price/items               # list all items (?groupId= to filter)
POST   /price/items               # create item
GET    /price/items/:id           # get item
PUT    /price/items/:id           # update item
DELETE /price/items/:id           # delete item (fails if used on any product)

POST   /price/groups/:id/items/:itemId   # add item to group
DELETE /price/groups/:id/items/:itemId   # remove item from group
```

**Item body (create / update):**
```json
{
  "name": "Coated 135g",
  "slug": "coated-135g",
  "priceUnit": 0.10,
  "calculationBasis": "YIELD_PCS",
  "displayMode": "SELECTABLE",
  "lengthMm": 450,
  "widthMm": 330
}
```

`calculationBasis`: `YIELD_PCS | LINEAR_M | SQM | PERIMETER | PCS | ORDER | FREE`
`displayMode`: `SELECTABLE | HIDDEN | REQUIRED`

---

## Product Pricing Setup

### Containers — `/products/:productId/containers`

A container is a named selection group owned by a product (e.g. "Paper", "Finish").
Each product has many containers. Containers are not shared across products.

```
GET    /products/:id/containers              # list containers on this product (ordered)
POST   /products/:id/containers              # create container     { name, containerType, sortOrder?, isHidden?, isRequired? }
GET    /products/:id/containers/:cid         # get container with its item slots
PUT    /products/:id/containers/:cid         # update               { name?, containerType?, sortOrder?, defaultItemId?, isHidden?, isRequired? }
DELETE /products/:id/containers/:cid         # delete container and its slots
```

### Items in a container — `/products/:productId/containers/:cid/items`

```
GET    /products/:id/containers/:cid/items              # list item slots (ordered)
POST   /products/:id/containers/:cid/items              # add item to container
DELETE /products/:id/containers/:cid/items/:itemId      # remove item from container
PATCH  /products/:id/containers/:cid/items/:itemId      # update per-container overrides
```

**Add item body:**
```json
{
  "itemId": "uuid",
  "sortOrder": 0,
  "priceUnit": 0.09,    // optional override
  "name": "Custom label" // optional display name override for this container slot
}
```

---

## Calculation

```
POST /price/calculate
```

**Body:**
```json
{
  "productId": "uuid",
  "context": {
    "widthMm": 85,
    "heightMm": 55,
    "quantity": 150
  }
}
```

The service resolves all items on the product (direct items + every item from every container
that has a selection, applying any per-product overrides), then passes them to `calculate()`.

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
