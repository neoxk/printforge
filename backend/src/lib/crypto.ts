import { randomBytes, timingSafeEqual } from 'node:crypto'

/**
 * Generates a high-entropy secret used by WooCommerce plugins to authenticate
 * server-to-server calls (e.g. assigning design files to an order). Shown once
 * in the admin UI and pasted into the plugin settings.
 */
export function generateConnectionSecret(): string {
  return `pf_live_${randomBytes(32).toString('base64url')}`
}

/** Constant-time string comparison that is safe for differing lengths. */
export function secretsMatch(a: string, b: string): boolean {
  const bufferA = Buffer.from(a)
  const bufferB = Buffer.from(b)
  if (bufferA.length !== bufferB.length) return false
  return timingSafeEqual(bufferA, bufferB)
}
