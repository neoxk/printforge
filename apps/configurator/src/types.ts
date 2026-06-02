import type { DesignerView } from '@printforge/ui/designer'

export type ConfigItem = {
  id: string
  name: string
  slug: string
}

export type ConfigContainer = {
  id: string
  name: string
  containerType: 'SINGLE_SELECT' | 'MULTI_SELECT' | 'AUTO_APPLIED'
  isHidden: boolean
  isRequired: boolean
  defaultItemId: string | null
  items: ConfigItem[]
}

export type Dimensions =
  | { type: 'fixed'; widthMm: number; heightMm: number }
  | { type: 'custom' }

export type ProductConfig = {
  productId: string
  dimensions: Dimensions
  containers: ConfigContainer[]
}

export type PriceLineItem = {
  itemId: string
  name: string
  calculationBasis: string
  cost: number
}

export type PricingResult = {
  total: number
  breakdown: PriceLineItem[]
}

export type ProductPrintAreaConfig = {
  productId: string
  views: DesignerView[]
}
