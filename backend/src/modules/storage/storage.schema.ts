import { z } from 'zod'

export const sessionIdParam = z.object({ sessionId: z.string().min(1).max(128) })
export const orderIdParam = z.object({ orderId: z.string().min(1).max(128) })

export const assignToOrderBody = z.object({
  sessionIds: z.array(z.string().min(1).max(128)).min(1),
})
