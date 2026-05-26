import bcrypt from 'bcrypt'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AppError, ConflictError, UnauthorizedError } from '../../../src/lib/errors.js'
import { prisma } from '../../../src/lib/prisma.js'
import { registerUser, validateCredentials } from '../../../src/modules/auth/auth.service.js'

vi.mock('bcrypt', () => ({
  default: {
    compare: vi.fn(),
    hash: vi.fn(),
  },
}))

vi.mock('../../../src/lib/prisma.js', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}))

const user = (prisma as any).user as {
  findUnique: ReturnType<typeof vi.fn>
  create: ReturnType<typeof vi.fn>
}

const bcryptMock = bcrypt as unknown as {
  compare: ReturnType<typeof vi.fn>
  hash: ReturnType<typeof vi.fn>
}

const storedUser = {
  id: 'user-1',
  email: 'owner@example.com',
  name: 'Owner',
  tenantName: 'Print Forge',
  passwordHash: 'hashed-password',
}

describe('validateCredentials', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    user.findUnique.mockResolvedValue(storedUser)
    bcryptMock.compare.mockResolvedValue(true)
  })

  it('returns the session user when credentials are valid', async () => {
    const result = await validateCredentials('owner@example.com', 'plain-password')

    expect(user.findUnique).toHaveBeenCalledWith({ where: { email: 'owner@example.com' } })
    expect(bcryptMock.compare).toHaveBeenCalledWith('plain-password', 'hashed-password')
    expect(result).toEqual({
      id: 'user-1',
      email: 'owner@example.com',
      name: 'Owner',
      tenantName: 'Print Forge',
    })
  })

  it('throws when the user does not exist', async () => {
    user.findUnique.mockResolvedValue(null)

    await expect(validateCredentials('missing@example.com', 'plain-password')).rejects.toBeInstanceOf(
      UnauthorizedError,
    )
    expect(bcryptMock.compare).not.toHaveBeenCalled()
  })

  it('throws when the password is invalid', async () => {
    bcryptMock.compare.mockResolvedValue(false)

    await expect(validateCredentials('owner@example.com', 'wrong-password')).rejects.toMatchObject({
      statusCode: 401,
      message: 'Invalid credentials',
    } satisfies Partial<AppError>)
  })
})

describe('registerUser', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    user.findUnique.mockResolvedValue(null)
    bcryptMock.hash.mockResolvedValue('new-hashed-password')
    user.create.mockResolvedValue({
      id: 'user-2',
      email: 'new@example.com',
      name: 'New Owner',
      tenantName: 'New Print Shop',
      passwordHash: 'new-hashed-password',
    })
  })

  it('creates a user with a hashed password and returns the session user', async () => {
    const result = await registerUser({
      name: 'New Owner',
      tenantName: 'New Print Shop',
      email: 'new@example.com',
      password: 'plain-password',
    })

    expect(user.findUnique).toHaveBeenCalledWith({ where: { email: 'new@example.com' } })
    expect(bcryptMock.hash).toHaveBeenCalledWith('plain-password', 10)
    expect(user.create).toHaveBeenCalledWith({
      data: {
        name: 'New Owner',
        tenantName: 'New Print Shop',
        email: 'new@example.com',
        passwordHash: 'new-hashed-password',
      },
    })
    expect(result).toEqual({
      id: 'user-2',
      email: 'new@example.com',
      name: 'New Owner',
      tenantName: 'New Print Shop',
    })
  })

  it('throws when an account with the email already exists', async () => {
    user.findUnique.mockResolvedValue(storedUser)

    await expect(
      registerUser({
        name: 'Owner',
        tenantName: 'Print Forge',
        email: 'owner@example.com',
        password: 'plain-password',
      }),
    ).rejects.toBeInstanceOf(ConflictError)

    expect(bcryptMock.hash).not.toHaveBeenCalled()
    expect(user.create).not.toHaveBeenCalled()
  })
})
