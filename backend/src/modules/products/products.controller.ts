import type { FastifyReply, FastifyRequest } from 'fastify'
import * as productsService from './products.service.js'

export async function getProductOptionsHandler(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
) {
  const options = await productsService.getProductOptions(request.params.id)
  return reply.send(options)
}

export async function listProductsHandler(_request: FastifyRequest, reply: FastifyReply) {
  const products = await productsService.listProducts()
  return reply.send(products)
}
