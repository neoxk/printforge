# Products API

## Product Config

### `GET /api/products/:id/config`

Returns the full display configuration for a product — all its containers and the items within them.

Intended for the Configurator SPA. This endpoint is **public** (no authentication required).

**Params:**

| Param | Description |
|---|---|
| `id` | UUID of the product |

**Response:**

```json
{
  "dimensions": { "type": "fixed", "widthMm": 85, "heightMm": 55 },
  "containers": [
    {
      "id": "8628e066-a8a1-4d8a-8ba9-2b0f3f6631ad",
      "name": "Paper",
      "containerType": "SINGLE_SELECT",
      "isHidden": false,
      "isRequired": false,
      "defaultItemId": null,
      "items": [
        { "id": "b6147482-2178-4a6a-b007-9bb8ccf1e939", "name": "190 g mat", "slug": "190g_mat_SRA3" },
        { "id": "0c88d9b1-49c2-42f5-98d8-4533bb177191", "name": "135g mat",  "slug": "135g_mat_SRA3" }
      ]
    }
  ]
}
```

**`dimensions` field:**

Controls whether the configurator shows a width × height input to the customer.

| `type` | Shape | Meaning |
|---|---|---|
| `"fixed"` | `{ type, widthMm, heightMm }` | Dimensions are predetermined; do not show dimension inputs |
| `"custom"` | `{ type }` | Customer must enter dimensions before the order can be priced |

**Container fields:**

| Field | Type | Description |
|---|---|---|
| `id` | `string (uuid)` | Container ID |
| `name` | `string` | Display label for this selection group |
| `containerType` | `SINGLE_SELECT \| MULTI_SELECT \| AUTO_APPLIED` | Selection mechanic |
| `isHidden` | `boolean` | If `true`, the container is not shown in the customer UI |
| `isRequired` | `boolean` | If `true`, the customer must select at least one item before proceeding |
| `defaultItemId` | `string (uuid) \| null` | Item pre-selected on page load; `null` means no default |
| `items` | `array` | Ordered list of items in this container |

**Item fields:**

| Field | Type | Description |
|---|---|---|
| `id` | `string (uuid)` | `OptionItem` ID — use this when calling `POST /api/pricing/calculate` |
| `name` | `string` | Display label; container-level name override applied if set, otherwise the library item name |
| `slug` | `string` | Stable readable identifier from the item library |

**Errors:**

| Status | Condition |
|---|---|
| `404` | Product not found |
