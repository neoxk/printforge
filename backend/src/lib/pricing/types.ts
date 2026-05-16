export type CalculationBasis = 'YIELD_PCS' | 'LINEAR_M' | 'SQM' | 'PERIMETER' | 'PCS' | 'ORDER' | 'FREE'
export type DisplayMode = 'SELECTABLE' | 'HIDDEN' | 'REQUIRED'

export type OrderContext = {
  widthMm: number
  heightMm: number
  quantity: number
}

// Normalised shape passed to every processor — Prisma Decimals already converted to number
export type OptionItemShape = {
  id: string
  name: string
  priceUnit: number
  lengthMm: number | null   // -1 in DB means infinite roll; stored as null here
  widthMm: number | null
  calculationBasis: CalculationBasis
  displayMode: DisplayMode
}

export type PriceLineItem = {
  itemId: string
  name: string
  calculationBasis: CalculationBasis
  cost: number
}

export type PricingResult = {
  total: number
  breakdown: PriceLineItem[]
}

export type Processor = (item: OptionItemShape, ctx: OrderContext) => number
