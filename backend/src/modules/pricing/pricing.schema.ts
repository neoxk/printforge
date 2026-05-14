import { z } from 'zod'

export const calculatePriceBody = z.object({
  productId: z.string(),
  options: z.record(z.string()),
})

export const createPricingRuleBody = z.object({
  name: z.string().trim().min(2).max(120),
  summary: z.string().trim().min(2).max(255),
  trigger: z.string().trim().min(2).max(120),
  status: z.string().trim().min(2).max(40),
})
