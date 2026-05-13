import type { FastifyError, FastifyReply, FastifyRequest } from 'fastify'
import { AppError } from '../lib/errors.js'

export function errorHandler(
  error: FastifyError | AppError,
  _request: FastifyRequest,
  reply: FastifyReply,
) {
  if (error instanceof AppError) {
    return reply.status(error.statusCode).send({ error: error.message })
  }

  if (error.statusCode) {
    return reply.status(error.statusCode).send({ error: error.message })
  }

  reply.log.error(error)
  return reply.status(500).send({ error: 'Internal server error' })
}
