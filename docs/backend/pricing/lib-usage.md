# Pricing Lib - API Reference

Located at `backend/src/lib/pricing/`. Import everything from the index:

```ts
import { calculate, buildOrderContext } from '../lib/pricing/index.js'
import type { OptionItemShape, OrderContext, PricingResult } from '../lib/pricing/index.js'
```

The lib is **pure computation** - no database, no async. Fetching the items from the DB is the caller's responsibility (see `pricing.service.ts`).

---

## `calculate(items, ctx)`

Runs each item through its processor and returns the total and a per-item breakdown.

```ts
function calculate(items: OptionItemShape[], ctx: OrderContext): PricingResult
```

**Example:**

```ts
const result = calculate(items, { widthMm: 85, heightMm: 55, quantity: 150 })

// result.total      → 8.10
// result.breakdown  → [
//   { itemId: '...', name: 'coated_135g',   calculationBasis: 'YIELD_PCS', cost: 0.80 },
//   { itemId: '...', name: 'digital_print', calculationBasis: 'YIELD_PCS', cost: 0.80 },
//   { itemId: '...', name: 'gloss_lam',     calculationBasis: 'LINEAR_M',  cost: 1.20 },
//   ...
// ]
```

---

## `buildOrderContext(raw)`

Validates and normalises raw input into a typed `OrderContext`. Throws `AppError(400)` if any field is missing, not a number, or out of range.

```ts
function buildOrderContext(raw: unknown): OrderContext
```

```ts
const ctx = buildOrderContext({ widthMm: 210, heightMm: 297, quantity: 50 })
```

---

## Types

```ts
type OrderContext = {
  widthMm: number    // finished product width in mm
  heightMm: number   // finished product height in mm
  quantity: number   // number of pieces (positive integer)
}

type OptionItemShape = {
  id: string
  name: string
  priceUnit: number          // monetary rate per unit
  lengthMm: number | null    // process sheet/plate length; null = infinite roll
  widthMm: number | null     // process sheet/plate or roll width
  calculationBasis: CalculationBasis
  displayMode: DisplayMode
}

type PriceLineItem = {
  itemId: string
  name: string
  calculationBasis: CalculationBasis
  cost: number
}

type PricingResult = {
  total: number
  breakdown: PriceLineItem[]
}

type CalculationBasis = 'YIELD_PCS' | 'LINEAR_M' | 'SQM' | 'PERIMETER' | 'PCS' | 'ORDER' | 'FREE'
type DisplayMode      = 'SELECTABLE' | 'HIDDEN' | 'REQUIRED'
```

---

## Adding a New Processor

1. Create `backend/src/lib/pricing/processors/your-basis.ts` - export a function matching `Processor`:
   ```ts
   export const yourBasis: Processor = (item, ctx) => { ... }
   ```
2. Add it to the registry in `processors/index.ts` under its `CalculationBasis` key.
3. Add the new value to the `CalculationBasis` union in `types.ts`.

TypeScript will error at the registry if the key is missing - the `Record<CalculationBasis, Processor>` type enforces exhaustiveness.
