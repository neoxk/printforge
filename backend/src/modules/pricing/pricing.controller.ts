import type { FastifyReply, FastifyRequest } from 'fastify'
import * as pricingService from './pricing.service.js'

export async function calculatePriceHandler(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const body = request.body as { productId: string; options: Record<string, string> }
  const result = await pricingService.calculatePrice(
    body.productId,
    body.options,
  )
  return reply.send(result)
}

export async function listPricingRulesHandler(_request: FastifyRequest, reply: FastifyReply) {
  const rules = await pricingService.listPricingRules()
  return reply.send(rules)
}

export async function createPricingRuleHandler(request: FastifyRequest, reply: FastifyReply) {
  const body = request.body as {
    name: string
    summary: string
    trigger: string
    status: string
  }
  const rule = await pricingService.createPricingRule(body)
  return reply.status(201).send(rule)
}
