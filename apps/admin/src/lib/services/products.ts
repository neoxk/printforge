import { apiRequest } from '../api/client'

export type ProductDimensions =
  | { type: 'fixed'; widthMm: number; heightMm: number }
  | { type: 'custom' }

type ProductConfig = {
  dimensions: ProductDimensions
}

type DimensionsResult = {
  id: string
  widthMm: number | null
  heightMm: number | null
}

export const Products = {
  getConfig(productId: string) {
    return apiRequest<ProductConfig>(`/api/products/${productId}/config`, { skipAuth: true })
  },

  updateDimensions(productId: string, widthMm: number | null, heightMm: number | null) {
    return apiRequest<DimensionsResult>(`/api/products/${productId}`, {
      method: 'PATCH',
      body: JSON.stringify({ widthMm, heightMm }),
    })
  },
}
