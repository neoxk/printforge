import bcrypt from 'bcrypt'
import { prisma } from '../../lib/prisma.js'
import { UnauthorizedError } from '../../lib/errors.js'

export async function validateCredentials(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) throw new UnauthorizedError('Invalid credentials')

  const valid = await bcrypt.compare(password, user.passwordHash)
  if (!valid) throw new UnauthorizedError('Invalid credentials')

  return { id: user.id, email: user.email }
}
