import type { ProductConfig } from '../types.js'

export async function fetchProductConfig(productId: string): Promise<ProductConfig> {
  const res = await fetch(`/api/products/${productId}/config`)
  if (!res.ok) throw new Error(`Failed to load product config (${res.status})`)
  return res.json() as Promise<ProductConfig>
}
