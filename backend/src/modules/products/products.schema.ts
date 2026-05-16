import { z } from 'zod'

const displayModeValues = ['SELECTABLE', 'HIDDEN', 'REQUIRED'] as const

export const productIdParam = z.object({ id: z.string() })

export const productConfigBody = z.object({
  fields: z.array(z.record(z.any())),
  savedAt: z.string().min(1),
})

// ─── Containers ───────────────────────────────────────────────────────────────

export const containerIdParams = z.object({
  id: z.string().uuid(),
  cid: z.string().uuid(),
})

export const containerItemParams = z.object({
  id: z.string().uuid(),
  cid: z.string().uuid(),
  itemId: z.string().uuid(),
})

export const createContainerBody = z.object({
  name: z.string().min(1).max(120),
  sortOrder: z.number().int().optional(),
})

export const updateContainerBody = z.object({
  name: z.string().min(1).max(120).optional(),
  sortOrder: z.number().int().optional(),
  defaultItemId: z.string().uuid().nullable().optional(),
})

export const addContainerItemBody = z.object({
  itemId: z.string().uuid(),
  sortOrder: z.number().int().optional(),
  priceUnit: z.number().nonnegative().optional(),
  displayMode: z.enum(displayModeValues).optional(),
})

export const patchContainerItemBody = z.object({
  sortOrder: z.number().int().optional(),
  priceUnit: z.number().nonnegative().nullable().optional(),
  displayMode: z.enum(displayModeValues).nullable().optional(),
})
