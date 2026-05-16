# PrintForge Pricing Engine — Overview

![[ER_diagram.png]]

---

## The Mental Model

Think of a print shop quoting a job manually. The owner doesn't just pick one price — they break the job down into every physical step it touches:

> "I need 8 sheets of SRA3 paper, 8 passes through the digital press, 8 passes through the laminator, and one fixed preflight charge."

Each of those steps has its own rate. The total quote is the sum of all steps. PrintForge automates exactly this breakdown — every step is an **OptionItem**, and the engine resolves each one against the order context, then sums them into a final price.

The customer only ever sees the total. The breakdown is internal.

---

## Data Model

### OptionItem — one step in the production workflow

An OptionItem represents a single billable step: a material, a process, a service, or a fixed charge. A finished product will typically have 3–6 OptionItems attached to it. For example, a laminated business card might have:

1. Paper (SRA3 sheet) — `YIELD_PCS`
2. Digital print — `YIELD_PCS`
3. Gloss lamination — `LINEAR_M`
4. Guillotine cutting — `PCS`
5. File preflight — `ORDER`

Each OptionItem carries:

| Field | Schema field | Description |
|---|---|---|
| `unit_price` | `priceUnit` | The monetary rate for one unit of this item |
| `calculation_basis` | `calculationBasis` | Determines how unit_price is applied; also implies the unit (m, m², pcs, etc.) |
| `process_length` | `length` (mm) | Working surface length; `-1` means infinite (roll) |
| `process_width` | `width` (mm) | Working surface width |
| `display_mode` | `displayMode` | Controls how the item behaves in the UI (see below) |

### OptionsGroup — a library of related OptionItems

An OptionsGroup is a named category that holds any number of OptionItems of the same type — for example, all the paper stocks a shop carries, or all the lamination options they offer. Groups exist to keep the item library organised and searchable. A group can contain dozens of items; only a few of them will end up on any specific product.

### OptionsContainer — the price recipe for one product

An OptionsContainer is the curated set of OptionItems that define how a specific product is priced. It is the bridge between the item library and the product. When the engine prices an order, it reads all OptionItems from the product's OptionsContainer and runs each one through its calculator.

The same OptionsContainer can be reused across multiple products that share an identical production workflow.

```
OptionsGroup "Papers"
  ├── coated_90g
  ├── coated_135g       ← pulled into "Business Card Standard" container
  ├── uncoated_80g
  └── silk_300g         ← pulled into "Business Card Premium" container

OptionsGroup "Lamination"
  ├── gloss_lam         ← pulled into "Business Card Standard" container
  ├── matte_lam
  └── soft_touch_lam    ← pulled into "Business Card Premium" container
```

---

## Display Modes

Every OptionItem has a `display_mode` that controls how it behaves on the frontend. The calculation engine always runs all items regardless of display mode — this is purely a UI concern.

| Value | Behaviour |
|---|---|
| `SELECTABLE` | Default. Shown in the UI, customer can select or deselect it. |
| `HIDDEN` | Never shown in the UI. Always included in the price calculation. Used for background costs the shop always charges but doesn't expose as a choice (e.g. cutting, handling). |
| `REQUIRED` | Shown in the UI but locked — the customer can see it but cannot deselect it. Used when the shop wants the customer to be aware of a mandatory step. |

For items that should appear in the UI but contribute no cost (e.g. an informational option, a free included service), set `calculation_basis` to `FREE` rather than introducing a special display mode. `FREE` always returns 0 and composes naturally with everything else.

---

## Order Context

Every calculation receives the same context object:

```
product_width_mm   — finished product width
product_height_mm  — finished product height
quantity           — number of pieces ordered
```

Product dimensions can come from two places: fixed dimensions stored on the product itself (e.g. a standard A4 flyer), or dimensions entered by the customer at order time (e.g. a custom-size banner). The calculators do not know or care which — they receive the context and compute.

---

## Calculation Basis Types

### 1. `YIELD_PCS` — Sheet / Plate Yield

**Depends on:** product dimensions, process dimensions, quantity
**Unit price unit:** per sheet / plate

Calculates how many finished products fit on one process sheet or plate (trying both orientations to maximise fit), then determines how many sheets are needed to fulfil the order.

**Example — business card digital print:**
```
product_dims    = 85 × 55 mm
quantity        = 150
process_length  = 450 mm
process_width   = 330 mm
unit_price      = 0.10

fits_per_sheet  = 21
sheets_required = ceil(150 / 21) = 8
cost            = 8 × 0.10 = 0.80
```

**Use cases:** business card printing, sign board production, label sheets

---

### 2. `LINEAR_M` — Linear Metre (Roll Material)

**Depends on:** product dimensions, process dimensions, quantity
**Unit price unit:** per metre of roll

For roll-fed materials. Determines the optimal column layout across the roll width, then calculates total roll length needed to fulfil the order.

`process_length = -1` signals an infinite roll (no sheet constraint on length).

**Example — PVC banner laminate:**
```
product_dims   = 1000 × 2000 mm
quantity       = 3
process_width  = 1100 mm   (roll width)
process_length = -1        (infinite roll)
unit_price     = 2.15

columns        = 1
rows_required  = 3
total_metres   = 6.0 m
cost           = 6.0 × 2.15 = 12.90
```

**Use cases:** laminating film, vinyl wrap, canvas, roll-fed wide-format print

---

### 3. `SQM` — Square Metre

**Depends on:** product dimensions, quantity
**Unit price unit:** per m²

Direct area billing. Each product contributes its own finished area — no process sheet involved.

**Example — latex print:**
```
product_dims = 500 × 700 mm, quantity = 10, unit_price = 4.50
area         = 0.35 m² per piece
cost         = 0.35 × 10 × 4.50 = 15.75
```

**Use cases:** latex / UV flatbed print, fabric print, direct-to-substrate area billing

---

### 4. `PERIMETER` — Perimeter (Running Metre of Edge)

**Depends on:** product dimensions, quantity
**Unit price unit:** per metre

Charges for the total edge length of all ordered pieces. Used for finishing operations applied along the full border of a product.

**Example — wire-o binding:**
```
product_dims = 210 × 297 mm, quantity = 50, unit_price = 0.08
perimeter    = 1.014 m per piece
cost         = 1.014 × 50 × 0.08 = 4.056
```

**Use cases:** wire-o binding, edge trimming, border lamination

---

### 5. `PCS` — Per Piece

**Depends on:** quantity only
**Unit price unit:** per piece

Multiplies quantity by unit price directly.

**Example — garment print:**
```
quantity = 20, unit_price = 3.50
cost     = 70.00
```

**Use cases:** garment printing, per-item finishing, any per-unit charge

---

### 6. `ORDER` — Per Order (Fixed)

**Depends on:** nothing
**Unit price unit:** per order

A flat one-time charge per order, regardless of quantity or dimensions.

**Example — file preflight:**
```
unit_price = 5.00
cost       = 5.00  (always, for any quantity)
```

**Use cases:** file preflight, artwork setup, plate making setup fee, admin charge

---

### 7. `FREE` — No Charge

**Depends on:** nothing
**Unit price unit:** n/a

Always returns a cost of 0. Used for items that should appear in the UI (selectable or required) but contribute nothing to the total — a free included service, a promotional item, or a placeholder option.

---

## How a Product Gets Priced

The engine iterates over every OptionItem in the product's OptionsContainer, runs each through its calculator with the order context, and sums the results into a cost breakdown:

```
[
  { item: "coated_135g",      cost: 0.80 },
  { item: "digital_print_4/0", cost: 0.80 },
  { item: "gloss_lam",        cost: 1.20 },
  { item: "cutting",          cost: 0.30 },
  { item: "preflight",        cost: 5.00 },
]

total: 8.10
```

The breakdown is available internally (useful for auditing and shop owner review). The end customer sees only the total.

---

## ER Diagram (Concrete)

![[ER_diagram_concrete.png]]
