import { prisma } from '../../lib/prisma.js'

export async function calculatePrice(productId: string, options: Record<string, string>) {
  // TODO: implement pricing rule evaluation
  return { price: 0, breakdown: [] }
}
