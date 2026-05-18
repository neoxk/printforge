import { describe, expect, it, vi, beforeEach } from 'vitest'
import { prisma } from '../../lib/prisma.js'
import {
  calculatePrice,
  createPricingRule,
  listPricingRules,
} from './pricing.service.js'

vi.mock('../../lib/prisma.js', () => ({
  prisma: {
    pricingRule: {
      create: vi.fn(),
      findMany: vi.fn(),
    },
  },
}))

const pricingRule = (prisma as any).pricingRule as {
  create: ReturnType<typeof vi.fn>
  findMany: ReturnType<typeof vi.fn>
}

describe('calculatePrice', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns the total price and breakdown for active pricing rules', async () => {
    pricingRule.findMany.mockResolvedValue([
      {
        id: BigInt(1),
        name: 'Large size',
        amount: 12.5,
        triggerLabel: 'Size',
      },
      {
        id: BigInt(2),
        name: 'Rush order',
        amount: 8,
        triggerLabel: 'Delivery',
      },
    ])

    const result = await calculatePrice('123', {
      size: 'large',
      delivery: 'rush',
    })

    expect(pricingRule.findMany).toHaveBeenCalledWith({
      where: {
        productId: BigInt(123),
        isActive: true,
      },
    })
    expect(result).toEqual({
      price: 20.5,
      breakdown: [
        {
          ruleId: BigInt(1),
          label: 'Large size',
          amount: 12.5,
          trigger: 'Size',
        },
        {
          ruleId: BigInt(2),
          label: 'Rush order',
          amount: 8,
          trigger: 'Delivery',
        },
      ],
      options: {
        size: 'large',
        delivery: 'rush',
      },
    })
  })
})

describe('listPricingRules', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns pricing rules formatted for the API', async () => {
    pricingRule.findMany.mockResolvedValue([
      {
        id: BigInt(2),
        name: 'Rush order',
        description: 'Adds rush order surcharge.',
        triggerLabel: 'Delivery',
        status: 'Active',
      },
      {
        id: BigInt(1),
        name: 'Large size',
        description: null,
        triggerLabel: 'Size',
        status: 'Draft',
      },
    ])

    const result = await listPricingRules()

    expect(pricingRule.findMany).toHaveBeenCalledWith({
      orderBy: { id: 'desc' },
    })
    expect(result).toEqual([
      {
        id: BigInt(2),
        name: 'Rush order',
        summary: 'Adds rush order surcharge.',
        trigger: 'Delivery',
        status: 'Active',
      },
      {
        id: BigInt(1),
        name: 'Large size',
        summary: 'No summary provided yet.',
        trigger: 'Size',
        status: 'Draft',
      },
    ])
  })
})

describe('createPricingRule', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('creates an active pricing rule and returns it formatted for the API', async () => {
    pricingRule.create.mockResolvedValue({
      id: BigInt(3),
      name: 'Rush order',
      description: 'Adds rush order surcharge.',
      triggerLabel: 'Delivery',
      status: 'Active',
    })

    const result = await createPricingRule({
      name: 'Rush order',
      summary: 'Adds rush order surcharge.',
      trigger: 'Delivery',
      status: 'Active',
    })

    expect(pricingRule.create).toHaveBeenCalledWith({
      data: {
        name: 'Rush order',
        productId: BigInt(0),
        triggerLabel: 'Delivery',
        operator: 'eq',
        triggerValue: 'Delivery',
        ruleType: 'flat_surcharge',
        amount: 0,
        description: 'Adds rush order surcharge.',
        status: 'Active',
        isActive: true,
      },
    })
    expect(result).toEqual({
      id: BigInt(3),
      name: 'Rush order',
      summary: 'Adds rush order surcharge.',
      trigger: 'Delivery',
      status: 'Active',
    })
  })
})
