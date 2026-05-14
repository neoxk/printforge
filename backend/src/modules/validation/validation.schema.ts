import { z } from 'zod'

export const createValidationRuleBody = z.object({
  name: z.string().trim().min(2).max(120),
  summary: z.string().trim().min(2).max(255),
  severity: z.enum(['Critical', 'Warning', 'Info']),
})
