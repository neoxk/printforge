import type { FastifyInstance } from 'fastify'
import multipart from '@fastify/multipart'
import { authenticate } from '../../middleware/authenticate.js'
import { saveTempDesignHandler, assignToOrderHandler } from './storage.controller.js'
import { assignToOrderBody, orderIdParam } from './storage.schema.js'

export async function storageRoutes(app: FastifyInstance) {
  await app.register(multipart)

  // Public — called from the customer-facing configurator iframe
  app.post('/temp/:sessionId', saveTempDesignHandler)

  // Protected — called server-side when an order is placed
  app.post(
    '/orders/:orderId/assign',
    { preHandler: authenticate, schema: { body: assignToOrderBody, params: orderIdParam } },
    assignToOrderHandler,
  )
}
