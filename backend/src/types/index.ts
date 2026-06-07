declare module 'fastify' {
  interface FastifyRequest {
    integrationConnection?: import('@prisma/client').IntegrationConnection
    accessVerify<Decoded extends import('@fastify/jwt').FastifyJWT['payload']>(): Promise<Decoded>
    refreshVerify<Decoded extends import('@fastify/jwt').FastifyJWT['payload']>(
      options?: { verify?: { extractToken?: (request: FastifyRequest) => string | void } },
    ): Promise<Decoded>
  }

  interface FastifyReply {
    accessSign(
      payload: import('@fastify/jwt').FastifyJWT['payload'],
      options?: { expiresIn?: string },
    ): Promise<string>
    refreshSign(
      payload: import('@fastify/jwt').FastifyJWT['payload'],
      options?: { expiresIn?: string },
    ): Promise<string>
  }
}

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: { id: string; email: string; name: string; tenantName: string }
    user: { id: string; email: string; name: string; tenantName: string }
  }
}
