import type { PricingResult } from '@printforge/ui'
import { apiRequest } from '../api/client'

export type PriceContext = {
  widthMm: number
  heightMm: number
  quantity: number
}

export const Pricing = {
  calculate(productId: string, selectedItemIds: string[], context: PriceContext) {
    return apiRequest<PricingResult>('/api/pricing/calculate', {
      method: 'POST',
      skipAuth: true,
      body: JSON.stringify({ productId, selectedItemIds, context }),
    })
  },
}
