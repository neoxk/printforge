import { describe, expect, it } from 'vitest'
import { AppError } from '../../../src/lib/errors.js'
import { buildOrderContext, calculate } from '../../../src/lib/pricing/index.js'
import type { CalculationBasis, OptionItemShape, OrderContext } from '../../../src/lib/pricing/index.js'

const ctx: OrderContext = {
  widthMm: 100,
  heightMm: 200,
  quantity: 10,
}

const item = (
  calculationBasis: CalculationBasis,
  overrides: Partial<OptionItemShape> = {},
): OptionItemShape => ({
  id: overrides.id ?? calculationBasis.toLowerCase(),
  name: overrides.name ?? calculationBasis,
  priceUnit: overrides.priceUnit ?? 1,
  lengthMm: overrides.lengthMm ?? null,
  widthMm: overrides.widthMm ?? null,
  calculationBasis,
})

describe('buildOrderContext', () => {
  it('returns a normalized order context for valid input', () => {
    expect(buildOrderContext({ widthMm: 100, heightMm: 200, quantity: 3 })).toEqual({
      widthMm: 100,
      heightMm: 200,
      quantity: 3,
    })
  })

  it('throws a 400 AppError for invalid context input', () => {
    expect(() => buildOrderContext({ widthMm: 0, heightMm: 200, quantity: 1 })).toThrow(AppError)
    expect(() => buildOrderContext({ widthMm: 0, heightMm: 200, quantity: 1 })).toThrow(
      'Invalid order context:',
    )
  })
})

describe('calculate', () => {
  it('calculates totals and line-item breakdown for all calculation bases', () => {
    const result = calculate(
      [
        item('YIELD_PCS', {
          id: 'yield',
          name: 'Sheets',
          priceUnit: 5,
          lengthMm: 500,
          widthMm: 400,
        }),
        item('LINEAR_M', {
          id: 'linear',
          name: 'Roll media',
          priceUnit: 2,
          widthMm: 500,
        }),
        item('SQM', {
          id: 'sqm',
          name: 'Ink',
          priceUnit: 3,
        }),
        item('PERIMETER', {
          id: 'perimeter',
          name: 'Cutting',
          priceUnit: 4,
        }),
        item('PCS', {
          id: 'pcs',
          name: 'Packaging',
          priceUnit: 2,
        }),
        item('ORDER', {
          id: 'order',
          name: 'Setup',
          priceUnit: 7,
        }),
        item('FREE', {
          id: 'free',
          name: 'Included proof',
          priceUnit: 999,
        }),
      ],
      ctx,
    )

    expect(result).toEqual({
      total: 57.4,
      breakdown: [
        { itemId: 'yield', name: 'Sheets', calculationBasis: 'YIELD_PCS', cost: 5 },
        { itemId: 'linear', name: 'Roll media', calculationBasis: 'LINEAR_M', cost: 0.8 },
        { itemId: 'sqm', name: 'Ink', calculationBasis: 'SQM', cost: 0.6000000000000001 },
        { itemId: 'perimeter', name: 'Cutting', calculationBasis: 'PERIMETER', cost: 24 },
        { itemId: 'pcs', name: 'Packaging', calculationBasis: 'PCS', cost: 20 },
        { itemId: 'order', name: 'Setup', calculationBasis: 'ORDER', cost: 7 },
        { itemId: 'free', name: 'Included proof', calculationBasis: 'FREE', cost: 0 },
      ],
    })
  })

  it('returns zero for yield-based items when the product does not fit the sheet', () => {
    const result = calculate(
      [
        item('YIELD_PCS', {
          priceUnit: 5,
          lengthMm: 50,
          widthMm: 50,
        }),
      ],
      ctx,
    )

    expect(result.total).toBe(0)
    expect(result.breakdown[0].cost).toBe(0)
  })

  it('returns zero for linear-meter items when the product does not fit the roll width', () => {
    const result = calculate(
      [
        item('LINEAR_M', {
          priceUnit: 2,
          widthMm: 50,
        }),
      ],
      ctx,
    )

    expect(result.total).toBe(0)
    expect(result.breakdown[0].cost).toBe(0)
  })

  it('uses the cheaper orientation for linear-meter calculations', () => {
    const result = calculate(
      [
        item('LINEAR_M', {
          priceUnit: 10,
          widthMm: 300,
        }),
      ],
      {
        widthMm: 100,
        heightMm: 250,
        quantity: 6,
      },
    )

    expect(result.total).toBe(5)
  })
})
