import bcrypt from 'bcrypt'
import { prisma } from '../../lib/prisma.js'
import { ConflictError, UnauthorizedError } from '../../lib/errors.js'

type AuthSessionUser = {
  id: string
  email: string
  name: string
  tenantName: string
}

export async function validateCredentials(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) throw new UnauthorizedError('Invalid credentials')

  const valid = await bcrypt.compare(password, user.passwordHash)
  if (!valid) throw new UnauthorizedError('Invalid credentials')

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    tenantName: user.tenantName,
  } satisfies AuthSessionUser
}

export async function registerUser(input: {
  name: string
  tenantName: string
  email: string
  password: string
}) {
  const existingUser = await prisma.user.findUnique({ where: { email: input.email } })

  if (existingUser) {
    throw new ConflictError('An account with this email already exists.')
  }

  const passwordHash = await bcrypt.hash(input.password, 10)
  const user = await prisma.user.create({
    data: {
      name: input.name,
      tenantName: input.tenantName,
      email: input.email,
      passwordHash,
    },
  })

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    tenantName: user.tenantName,
  } satisfies AuthSessionUser
}
