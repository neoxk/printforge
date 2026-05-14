import { z } from 'zod'

export const productIdParam = z.object({
  id: z.string(),
})

export const productConfigBody = z.object({
  fields: z.array(z.record(z.any())),
  savedAt: z.string().min(1),
})
