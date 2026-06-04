import { beforeEach, describe, expect, it, vi } from 'vitest'
import { loginHandler, refreshHandler, registerHandler } from '../../../src/modules/auth/auth.controller.js'
import { isFirstTime, registerUser, validateCredentials } from '../../../src/modules/auth/auth.service.js'

vi.mock('../../../src/modules/auth/auth.service.js', () => ({
  isFirstTime: vi.fn(),
  registerUser: vi.fn(),
  validateCredentials: vi.fn(),
}))

const firstTime = isFirstTime as ReturnType<typeof vi.fn>
const register = registerUser as ReturnType<typeof vi.fn>
const validate = validateCredentials as ReturnType<typeof vi.fn>

const user = {
  id: 'user-1',
  email: 'owner@example.com',
  name: 'Owner',
  tenantName: 'Print Forge',
}

function reply() {
  return {
    accessSign: vi.fn().mockResolvedValue('access-token'),
    refreshSign: vi.fn().mockResolvedValue('refresh-token'),
    status: vi.fn(function (this: any) {
      return this
    }),
    send: vi.fn(),
  }
}

describe('auth controller', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    firstTime.mockResolvedValue(true)
    register.mockResolvedValue(user)
    validate.mockResolvedValue(user)
  })

  it('logs in with credentials and returns signed tokens', async () => {
    const res = reply()

    await loginHandler({ body: { email: 'owner@example.com', password: 'secret' } } as any, res as any)

    expect(validate).toHaveBeenCalledWith('owner@example.com', 'secret')
    expect(res.accessSign).toHaveBeenCalledWith(user, { expiresIn: '15m' })
    expect(res.refreshSign).toHaveBeenCalledWith(user, { expiresIn: '7d' })
    expect(res.send).toHaveBeenCalledWith({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      user,
    })
  })

  it('registers a user and responds with status 201', async () => {
    const res = reply()
    const body = {
      name: 'Owner',
      tenantName: 'Print Forge',
      email: 'owner@example.com',
      password: 'secret',
    }

    await registerHandler({ body } as any, res as any)

    expect(register).toHaveBeenCalledWith(body)
    expect(res.status).toHaveBeenCalledWith(201)
    expect(res.send).toHaveBeenCalledWith({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      user,
    })
  })

  it('refreshes tokens from the refresh token payload', async () => {
    const res = reply()
    const refreshVerify = vi.fn().mockResolvedValue(user)

    await refreshHandler(
      {
        body: { refreshToken: 'old-refresh-token' },
        refreshVerify,
      } as any,
      res as any,
    )

    expect(refreshVerify).toHaveBeenCalledWith({
      verify: {
        extractToken: expect.any(Function),
      },
    })
    expect(refreshVerify.mock.calls[0][0].verify.extractToken()).toBe('old-refresh-token')
    expect(res.send).toHaveBeenCalledWith({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      user,
    })
  })
})
