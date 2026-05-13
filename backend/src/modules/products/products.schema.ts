import { z } from 'zod'

export const productIdParam = z.object({
  id: z.string(),
})
