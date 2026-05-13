import type { FastifyReply, FastifyRequest } from 'fastify'
import type { z } from 'zod'
import * as pricingService from './pricing.service.js'
import type { calculatePriceBody } from './pricing.schema.js'

export async function calculatePriceHandler(
  request: FastifyRequest<{ Body: z.infer<typeof calculatePriceBody> }>,
  reply: FastifyReply,
) {
  const result = await pricingService.calculatePrice(
    request.body.productId,
    request.body.options,
  )
  return reply.send(result)
}
