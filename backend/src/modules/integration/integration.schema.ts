import { z } from 'zod'

export const integrationBody = z.object({
  connectionName: z.string().trim().min(2).max(120),
  storeUrl: z.string().trim().url(),
  restApiBase: z.string().trim().min(1).max(255),
  authMethod: z.enum(['public_store_api', 'consumer_keys']),
  consumerKey: z.string().trim().optional().default(''),
  consumerSecret: z.string().trim().optional().default(''),
  apiStatus: z.string().trim().min(1).max(80),
  lastSync: z.string().trim().min(1).max(120),
  mode: z.string().trim().min(1).max(120),
  importPublishedProducts: z.boolean(),
  importAttributes: z.boolean(),
  importVariations: z.boolean(),
})
