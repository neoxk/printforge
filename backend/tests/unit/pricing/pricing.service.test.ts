import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AppError, NotFoundError } from '../../../src/lib/errors.js'
import { prisma } from '../../../src/lib/prisma.js'
import { calculatePrice } from '../../../src/modules/pricing/pricing.service.js'

vi.mock('../../../src/lib/prisma.js', () => ({
  prisma: {
    product: {
      findUnique: vi.fn(),
    },
    optionsContainer: {
      findMany: vi.fn(),
    },
  },
}))

const product = (prisma as any).product as {
  findUnique: ReturnType<typeof vi.fn>
}

const optionsContainer = (prisma as any).optionsContainer as {
  findMany: ReturnType<typeof vi.fn>
}

const decimal = (value: number) => ({
  toNumber: () => value,
})

const item = (
  id: string,
  overrides: Partial<{
    name: string
    priceUnit: number
    calculationBasis: 'YIELD_PCS' | 'LINEAR_M' | 'SQM' | 'PERIMETER' | 'PCS' | 'ORDER' | 'FREE'
    lengthMm: number | null
    widthMm: number | null
  }> = {},
) => ({
  id,
  name: overrides.name ?? id,
  priceUnit: decimal(overrides.priceUnit ?? 0),
  lengthMm: overrides.lengthMm ?? null,
  widthMm: overrides.widthMm ?? null,
  calculationBasis: overrides.calculationBasis ?? 'PCS',
})

const slot = (
  containerId: string,
  itemId: string,
  itemData: ReturnType<typeof item>,
  overrides: Partial<{
    id: string
    sortOrder: number
    name: string | null
    priceUnit: number | null
  }> = {},
) => ({
  id: overrides.id ?? `${containerId}-${itemId}`,
  containerId,
  itemId,
  sortOrder: overrides.sortOrder ?? 0,
  name: overrides.name,
  priceUnit: overrides.priceUnit == null ? null : decimal(overrides.priceUnit),
  item: itemData,
})

describe('calculatePrice', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    product.findUnique.mockResolvedValue({ id: 'product-1' })
    optionsContainer.findMany.mockResolvedValue([])
  })

  it('returns calculator totals for selected and auto-applied option items', async () => {
    optionsContainer.findMany.mockResolvedValue([
      {
        id: 'container-size',
        productId: 'product-1',
        name: 'Size',
        sortOrder: 0,
        containerType: 'SINGLE_SELECT',
        isRequired: true,
        items: [
          slot(
            'container-size',
            'item-large',
            item('item-large', { name: 'Large', priceUnit: 5, calculationBasis: 'PCS' }),
            { name: 'Large print', priceUnit: 6 },
          ),
        ],
      },
      {
        id: 'container-setup',
        productId: 'product-1',
        name: 'Setup',
        sortOrder: 1,
        containerType: 'AUTO_APPLIED',
        isRequired: false,
        items: [
          slot(
            'container-setup',
            'item-setup',
            item('item-setup', { name: 'Setup fee', priceUnit: 10, calculationBasis: 'ORDER' }),
          ),
        ],
      },
    ])

    const result = await calculatePrice('product-1', ['item-large'], {
      widthMm: 100,
      heightMm: 200,
      quantity: 3,
    })

    expect(product.findUnique).toHaveBeenCalledWith({ where: { id: 'product-1' } })
    expect(optionsContainer.findMany).toHaveBeenCalledWith({
      where: { productId: 'product-1' },
      include: {
        items: { include: { item: true }, orderBy: { sortOrder: 'asc' } },
      },
      orderBy: { sortOrder: 'asc' },
    })
    expect(result).toEqual({
      total: 28,
      breakdown: [
        {
          itemId: 'item-large',
          name: 'Large print',
          calculationBasis: 'PCS',
          cost: 18,
        },
        {
          itemId: 'item-setup',
          name: 'Setup fee',
          calculationBasis: 'ORDER',
          cost: 10,
        },
      ],
    })
  })

  it('throws when the product does not exist', async () => {
    product.findUnique.mockResolvedValue(null)

    await expect(
      calculatePrice('missing-product', [], { widthMm: 100, heightMm: 200, quantity: 1 }),
    ).rejects.toBeInstanceOf(NotFoundError)
  })

  it('throws when the same option item is selected more than once', async () => {
    await expect(
      calculatePrice('product-1', ['item-large', 'item-large'], {
        widthMm: 100,
        heightMm: 200,
        quantity: 1,
      }),
    ).rejects.toMatchObject({
      statusCode: 400,
      message: 'Duplicate option item selected.',
    } satisfies Partial<AppError>)

    expect(optionsContainer.findMany).not.toHaveBeenCalled()
  })

  it('throws when a selected item is not available for the product', async () => {
    optionsContainer.findMany.mockResolvedValue([
      {
        id: 'container-size',
        name: 'Size',
        sortOrder: 0,
        containerType: 'SINGLE_SELECT',
        isRequired: false,
        items: [
          slot(
            'container-size',
            'item-small',
            item('item-small', { name: 'Small', priceUnit: 2, calculationBasis: 'PCS' }),
          ),
        ],
      },
    ])

    await expect(
      calculatePrice('product-1', ['item-large'], { widthMm: 100, heightMm: 200, quantity: 1 }),
    ).rejects.toMatchObject({
      statusCode: 400,
      message: 'One or more selected option items are not available for this product.',
    } satisfies Partial<AppError>)
  })

  it('throws when a required container has no selected item', async () => {
    optionsContainer.findMany.mockResolvedValue([
      {
        id: 'container-size',
        name: 'Size',
        sortOrder: 0,
        containerType: 'SINGLE_SELECT',
        isRequired: true,
        items: [
          slot(
            'container-size',
            'item-small',
            item('item-small', { name: 'Small', priceUnit: 2, calculationBasis: 'PCS' }),
          ),
        ],
      },
    ])

    await expect(
      calculatePrice('product-1', [], { widthMm: 100, heightMm: 200, quantity: 1 }),
    ).rejects.toMatchObject({
      statusCode: 400,
      message: 'Size is required.',
    } satisfies Partial<AppError>)
  })

  it('throws when multiple items are selected for a single-select container', async () => {
    optionsContainer.findMany.mockResolvedValue([
      {
        id: 'container-size',
        name: 'Size',
        sortOrder: 0,
        containerType: 'SINGLE_SELECT',
        isRequired: false,
        items: [
          slot(
            'container-size',
            'item-small',
            item('item-small', { name: 'Small', priceUnit: 2, calculationBasis: 'PCS' }),
          ),
          slot(
            'container-size',
            'item-large',
            item('item-large', { name: 'Large', priceUnit: 4, calculationBasis: 'PCS' }),
          ),
        ],
      },
    ])

    await expect(
      calculatePrice('product-1', ['item-small', 'item-large'], {
        widthMm: 100,
        heightMm: 200,
        quantity: 1,
      }),
    ).rejects.toMatchObject({
      statusCode: 400,
      message: 'Only one option may be selected for Size.',
    } satisfies Partial<AppError>)
  })
})
