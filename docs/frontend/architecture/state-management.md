# State Management - Reducers and Action Creators

## The Problem

Without a reducer, every mutation in a component requires two things: an API call and a manual state update.

```ts
// you have to do both, every time
const group = await Groups.create(name)
setGroups(prev => [...prev, group])
```

As the number of operations grows, these state update expressions scatter across event handlers, mixed in with API calls. When something breaks, you hunt through the component to find where state diverged from the backend.

---

## The Pattern

State transitions live in a **reducer** - a pure function that maps `(currentState, action) → nextState`. Event handlers become minimal: one API call, one dispatch.

```ts
// event handler
async function handleCreateGroup(name: string) {
  const group = await Groups.create(name)
  dispatch(PricingActions.GROUP_CREATED(group))
}

// all state logic in one place
case 'GROUP_CREATED':
  return { ...state, groups: [...state.groups, action.group] }
```

---

## Action Creators

Raw dispatch calls require remembering string literals:

```ts
dispatch({ type: 'GROUP_CREATED', group })  // error-prone, no autocomplete
```

Instead, `PricingActions` provides a typed creator for every action. The key names match the action type strings exactly so they're self-documenting:

```ts
dispatch(PricingActions.GROUP_CREATED(group))   // typed, autocompleted
dispatch(PricingActions.ITEM_DELETED(id))
dispatch(PricingActions.ITEM_MOVED(itemId, toGroupId))
```

TypeScript enforces the argument shape at the call site - if `GROUP_CREATED` expects an `OptionsGroup`, passing anything else is a compile error.

---

## File Location

```
apps/admin/src/lib/
  reducers/
    pricing.ts    # PricingState, PricingAction, PricingActions, pricingReducer
```

---

## Benefits Over useState

| | Multiple useState | Reducer |
|---|---|---|
| State update logic | Scattered in handlers | All in one place |
| Debugging | Hunt through component | Every transition has a named action |
| Testing | Requires rendering | Pure function, no React needed |
| Related state updates | Easy to forget one | Handled together in one case |

---

## When to Move to TanStack Query

The reducer pattern works well for self-contained pages with clear load/mutate flows. Consider adding TanStack Query when:

- The same data is fetched in multiple components independently
- You need background refetching or cache invalidation across pages
- Loading and error states are getting complex to coordinate manually

The namespace services (`Groups`, `Items`, `Pricing`) are compatible with TanStack Query - they slot directly into `queryFn` and `mutationFn` with no changes.
