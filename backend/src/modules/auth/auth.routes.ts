import type { FastifyInstance } from 'fastify'
import { loginHandler, refreshHandler } from './auth.controller.js'
import { loginBody, refreshBody } from './auth.schema.js'

export async function authRoutes(app: FastifyInstance) {
  app.post('/login', { schema: { body: loginBody } }, loginHandler)
  app.post('/refresh', { schema: { body: refreshBody } }, refreshHandler)
}
