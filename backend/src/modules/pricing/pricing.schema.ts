import { z } from 'zod'

export const calculatePriceBody = z.object({
  productId: z.string(),
  options: z.record(z.string()),
})
