import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const WOO_PROXY_PATH = '/__printforge/woocommerce-sync'

function trimTrailingSlashes(value: string) {
  return value.trim().replace(/\/+$/g, '')
}

function buildWooProductsUrl(payload: {
  authMethod?: 'public_store_api' | 'consumer_keys'
  restApiBase?: string
  consumerKey?: string
  consumerSecret?: string
}) {
  const configuredValue = trimTrailingSlashes(payload.restApiBase ?? '')

  if (!configuredValue) {
    throw new Error('A WooCommerce API base URL is required.')
  }

  const productsUrl = configuredValue.endsWith('/products')
    ? configuredValue
    : `${configuredValue}/products`

  if (payload.authMethod !== 'consumer_keys') {
    return productsUrl
  }

  const url = new URL(productsUrl)

  if (!payload.consumerKey?.trim() || !payload.consumerSecret?.trim()) {
    throw new Error('Consumer key and consumer secret are required for this connection method.')
  }

  url.searchParams.set('consumer_key', payload.consumerKey.trim())
  url.searchParams.set('consumer_secret', payload.consumerSecret.trim())
  url.searchParams.set('per_page', '100')

  return url.toString()
}

const hmrHost = process.env.VITE_HMR_HOST
const hmrClientPort = process.env.VITE_HMR_CLIENT_PORT
const hmrPath = process.env.VITE_HMR_PATH

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'printforge-woocommerce-dev-proxy',
      configureServer(server) {
        server.middlewares.use(WOO_PROXY_PATH, async (req, res) => {
          if (req.method !== 'POST') {
            res.statusCode = 405
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: 'Method not allowed' }))
            return
          }

          try {
            const body = await new Promise<string>((resolve, reject) => {
              let rawBody = ''

              req.on('data', (chunk) => {
                rawBody += chunk
              })
              req.on('end', () => resolve(rawBody))
              req.on('error', reject)
            })

            const payload = JSON.parse(body) as {
              authMethod?: 'public_store_api' | 'consumer_keys'
              restApiBase?: string
              consumerKey?: string
              consumerSecret?: string
            }

            const upstreamUrl = buildWooProductsUrl(payload)
            const upstreamResponse = await fetch(upstreamUrl, {
              headers: {
                Accept: 'application/json',
              },
            })

            const responseText = await upstreamResponse.text()
            res.statusCode = upstreamResponse.status
            res.setHeader(
              'Content-Type',
              upstreamResponse.headers.get('content-type') ?? 'application/json',
            )
            res.end(responseText)
          } catch (error) {
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json')
            res.end(
              JSON.stringify({
                error:
                  error instanceof Error
                    ? error.message
                    : 'WooCommerce proxy request failed.',
              }),
            )
          }
        })
      },
    },
  ],
  base: process.env.VITE_BASE_PATH ?? '/',
  server: {
    hmr: hmrHost || hmrClientPort || hmrPath
      ? {
          host: hmrHost,
          clientPort: hmrClientPort ? Number(hmrClientPort) : undefined,
          path: hmrPath,
        }
      : undefined,
    proxy: {
      '/api': process.env.VITE_API_PROXY_TARGET ?? 'http://localhost:3000',
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@printforge/ui': fileURLToPath(new URL('../../packages/ui/src/index.ts', import.meta.url)),
    },
  },
})
