import { Plus, Eye } from 'lucide-react'
import { type ComponentProps, useEffect, useReducer, useState } from 'react'
import { DragDropProvider } from '@dnd-kit/react'
import { useSortable, isSortable } from '@dnd-kit/react/sortable'
import { PointerSensor, PointerActivationConstraints } from '@dnd-kit/dom'
import type { ProductRecord } from '@printforge/ui'
import { Card, CardHeader, CardTitle, CardDescription, CardAction, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { showError } from '@/lib/toast'
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
import type { ContainerItemPatchPayload, ContainerPatchPayload } from '../../../lib/services/containers'
import type { ContainerOptionItem } from '@printforge/ui'
import { Groups, Items } from '../../../lib/services'
import { CONTAINER_TYPE_OPTIONS } from '../../../lib/options-meta'
import { ContainerCard } from './ContainerCard'
import { ProductSettingsCard } from './ProductSettingsCard'
import { PreviewModal } from './PreviewModal'

type SortableContainerCardProps = ComponentProps<typeof ContainerCard> & { index: number }

function SortableContainerCard({ index, ...props }: SortableContainerCardProps) {
  const { ref, handleRef } = useSortable({ id: props.container.id, index })
  return <ContainerCard ref={ref} handleRef={handleRef} {...props} />
}

type Props = { product: ProductRecord }

export function PricingAndOptionsTab({ product }: Props) {
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

  async function handlePatchContainer(containerId: string, payload: ContainerPatchPayload) {
    try {
      const updated = await Containers.update(product.id, containerId, payload)
      containersDispatch(ContainersActions.CONTAINER_UPDATED(updated))
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to update container.', 'Update failed')
    }
  }

  async function handleReorderItems(containerId: string, newOrder: ContainerOptionItem[]) {
    containersDispatch(ContainersActions.CONTAINER_ITEMS_REORDERED(containerId, newOrder))
    try {
      await Containers.reorderItems(product.id, containerId, newOrder.map((ci) => ci.itemId))
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to reorder items.', 'Reorder failed')
    }
  }

  async function handleReorderContainers(newOrder: typeof containersState.containers) {
    containersDispatch(ContainersActions.CONTAINERS_REORDERED(newOrder))
    try {
      await Containers.reorder(product.id, newOrder.map((c) => c.id))
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to reorder.', 'Reorder failed')
    }
  }

  const { containers, items, isLoading } = containersState

  return (
    <div className="page-stack">
      <ProductSettingsCard productId={product.id} />

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Options & Pricing</CardTitle>
            <CardDescription>Build the options and pricing structure for this product</CardDescription>
          </div>
          <CardAction className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              type="button"
              onClick={() => setIsPreviewOpen(true)}
            >
              <Eye className="size-4" aria-hidden="true" />
              Preview
            </Button>
            <Button
              variant="ghost"
              size="sm"
              type="button"
              onClick={() => setIsAddingContainer((v) => !v)}
            >
              <Plus className="size-4" aria-hidden="true" />
              Add container
            </Button>
          </CardAction>
        </CardHeader>

        <CardContent className="flex flex-col gap-3">
          {isAddingContainer && (
            <div className="flex gap-2 items-center">
              <Input
                className="flex-1"
                type="text"
                placeholder="Container name (e.g. Paper, Finish)"
                value={newContainerName}
                onChange={(e) => setNewContainerName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && void handleAddContainer()}
                autoFocus
              />
              <Select
                value={newContainerType}
                onValueChange={(v) => setNewContainerType(v as typeof newContainerType)}
              >
                <SelectTrigger className="w-[160px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CONTAINER_TYPE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button type="button" onClick={() => void handleAddContainer()}>
                Confirm
              </Button>
              <Button
                variant="ghost"
                type="button"
                onClick={() => {
                  setIsAddingContainer(false)
                  setNewContainerName('')
                  setNewContainerType(CONTAINER_TYPE_OPTIONS[0].value)
                }}
              >
                Cancel
              </Button>
            </div>
          )}

          {isLoading ? (
            <p className="text-sm text-muted-foreground py-2">Loading…</p>
          ) : containers.length === 0 ? (
            <p className="text-sm text-muted-foreground py-2">
              No containers yet. Add one to start building the pricing structure.
            </p>
          ) : (
            <DragDropProvider
              sensors={[PointerSensor.configure({ activationConstraints: [new PointerActivationConstraints.Distance({ value: 8 })] })]}
              onDragEnd={(event) => {
                if (event.canceled) return
                const { source } = event.operation
                if (!isSortable(source)) return
                const { initialIndex, index } = source
                if (initialIndex === index) return
                const newOrder = [...containers]
                const [moved] = newOrder.splice(initialIndex, 1)
                newOrder.splice(index, 0, moved)
                void handleReorderContainers(newOrder)
              }}
            >
              <div className="grid gap-3">
                {containers.map((container, idx) => (
                  <SortableContainerCard
                    key={container.id}
                    index={idx}
                    container={container}
                    containerItems={items[container.id] ?? []}
                    libraryItems={pricingState.items}
                    groups={pricingState.groups}
                    onDelete={() => void handleDeleteContainer(container.id)}
                    onSetDefault={(itemId) => void handleSetDefault(container.id, itemId)}
                    onAddItem={(itemId) => void handleAddItem(container.id, itemId)}
                    onRemoveItem={(itemId) => void handleRemoveItem(container.id, itemId)}
                    onPatchItem={(itemId, payload) => void handlePatchItem(container.id, itemId, payload)}
                    onReorderItems={(newOrder) => void handleReorderItems(container.id, newOrder)}
                    onPatchContainer={(payload) => void handlePatchContainer(container.id, payload)}
                  />
                ))}
              </div>
            </DragDropProvider>
          )}
        </CardContent>
      </Card>

      <PreviewModal
        productId={product.id}
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
      />
    </div>
  )
}
