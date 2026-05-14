import type { FastifyInstance } from 'fastify'
import { authenticate } from '../../middleware/authenticate.js'
import {
  getProductConfigurationHandler,
  getProductOptionsHandler,
  listProductsHandler,
  saveProductConfigurationHandler,
} from './products.controller.js'
import { productConfigBody, productIdParam } from './products.schema.js'

export async function productsRoutes(app: FastifyInstance) {
  // Public — called by the configurator iframe
  app.get('/:id/options', { schema: { params: productIdParam } }, getProductOptionsHandler)

  // Admin — requires JWT
  app.get('/', { preHandler: authenticate }, listProductsHandler)
  app.get('/:id/config', { preHandler: authenticate, schema: { params: productIdParam } }, getProductConfigurationHandler)
  app.put(
    '/:id/config',
    { preHandler: authenticate, schema: { params: productIdParam, body: productConfigBody } },
    saveProductConfigurationHandler,
  )
}
