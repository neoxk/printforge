import type { FastifyReply, FastifyRequest } from 'fastify'
import { UnauthorizedError } from '../lib/errors.js'
import { verifyWebhookSecret } from '../modules/integration/integration.service.js'

const SECRET_HEADER = 'x-printforge-secret'

/**
 * Authenticates server-to-server calls from the WooCommerce plugins (e.g.
 * assigning design files to an order) using the connection's webhook secret,
 * which the store owner copies from the admin UI into the plugin settings.
 */
export async function authenticateWebhook(request: FastifyRequest, _reply: FastifyReply) {
  const header = request.headers[SECRET_HEADER]
  const secret = Array.isArray(header) ? header[0] : header

  if (!secret) {
    throw new UnauthorizedError('Missing PrintForge secret')
  }

  const connection = await verifyWebhookSecret(secret)

  if (!connection) {
    throw new UnauthorizedError('Invalid PrintForge secret')
  }

  request.integrationConnection = connection
}
