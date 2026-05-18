# PrintForge Pricing Engine — Overview

---

## The Mental Model

Think of a print shop quoting a job manually. The owner breaks the job down into every physical step it touches:

> "I need 8 sheets of SRA3 paper, 8 passes through the digital press, 8 passes through the laminator, and one fixed preflight charge."

Each step has its own rate. The total quote is the sum of all steps. PrintForge automates exactly this breakdown.

The customer only ever sees the total. The breakdown is internal.

---

## Data Model

### OptionItem — one billable step

An OptionItem is a single priced step in the production workflow: a material, a process, a service, or a fixed charge. It lives in the **item library** and is independent of any specific product.

Each item carries:

| Field | Description |
|---|---|
| `name` | Human-readable display label — unique across all items |
| `slug` | Unique readable identifier used in code and APIs (e.g. `coated-135g`) |
| `priceUnit` | Monetary rate per unit |
| `calculationBasis` | How the unit price is applied (see below) |
| `lengthMm` / `widthMm` | Process sheet/plate dimensions; `lengthMm = -1` means infinite roll |
| `displayMode` | How the item behaves in the UI |

### OptionsGroup — library organisation

An OptionsGroup is a named shelf in the item library (e.g. "Papers", "Lamination Films", "Finishing"). Groups exist purely for admin organisation — they have no effect on pricing or the customer-facing UI. An item can belong to one group or none.

### OptionsContainer — a selection group on a product

An OptionsContainer is a named set of choices that belongs to a specific product. It represents one dimension of the customer's selection — for example, "Paper", "Finish", or "Sides". A product typically has several containers.

Each container:
- Is **owned by its product** and is not shared or reused across products
- Holds a curated list of OptionItems the customer can choose from
- Has an optional **default item** — the item pre-selected when the product page loads
- Has a **type** that controls how the customer interacts with it (see Container Types below)
- Has **visibility and validation flags** controlling how it behaves in the UI (see Container Flags below)

Example — a business card product might have:

```
Product "Business Card"
  ├── Container "Paper"
  │     items: 90g Uncoated*, 135g Coated, 300g Silk
  │     default: 90g Uncoated
  ├── Container "Finish"
  │     items: No Finish*, Gloss Lam, Matte Lam, Soft Touch
  │     default: No Finish
  └── Container "Sides"
        items: 1/0*, 4/0, 4/4
        default: 1/0
```

### Per-product overrides

When an item is added to a container, any of its library settings (`priceUnit`, `displayMode`) can be overridden for that specific product. The library item itself is unchanged — the override applies only to that attachment.

---

## Display Modes

Every OptionItem has a `displayMode` that controls how it appears on the frontend. The calculation engine always runs all selected items regardless of display mode — this is purely a UI concern.

| Value | Behaviour |
|---|---|
| `SELECTABLE` | Default. Shown in the UI, customer can select or deselect it. |
| `HIDDEN` | Never shown in the UI. Always included in the price calculation. Used for background costs the shop always charges but doesn't expose as a choice. |
| `REQUIRED` | Shown in the UI but locked — the customer can see it but cannot deselect it. |

For items that should appear in the UI but contribute no cost (e.g. a free included service), set `calculationBasis` to `FREE`. `FREE` always returns 0.

---

## Order Context

Every calculation receives the same context object:

```
widthMm    — finished product width in mm
heightMm   — finished product height in mm
quantity   — number of pieces ordered
```

Product dimensions come from either fixed dimensions stored on the product (e.g. a standard A4 flyer) or dimensions entered by the customer at order time (e.g. a custom-size banner). The calculators do not know or care which — they receive the context and compute.

---

## Calculation Basis Types

### `YIELD_PCS` — Sheet / Plate Yield

**Depends on:** product dimensions, process dimensions, quantity  
**Unit price:** per sheet / plate

Calculates how many finished products fit on one process sheet (trying both orientations to maximise fit), then determines how many sheets are needed to fulfil the order.

```
product: 85 × 55 mm, quantity: 150
process: 450 × 330 mm, unit_price: 0.10

fits_per_sheet  = 21
sheets_required = ceil(150 / 21) = 8
cost            = 8 × 0.10 = 0.80
```

Use cases: business card printing, sign board production, label sheets.

---

### `LINEAR_M` — Linear Metre (Roll Material)

**Depends on:** product dimensions, process dimensions, quantity  
**Unit price:** per metre of roll

For roll-fed materials. Determines the optimal column layout across the roll width, then calculates total roll length needed to fulfil the order. `lengthMm = -1` signals an infinite roll.

```
product: 1000 × 2000 mm, quantity: 3
roll width: 1100 mm, unit_price: 2.15

columns       = 1
rows_required = 3
total_metres  = 6.0 m
cost          = 6.0 × 2.15 = 12.90
```

Use cases: laminating film, vinyl wrap, canvas, roll-fed wide-format print.

---

### `SQM` — Square Metre

**Depends on:** product dimensions, quantity  
**Unit price:** per m²

Direct area billing. Each product contributes its own finished area.

```
product: 500 × 700 mm, quantity: 10, unit_price: 4.50
area = 0.35 m² per piece
cost = 0.35 × 10 × 4.50 = 15.75
```

Use cases: latex / UV flatbed print, fabric print, direct-to-substrate area billing.

---

### `PERIMETER` — Perimeter

**Depends on:** product dimensions, quantity  
**Unit price:** per metre

Charges for the total edge length of all ordered pieces.

```
product: 210 × 297 mm, quantity: 50, unit_price: 0.08
perimeter = 1.014 m per piece
cost      = 1.014 × 50 × 0.08 = 4.056
```

Use cases: wire-o binding, edge trimming, border lamination.

---

### `PCS` — Per Piece

**Depends on:** quantity only  
**Unit price:** per piece

Multiplies quantity by unit price directly.

```
quantity: 20, unit_price: 3.50
cost = 70.00
```

Use cases: garment printing, per-item finishing, any per-unit charge.

---

### `ORDER` — Per Order (Fixed)

**Depends on:** nothing  
**Unit price:** per order

A flat one-time charge per order, regardless of quantity or dimensions.

```
unit_price = 5.00
cost       = 5.00  (always, for any quantity)
```

Use cases: file preflight, artwork setup, plate making, admin charge.

---

### `FREE` — No Charge

Always returns 0. Used for items that appear in the UI (selectable or required) but contribute nothing to the total.

---

## How a Product Gets Priced

When an order is placed, the engine receives the item selected by the customer from each container (one per container, based on their selection or the default). Each item is run through its calculator with the order context. Per-product overrides are applied before calculation. Results are summed into a cost breakdown:

```
[
  { item: "135g Coated",    cost: 0.80 },
  { item: "Digital 4/0",   cost: 0.80 },
  { item: "Gloss Lam",     cost: 1.20 },
  { item: "Cutting",       cost: 0.30 },
  { item: "Preflight",     cost: 5.00 },
]

total: 8.10
```

The breakdown is available internally for auditing and shop owner review. The end customer sees only the total.
