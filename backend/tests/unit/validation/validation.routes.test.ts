import { describe, expect, it, vi } from 'vitest'
import { validationRoutes } from '../../../src/modules/validation/validation.routes.js'

describe('validationRoutes', () => {
  it('does not register routes yet', async () => {
    const app = {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn(),
    }

    await expect(validationRoutes(app as any)).resolves.toBeUndefined()
    expect(app.get).not.toHaveBeenCalled()
    expect(app.post).not.toHaveBeenCalled()
    expect(app.put).not.toHaveBeenCalled()
    expect(app.patch).not.toHaveBeenCalled()
    expect(app.delete).not.toHaveBeenCalled()
  })
})
