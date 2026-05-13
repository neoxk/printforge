import type { FastifyInstance } from 'fastify'
import { calculatePriceHandler } from './pricing.controller.js'
import { calculatePriceBody } from './pricing.schema.js'

export async function pricingRoutes(app: FastifyInstance) {
  // Public — called by the configurator iframe in real time
  app.post('/calculate', { schema: { body: calculatePriceBody } }, calculatePriceHandler)
}
