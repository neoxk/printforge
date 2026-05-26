import { useEffect, useReducer, useState } from 'react'
import { PageHeader, useAppAlerts } from '@printforge/ui'
import type { OptionItem } from '@printforge/ui'
import {
  pricingReducer,
  initialPricingState,
  PricingActions,
} from '../../lib/reducers/pricing'
import { Groups, Items } from '../../lib/services'
import { GroupSidebar } from './GroupSidebar'
import { ItemTable } from './ItemTable'
import { ItemSlideOver } from './ItemSlideOver'
import type { ItemFormData } from './ItemSlideOver'

export function PricingPage() {
  const { showError } = useAppAlerts()
  const [state, dispatch] = useReducer(pricingReducer, initialPricingState)
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null)
  const [slideOver, setSlideOver] = useState<{ open: boolean; item: OptionItem | null }>({
    open: false,
    item: null,
  })

  useEffect(() => {
    Promise.all([Groups.list(), Items.list()])
      .then(([groups, items]) => dispatch(PricingActions.LOADED(groups, items)))
      .catch((err) => {
        const msg = err instanceof Error ? err.message : 'Failed to load data.'
        dispatch(PricingActions.ERROR(msg))
        showError(msg, 'Load failed')
      })
  }, [])

  // ─── Group handlers ───────────────────────────────────────────────────────

  async function handleCreateGroup(name: string) {
    try {
      const group = await Groups.create(name)
      dispatch(PricingActions.GROUP_CREATED(group))
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to create group.', 'Error')
    }
  }

  async function handleRenameGroup(id: string, name: string) {
    try {
      await Groups.rename(id, name)
      dispatch(PricingActions.GROUP_RENAMED(id, name))
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to rename group.', 'Error')
    }
  }

  async function handleDeleteGroup(id: string) {
    try {
      await Groups.delete(id)
      dispatch(PricingActions.GROUP_DELETED(id))
      if (selectedGroupId === id) setSelectedGroupId(null)
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to delete group.', 'Error')
    }
  }

  // ─── Item handlers ────────────────────────────────────────────────────────

  function openCreate() {
    setSlideOver({ open: true, item: null })
  }

  function openEdit(item: OptionItem) {
    setSlideOver({ open: true, item })
  }

  function closeSlideOver() {
    setSlideOver((s) => ({ ...s, open: false }))
  }

  async function handleSaveItem(data: ItemFormData, existing: OptionItem | null) {
    const { groupId, ...payload } = data
    try {
      if (existing) {
        const updated = await Items.update(existing.id, payload)

        const oldGroupId = existing.groupId
        if (groupId !== oldGroupId) {
          if (oldGroupId) await Groups.removeItem(oldGroupId, existing.id)
          if (groupId) await Groups.addItem(groupId, existing.id)
        }

        dispatch(PricingActions.ITEM_UPDATED({ ...updated, groupId }))
      } else {
        const created = await Items.create(payload)
        dispatch(PricingActions.ITEM_CREATED(created))

        if (groupId) {
          await Groups.addItem(groupId, created.id)
          dispatch(PricingActions.ITEM_MOVED(created.id, groupId))
        }
      }
      closeSlideOver()
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to save item.', 'Error')
      throw err
    }
  }

  async function handleDeleteItem(id: string) {
    try {
      await Items.delete(id)
      dispatch(PricingActions.ITEM_DELETED(id))
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to delete item.', 'Error')
    }
  }

  // ─── Derived state ────────────────────────────────────────────────────────

  const visibleItems =
    selectedGroupId === 'ungrouped'
      ? state.items.filter((i) => i.groupId === null)
      : selectedGroupId
        ? state.items.filter((i) => i.groupId === selectedGroupId)
        : state.items

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        eyebrow="Library"
        title="Option Items"
        description="Manage the reusable item library used to build product pricing."
      />

      <div className="grid grid-cols-4 gap-4 items-start">
        <GroupSidebar
          groups={state.groups}
          items={state.items}
          selectedGroupId={selectedGroupId}
          onSelect={setSelectedGroupId}
          onCreate={handleCreateGroup}
          onRename={handleRenameGroup}
          onDelete={handleDeleteGroup}
        />

        <ItemTable
          items={visibleItems}
          groups={state.groups}
          isLoading={state.isLoading}
          selectedGroupId={selectedGroupId}
          onEdit={(item) => (item ? openEdit(item) : openCreate())}
          onDelete={handleDeleteItem}
        />
      </div>

      <ItemSlideOver
        isOpen={slideOver.open}
        item={slideOver.item}
        groups={state.groups}
        onClose={closeSlideOver}
        onSave={handleSaveItem}
      />
    </div>
  )
}
