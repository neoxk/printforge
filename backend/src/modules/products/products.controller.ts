import type { FastifyReply, FastifyRequest } from 'fastify'
import * as productsService from './products.service.js'

// ─── Products ─────────────────────────────────────────────────────────────────

export async function getProductOptionsHandler(req: FastifyRequest, reply: FastifyReply) {
  const params = req.params as { id: string }
  return reply.send(await productsService.getProductOptions(params.id))
}

export async function listProductsHandler(_req: FastifyRequest, reply: FastifyReply) {
  return reply.send(await productsService.listProducts())
}

export async function getProductConfigurationHandler(req: FastifyRequest, reply: FastifyReply) {
  const params = req.params as { id: string }
  return reply.send(await productsService.getProductConfiguration(params.id))
}

export async function saveProductConfigurationHandler(req: FastifyRequest, reply: FastifyReply) {
  const params = req.params as { id: string }
  const body = req.body as Parameters<typeof productsService.saveProductConfiguration>[1]
  return reply.send(await productsService.saveProductConfiguration(params.id, body))
}

// ─── Containers ───────────────────────────────────────────────────────────────

export async function listContainersHandler(req: FastifyRequest, reply: FastifyReply) {
  const { id } = req.params as { id: string }
  return reply.send(await productsService.listContainers(id))
}

export async function getContainerHandler(req: FastifyRequest, reply: FastifyReply) {
  const { id, cid } = req.params as { id: string; cid: string }
  return reply.send(await productsService.getContainer(id, cid))
}

export async function createContainerHandler(req: FastifyRequest, reply: FastifyReply) {
  const { id } = req.params as { id: string }
  const body = req.body as { name: string; sortOrder?: number }
  return reply.status(201).send(await productsService.createContainer(id, body))
}

export async function updateContainerHandler(req: FastifyRequest, reply: FastifyReply) {
  const { id, cid } = req.params as { id: string; cid: string }
  const body = req.body as { name?: string; sortOrder?: number; defaultItemId?: string | null }
  return reply.send(await productsService.updateContainer(id, cid, body))
}

export async function deleteContainerHandler(req: FastifyRequest, reply: FastifyReply) {
  const { id, cid } = req.params as { id: string; cid: string }
  await productsService.deleteContainer(id, cid)
  return reply.status(204).send()
}

// ─── Container Items ──────────────────────────────────────────────────────────

export async function listContainerItemsHandler(req: FastifyRequest, reply: FastifyReply) {
  const { id, cid } = req.params as { id: string; cid: string }
  return reply.send(await productsService.listContainerItems(id, cid))
}

export async function addItemToContainerHandler(req: FastifyRequest, reply: FastifyReply) {
  const { id, cid } = req.params as { id: string; cid: string }
  const body = req.body as { itemId: string; sortOrder?: number; priceUnit?: number; displayMode?: string }
  return reply.status(201).send(await productsService.addItemToContainer(id, cid, body))
}

export async function removeItemFromContainerHandler(req: FastifyRequest, reply: FastifyReply) {
  const { id, cid, itemId } = req.params as { id: string; cid: string; itemId: string }
  await productsService.removeItemFromContainer(id, cid, itemId)
  return reply.status(204).send()
}

export async function patchContainerItemHandler(req: FastifyRequest, reply: FastifyReply) {
  const { id, cid, itemId } = req.params as { id: string; cid: string; itemId: string }
  const body = req.body as { sortOrder?: number; priceUnit?: number | null; displayMode?: string | null }
  return reply.send(await productsService.patchContainerItem(id, cid, itemId, body))
}
