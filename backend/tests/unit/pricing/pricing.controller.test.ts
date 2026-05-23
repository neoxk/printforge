import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  addItemToGroupHandler,
  calculateHandler,
  createGroupHandler,
  createItemHandler,
  deleteGroupHandler,
  deleteItemHandler,
  getGroupHandler,
  getItemHandler,
  listGroupsHandler,
  listItemsHandler,
  removeItemFromGroupHandler,
  updateGroupHandler,
  updateItemHandler,
} from '../../../src/modules/pricing/pricing.controller.js'
import * as pricingService from '../../../src/modules/pricing/pricing.service.js'

vi.mock('../../../src/modules/pricing/pricing.service.js', () => ({
  addItemToGroup: vi.fn(),
  calculatePrice: vi.fn(),
  createGroup: vi.fn(),
  createItem: vi.fn(),
  deleteGroup: vi.fn(),
  deleteItem: vi.fn(),
  getGroup: vi.fn(),
  getItem: vi.fn(),
  listGroups: vi.fn(),
  listItems: vi.fn(),
  removeItemFromGroup: vi.fn(),
  updateGroup: vi.fn(),
  updateItem: vi.fn(),
}))

function reply() {
  return {
    status: vi.fn(function (this: any) {
      return this
    }),
    send: vi.fn(),
  }
}

describe('pricing controller', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(pricingService.addItemToGroup).mockResolvedValue({ id: 'item-1' } as any)
    vi.mocked(pricingService.calculatePrice).mockResolvedValue({ total: 10, breakdown: [] } as any)
    vi.mocked(pricingService.createGroup).mockResolvedValue({ id: 'group-1' } as any)
    vi.mocked(pricingService.createItem).mockResolvedValue({ id: 'item-1' } as any)
    vi.mocked(pricingService.getGroup).mockResolvedValue({ id: 'group-1' } as any)
    vi.mocked(pricingService.getItem).mockResolvedValue({ id: 'item-1' } as any)
    vi.mocked(pricingService.listGroups).mockResolvedValue([{ id: 'group-1' }] as any)
    vi.mocked(pricingService.listItems).mockResolvedValue([{ id: 'item-1' }] as any)
    vi.mocked(pricingService.updateGroup).mockResolvedValue({ id: 'group-1', name: 'Paper' } as any)
    vi.mocked(pricingService.updateItem).mockResolvedValue({ id: 'item-1', name: 'Matte' } as any)
  })

  it('lists groups', async () => {
    const res = reply()

    await listGroupsHandler({} as any, res as any)

    expect(pricingService.listGroups).toHaveBeenCalledWith()
    expect(res.send).toHaveBeenCalledWith([{ id: 'group-1' }])
  })

  it('gets a group by id', async () => {
    const res = reply()

    await getGroupHandler({ params: { id: 'group-1' } } as any, res as any)

    expect(pricingService.getGroup).toHaveBeenCalledWith('group-1')
    expect(res.send).toHaveBeenCalledWith({ id: 'group-1' })
  })

  it('creates a group with status 201', async () => {
    const res = reply()

    await createGroupHandler({ body: { name: 'Paper' } } as any, res as any)

    expect(pricingService.createGroup).toHaveBeenCalledWith('Paper')
    expect(res.status).toHaveBeenCalledWith(201)
    expect(res.send).toHaveBeenCalledWith({ id: 'group-1' })
  })

  it('updates and deletes groups', async () => {
    const updateReply = reply()
    const deleteReply = reply()

    await updateGroupHandler({ params: { id: 'group-1' }, body: { name: 'Paper' } } as any, updateReply as any)
    await deleteGroupHandler({ params: { id: 'group-1' } } as any, deleteReply as any)

    expect(pricingService.updateGroup).toHaveBeenCalledWith('group-1', 'Paper')
    expect(updateReply.send).toHaveBeenCalledWith({ id: 'group-1', name: 'Paper' })
    expect(pricingService.deleteGroup).toHaveBeenCalledWith('group-1')
    expect(deleteReply.status).toHaveBeenCalledWith(204)
    expect(deleteReply.send).toHaveBeenCalledWith()
  })

  it('adds and removes items from a group', async () => {
    const addReply = reply()
    const removeReply = reply()

    await addItemToGroupHandler({ params: { id: 'group-1', itemId: 'item-1' } } as any, addReply as any)
    await removeItemFromGroupHandler({ params: { id: 'group-1', itemId: 'item-1' } } as any, removeReply as any)

    expect(pricingService.addItemToGroup).toHaveBeenCalledWith('group-1', 'item-1')
    expect(addReply.send).toHaveBeenCalledWith({ id: 'item-1' })
    expect(pricingService.removeItemFromGroup).toHaveBeenCalledWith('group-1', 'item-1')
    expect(removeReply.status).toHaveBeenCalledWith(204)
    expect(removeReply.send).toHaveBeenCalledWith()
  })

  it('lists items with an optional group filter', async () => {
    const res = reply()

    await listItemsHandler({ query: { groupId: 'group-1' } } as any, res as any)

    expect(pricingService.listItems).toHaveBeenCalledWith('group-1')
    expect(res.send).toHaveBeenCalledWith([{ id: 'item-1' }])
  })

  it('gets, creates, updates, and deletes items', async () => {
    const getReply = reply()
    const createReply = reply()
    const updateReply = reply()
    const deleteReply = reply()
    const body = { name: 'Matte', slug: 'matte', priceUnit: 1, calculationBasis: 'PCS' }

    await getItemHandler({ params: { id: 'item-1' } } as any, getReply as any)
    await createItemHandler({ body } as any, createReply as any)
    await updateItemHandler({ params: { id: 'item-1' }, body } as any, updateReply as any)
    await deleteItemHandler({ params: { id: 'item-1' } } as any, deleteReply as any)

    expect(pricingService.getItem).toHaveBeenCalledWith('item-1')
    expect(getReply.send).toHaveBeenCalledWith({ id: 'item-1' })
    expect(pricingService.createItem).toHaveBeenCalledWith(body)
    expect(createReply.status).toHaveBeenCalledWith(201)
    expect(pricingService.updateItem).toHaveBeenCalledWith('item-1', body)
    expect(updateReply.send).toHaveBeenCalledWith({ id: 'item-1', name: 'Matte' })
    expect(pricingService.deleteItem).toHaveBeenCalledWith('item-1')
    expect(deleteReply.status).toHaveBeenCalledWith(204)
  })

  it('calculates pricing from the request body', async () => {
    const res = reply()
    const body = {
      productId: 'product-1',
      selectedItemIds: ['item-1'],
      context: { quantity: 2 },
    }

    await calculateHandler({ body } as any, res as any)

    expect(pricingService.calculatePrice).toHaveBeenCalledWith('product-1', ['item-1'], { quantity: 2 })
    expect(res.send).toHaveBeenCalledWith({ total: 10, breakdown: [] })
  })
})
