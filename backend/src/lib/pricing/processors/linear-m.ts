import type { OptionItemShape, OrderContext, Processor } from '../types.js'

export const linearM: Processor = (item: OptionItemShape, ctx: OrderContext): number => {
  const rollWidthMm = item.widthMm ?? 0
  const w = ctx.widthMm
  const h = ctx.heightMm
  const qty = ctx.quantity

  // Try both orientations; pick the one that uses less roll length
  const options: number[] = []

  const cols1 = Math.floor(rollWidthMm / w)
  if (cols1 >= 1) {
    const metres = (Math.ceil(qty / cols1) * h) / 1000
    options.push(metres)
  }

  const cols2 = Math.floor(rollWidthMm / h)
  if (cols2 >= 1) {
    const metres = (Math.ceil(qty / cols2) * w) / 1000
    options.push(metres)
  }

  if (options.length === 0) return 0

  const totalMetres = Math.min(...options)
  return totalMetres * item.priceUnit
}
