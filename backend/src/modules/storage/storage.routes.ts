import type { FastifyInstance } from 'fastify'
import multipart from '@fastify/multipart'
import { authenticateWebhook } from '../../middleware/webhook-auth.js'
import {
  saveTempDesignHandler,
  assignToOrderHandler,
  listOrderDesignsHandler,
  downloadOrderDesignHandler,
} from './storage.controller.js'
import {
  assignToOrderBody,
  orderIdParam,
  orderSessionParams,
  orderSessionFileParams,
} from './storage.schema.js'

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

  // Protected — called server-side by the WooCommerce plugin to render and
  // serve per-line-item design downloads in the order admin.
  app.get(
    '/orders/:orderId/:sessionId',
    { preHandler: authenticateWebhook, schema: { params: orderSessionParams } },
    listOrderDesignsHandler,
  )
  app.get(
    '/orders/:orderId/:sessionId/:filename',
    { preHandler: authenticateWebhook, schema: { params: orderSessionFileParams } },
    downloadOrderDesignHandler,
  )
}
