import type { FastifyReply, FastifyRequest } from 'fastify'
import * as productsService from './products.service.js'

export async function getProductOptionsHandler(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const params = request.params as { id: string }
  const options = await productsService.getProductOptions(params.id)
  return reply.send(options)
}

export async function listProductsHandler(_request: FastifyRequest, reply: FastifyReply) {
  const products = await productsService.listProducts()
  return reply.send(products)
}

export async function getProductConfigurationHandler(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const params = request.params as { id: string }
  const configuration = await productsService.getProductConfiguration(params.id)
  return reply.send(configuration)
}

export async function saveProductConfigurationHandler(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const params = request.params as { id: string }
  const body = request.body as Parameters<typeof productsService.saveProductConfiguration>[1]
  const configuration = await productsService.saveProductConfiguration(params.id, body)
  return reply.send(configuration)
}
