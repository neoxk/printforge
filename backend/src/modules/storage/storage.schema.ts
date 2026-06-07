import { z } from 'zod'

export const sessionIdParam = z.object({ sessionId: z.string().min(1).max(128) })
export const orderIdParam = z.object({ orderId: z.string().min(1).max(128) })

export const assignToOrderBody = z.object({
  sessionIds: z.array(z.string().min(1).max(128)).min(1),
})

export const orderSessionParams = z.object({
  orderId: z.string().min(1).max(128),
  sessionId: z.string().min(1).max(128),
})

// `filename` is restricted to a bare basename (word chars, dot, dash) so the
// param can never be used to traverse out of the order/session folder.
export const orderSessionFileParams = orderSessionParams.extend({
  filename: z.string().min(1).max(256).regex(/^[\w.\-]+$/),
})
