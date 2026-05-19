import type { OptionsGroup, OptionItem } from '@printforge/ui'
import { apiRequest } from '../api/client'

export const Groups = {
  list() {
    return apiRequest<OptionsGroup[]>('/api/pricing/groups')
  },

  get(id: string) {
    return apiRequest<OptionsGroup & { items: OptionItem[] }>(`/api/pricing/groups/${id}`)
  },

  create(name: string) {
    return apiRequest<OptionsGroup>('/api/pricing/groups', {
      method: 'POST',
      body: JSON.stringify({ name }),
    })
  },

  rename(id: string, name: string) {
    return apiRequest<OptionsGroup>(`/api/pricing/groups/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ name }),
    })
  },

  delete(id: string) {
    return apiRequest<void>(`/api/pricing/groups/${id}`, {
      method: 'DELETE',
    })
  },

  addItem(groupId: string, itemId: string) {
    return apiRequest<OptionItem>(`/api/pricing/groups/${groupId}/items/${itemId}`, {
      method: 'POST',
    })
  },

  removeItem(groupId: string, itemId: string) {
    return apiRequest<void>(`/api/pricing/groups/${groupId}/items/${itemId}`, {
      method: 'DELETE',
    })
  },

  async move(itemId: string, fromGroupId: string | null, toGroupId: string) {
    if (fromGroupId) {
      await Groups.removeItem(fromGroupId, itemId)
    }
    await Groups.addItem(toGroupId, itemId)
  },
}
