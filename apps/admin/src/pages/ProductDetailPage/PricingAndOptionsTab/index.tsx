import { Plus, Eye } from 'lucide-react'
import { useEffect, useReducer, useState } from 'react'
import { SectionCard, useAppAlerts } from '@printforge/ui'
import type { ProductRecord } from '@printforge/ui'
import {
  containersReducer,
  initialContainersState,
  ContainersActions,
} from '../../../lib/reducers/containers'
import {
  pricingReducer,
  initialPricingState,
  PricingActions,
} from '../../../lib/reducers/pricing'
import { Containers } from '../../../lib/services/containers'
import type { ContainerItemPatchPayload } from '../../../lib/services/containers'
import { Groups, Items } from '../../../lib/services'
import { CONTAINER_TYPE_OPTIONS } from '../../../lib/options-meta'
import { ContainerCard } from './ContainerCard'
import { PreviewModal } from './PreviewModal'

type Props = { product: ProductRecord }

export function PricingAndOptionsTab({ product }: Props) {
  const { showError } = useAppAlerts()
  const [containersState, containersDispatch] = useReducer(containersReducer, initialContainersState)
  const [pricingState, pricingDispatch] = useReducer(pricingReducer, initialPricingState)
  const [isAddingContainer, setIsAddingContainer] = useState(false)
  const [newContainerName, setNewContainerName] = useState('')
  const [newContainerType, setNewContainerType] = useState(CONTAINER_TYPE_OPTIONS[0].value)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const [containerList, groups, items] = await Promise.all([
          Containers.list(product.id),
          Groups.list(),
          Items.list(),
        ])

        const slotLists = await Promise.all(
          containerList.map((c) => Containers.listItems(product.id, c.id)),
        )

        const itemsMap = Object.fromEntries(
          containerList.map((c, i) => [c.id, slotLists[i]]),
        )

        containersDispatch(ContainersActions.LOADED(containerList, itemsMap))
        pricingDispatch(PricingActions.LOADED(groups, items))
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to load pricing data.'
        containersDispatch(ContainersActions.ERROR(msg))
        showError(msg, 'Load failed')
      }
    }

    void load()
  }, [product.id])

  async function handleAddContainer() {
    const name = newContainerName.trim()
    if (!name) return
    try {
      const nextSortOrder = containersState.containers.length
      const container = await Containers.create(product.id, name, newContainerType, nextSortOrder)
      containersDispatch(ContainersActions.CONTAINER_CREATED(container))
      setNewContainerName('')
      setNewContainerType(CONTAINER_TYPE_OPTIONS[0].value)
      setIsAddingContainer(false)
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to create container.', 'Create failed')
    }
  }

  async function handleDeleteContainer(containerId: string) {
    try {
      await Containers.remove(product.id, containerId)
      containersDispatch(ContainersActions.CONTAINER_DELETED(containerId))
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to delete container.', 'Delete failed')
    }
  }

  async function handleSetDefault(containerId: string, defaultItemId: string | null) {
    try {
      const updated = await Containers.update(product.id, containerId, { defaultItemId })
      containersDispatch(ContainersActions.CONTAINER_UPDATED(updated))
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to update default.', 'Update failed')
    }
  }

  async function handleAddItem(containerId: string, itemId: string) {
    try {
      const item = await Containers.addItem(product.id, containerId, itemId)
      containersDispatch(ContainersActions.CONTAINER_ITEM_ADDED(containerId, item))
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to add item.', 'Add failed')
    }
  }

  async function handleRemoveItem(containerId: string, itemId: string) {
    try {
      await Containers.removeItem(product.id, containerId, itemId)
      containersDispatch(ContainersActions.CONTAINER_ITEM_REMOVED(containerId, itemId))
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to remove item.', 'Remove failed')
    }
  }

  async function handlePatchItem(
    containerId: string,
    itemId: string,
    payload: ContainerItemPatchPayload,
  ) {
    try {
      const updated = await Containers.patchItem(product.id, containerId, itemId, payload)
      containersDispatch(ContainersActions.CONTAINER_ITEM_PATCHED(containerId, updated))
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to update item.', 'Update failed')
    }
  }

  const { containers, items, isLoading } = containersState

  return (
    <div className="page-stack">
      <SectionCard
        title="Options & Pricing"
        description="Build the options and pricing structure for this product"
        actions={
          <>
            <button
              className="ghost-button"
              type="button"
              onClick={() => setIsPreviewOpen(true)}
            >
              <Eye className="button-icon" aria-hidden="true" />
              Preview
            </button>
            <button
              className="ghost-button"
              type="button"
              onClick={() => setIsAddingContainer((v) => !v)}
            >
              <Plus className="button-icon" aria-hidden="true" />
              Add container
            </button>
          </>
        }
      >
        {isAddingContainer && (
          <div className="add-container-row">
            <input
              type="text"
              placeholder="Container name (e.g. Paper, Finish)"
              value={newContainerName}
              onChange={(e) => setNewContainerName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && void handleAddContainer()}
              autoFocus
            />
            <select
              value={newContainerType}
              onChange={(e) => setNewContainerType(e.target.value as typeof newContainerType)}
            >
              {CONTAINER_TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <button className="primary-button" type="button" onClick={() => void handleAddContainer()}>
              Confirm
            </button>
            <button
              className="ghost-button"
              type="button"
              onClick={() => { setIsAddingContainer(false); setNewContainerName(''); setNewContainerType(CONTAINER_TYPE_OPTIONS[0].value) }}
            >
              Cancel
            </button>
          </div>
        )}

        {isLoading ? (
          <p className="empty-row muted-copy">Loading…</p>
        ) : containers.length === 0 ? (
          <p className="empty-row muted-copy">
            No containers yet. Add one to start building the pricing structure.
          </p>
        ) : (
          <div className="container-list">
            {containers.map((container, idx) => (
              <ContainerCard
                key={container.id}
                container={container}
                containerItems={items[container.id] ?? []}
                position={idx + 1}
                total={containers.length}
                libraryItems={pricingState.items}
                groups={pricingState.groups}
                onDelete={() => void handleDeleteContainer(container.id)}
                onSetDefault={(itemId) => void handleSetDefault(container.id, itemId)}
                onAddItem={(itemId) => void handleAddItem(container.id, itemId)}
                onRemoveItem={(itemId) => void handleRemoveItem(container.id, itemId)}
                onPatchItem={(itemId, payload) => void handlePatchItem(container.id, itemId, payload)}
              />
            ))}
          </div>
        )}
      </SectionCard>

      <PreviewModal
        productId={product.id}
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
      />
    </div>
  )
}
