import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  getIntegrationHandler,
  saveIntegrationHandler,
  syncProductsHandler,
} from '../../../src/modules/integration/integration.controller.js'
import {
  getCurrentIntegration,
  saveIntegration,
  syncWooProducts,
} from '../../../src/modules/integration/integration.service.js'

vi.mock('../../../src/modules/integration/integration.service.js', () => ({
  getCurrentIntegration: vi.fn(),
  saveIntegration: vi.fn(),
  syncWooProducts: vi.fn(),
}))

const getCurrent = getCurrentIntegration as ReturnType<typeof vi.fn>
const save = saveIntegration as ReturnType<typeof vi.fn>
const sync = syncWooProducts as ReturnType<typeof vi.fn>

const send = vi.fn()
const reply = { send }

describe('integration controller', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    getCurrent.mockResolvedValue({ connectionName: 'Primary Store' })
    save.mockResolvedValue({ connectionName: 'Saved Store' })
    sync.mockResolvedValue({ products: [], connectionName: 'Primary Store' })
  })

  it('sends the current integration connection', async () => {
    await getIntegrationHandler({} as any, reply as any)

    expect(getCurrent).toHaveBeenCalledWith()
    expect(send).toHaveBeenCalledWith({ connectionName: 'Primary Store' })
  })

  it('saves the request body and sends the saved connection', async () => {
    const body = { connectionName: 'Saved Store' }

    await saveIntegrationHandler({ body } as any, reply as any)

    expect(save).toHaveBeenCalledWith(body)
    expect(send).toHaveBeenCalledWith({ connectionName: 'Saved Store' })
  })

  it('syncs WooCommerce products and sends the result', async () => {
    await syncProductsHandler({} as any, reply as any)

    expect(sync).toHaveBeenCalledWith()
    expect(send).toHaveBeenCalledWith({ products: [], connectionName: 'Primary Store' })
  })
})
