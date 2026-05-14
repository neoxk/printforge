import type { FastifyInstance } from 'fastify'
import { loginHandler, refreshHandler, registerHandler } from './auth.controller.js'
import { loginBody, refreshBody, registerBody } from './auth.schema.js'

export async function authRoutes(app: FastifyInstance) {
  app.post('/register', { schema: { body: registerBody } }, registerHandler)
  app.post('/login', { schema: { body: loginBody } }, loginHandler)
  app.post('/refresh', { schema: { body: refreshBody } }, refreshHandler)
}
