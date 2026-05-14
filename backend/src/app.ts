import Fastify from 'fastify'
import cors from '@fastify/cors'
import jwt from '@fastify/jwt'
import auth from '@fastify/auth'
import { ZodTypeProvider, serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod'
import { env } from './config/env.js'
import { errorHandler } from './middleware/errorHandler.js'
import { authRoutes } from './modules/auth/auth.routes.js'
import { integrationRoutes } from './modules/integration/integration.routes.js'
import { productsRoutes } from './modules/products/products.routes.js'
import { pricingRoutes } from './modules/pricing/pricing.routes.js'
import { validationRoutes } from './modules/validation/validation.routes.js'

export async function createApp() {
  const app = Fastify({ logger: true }).withTypeProvider<ZodTypeProvider>()

  app.setValidatorCompiler(validatorCompiler)
  app.setSerializerCompiler(serializerCompiler)
  app.setErrorHandler(errorHandler)

  await app.register(cors)

  await app.register(jwt, {
    secret: env.JWT_SECRET,
    namespace: 'access',
    jwtVerify: 'accessVerify',
    jwtSign: 'accessSign',
  })

  await app.register(jwt, {
    secret: env.JWT_REFRESH_SECRET,
    namespace: 'refresh',
    jwtVerify: 'refreshVerify',
    jwtSign: 'refreshSign',
  })

  await app.register(auth)

  await app.register(authRoutes, { prefix: '/api/auth' })
  await app.register(integrationRoutes, { prefix: '/api/integration' })
  await app.register(productsRoutes, { prefix: '/api/products' })
  await app.register(pricingRoutes, { prefix: '/api/pricing' })
  await app.register(validationRoutes, { prefix: '/api/validation' })

  return app
}
