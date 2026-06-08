# Using the Service Layer

Services live in `apps/admin/src/lib/services/`. Import from the barrel:

```ts
import { Groups, Items, Pricing } from '@/lib/services'
import type { ItemPayload, PriceContext } from '@/lib/services'
```

---

## Groups

```ts
// List all groups
const groups = await Groups.list()

// Get a single group with its items included
const group = await Groups.get(id)
group.items  // OptionItem[]

// Create
const newGroup = await Groups.create('Papers')

// Rename
const updated = await Groups.rename(id, 'Coated Papers')

// Delete (does not delete the items inside - they become ungrouped)
await Groups.delete(id)

// Add / remove an item from a group
await Groups.addItem(groupId, itemId)
await Groups.removeItem(groupId, itemId)

// Move an item from one group to another
// fromGroupId can be null if the item is currently ungrouped
await Groups.move(itemId, fromGroupId, toGroupId)
```

---

## Items

```ts
// List all items, or filter by group
const all    = await Items.list()
const subset = await Items.list(groupId)

// Get a single item
const item = await Items.get(id)

// Create
const payload: ItemPayload = {
  name: 'Coated 135g',
  slug: 'coated-135g',
  priceUnit: 0.10,
  calculationBasis: 'YIELD_PCS',
  displayMode: 'SELECTABLE',
  lengthMm: 450,
  widthMm: 330,
}
const newItem = await Items.create(payload)

// Update
const updated = await Items.update(id, payload)

// Delete (fails if the item is in use on any product container)
await Items.delete(id)
```

---

## Pricing

```ts
const context: PriceContext = {
  widthMm: 85,
  heightMm: 55,
  quantity: 150,
}

const result = await Pricing.calculate(productId, selectedItemIds, context)

result.total      // number - total cost
result.breakdown  // PriceLineItem[] - cost per item
```

The calculate endpoint is public - no auth token required. It is safe to call from the Configurator iframe.

---

## Error handling

All service functions throw on non-2xx responses. The error message comes from the backend's `{ error: string }` response body, or falls back to the HTTP status. Wrap calls in try/catch:

```ts
try {
  const group = await Groups.create(name)
  dispatch(PricingActions.GROUP_CREATED(group))
} catch (error) {
  dispatch(PricingActions.ERROR(error instanceof Error ? error.message : 'Unknown error'))
}
```
