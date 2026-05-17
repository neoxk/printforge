import type { ContainerOptionItem, DisplayMode, OptionsContainer } from '@printforge/ui'
import { apiRequest } from '../api/client'

export type ContainerPatchPayload = {
  name?: string
  sortOrder?: number
  defaultItemId?: string | null
}

export type ContainerItemPatchPayload = {
  priceUnit?: number | null
  displayMode?: DisplayMode | null
}

export const Containers = {
  list(productId: string) {
    return apiRequest<OptionsContainer[]>(`/api/products/${productId}/containers`)
  },

  create(productId: string, name: string, sortOrder?: number) {
    return apiRequest<OptionsContainer>(`/api/products/${productId}/containers`, {
      method: 'POST',
      body: JSON.stringify({ name, sortOrder }),
    })
  },

  update(productId: string, containerId: string, payload: ContainerPatchPayload) {
    return apiRequest<OptionsContainer>(`/api/products/${productId}/containers/${containerId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    })
  },

  remove(productId: string, containerId: string) {
    return apiRequest<void>(`/api/products/${productId}/containers/${containerId}`, {
      method: 'DELETE',
    })
  },

  listItems(productId: string, containerId: string) {
    return apiRequest<ContainerOptionItem[]>(
      `/api/products/${productId}/containers/${containerId}/items`,
    )
  },

  addItem(productId: string, containerId: string, itemId: string) {
    return apiRequest<ContainerOptionItem>(
      `/api/products/${productId}/containers/${containerId}/items`,
      { method: 'POST', body: JSON.stringify({ itemId }) },
    )
  },

  removeItem(productId: string, containerId: string, itemId: string) {
    return apiRequest<void>(
      `/api/products/${productId}/containers/${containerId}/items/${itemId}`,
      { method: 'DELETE' },
    )
  },

  patchItem(
    productId: string,
    containerId: string,
    itemId: string,
    payload: ContainerItemPatchPayload,
  ) {
    return apiRequest<ContainerOptionItem>(
      `/api/products/${productId}/containers/${containerId}/items/${itemId}`,
      { method: 'PATCH', body: JSON.stringify(payload) },
    )
  },
}
