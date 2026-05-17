# Using the Pricing Reducer

The pricing reducer manages the full state of groups and items for the pricing page. It lives at `apps/admin/src/lib/reducers/pricing.ts`.

---

## Setup

```ts
import { useReducer, useEffect } from 'react'
import { pricingReducer, initialPricingState, PricingActions } from '@/lib/reducers/pricing'
import { Groups, Items } from '@/lib/services'

function PricingPage() {
  const [state, dispatch] = useReducer(pricingReducer, initialPricingState)

  useEffect(() => {
    Promise.all([Groups.list(), Items.list()])
      .then(([groups, items]) => dispatch(PricingActions.LOADED(groups, items)))
      .catch((e) => dispatch(PricingActions.ERROR(e.message)))
  }, [])

  // state.groups, state.items, state.isLoading, state.error
}
```

---

## Available Actions

| Action creator | When to dispatch |
|---|---|
| `PricingActions.LOADED(groups, items)` | Initial data fetch complete |
| `PricingActions.GROUP_CREATED(group)` | After `Groups.create()` |
| `PricingActions.GROUP_RENAMED(id, name)` | After `Groups.rename()` |
| `PricingActions.GROUP_DELETED(id)` | After `Groups.delete()` |
| `PricingActions.ITEM_CREATED(item)` | After `Items.create()` |
| `PricingActions.ITEM_UPDATED(item)` | After `Items.update()` |
| `PricingActions.ITEM_DELETED(id)` | After `Items.delete()` |
| `PricingActions.ITEM_MOVED(itemId, toGroupId)` | After `Groups.move()` |
| `PricingActions.ERROR(message)` | When any API call fails |

---

## Mutation pattern

Every mutation follows the same shape: API call, then dispatch.

```ts
async function handleCreateGroup(name: string) {
  try {
    const group = await Groups.create(name)
    dispatch(PricingActions.GROUP_CREATED(group))
  } catch (e) {
    dispatch(PricingActions.ERROR(e instanceof Error ? e.message : 'Unknown error'))
  }
}

async function handleDeleteItem(id: string) {
  try {
    await Items.delete(id)
    dispatch(PricingActions.ITEM_DELETED(id))
  } catch (e) {
    dispatch(PricingActions.ERROR(e instanceof Error ? e.message : 'Unknown error'))
  }
}

async function handleMoveItem(itemId: string, fromGroupId: string | null, toGroupId: string) {
  try {
    await Groups.move(itemId, fromGroupId, toGroupId)
    dispatch(PricingActions.ITEM_MOVED(itemId, toGroupId))
  } catch (e) {
    dispatch(PricingActions.ERROR(e instanceof Error ? e.message : 'Unknown error'))
  }
}
```

---

## State shape

```ts
type PricingState = {
  groups: OptionsGroup[]   // all groups, alphabetical (backend-ordered)
  items: OptionItem[]      // all items, alphabetical (backend-ordered)
  isLoading: boolean       // true until LOADED is dispatched
  error: string | null     // set by ERROR, not automatically cleared
}
```

Groups and items are stored flat. To get the items belonging to a group, filter client-side:

```ts
const groupItems = state.items.filter(i => i.groupId === group.id)
const ungrouped  = state.items.filter(i => i.groupId === null)
```

---

## Notes

- `GROUP_DELETED` automatically nulls out `groupId` on any items that belonged to the deleted group, mirroring what the backend does.
- `error` is never automatically cleared — reset it explicitly if you display and dismiss error UI.
- The reducer is a pure function with no side effects — it can be unit tested without React or the API.
