import { z } from 'zod'

const containerTypeValues = ['SINGLE_SELECT', 'MULTI_SELECT', 'AUTO_APPLIED'] as const

export const productIdParam = z.object({ id: z.string() })

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
  containerType: z.enum(containerTypeValues),
  sortOrder: z.number().int().optional(),
  isHidden: z.boolean().optional(),
  isRequired: z.boolean().optional(),
})

export const updateContainerBody = z.object({
  name: z.string().min(1).max(120).optional(),
  containerType: z.enum(containerTypeValues).optional(),
  sortOrder: z.number().int().optional(),
  defaultItemId: z.string().uuid().nullable().optional(),
  isHidden: z.boolean().optional(),
  isRequired: z.boolean().optional(),
})

export const addContainerItemBody = z.object({
  itemId: z.string().uuid(),
  sortOrder: z.number().int().optional(),
  priceUnit: z.number().nonnegative().optional(),
  name: z.string().max(120).optional(),
})

export const patchContainerItemBody = z.object({
  sortOrder: z.number().int().optional(),
  priceUnit: z.number().nonnegative().nullable().optional(),
  name: z.string().max(120).nullable().optional(),
})

export const updateProductBody = z.object({
  widthMm: z.number().int().positive().nullable(),
  heightMm: z.number().int().positive().nullable(),
})
