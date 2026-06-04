import bcrypt from 'bcrypt'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { prisma } from '../../src/lib/prisma.js'
import { createApp } from '../../src/app.js'

vi.mock('../../src/config/env.js', () => ({
  env: {
    JWT_SECRET: 'integration-access-secret',
    JWT_REFRESH_SECRET: 'integration-refresh-secret',
    WOOCOMMERCE_INTERNAL_URL: undefined,
  },
}))

vi.mock('bcrypt', () => ({
  default: {
    compare: vi.fn(),
    hash: vi.fn(),
  },
}))

vi.mock('../../src/lib/prisma.js', () => ({
  prisma: {
    user: {
      count: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    integrationConnection: {
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    product: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      deleteMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    optionsContainer: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    containerOptionItem: {
      findMany: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
      update: vi.fn(),
    },
    optionItem: {
      findUnique: vi.fn(),
    },
  },
}))

const user = (prisma as any).user as {
  count: ReturnType<typeof vi.fn>
  findUnique: ReturnType<typeof vi.fn>
  create: ReturnType<typeof vi.fn>
}

const integrationConnection = (prisma as any).integrationConnection as {
  findFirst: ReturnType<typeof vi.fn>
  create: ReturnType<typeof vi.fn>
}

const product = (prisma as any).product as {
  findUnique: ReturnType<typeof vi.fn>
  findMany: ReturnType<typeof vi.fn>
}

const optionsContainer = (prisma as any).optionsContainer as {
  findMany: ReturnType<typeof vi.fn>
}

const bcryptMock = bcrypt as unknown as {
  compare: ReturnType<typeof vi.fn>
  hash: ReturnType<typeof vi.fn>
}

const productId = '11111111-1111-4111-8111-111111111111'
const itemId = '22222222-2222-4222-8222-222222222222'
const connectionId = '33333333-3333-4333-8333-333333333333'

const storedUser = {
  id: '44444444-4444-4444-8444-444444444444',
  email: 'owner@example.com',
  name: 'Owner',
  tenantName: 'Print Forge',
  passwordHash: 'hashed-password',
}

const decimal = (value: number) => ({
  toNumber: () => value,
  toString: () => String(value),
  valueOf: () => value,
})

async function buildApp() {
  const app = await createApp()
  await app.ready()
  return app
}

describe('backend integration routes', () => {
  let app: Awaited<ReturnType<typeof buildApp>>

  beforeEach(async () => {
    vi.clearAllMocks()

    bcryptMock.compare.mockResolvedValue(true)
    bcryptMock.hash.mockResolvedValue('new-hashed-password')
    user.count.mockResolvedValue(0)
    user.findUnique.mockResolvedValue(storedUser)
    user.create.mockResolvedValue({
      ...storedUser,
      email: 'new@example.com',
      passwordHash: 'new-hashed-password',
    })

    integrationConnection.findFirst.mockResolvedValue({
      id: connectionId,
      connectionName: 'Primary Store',
      createdAt: new Date('2026-01-01T10:00:00.000Z'),
    })
    integrationConnection.create.mockResolvedValue({
      id: connectionId,
      connectionName: 'Primary Store',
      createdAt: new Date('2026-01-01T10:00:00.000Z'),
    })
    product.findMany.mockResolvedValue([
      {
        id: productId,
        wooProductId: BigInt(123),
        name: 'Business Cards',
        category: 'Stationery',
        status: 'Store synced',
        sku: 'BC-001',
        basePrice: '$12.34',
      },
    ])

    app = await buildApp()
  })

  afterEach(async () => {
    await app.close()
  })

  it('supports register, login, and refresh auth flow', async () => {
    user.findUnique.mockResolvedValueOnce(null).mockResolvedValueOnce(storedUser)

    const registerResponse = await app.inject({
      method: 'POST',
      url: '/api/auth/register',
      payload: {
        name: 'New Owner',
        tenantName: 'Print Forge',
        email: 'new@example.com',
        password: 'password123',
      },
    })

    expect(registerResponse.statusCode).toBe(201)
    expect(registerResponse.json()).toMatchObject({
      accessToken: expect.any(String),
      refreshToken: expect.any(String),
      user: {
        email: 'new@example.com',
        tenantName: 'Print Forge',
      },
    })

    const loginResponse = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: {
        email: 'owner@example.com',
        password: 'password123',
      },
    })

    expect(loginResponse.statusCode).toBe(200)
    const loginBody = loginResponse.json()
    expect(loginBody).toMatchObject({
      accessToken: expect.any(String),
      refreshToken: expect.any(String),
      user: {
        id: storedUser.id,
        email: 'owner@example.com',
      },
    })

    const refreshResponse = await app.inject({
      method: 'POST',
      url: '/api/auth/refresh',
      payload: {
        refreshToken: loginBody.refreshToken,
      },
    })

    expect(refreshResponse.statusCode).toBe(200)
    expect(refreshResponse.json()).toMatchObject({
      accessToken: expect.any(String),
      refreshToken: expect.any(String),
      user: {
        id: storedUser.id,
        email: 'owner@example.com',
      },
    })
  })

  it('rejects missing auth on protected routes and accepts a valid access token', async () => {
    const missingAuthResponse = await app.inject({
      method: 'GET',
      url: '/api/products',
    })

    expect(missingAuthResponse.statusCode).toBe(401)

    const loginResponse = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: {
        email: 'owner@example.com',
        password: 'password123',
      },
    })
    const { accessToken } = loginResponse.json()

    const protectedResponse = await app.inject({
      method: 'GET',
      url: '/api/products',
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
    })

    expect(protectedResponse.statusCode).toBe(200)
    expect(protectedResponse.json()).toEqual([
      {
        id: productId,
        wooProductId: '123',
        name: 'Business Cards',
        category: 'Stationery',
        status: 'Store synced',
        sku: 'BC-001',
        basePrice: '$12.34',
      },
    ])
  })

  it('returns public product config by product id and WooCommerce product id', async () => {
    product.findUnique.mockResolvedValue({
      id: productId,
      connectionId,
      wooProductId: BigInt(123),
      name: 'Business Cards',
      width: decimal(90),
      height: decimal(50),
    })
    optionsContainer.findMany.mockResolvedValue([
      {
        id: 'container-1',
        name: 'Paper',
        containerType: 'SINGLE_SELECT',
        isHidden: false,
        isRequired: true,
        defaultItemId: itemId,
        items: [
          {
            itemId,
            name: 'Matte finish',
            item: {
              name: 'Matte',
              slug: 'matte',
            },
          },
        ],
      },
    ])

    const byProductIdResponse = await app.inject({
      method: 'GET',
      url: `/api/products/${productId}/config`,
    })

    expect(byProductIdResponse.statusCode).toBe(200)
    expect(byProductIdResponse.json()).toEqual({
      productId,
      dimensions: { type: 'fixed', widthMm: 90, heightMm: 50 },
      containers: [
        {
          id: 'container-1',
          name: 'Paper',
          containerType: 'SINGLE_SELECT',
          isHidden: false,
          isRequired: true,
          defaultItemId: itemId,
          items: [{ id: itemId, name: 'Matte finish', slug: 'matte' }],
        },
      ],
    })

    const byWooIdResponse = await app.inject({
      method: 'GET',
      url: '/api/products/woo/123/config',
    })

    expect(byWooIdResponse.statusCode).toBe(200)
    expect(product.findUnique).toHaveBeenCalledWith({
      where: {
        uq_synced_product_connection_woo_id: {
          connectionId,
          wooProductId: BigInt(123),
        },
      },
    })
    expect(byWooIdResponse.json().productId).toBe(productId)
  })

  it('calculates pricing through the public pricing endpoint', async () => {
    product.findUnique.mockResolvedValue({ id: productId })
    optionsContainer.findMany.mockResolvedValue([
      {
        id: 'container-size',
        productId,
        name: 'Size',
        sortOrder: 0,
        containerType: 'SINGLE_SELECT',
        isRequired: true,
        items: [
          {
            id: 'slot-1',
            containerId: 'container-size',
            itemId,
            sortOrder: 0,
            name: 'Large print',
            priceUnit: decimal(6),
            item: {
              id: itemId,
              name: 'Large',
              slug: 'large',
              priceUnit: decimal(5),
              lengthMm: null,
              widthMm: null,
              calculationBasis: 'PCS',
            },
          },
        ],
      },
    ])

    const response = await app.inject({
      method: 'POST',
      url: '/api/pricing/calculate',
      payload: {
        productId,
        selectedItemIds: [itemId],
        context: {
          widthMm: 100,
          heightMm: 200,
          quantity: 3,
        },
      },
    })

    expect(response.statusCode).toBe(200)
    expect(response.json()).toEqual({
      total: 18,
      breakdown: [
        {
          itemId,
          name: 'Large print',
          calculationBasis: 'PCS',
          cost: 18,
        },
      ],
    })
  })

  it('calculates quantity table pricing through the public pricing endpoint', async () => {
    product.findUnique.mockResolvedValue({ id: productId })
    optionsContainer.findMany.mockResolvedValue([
      {
        id: 'container-size',
        productId,
        name: 'Size',
        sortOrder: 0,
        containerType: 'SINGLE_SELECT',
        isRequired: true,
        items: [
          {
            id: 'slot-1',
            containerId: 'container-size',
            itemId,
            sortOrder: 0,
            name: 'Large print',
            priceUnit: decimal(6),
            item: {
              id: itemId,
              name: 'Large',
              slug: 'large',
              priceUnit: decimal(5),
              lengthMm: null,
              widthMm: null,
              calculationBasis: 'PCS',
            },
          },
        ],
      },
    ])

    const response = await app.inject({
      method: 'POST',
      url: '/api/pricing/quantity-table',
      payload: {
        productId,
        selectedItemIds: [itemId],
        context: {
          widthMm: 100,
          heightMm: 200,
          quantity: 1,
        },
        quantities: [3, 5],
      },
    })

    expect(response.statusCode).toBe(200)
    expect(response.json()).toEqual({
      rows: [
        {
          quantity: 3,
          optionsTotal: 18,
          breakdown: [
            {
              itemId,
              name: 'Large print',
              calculationBasis: 'PCS',
              cost: 18,
            },
          ],
        },
        {
          quantity: 5,
          optionsTotal: 30,
          breakdown: [
            {
              itemId,
              name: 'Large print',
              calculationBasis: 'PCS',
              cost: 30,
            },
          ],
        },
      ],
    })
  })
})
