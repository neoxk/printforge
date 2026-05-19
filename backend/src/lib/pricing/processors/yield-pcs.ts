import type { OptionItemShape, OrderContext, Processor } from '../types.js'

export const yieldPcs: Processor = (item: OptionItemShape, ctx: OrderContext): number => {
  const L = item.lengthMm ?? 0
  const W = item.widthMm ?? 0
  const w = ctx.widthMm
  const h = ctx.heightMm

  const fitsNormal = Math.floor(L / w) * Math.floor(W / h)
  const fitsRotated = Math.floor(L / h) * Math.floor(W / w)
  const fitsPerSheet = Math.max(fitsNormal, fitsRotated)

  if (fitsPerSheet <= 0) return 0

  const sheets = Math.ceil(ctx.quantity / fitsPerSheet)
  return sheets * item.priceUnit
}
