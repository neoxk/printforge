import { processors } from './processors/index.js'
import type { OptionItemShape, OrderContext, PriceLineItem, PricingResult } from './types.js'

export function calculate(items: OptionItemShape[], ctx: OrderContext): PricingResult {
  const breakdown: PriceLineItem[] = items.map((item) => {
    const processor = processors[item.calculationBasis]
    const cost = processor(item, ctx)
    return { itemId: item.id, name: item.name, calculationBasis: item.calculationBasis, cost }
  })

  const total = breakdown.reduce((sum, line) => sum + line.cost, 0)

  return { total, breakdown }
}
