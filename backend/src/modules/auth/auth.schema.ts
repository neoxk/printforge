import { z } from 'zod'

export const loginBody = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

export const registerBody = z.object({
  name: z.string().trim().min(2).max(120),
  tenantName: z.string().trim().min(2).max(160),
  email: z.string().email(),
  password: z.string().min(8),
})

export const refreshBody = z.object({
  refreshToken: z.string(),
})
