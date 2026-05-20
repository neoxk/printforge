import type { FastifyReply, FastifyRequest } from 'fastify'
import * as productsService from './products.service.js'

// ─── Products ─────────────────────────────────────────────────────────────────

export async function listProductsHandler(_req: FastifyRequest, reply: FastifyReply) {
  return reply.send(await productsService.listProducts())
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
  const body = req.body as { name: string; containerType: string; sortOrder?: number; isHidden?: boolean; isRequired?: boolean }
  return reply.status(201).send(await productsService.createContainer(id, body))
}

export async function updateContainerHandler(req: FastifyRequest, reply: FastifyReply) {
  const { id, cid } = req.params as { id: string; cid: string }
  const body = req.body as { name?: string; containerType?: string; sortOrder?: number; defaultItemId?: string | null; isHidden?: boolean; isRequired?: boolean }
  return reply.send(await productsService.updateContainer(id, cid, body))
}

export async function deleteContainerHandler(req: FastifyRequest, reply: FastifyReply) {
  const { id, cid } = req.params as { id: string; cid: string }
  await productsService.deleteContainer(id, cid)
  return reply.status(204).send()
}

// ─── Product Update ───────────────────────────────────────────────────────────

export async function updateProductHandler(req: FastifyRequest, reply: FastifyReply) {
  const { id } = req.params as { id: string }
  const body = req.body as { widthMm: number | null; heightMm: number | null }
  return reply.send(await productsService.updateProduct(id, body))
}

// ─── Product Config ───────────────────────────────────────────────────────────

export async function getProductConfigHandler(req: FastifyRequest, reply: FastifyReply) {
  const { id } = req.params as { id: string }
  return reply.send(await productsService.getProductConfig(id))
}

export async function getProductConfigByWooIdHandler(req: FastifyRequest, reply: FastifyReply) {
  const { wooProductId } = req.params as { wooProductId: string }
  return reply.send(await productsService.getProductConfigByWooId(wooProductId))
}

// ─── Container Items ──────────────────────────────────────────────────────────

export async function listContainerItemsHandler(req: FastifyRequest, reply: FastifyReply) {
  const { id, cid } = req.params as { id: string; cid: string }
  return reply.send(await productsService.listContainerItems(id, cid))
}

export async function addItemToContainerHandler(req: FastifyRequest, reply: FastifyReply) {
  const { id, cid } = req.params as { id: string; cid: string }
  const body = req.body as { itemId: string; sortOrder?: number; priceUnit?: number; name?: string }
  return reply.status(201).send(await productsService.addItemToContainer(id, cid, body))
}

export async function removeItemFromContainerHandler(req: FastifyRequest, reply: FastifyReply) {
  const { id, cid, itemId } = req.params as { id: string; cid: string; itemId: string }
  await productsService.removeItemFromContainer(id, cid, itemId)
  return reply.status(204).send()
}

export async function patchContainerItemHandler(req: FastifyRequest, reply: FastifyReply) {
  const { id, cid, itemId } = req.params as { id: string; cid: string; itemId: string }
  const body = req.body as { sortOrder?: number; priceUnit?: number | null; name?: string | null }
  return reply.send(await productsService.patchContainerItem(id, cid, itemId, body))
}
