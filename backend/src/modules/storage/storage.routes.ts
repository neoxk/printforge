import type { FastifyInstance } from 'fastify'
import multipart from '@fastify/multipart'
import { authenticateWebhook } from '../../middleware/webhook-auth.js'
import { saveTempDesignHandler, assignToOrderHandler } from './storage.controller.js'
import { assignToOrderBody, orderIdParam } from './storage.schema.js'

export async function storageRoutes(app: FastifyInstance) {
  await app.register(multipart)

  // Public — called from the customer-facing configurator iframe
  app.post('/temp/:sessionId', saveTempDesignHandler)

  // Protected — called server-side by the WooCommerce plugin when an order is
  // placed, authenticated with the connection's webhook secret.
  app.post(
    '/orders/:orderId/assign',
    { preHandler: authenticateWebhook, schema: { body: assignToOrderBody, params: orderIdParam } },
    assignToOrderHandler,
  )
}
