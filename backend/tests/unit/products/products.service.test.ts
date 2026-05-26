import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AppError, ConflictError, NotFoundError } from '../../../src/lib/errors.js'
import { prisma } from '../../../src/lib/prisma.js'
import { getCurrentConnectionRecord, listSyncedProducts } from '../../../src/modules/integration/integration.service.js'
import {
  addItemToContainer,
  createContainer,
  deleteContainer,
  getContainer,
  getProductConfig,
  getProductConfigByWooId,
  listContainerItems,
  listContainers,
  listProducts,
  patchContainerItem,
  removeItemFromContainer,
  updateContainer,
  updateProduct,
} from '../../../src/modules/products/products.service.js'

vi.mock('../../../src/modules/integration/integration.service.js', () => ({
  getCurrentConnectionRecord: vi.fn(),
  listSyncedProducts: vi.fn(),
}))

vi.mock('../../../src/lib/prisma.js', () => ({
  prisma: {
    product: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    optionsContainer: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    containerOptionItem: {
      findMany: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
      update: vi.fn(),
    },
    optionItem: {
      findUnique: vi.fn(),
    },
  },
}))

const syncedProducts = listSyncedProducts as ReturnType<typeof vi.fn>
const currentConnection = getCurrentConnectionRecord as ReturnType<typeof vi.fn>

const product = (prisma as any).product as {
  findUnique: ReturnType<typeof vi.fn>
  update: ReturnType<typeof vi.fn>
}

const optionsContainer = (prisma as any).optionsContainer as {
  findFirst: ReturnType<typeof vi.fn>
  findMany: ReturnType<typeof vi.fn>
  create: ReturnType<typeof vi.fn>
  update: ReturnType<typeof vi.fn>
  delete: ReturnType<typeof vi.fn>
}

const containerOptionItem = (prisma as any).containerOptionItem as {
  findMany: ReturnType<typeof vi.fn>
  create: ReturnType<typeof vi.fn>
  delete: ReturnType<typeof vi.fn>
  update: ReturnType<typeof vi.fn>
}

const optionItem = (prisma as any).optionItem as {
  findUnique: ReturnType<typeof vi.fn>
}

const decimal = (value: number) => ({
  toString: () => String(value),
  valueOf: () => value,
})

const storedProduct = {
  id: 'product-1',
  connectionId: 'connection-1',
  wooProductId: BigInt(123),
  name: 'Business Cards',
  width: decimal(90),
  height: decimal(50),
}

const storedContainer = {
  id: 'container-1',
  productId: 'product-1',
  name: 'Paper',
  containerType: 'SINGLE_SELECT',
  sortOrder: 1,
  isHidden: false,
  isRequired: true,
  defaultItemId: null,
}

const storedItem = {
  id: 'item-1',
  name: 'Matte',
  slug: 'matte',
}

describe('listProducts', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    syncedProducts.mockResolvedValue([{ id: 'product-1', name: 'Business Cards' }])
  })

  it('returns products from the integration synced-products list', async () => {
    await expect(listProducts()).resolves.toEqual([{ id: 'product-1', name: 'Business Cards' }])
    expect(syncedProducts).toHaveBeenCalledWith()
  })
})

describe('container management', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    product.findUnique.mockResolvedValue(storedProduct)
    optionsContainer.findFirst.mockResolvedValue(storedContainer)
    optionsContainer.findMany.mockResolvedValue([storedContainer])
    optionsContainer.create.mockResolvedValue(storedContainer)
    optionsContainer.update.mockResolvedValue({ ...storedContainer, name: 'Finish' })
    optionsContainer.delete.mockResolvedValue(storedContainer)
  })

  it('lists containers for an existing product', async () => {
    const result = await listContainers('product-1')

    expect(product.findUnique).toHaveBeenCalledWith({ where: { id: 'product-1' } })
    expect(optionsContainer.findMany).toHaveBeenCalledWith({
      where: { productId: 'product-1' },
      orderBy: { sortOrder: 'asc' },
      include: { defaultItem: true },
    })
    expect(result).toEqual([storedContainer])
  })

  it('throws when listing containers for a missing product', async () => {
    product.findUnique.mockResolvedValue(null)

    await expect(listContainers('missing-product')).rejects.toBeInstanceOf(NotFoundError)
    expect(optionsContainer.findMany).not.toHaveBeenCalled()
  })

  it('gets one container with its items', async () => {
    await getContainer('product-1', 'container-1')

    expect(optionsContainer.findFirst).toHaveBeenCalledWith({
      where: { id: 'container-1', productId: 'product-1' },
      include: {
        defaultItem: true,
        items: { include: { item: true }, orderBy: { sortOrder: 'asc' } },
      },
    })
  })

  it('creates a container with default values for omitted fields', async () => {
    await createContainer('product-1', {
      name: 'Paper',
      containerType: 'SINGLE_SELECT',
    })

    expect(optionsContainer.create).toHaveBeenCalledWith({
      data: {
        productId: 'product-1',
        name: 'Paper',
        containerType: 'SINGLE_SELECT',
        sortOrder: 0,
        isHidden: false,
        isRequired: false,
      },
    })
  })

  it('updates only provided container fields', async () => {
    const result = await updateContainer('product-1', 'container-1', {
      name: 'Finish',
      defaultItemId: 'item-1',
      isRequired: false,
    })

    expect(optionsContainer.update).toHaveBeenCalledWith({
      where: { id: 'container-1' },
      data: {
        name: 'Finish',
        defaultItemId: 'item-1',
        isRequired: false,
      },
      include: { defaultItem: true },
    })
    expect(result.name).toBe('Finish')
  })

  it('deletes an existing container', async () => {
    await deleteContainer('product-1', 'container-1')

    expect(optionsContainer.delete).toHaveBeenCalledWith({ where: { id: 'container-1' } })
  })
})

describe('container items', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    optionsContainer.findFirst.mockResolvedValue(storedContainer)
    optionItem.findUnique.mockResolvedValue(storedItem)
    containerOptionItem.findMany.mockResolvedValue([{ itemId: 'item-1', item: storedItem }])
    containerOptionItem.create.mockResolvedValue({ itemId: 'item-1', item: storedItem })
    containerOptionItem.update.mockResolvedValue({ itemId: 'item-1', sortOrder: 2, item: storedItem })
    containerOptionItem.delete.mockResolvedValue({ itemId: 'item-1' })
  })

  it('lists items for an existing container', async () => {
    await listContainerItems('product-1', 'container-1')

    expect(containerOptionItem.findMany).toHaveBeenCalledWith({
      where: { containerId: 'container-1' },
      include: { item: true },
      orderBy: { sortOrder: 'asc' },
    })
  })

  it('adds an existing item to a container', async () => {
    await addItemToContainer('product-1', 'container-1', {
      itemId: 'item-1',
      sortOrder: 3,
      priceUnit: 12,
      name: 'Premium matte',
    })

    expect(optionItem.findUnique).toHaveBeenCalledWith({ where: { id: 'item-1' } })
    expect(containerOptionItem.create).toHaveBeenCalledWith({
      data: {
        containerId: 'container-1',
        itemId: 'item-1',
        sortOrder: 3,
        priceUnit: 12,
        name: 'Premium matte',
      },
      include: { item: true },
    })
  })

  it('throws when adding an item that does not exist', async () => {
    optionItem.findUnique.mockResolvedValue(null)

    await expect(
      addItemToContainer('product-1', 'container-1', { itemId: 'missing-item' }),
    ).rejects.toBeInstanceOf(NotFoundError)
    expect(containerOptionItem.create).not.toHaveBeenCalled()
  })

  it('throws a conflict when adding a duplicate container item', async () => {
    containerOptionItem.create.mockRejectedValue({ code: 'P2002' })

    await expect(
      addItemToContainer('product-1', 'container-1', { itemId: 'item-1' }),
    ).rejects.toBeInstanceOf(ConflictError)
  })

  it('throws when removing an item that is not in the container', async () => {
    containerOptionItem.delete.mockRejectedValue({ code: 'P2025' })

    await expect(removeItemFromContainer('product-1', 'container-1', 'item-1')).rejects.toMatchObject({
      statusCode: 404,
      message: 'Item not found in this container.',
    } satisfies Partial<AppError>)
  })

  it('patches container item fields', async () => {
    await patchContainerItem('product-1', 'container-1', 'item-1', {
      sortOrder: 2,
      priceUnit: null,
      name: null,
    })

    expect(containerOptionItem.update).toHaveBeenCalledWith({
      where: { uq_container_option_item: { containerId: 'container-1', itemId: 'item-1' } },
      data: {
        sortOrder: 2,
        priceUnit: null,
        name: null,
      },
      include: { item: true },
    })
  })
})

describe('product updates and config', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    product.findUnique.mockResolvedValue(storedProduct)
    product.update.mockResolvedValue({
      id: 'product-1',
      width: decimal(100),
      height: null,
    })
    optionsContainer.findMany.mockResolvedValue([
      {
        ...storedContainer,
        items: [
          {
            itemId: 'item-1',
            name: 'Premium matte',
            item: storedItem,
          },
        ],
      },
    ])
    currentConnection.mockResolvedValue({ id: 'connection-1' })
  })

  it('updates product dimensions and returns millimeter values', async () => {
    const result = await updateProduct('product-1', { widthMm: 100, heightMm: null })

    expect(product.update).toHaveBeenCalledWith({
      where: { id: 'product-1' },
      data: { width: 100, height: null },
      select: { id: true, width: true, height: true },
    })
    expect(result).toEqual({
      id: 'product-1',
      widthMm: 100,
      heightMm: null,
    })
  })

  it('returns product configurator data with fixed dimensions and container items', async () => {
    const result = await getProductConfig('product-1')

    expect(result).toEqual({
      productId: 'product-1',
      dimensions: { type: 'fixed', widthMm: 90, heightMm: 50 },
      containers: [
        {
          id: 'container-1',
          name: 'Paper',
          containerType: 'SINGLE_SELECT',
          isHidden: false,
          isRequired: true,
          defaultItemId: null,
          items: [
            {
              id: 'item-1',
              name: 'Premium matte',
              slug: 'matte',
            },
          ],
        },
      ],
    })
  })

  it('returns product config by WooCommerce product id', async () => {
    product.findUnique
      .mockResolvedValueOnce({ id: 'product-1' })
      .mockResolvedValueOnce(storedProduct)

    await getProductConfigByWooId('123')

    expect(product.findUnique).toHaveBeenNthCalledWith(1, {
      where: {
        uq_synced_product_connection_woo_id: {
          connectionId: 'connection-1',
          wooProductId: BigInt(123),
        },
      },
    })
  })
})
