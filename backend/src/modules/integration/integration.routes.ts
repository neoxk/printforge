import type { FastifyInstance } from 'fastify'
import { authenticate } from '../../middleware/authenticate.js'
import {
  getIntegrationHandler,
  saveIntegrationHandler,
  syncProductsHandler,
} from './integration.controller.js'
import { integrationBody } from './integration.schema.js'

export async function integrationRoutes(app: FastifyInstance) {
  app.get('/', { preHandler: authenticate }, getIntegrationHandler)
  app.put('/', { preHandler: authenticate, schema: { body: integrationBody } }, saveIntegrationHandler)
  app.post('/sync', { preHandler: authenticate }, syncProductsHandler)
}
