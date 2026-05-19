import type { OptionItemShape, OrderContext, Processor } from '../types.js'

export const sqm: Processor = (_item: OptionItemShape, ctx: OrderContext): number => {
  const areaSqm = (ctx.widthMm * ctx.heightMm) / 1_000_000
  return areaSqm * ctx.quantity * _item.priceUnit
}
