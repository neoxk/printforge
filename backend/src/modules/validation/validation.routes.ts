import type { FastifyInstance } from 'fastify'
import { authenticate } from '../../middleware/authenticate.js'
import {
  createValidationRuleHandler,
  listValidationRulesHandler,
} from './validation.controller.js'
import { createValidationRuleBody } from './validation.schema.js'

export async function validationRoutes(app: FastifyInstance) {
  app.get('/', { preHandler: authenticate }, listValidationRulesHandler)
  app.post(
    '/',
    { preHandler: authenticate, schema: { body: createValidationRuleBody } },
    createValidationRuleHandler,
  )
}
