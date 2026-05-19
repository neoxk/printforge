import { WooAuthMethod, type IntegrationConnection } from '@prisma/client'
import { prisma } from '../../lib/prisma.js'
import { AppError } from '../../lib/errors.js'
import { env } from '../../config/env.js'

type IntegrationPayload = {
  connectionName: string
  storeUrl: string
  restApiBase: string
  authMethod: 'public_store_api' | 'consumer_keys'
  consumerKey: string
  consumerSecret: string
  apiStatus: string
  lastSync: string
  mode: string
  importPublishedProducts: boolean
  importAttributes: boolean
  importVariations: boolean
}

type WooAttributeTerm = {
  id?: number
  name?: string
  slug?: string
}

type WooStoreAttribute = {
  id?: number
  name: string
  terms?: WooAttributeTerm[]
  options?: string[]
}

type WooStoreProduct = {
  id: number
  name: string
  slug: string
  sku?: string
  categories?: Array<{ name: string }>
  attributes?: WooStoreAttribute[]
  prices?: {
    price?: string
    currency_prefix?: string
    currency_suffix?: string
    currency_minor_unit?: number
  }
}

function formatSyncLabel(date: Date | null) {
  if (!date) {
    return 'Not synced yet'
  }

  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

function parseSyncLabel(value: string) {
  const parsedValue = Date.parse(value)
  return Number.isNaN(parsedValue) ? null : new Date(parsedValue)
}

function trimTrailingSlashes(value: string) {
  return value.trim().replace(/\/+$/g, '')
}

function resolveInternalWooCommerceUrl(value: string) {
  if (!env.WOOCOMMERCE_INTERNAL_URL) {
    return value
  }

  const url = new URL(value)
  const isLocalWordPressUrl =
    ['localhost', '127.0.0.1'].includes(url.hostname) && url.port === '8080'

  if (!isLocalWordPressUrl) {
    return value
  }

  const internalUrl = new URL(env.WOOCOMMERCE_INTERNAL_URL)
  url.protocol = internalUrl.protocol
  url.hostname = internalUrl.hostname
  url.port = internalUrl.port
  return url.toString()
}

function getDefaultConnection() {
  return {
    connectionName: 'Primary WooCommerce Store',
    storeUrl: 'http://localhost:8080',
    restApiBase: 'http://localhost:8080/index.php?rest_route=/wc/store/v1/products',
    authMethod: WooAuthMethod.public_store_api,
    consumerKey: '',
    consumerSecret: '',
    apiStatus: 'Not tested',
    lastSync: null,
    mode: 'Manual sync with audit trail',
    importPublishedProducts: true,
    importAttributes: true,
    importVariations: true,
  }
}

function serializeIntegration(connection: IntegrationConnection) {
  return {
    connectionName: connection.connectionName,
    storeUrl: connection.storeUrl,
    restApiBase: connection.restApiBase,
    authMethod: connection.authMethod,
    consumerKey: connection.consumerKey ?? '',
    consumerSecret: connection.consumerSecret ?? '',
    apiStatus: connection.apiStatus,
    lastSync: formatSyncLabel(connection.lastSync),
    mode: connection.mode,
    importPublishedProducts: connection.importPublishedProducts,
    importAttributes: connection.importAttributes,
    importVariations: connection.importVariations,
  }
}

function formatStorePrice(product: WooStoreProduct) {
  const rawPrice = product.prices?.price

  if (!rawPrice) {
    return 'N/A'
  }

  const minorUnit = product.prices?.currency_minor_unit ?? 2
  const amount = Number(rawPrice) / 10 ** minorUnit

  if (!Number.isFinite(amount)) {
    return 'N/A'
  }

  return `${product.prices?.currency_prefix ?? '$'}${amount.toFixed(minorUnit)}${product.prices?.currency_suffix ?? ''}`
}

function getSku(product: WooStoreProduct) {
  if (product.sku?.trim()) {
    return product.sku
  }

  return String(product.id)
}

function buildProductsRequestUrl(connection: IntegrationConnection) {
  const configuredValue = trimTrailingSlashes(connection.restApiBase)

  if (!configuredValue) {
    throw new AppError(400, 'WooCommerce API base URL is required.')
  }

  const externalProductsUrl = configuredValue.endsWith('/products')
    ? configuredValue
    : `${configuredValue}/products`
  const productsUrl = resolveInternalWooCommerceUrl(externalProductsUrl)

  if (connection.authMethod !== WooAuthMethod.consumer_keys) {
    return productsUrl
  }

  if (!connection.consumerKey || !connection.consumerSecret) {
    throw new AppError(400, 'Consumer key and consumer secret are required.')
  }

  const url = new URL(productsUrl)
  url.searchParams.set('consumer_key', connection.consumerKey)
  url.searchParams.set('consumer_secret', connection.consumerSecret)
  url.searchParams.set('per_page', '100')
  return url.toString()
}

export async function getCurrentIntegration() {
  let connection = await prisma.integrationConnection.findFirst({
    orderBy: { createdAt: 'asc' },
  })

  if (!connection) {
    connection = await prisma.integrationConnection.create({
      data: getDefaultConnection(),
    })
  }

  return serializeIntegration(connection)
}

export async function saveIntegration(payload: IntegrationPayload) {
  const existingConnection = await prisma.integrationConnection.findFirst({
    orderBy: { createdAt: 'asc' },
  })

  const data = {
    connectionName: payload.connectionName,
    storeUrl: payload.storeUrl,
    restApiBase: payload.restApiBase,
    authMethod: payload.authMethod === 'consumer_keys'
      ? WooAuthMethod.consumer_keys
      : WooAuthMethod.public_store_api,
    consumerKey: payload.consumerKey || null,
    consumerSecret: payload.consumerSecret || null,
    apiStatus: payload.apiStatus,
    lastSync: parseSyncLabel(payload.lastSync),
    mode: payload.mode,
    importPublishedProducts: payload.importPublishedProducts,
    importAttributes: payload.importAttributes,
    importVariations: payload.importVariations,
  }

  const connection = existingConnection
    ? await prisma.integrationConnection.update({
        where: { id: existingConnection.id },
        data,
      })
    : await prisma.integrationConnection.create({ data })

  return serializeIntegration(connection)
}

export async function getCurrentConnectionRecord() {
  let connection = await prisma.integrationConnection.findFirst({
    orderBy: { createdAt: 'asc' },
  })

  if (!connection) {
    connection = await prisma.integrationConnection.create({
      data: getDefaultConnection(),
    })
  }

  return connection
}

export async function syncWooProducts() {
  const connection = await getCurrentConnectionRecord()
  const requestUrl = buildProductsRequestUrl(connection)
  const response = await fetch(requestUrl, {
    headers: {
      Accept: 'application/json',
    },
  })

  if (!response.ok) {
    throw new AppError(
      response.status,
      `WooCommerce sync failed with status ${response.status}.`,
    )
  }

  const products = (await response.json()) as WooStoreProduct[]
  const syncedAt = new Date()

  await prisma.$transaction([
    prisma.product.deleteMany({
      where: { connectionId: connection.id },
    }),
    ...products.map((product) =>
      prisma.product.create({
        data: {
          connectionId: connection.id,
          wooProductId: BigInt(product.id),
          name: product.name,
          category: product.categories?.map((category) => category.name).join(', ') || 'Uncategorized',
          status: 'Store synced',
          sku: getSku(product),
          basePrice: formatStorePrice(product),
        },
      }),
    ),
    prisma.integrationConnection.update({
      where: { id: connection.id },
      data: {
        apiStatus: 'Healthy',
        lastSync: syncedAt,
      },
    }),
  ])

  return {
    products: await listSyncedProducts(),
    syncedAt: formatSyncLabel(syncedAt),
    connectionName: connection.connectionName,
    authMethod: connection.authMethod,
  }
}

export async function listSyncedProducts() {
  const connection = await getCurrentConnectionRecord()
  const products = await prisma.product.findMany({
    where: { connectionId: connection.id },
    orderBy: { updatedAt: 'desc' },
  })

  return products.map((product) => ({
    id: product.id,
    wooProductId: product.wooProductId.toString(),
    name: product.name,
    category: product.category,
    status: product.status,
    sku: product.sku,
    basePrice: product.basePrice,
  }))
}
