import type { OptionItemShape, OrderContext, Processor } from '../types.js'

export const order: Processor = (item: OptionItemShape, _ctx: OrderContext): number => {
  return item.priceUnit
}
