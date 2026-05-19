import { z } from 'zod'
import { AppError } from '../errors.js'
import type { OrderContext } from './types.js'

const orderContextSchema = z.object({
  widthMm: z.number().positive(),
  heightMm: z.number().positive(),
  quantity: z.number().int().positive(),
})

export function buildOrderContext(raw: unknown): OrderContext {
  const result = orderContextSchema.safeParse(raw)
  if (!result.success) {
    const message = result.error.issues.map((i) => i.message).join(', ')
    throw new AppError(400, `Invalid order context: ${message}`)
  }
  return result.data
}
