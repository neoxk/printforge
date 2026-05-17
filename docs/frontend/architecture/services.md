# Service Layer — Namespace Pattern

## The Problem

The original `Api.ts` exported flat functions for every API call:

```ts
listGroupsRequest()
createGroupRequest(name)
deleteGroupRequest(id)
addItemToGroupRequest(groupId, itemId)
```

As the API surface grew, this became a grab-bag with no structure. Importing required knowing the exact function name, autocomplete offered no grouping, and there was no clear ownership of what belonged where.

---

## What We Considered

### Flat functions (original approach)
One file, one function per endpoint. Simple, but doesn't scale — no discoverability, noisy imports, no clear domain boundaries.

### Active Record (`group.addItem()`)
Instance methods on model objects. Reads naturally but has a fundamental problem on the frontend: after a mutation the instance in React state is stale. You either re-fetch (defeating the point), mutate in place (breaks immutability), or return a new instance (every other component holding a reference to the old one is now out of date).

### Namespace objects (chosen)
Plain objects with functions grouped by resource. No instances, no stale data — the data stays as plain objects in React state, and the namespace is just an organised collection of functions.

---

## The Pattern

Each domain gets one file exporting one `const` object. All functions delegate to the shared `apiRequest` client.

```ts
// services/groups.ts
export const Groups = {
  list()                                    { ... },
  get(id: string)                           { ... },
  create(name: string)                      { ... },
  rename(id: string, name: string)          { ... },
  delete(id: string)                        { ... },
  addItem(groupId: string, itemId: string)  { ... },
  removeItem(groupId: string, itemId: string) { ... },
  move(itemId, fromGroupId, toGroupId)      { ... },
}
```

Usage in a component:

```ts
import { Groups, Items, Pricing } from '@/lib/services'

const groups = await Groups.list()
const item   = await Items.create(payload)
const result = await Pricing.calculate(productId, selectedItemIds, context)
```

---

## File Locations

```
apps/admin/src/lib/
  api/
    client.ts        # shared apiRequest helper with auth + token refresh
  services/
    groups.ts        # Groups namespace
    items.ts         # Items namespace + ItemPayload type
    pricing.ts       # Pricing namespace + PriceContext type
    index.ts         # barrel re-export
```

---

## Rules

- One namespace object per backend resource domain
- Functions are named after the operation, not the HTTP verb (`rename` not `put`, `delete` not `deleteById`)
- Multi-step operations that span multiple API calls belong as a method on the most relevant namespace (e.g. `Groups.move` orchestrates `removeItem` + `addItem`)
- The `api/client.ts` file is the only place that touches `fetch` directly
