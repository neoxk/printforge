import type { OptionItemShape, OrderContext, Processor } from '../types.js'

export const pcs: Processor = (item: OptionItemShape, ctx: OrderContext): number => {
  return ctx.quantity * item.priceUnit
}
