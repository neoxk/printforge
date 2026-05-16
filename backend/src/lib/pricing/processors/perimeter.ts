import type { OptionItemShape, OrderContext, Processor } from '../types.js'

export const perimeter: Processor = (item: OptionItemShape, ctx: OrderContext): number => {
  const perimM = (2 * (ctx.widthMm + ctx.heightMm)) / 1000
  return perimM * ctx.quantity * item.priceUnit
}
