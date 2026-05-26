import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  addItemToContainerHandler,
  createContainerHandler,
  deleteContainerHandler,
  getContainerHandler,
  getProductConfigByWooIdHandler,
  getProductConfigHandler,
  listContainerItemsHandler,
  listContainersHandler,
  listProductsHandler,
  patchContainerItemHandler,
  removeItemFromContainerHandler,
  updateContainerHandler,
  updateProductHandler,
} from '../../../src/modules/products/products.controller.js'
import * as productsService from '../../../src/modules/products/products.service.js'

vi.mock('../../../src/modules/products/products.service.js', () => ({
  addItemToContainer: vi.fn(),
  createContainer: vi.fn(),
  deleteContainer: vi.fn(),
  getContainer: vi.fn(),
  getProductConfig: vi.fn(),
  getProductConfigByWooId: vi.fn(),
  listContainerItems: vi.fn(),
  listContainers: vi.fn(),
  listProducts: vi.fn(),
  patchContainerItem: vi.fn(),
  removeItemFromContainer: vi.fn(),
  updateContainer: vi.fn(),
  updateProduct: vi.fn(),
}))

function reply() {
  return {
    status: vi.fn(function (this: any) {
      return this
    }),
    send: vi.fn(),
  }
}

describe('products controller', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(productsService.addItemToContainer).mockResolvedValue({ itemId: 'item-1' } as any)
    vi.mocked(productsService.createContainer).mockResolvedValue({ id: 'container-1' } as any)
    vi.mocked(productsService.getContainer).mockResolvedValue({ id: 'container-1' } as any)
    vi.mocked(productsService.getProductConfig).mockResolvedValue({ productId: 'product-1' } as any)
    vi.mocked(productsService.getProductConfigByWooId).mockResolvedValue({ productId: 'product-1' } as any)
    vi.mocked(productsService.listContainerItems).mockResolvedValue([{ itemId: 'item-1' }] as any)
    vi.mocked(productsService.listContainers).mockResolvedValue([{ id: 'container-1' }] as any)
    vi.mocked(productsService.listProducts).mockResolvedValue([{ id: 'product-1' }] as any)
    vi.mocked(productsService.patchContainerItem).mockResolvedValue({ itemId: 'item-1' } as any)
    vi.mocked(productsService.updateContainer).mockResolvedValue({ id: 'container-1', name: 'Paper' } as any)
    vi.mocked(productsService.updateProduct).mockResolvedValue({ id: 'product-1', widthMm: 100, heightMm: null } as any)
  })

  it('lists products', async () => {
    const res = reply()

    await listProductsHandler({} as any, res as any)

    expect(productsService.listProducts).toHaveBeenCalledWith()
    expect(res.send).toHaveBeenCalledWith([{ id: 'product-1' }])
  })

  it('lists and gets containers for a product', async () => {
    const listReply = reply()
    const getReply = reply()

    await listContainersHandler({ params: { id: 'product-1' } } as any, listReply as any)
    await getContainerHandler({ params: { id: 'product-1', cid: 'container-1' } } as any, getReply as any)

    expect(productsService.listContainers).toHaveBeenCalledWith('product-1')
    expect(listReply.send).toHaveBeenCalledWith([{ id: 'container-1' }])
    expect(productsService.getContainer).toHaveBeenCalledWith('product-1', 'container-1')
    expect(getReply.send).toHaveBeenCalledWith({ id: 'container-1' })
  })

  it('creates, updates, and deletes containers', async () => {
    const createReply = reply()
    const updateReply = reply()
    const deleteReply = reply()
    const createBody = { name: 'Paper', containerType: 'SINGLE_SELECT' }
    const updateBody = { name: 'Paper', isRequired: true }

    await createContainerHandler({ params: { id: 'product-1' }, body: createBody } as any, createReply as any)
    await updateContainerHandler(
      { params: { id: 'product-1', cid: 'container-1' }, body: updateBody } as any,
      updateReply as any,
    )
    await deleteContainerHandler({ params: { id: 'product-1', cid: 'container-1' } } as any, deleteReply as any)

    expect(productsService.createContainer).toHaveBeenCalledWith('product-1', createBody)
    expect(createReply.status).toHaveBeenCalledWith(201)
    expect(createReply.send).toHaveBeenCalledWith({ id: 'container-1' })
    expect(productsService.updateContainer).toHaveBeenCalledWith('product-1', 'container-1', updateBody)
    expect(updateReply.send).toHaveBeenCalledWith({ id: 'container-1', name: 'Paper' })
    expect(productsService.deleteContainer).toHaveBeenCalledWith('product-1', 'container-1')
    expect(deleteReply.status).toHaveBeenCalledWith(204)
    expect(deleteReply.send).toHaveBeenCalledWith()
  })

  it('updates product dimensions', async () => {
    const res = reply()
    const body = { widthMm: 100, heightMm: null }

    await updateProductHandler({ params: { id: 'product-1' }, body } as any, res as any)

    expect(productsService.updateProduct).toHaveBeenCalledWith('product-1', body)
    expect(res.send).toHaveBeenCalledWith({ id: 'product-1', widthMm: 100, heightMm: null })
  })

  it('gets product config by internal id and WooCommerce id', async () => {
    const internalReply = reply()
    const wooReply = reply()

    await getProductConfigHandler({ params: { id: 'product-1' } } as any, internalReply as any)
    await getProductConfigByWooIdHandler({ params: { wooProductId: '123' } } as any, wooReply as any)

    expect(productsService.getProductConfig).toHaveBeenCalledWith('product-1')
    expect(internalReply.send).toHaveBeenCalledWith({ productId: 'product-1' })
    expect(productsService.getProductConfigByWooId).toHaveBeenCalledWith('123')
    expect(wooReply.send).toHaveBeenCalledWith({ productId: 'product-1' })
  })

  it('lists, adds, removes, and patches container items', async () => {
    const listReply = reply()
    const addReply = reply()
    const removeReply = reply()
    const patchReply = reply()
    const addBody = { itemId: 'item-1', sortOrder: 1 }
    const patchBody = { sortOrder: 2, name: null }

    await listContainerItemsHandler({ params: { id: 'product-1', cid: 'container-1' } } as any, listReply as any)
    await addItemToContainerHandler(
      { params: { id: 'product-1', cid: 'container-1' }, body: addBody } as any,
      addReply as any,
    )
    await removeItemFromContainerHandler(
      { params: { id: 'product-1', cid: 'container-1', itemId: 'item-1' } } as any,
      removeReply as any,
    )
    await patchContainerItemHandler(
      { params: { id: 'product-1', cid: 'container-1', itemId: 'item-1' }, body: patchBody } as any,
      patchReply as any,
    )

    expect(productsService.listContainerItems).toHaveBeenCalledWith('product-1', 'container-1')
    expect(listReply.send).toHaveBeenCalledWith([{ itemId: 'item-1' }])
    expect(productsService.addItemToContainer).toHaveBeenCalledWith('product-1', 'container-1', addBody)
    expect(addReply.status).toHaveBeenCalledWith(201)
    expect(addReply.send).toHaveBeenCalledWith({ itemId: 'item-1' })
    expect(productsService.removeItemFromContainer).toHaveBeenCalledWith('product-1', 'container-1', 'item-1')
    expect(removeReply.status).toHaveBeenCalledWith(204)
    expect(removeReply.send).toHaveBeenCalledWith()
    expect(productsService.patchContainerItem).toHaveBeenCalledWith('product-1', 'container-1', 'item-1', patchBody)
    expect(patchReply.send).toHaveBeenCalledWith({ itemId: 'item-1' })
  })
})
