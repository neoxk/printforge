import type { FastifyReply, FastifyRequest } from 'fastify'
import * as storageService from './storage.service.js'

export async function saveTempDesignHandler(req: FastifyRequest, reply: FastifyReply) {
  const { sessionId } = req.params as { sessionId: string }
  const data = await req.file()
  if (!data) return reply.status(400).send({ error: 'No file uploaded' })

  const buffer = await data.toBuffer()
  const result = await storageService.saveTempDesign(sessionId, data.filename, buffer, data.mimetype)
  return reply.status(201).send(result)
}

export async function assignToOrderHandler(req: FastifyRequest, reply: FastifyReply) {
  const { orderId } = req.params as { orderId: string }
  const { sessionIds } = req.body as { sessionIds: string[] }
  const result = await storageService.assignToOrder(sessionIds, orderId)
  return reply.send(result)
}

export async function listOrderDesignsHandler(req: FastifyRequest, reply: FastifyReply) {
  const { orderId, sessionId } = req.params as { orderId: string; sessionId: string }
  const result = await storageService.listOrderDesigns(orderId, sessionId)
  return reply.send(result)
}

export async function downloadOrderDesignHandler(req: FastifyRequest, reply: FastifyReply) {
  const { orderId, sessionId, filename } = req.params as {
    orderId: string
    sessionId: string
    filename: string
  }

  const { body, contentType, contentLength } = await storageService.getOrderDesign(
    orderId,
    sessionId,
    filename,
  )

  reply.header('Content-Type', contentType ?? 'application/octet-stream')
  reply.header('Content-Disposition', `attachment; filename="${filename}"`)
  if (contentLength !== undefined) {
    reply.header('Content-Length', contentLength)
  }
  return reply.send(body)
}
