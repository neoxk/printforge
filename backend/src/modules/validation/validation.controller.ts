import type { FastifyReply, FastifyRequest } from 'fastify'
import * as validationService from './validation.service.js'

export async function listValidationRulesHandler(_request: FastifyRequest, reply: FastifyReply) {
  const rules = await validationService.listValidationRules()
  return reply.send(rules)
}

export async function createValidationRuleHandler(request: FastifyRequest, reply: FastifyReply) {
  const body = request.body as {
    name: string
    summary: string
    severity: 'Critical' | 'Warning' | 'Info'
  }

  const rule = await validationService.createValidationRule(body)
  return reply.status(201).send(rule)
}
