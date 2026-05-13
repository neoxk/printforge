import type { FastifyInstance } from 'fastify'
import { authenticate } from '../../middleware/authenticate.js'
import { getProductOptionsHandler, listProductsHandler } from './products.controller.js'
import { productIdParam } from './products.schema.js'

export async function productsRoutes(app: FastifyInstance) {
  // Public — called by the configurator iframe
  app.get('/:id/options', { schema: { params: productIdParam } }, getProductOptionsHandler)

  // Admin — requires JWT
  app.get('/', { preHandler: authenticate }, listProductsHandler)
}
