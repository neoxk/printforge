import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AppError } from '../../../src/lib/errors.js'
import { prisma } from '../../../src/lib/prisma.js'
import {
  getCurrentConnectionRecord,
  getCurrentIntegration,
  listSyncedProducts,
  saveIntegration,
  syncWooProducts,
} from '../../../src/modules/integration/integration.service.js'

vi.mock('../../../src/config/env.js', () => ({
  env: {
    WOOCOMMERCE_INTERNAL_URL: undefined,
  },
}))

vi.mock('../../../src/lib/prisma.js', () => ({
  prisma: {
    $transaction: vi.fn(),
    integrationConnection: {
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    product: {
      deleteMany: vi.fn(),
      create: vi.fn(),
      findMany: vi.fn(),
    },
  },
}))

const integrationConnection = (prisma as any).integrationConnection as {
  findFirst: ReturnType<typeof vi.fn>
  create: ReturnType<typeof vi.fn>
  update: ReturnType<typeof vi.fn>
}

const product = (prisma as any).product as {
  deleteMany: ReturnType<typeof vi.fn>
  create: ReturnType<typeof vi.fn>
  findMany: ReturnType<typeof vi.fn>
}

const transaction = (prisma as any).$transaction as ReturnType<typeof vi.fn>
const fetchMock = vi.fn()

const connection = {
  id: 'connection-1',
  connectionName: 'Primary WooCommerce Store',
  storeUrl: 'http://localhost:8080',
  restApiBase: 'http://localhost:8080/wp-json/wc/store/v1',
  authMethod: 'public_store_api',
  consumerKey: null,
  consumerSecret: null,
  webhookSecret: 'pf_live_existing-secret',
  apiStatus: 'Not tested',
  lastSync: null,
  mode: 'Manual sync with audit trail',
  importPublishedProducts: true,
  importAttributes: true,
  importVariations: true,
  createdAt: new Date('2026-01-01T10:00:00.000Z'),
  updatedAt: new Date('2026-01-01T10:00:00.000Z'),
}

describe('getCurrentIntegration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    integrationConnection.findFirst.mockResolvedValue(connection)
  })

  it('returns the first integration connection as a serialized payload', async () => {
    const result = await getCurrentIntegration()

    expect(integrationConnection.findFirst).toHaveBeenCalledWith({
      orderBy: { createdAt: 'asc' },
    })
    expect(integrationConnection.create).not.toHaveBeenCalled()
    expect(result).toEqual({
      connectionName: 'Primary WooCommerce Store',
      storeUrl: 'http://localhost:8080',
      restApiBase: 'http://localhost:8080/wp-json/wc/store/v1',
      authMethod: 'public_store_api',
      consumerKey: '',
      consumerSecret: '',
      webhookSecret: 'pf_live_existing-secret',
      apiStatus: 'Not tested',
      lastSync: 'Not synced yet',
      mode: 'Manual sync with audit trail',
      importPublishedProducts: true,
      importAttributes: true,
      importVariations: true,
    })
  })

  it('creates and returns the default connection when none exists', async () => {
    integrationConnection.findFirst.mockResolvedValue(null)
    integrationConnection.create.mockResolvedValue(connection)

    const result = await getCurrentIntegration()

    expect(integrationConnection.create).toHaveBeenCalledWith({
      data: {
        connectionName: 'Primary WooCommerce Store',
        storeUrl: 'http://localhost:8080',
        restApiBase: 'http://localhost:8080/index.php?rest_route=/wc/store/v1/products',
        authMethod: 'public_store_api',
        consumerKey: '',
        consumerSecret: '',
        webhookSecret: expect.any(String),
        apiStatus: 'Not tested',
        lastSync: null,
        mode: 'Manual sync with audit trail',
        importPublishedProducts: true,
        importAttributes: true,
        importVariations: true,
      },
    })
    expect(result.connectionName).toBe('Primary WooCommerce Store')
    expect(result.lastSync).toBe('Not synced yet')
  })
})

describe('saveIntegration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    integrationConnection.findFirst.mockResolvedValue(connection)
    integrationConnection.update.mockResolvedValue({
      ...connection,
      connectionName: 'Production Store',
      authMethod: 'consumer_keys',
      consumerKey: 'ck_test',
      consumerSecret: 'cs_test',
      lastSync: new Date('2026-05-20T09:30:00.000Z'),
    })
  })

  it('updates the existing connection and serializes the saved values', async () => {
    const result = await saveIntegration({
      connectionName: 'Production Store',
      storeUrl: 'https://store.example.com',
      restApiBase: 'https://store.example.com/wp-json/wc/v3',
      authMethod: 'consumer_keys',
      consumerKey: 'ck_test',
      consumerSecret: 'cs_test',
      apiStatus: 'Healthy',
      lastSync: '2026-05-20T09:30:00.000Z',
      mode: 'Scheduled sync',
      importPublishedProducts: true,
      importAttributes: false,
      importVariations: true,
    })

    expect(integrationConnection.update).toHaveBeenCalledWith({
      where: { id: 'connection-1' },
      data: {
        connectionName: 'Production Store',
        storeUrl: 'https://store.example.com',
        restApiBase: 'https://store.example.com/wp-json/wc/v3',
        authMethod: 'consumer_keys',
        consumerKey: 'ck_test',
        consumerSecret: 'cs_test',
        apiStatus: 'Healthy',
        lastSync: new Date('2026-05-20T09:30:00.000Z'),
        mode: 'Scheduled sync',
        importPublishedProducts: true,
        importAttributes: false,
        importVariations: true,
      },
    })
    expect(result).toMatchObject({
      connectionName: 'Production Store',
      authMethod: 'consumer_keys',
      consumerKey: 'ck_test',
      consumerSecret: 'cs_test',
    })
  })

  it('creates a connection when none exists and stores empty credentials as null', async () => {
    integrationConnection.findFirst.mockResolvedValue(null)
    integrationConnection.create.mockResolvedValue({
      ...connection,
      consumerKey: null,
      consumerSecret: null,
    })

    await saveIntegration({
      connectionName: 'Primary WooCommerce Store',
      storeUrl: 'http://localhost:8080',
      restApiBase: 'http://localhost:8080/wp-json/wc/store/v1',
      authMethod: 'public_store_api',
      consumerKey: '',
      consumerSecret: '',
      apiStatus: 'Not tested',
      lastSync: 'Not synced yet',
      mode: 'Manual sync with audit trail',
      importPublishedProducts: true,
      importAttributes: true,
      importVariations: true,
    })

    expect(integrationConnection.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        authMethod: 'public_store_api',
        consumerKey: null,
        consumerSecret: null,
        lastSync: null,
      }),
    })
  })
})

describe('getCurrentConnectionRecord', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    integrationConnection.findFirst.mockResolvedValue(connection)
  })

  it('returns the stored connection record', async () => {
    await expect(getCurrentConnectionRecord()).resolves.toEqual(connection)
    expect(integrationConnection.create).not.toHaveBeenCalled()
  })
})

describe('syncWooProducts', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal('fetch', fetchMock)
    integrationConnection.findFirst.mockResolvedValue(connection)
    product.deleteMany.mockReturnValue({ operation: 'delete-products' })
    product.create.mockReturnValue({ operation: 'create-product' })
    product.findMany.mockResolvedValue([
      {
        id: 'product-1',
        wooProductId: BigInt(123),
        name: 'Business Cards',
        category: 'Stationery',
        status: 'Store synced',
        sku: 'BC-001',
        basePrice: '$12.34',
        updatedAt: new Date('2026-05-20T10:00:00.000Z'),
      },
    ])
    integrationConnection.update.mockReturnValue({ operation: 'update-connection' })
    transaction.mockResolvedValue([])
    fetchMock.mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue([
        {
          id: 123,
          name: 'Business Cards',
          slug: 'business-cards',
          sku: 'BC-001',
          categories: [{ name: 'Stationery' }],
          prices: {
            price: '1234',
            currency_prefix: '$',
            currency_minor_unit: 2,
          },
        },
      ]),
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('fetches WooCommerce products, replaces synced products, and returns the refreshed list', async () => {
    const result = await syncWooProducts()

    expect(fetchMock).toHaveBeenCalledWith('http://localhost:8080/wp-json/wc/store/v1/products', {
      headers: {
        Accept: 'application/json',
      },
    })
    expect(product.deleteMany).toHaveBeenCalledWith({
      where: { connectionId: 'connection-1' },
    })
    expect(product.create).toHaveBeenCalledWith({
      data: {
        connectionId: 'connection-1',
        wooProductId: BigInt(123),
        name: 'Business Cards',
        category: 'Stationery',
        status: 'Store synced',
        sku: 'BC-001',
        basePrice: '$12.34',
      },
    })
    expect(transaction).toHaveBeenCalledWith([
      { operation: 'delete-products' },
      { operation: 'create-product' },
      { operation: 'update-connection' },
    ])
    expect(result).toMatchObject({
      products: [
        {
          id: 'product-1',
          wooProductId: '123',
          name: 'Business Cards',
          category: 'Stationery',
          status: 'Store synced',
          sku: 'BC-001',
          basePrice: '$12.34',
        },
      ],
      connectionName: 'Primary WooCommerce Store',
      authMethod: 'public_store_api',
    })
  })

  it('throws when WooCommerce responds with an error status', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 503,
    })

    await expect(syncWooProducts()).rejects.toMatchObject({
      statusCode: 503,
      message: 'WooCommerce sync failed with status 503.',
    } satisfies Partial<AppError>)

    expect(transaction).not.toHaveBeenCalled()
  })

  it('throws when consumer key authentication is selected without credentials', async () => {
    integrationConnection.findFirst.mockResolvedValue({
      ...connection,
      authMethod: 'consumer_keys',
      consumerKey: null,
      consumerSecret: null,
    })

    await expect(syncWooProducts()).rejects.toMatchObject({
      statusCode: 400,
      message: 'Consumer key and consumer secret are required.',
    } satisfies Partial<AppError>)

    expect(fetchMock).not.toHaveBeenCalled()
  })
})

describe('listSyncedProducts', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    integrationConnection.findFirst.mockResolvedValue(connection)
    product.findMany.mockResolvedValue([
      {
        id: 'product-1',
        wooProductId: BigInt(321),
        name: 'Flyers',
        category: 'Marketing',
        status: 'Store synced',
        sku: '321',
        basePrice: 'EUR 9.99',
        updatedAt: new Date('2026-05-20T10:00:00.000Z'),
      },
    ])
  })

  it('returns synced products for the current connection', async () => {
    const result = await listSyncedProducts()

    expect(product.findMany).toHaveBeenCalledWith({
      where: { connectionId: 'connection-1' },
      orderBy: { updatedAt: 'desc' },
    })
    expect(result).toEqual([
      {
        id: 'product-1',
        wooProductId: '321',
        name: 'Flyers',
        category: 'Marketing',
        status: 'Store synced',
        sku: '321',
        basePrice: 'EUR 9.99',
      },
    ])
  })
})
