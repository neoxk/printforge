import type { OptionItem, CalculationBasis, DisplayMode } from '@printforge/ui'
import { apiRequest } from '../api/client'

export type ItemPayload = {
  name: string
  slug: string
  priceUnit: number
  calculationBasis: CalculationBasis
  displayMode?: DisplayMode
  lengthMm?: number | null
  widthMm?: number | null
}

export const Items = {
  list(groupId?: string) {
    const query = groupId ? `?groupId=${groupId}` : ''
    return apiRequest<OptionItem[]>(`/api/pricing/items${query}`)
  },

  get(id: string) {
    return apiRequest<OptionItem>(`/api/pricing/items/${id}`)
  },

  create(payload: ItemPayload) {
    return apiRequest<OptionItem>('/api/pricing/items', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },

  update(id: string, payload: ItemPayload) {
    return apiRequest<OptionItem>(`/api/pricing/items/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    })
  },

  delete(id: string) {
    return apiRequest<void>(`/api/pricing/items/${id}`, {
      method: 'DELETE',
    })
  },
}
