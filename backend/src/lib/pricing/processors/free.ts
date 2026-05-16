import type { OptionItemShape, OrderContext, Processor } from '../types.js'

export const free: Processor = (_item: OptionItemShape, _ctx: OrderContext): number => {
  return 0
}
