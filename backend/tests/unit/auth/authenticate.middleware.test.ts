import { describe, expect, it, vi } from 'vitest'
import { authenticate } from '../../../src/middleware/authenticate.js'

describe('authenticate middleware', () => {
  it('verifies the access token on the request', async () => {
    const accessVerify = vi.fn().mockResolvedValue(undefined)

    await authenticate({ accessVerify } as any, {} as any)

    expect(accessVerify).toHaveBeenCalledWith()
  })

  it('propagates access token verification failures', async () => {
    const error = new Error('invalid token')
    const accessVerify = vi.fn().mockRejectedValue(error)

    await expect(authenticate({ accessVerify } as any, {} as any)).rejects.toThrow(error)
  })
})
