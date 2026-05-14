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
})

export const env = envSchema.parse(process.env)
