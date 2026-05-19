import type { ContainerOptionItem, ContainerType, OptionsContainer } from '@printforge/ui'
import { apiRequest } from '../api/client'

export type ContainerPatchPayload = {
  name?: string
  containerType?: ContainerType
  sortOrder?: number
  defaultItemId?: string | null
  isHidden?: boolean
  isRequired?: boolean
}

export type ContainerItemPatchPayload = {
  priceUnit?: number | null
  name?: string | null
}

export const Containers = {
  list(productId: string) {
    return apiRequest<OptionsContainer[]>(`/api/products/${productId}/containers`)
  },

  create(productId: string, name: string, containerType: ContainerType, sortOrder?: number) {
    return apiRequest<OptionsContainer>(`/api/products/${productId}/containers`, {
      method: 'POST',
      body: JSON.stringify({ name, containerType, sortOrder }),
    })
  },

  update(productId: string, containerId: string, payload: ContainerPatchPayload) {
    return apiRequest<OptionsContainer>(`/api/products/${productId}/containers/${containerId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    })
  },

  reorder(productId: string, orderedIds: string[]): Promise<void> {
    return Promise.all(
      orderedIds.map((id, index) => Containers.update(productId, id, { sortOrder: index })),
    ).then(() => undefined)
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

  reorderItems(productId: string, containerId: string, orderedItemIds: string[]): Promise<void> {
    return Promise.all(
      orderedItemIds.map((itemId, index) =>
        apiRequest<ContainerOptionItem>(
          `/api/products/${productId}/containers/${containerId}/items/${itemId}`,
          { method: 'PATCH', body: JSON.stringify({ sortOrder: index }) },
        ),
      ),
    ).then(() => undefined)
  },
}
