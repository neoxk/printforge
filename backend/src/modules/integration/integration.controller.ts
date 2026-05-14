import type { FastifyReply, FastifyRequest } from 'fastify'
import * as integrationService from './integration.service.js'

export async function getIntegrationHandler(_request: FastifyRequest, reply: FastifyReply) {
  const connection = await integrationService.getCurrentIntegration()
  return reply.send(connection)
}

export async function saveIntegrationHandler(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const connection = await integrationService.saveIntegration(
    request.body as Parameters<typeof integrationService.saveIntegration>[0],
  )
  return reply.send(connection)
}

export async function syncProductsHandler(_request: FastifyRequest, reply: FastifyReply) {
  const result = await integrationService.syncWooProducts()
  return reply.send(result)
}
