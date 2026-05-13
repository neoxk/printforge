import { createApp } from './src/app.js'
import { env } from './src/config/env.js'

const app = await createApp()

try {
  await app.listen({ port: env.PORT, host: '0.0.0.0' })
} catch (err) {
  app.log.error(err)
  process.exit(1)
}
