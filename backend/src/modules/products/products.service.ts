import { prisma } from '../../lib/prisma.js'
import { NotFoundError } from '../../lib/errors.js'

export async function getProductOptions(productId: string) {
  // TODO: implement
  throw new NotFoundError()
}

export async function listProducts() {
  // TODO: implement
  return []
}
