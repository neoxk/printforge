import type { FastifyError, FastifyReply, FastifyRequest } from 'fastify'
import { AppError } from '../lib/errors.js'

function toLabelCase(value: string) {
  return value
    .split(/[._-]+/g)
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ')
}

function formatValidationMessage(message: string) {
  return message
    .split(', ')
    .map((segment) => {
      const match = segment.match(/^(body|params|querystring|headers)\/([^ ]+)\s+(.+)$/i)

      if (!match) {
        return segment
      }

      const [, scope, rawFieldName, rawMessage] = match
      const scopeLabel =
        scope.toLowerCase() === 'body'
          ? ''
          : `${toLabelCase(scope)} `

      return `${scopeLabel}${toLabelCase(rawFieldName)}: ${rawMessage}`
    })
    .join(', ')
}

export function errorHandler(
  error: FastifyError | AppError,
  _request: FastifyRequest,
  reply: FastifyReply,
) {
  if (error instanceof AppError) {
    return reply.status(error.statusCode).send({ error: error.message })
  }

  if (error.statusCode) {
    const message =
      error.statusCode === 400 ? formatValidationMessage(error.message) : error.message

    return reply.status(error.statusCode).send({ error: message })
  }

  reply.log.error(error)
  return reply.status(500).send({ error: 'Internal server error' })
}
