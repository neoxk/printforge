import type { FastifyReply, FastifyRequest } from 'fastify'
import type { z } from 'zod'
import * as authService from './auth.service.js'
import type { loginBody, refreshBody } from './auth.schema.js'

export async function loginHandler(
  request: FastifyRequest<{ Body: z.infer<typeof loginBody> }>,
  reply: FastifyReply,
) {
  const user = await authService.validateCredentials(request.body.email, request.body.password)
  return reply.send({
    accessToken: request.server.accessSign(user, { expiresIn: '15m' }),
    refreshToken: request.server.refreshSign(user, { expiresIn: '7d' }),
  })
}

export async function refreshHandler(
  request: FastifyRequest<{ Body: z.infer<typeof refreshBody> }>,
  reply: FastifyReply,
) {
  const payload = await request.refreshVerify<{ id: string; email: string }>()
  return reply.send({
    accessToken: request.server.accessSign(
      { id: payload.id, email: payload.email },
      { expiresIn: '15m' },
    ),
    refreshToken: request.server.refreshSign(
      { id: payload.id, email: payload.email },
      { expiresIn: '7d' },
    ),
  })
}
