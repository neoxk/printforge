import { z } from 'zod'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'

const localEnvPath = resolve(process.cwd(), '.env')

if (existsSync(localEnvPath)) {
  process.loadEnvFile(localEnvPath)
}

const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  DATABASE_URL: z.string(),
  JWT_SECRET: z.string(),
  JWT_REFRESH_SECRET: z.string(),
  WOOCOMMERCE_INTERNAL_URL: z.string().optional(),
  S3_ENDPOINT: z.string(),
  S3_BUCKET: z.string(),
  S3_ACCESS_KEY_ID: z.string(),
  S3_SECRET_ACCESS_KEY: z.string(),
  S3_REGION: z.string().default('auto'),
})

export const env = envSchema.parse(process.env)
