import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { prisma } from '../../src/lib/prisma.js'
import { s3 } from '../../src/lib/s3.js'
import { createApp } from '../../src/app.js'

vi.mock('../../src/config/env.js', () => ({
  env: {
    JWT_SECRET: 'integration-access-secret',
    JWT_REFRESH_SECRET: 'integration-refresh-secret',
    WOOCOMMERCE_INTERNAL_URL: undefined,
  },
}))

vi.mock('../../src/lib/s3.js', () => ({
  s3: { send: vi.fn() },
  S3_BUCKET: 'test-bucket',
}))

vi.mock('../../src/lib/prisma.js', () => ({
  prisma: {
    integrationConnection: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
  },
}))

const integrationConnection = (prisma as any).integrationConnection as {
  findFirst: ReturnType<typeof vi.fn>
  findMany: ReturnType<typeof vi.fn>
  create: ReturnType<typeof vi.fn>
  update: ReturnType<typeof vi.fn>
}

const s3Mock = s3 as unknown as { send: ReturnType<typeof vi.fn> }

const WEBHOOK_SECRET = 'pf_live_known-test-secret'
const connectionId = '33333333-3333-4333-8333-333333333333'

async function buildApp() {
  const app = await createApp()
  await app.ready()
  return app
}

describe('storage assign route (webhook auth)', () => {
  let app: Awaited<ReturnType<typeof buildApp>>

  beforeEach(async () => {
    vi.clearAllMocks()

    const connectionRecord = {
      id: connectionId,
      connectionName: 'Primary Store',
      webhookSecret: WEBHOOK_SECRET,
      createdAt: new Date('2026-01-01T10:00:00.000Z'),
    }
    integrationConnection.findFirst.mockResolvedValue(connectionRecord)
    // verifyWebhookSecret authenticates against any connection holding the secret.
    integrationConnection.findMany.mockResolvedValue([connectionRecord])
    // assignToOrder lists temp objects per session; empty bucket = nothing moved.
    s3Mock.send.mockResolvedValue({ Contents: [] })

    app = await buildApp()
  })

  afterEach(async () => {
    await app.close()
  })

  const assign = (headers: Record<string, string>) =>
    app.inject({
      method: 'POST',
      url: '/api/storage/orders/4321/assign',
      headers,
      payload: { sessionIds: ['session-a'] },
    })

  it('rejects requests with no secret header', async () => {
    const response = await assign({})
    expect(response.statusCode).toBe(401)
    expect(s3Mock.send).not.toHaveBeenCalled()
  })

  it('rejects requests with the wrong secret', async () => {
    const response = await assign({ 'x-printforge-secret': 'pf_live_wrong' })
    expect(response.statusCode).toBe(401)
    expect(s3Mock.send).not.toHaveBeenCalled()
  })

  it('accepts requests with the correct secret', async () => {
    const response = await assign({ 'x-printforge-secret': WEBHOOK_SECRET })
    expect(response.statusCode).toBe(200)
    expect(response.json()).toEqual({ movedCount: 0, keys: [] })
  })

  it('namespaces each session so same-named files from different designs do not collide', async () => {
    // Two cart items of the same product → identical per-view filename
    // (view-front.png) under different session ids. They must NOT overwrite
    // each other in the order.
    s3Mock.send.mockImplementation((command: { constructor: { name: string }; input: any }) => {
      const name = command.constructor.name
      if (name === 'ListObjectsV2Command') {
        const prefix: string = command.input.Prefix
        return Promise.resolve({ Contents: [{ Key: `${prefix}view-front.png` }] })
      }
      return Promise.resolve({})
    })

    const response = await app.inject({
      method: 'POST',
      url: '/api/storage/orders/4321/assign',
      headers: { 'x-printforge-secret': WEBHOOK_SECRET },
      payload: { sessionIds: ['session-a', 'session-b'] },
    })

    expect(response.statusCode).toBe(200)
    expect(response.json()).toEqual({
      movedCount: 2,
      keys: [
        'orders/4321/session-a/view-front.png',
        'orders/4321/session-b/view-front.png',
      ],
    })

    const copyDestinations = s3Mock.send.mock.calls
      .map(([command]) => command)
      .filter((command: any) => command.constructor.name === 'CopyObjectCommand')
      .map((command: any) => command.input.Key)
    expect(copyDestinations).toEqual([
      'orders/4321/session-a/view-front.png',
      'orders/4321/session-b/view-front.png',
    ])
  })
})
