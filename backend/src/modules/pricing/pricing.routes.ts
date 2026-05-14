import type { FastifyInstance } from 'fastify'
import { authenticate } from '../../middleware/authenticate.js'
import {
  calculatePriceHandler,
  createPricingRuleHandler,
  listPricingRulesHandler,
} from './pricing.controller.js'
import { calculatePriceBody, createPricingRuleBody } from './pricing.schema.js'

export async function pricingRoutes(app: FastifyInstance) {
  // Public — called by the configurator iframe in real time
  app.post('/calculate', { schema: { body: calculatePriceBody } }, calculatePriceHandler)

  // Admin
  app.get('/', { preHandler: authenticate }, listPricingRulesHandler)
  app.post('/', { preHandler: authenticate, schema: { body: createPricingRuleBody } }, createPricingRuleHandler)
}
