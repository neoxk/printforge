import type { FastifyReply, FastifyRequest } from 'fastify'
import * as authService from './auth.service.js'
import { ForbiddenError } from '../../lib/errors.js'

export async function firstTimeHandler(
  _request: FastifyRequest,
  reply: FastifyReply,
) {
  const firstTime = await authService.isFirstTime()
  return reply.send({ firstTime })
}

export async function loginHandler(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const body = request.body as { email: string; password: string }
  const user = await authService.validateCredentials(body.email, body.password)
  return reply.send({
    accessToken: await reply.accessSign(user, { expiresIn: '15m' }),
    refreshToken: await reply.refreshSign(user, { expiresIn: '7d' }),
    user,
  })
}

export async function registerHandler(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  if (!(await authService.isFirstTime())) {
    throw new ForbiddenError('Registration is not available.')
  }

  const body = request.body as {
    name: string
    tenantName: string
    email: string
    password: string
  }
  const user = await authService.registerUser(body)

  return reply.status(201).send({
    accessToken: await reply.accessSign(user, { expiresIn: '15m' }),
    refreshToken: await reply.refreshSign(user, { expiresIn: '7d' }),
    user,
  })
}

export async function refreshHandler(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const body = request.body as { refreshToken: string }
  const payload = await request.refreshVerify<{
    id: string
    email: string
    name: string
    tenantName: string
  }>({
    verify: {
      extractToken: () => body.refreshToken,
    },
  })

  const user = {
    id: payload.id,
    email: payload.email,
    name: payload.name,
    tenantName: payload.tenantName,
  }

  return reply.send({
    accessToken: await reply.accessSign(user, { expiresIn: '15m' }),
    refreshToken: await reply.refreshSign(user, { expiresIn: '7d' }),
    user,
  })
}
