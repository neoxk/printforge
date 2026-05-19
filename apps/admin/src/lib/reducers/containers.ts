import type { ContainerOptionItem, OptionsContainer } from '@printforge/ui'

// ─── State ───────────────────────────────────────────────────────────────────

export type ContainersState = {
  containers: OptionsContainer[]
  items: Record<string, ContainerOptionItem[]>
  isLoading: boolean
  error: string | null
}

export const initialContainersState: ContainersState = {
  containers: [],
  items: {},
  isLoading: true,
  error: null,
}

// ─── Actions ─────────────────────────────────────────────────────────────────

export type ContainersAction =
  | { type: 'LOADED'; containers: OptionsContainer[]; items: Record<string, ContainerOptionItem[]> }
  | { type: 'CONTAINER_CREATED'; container: OptionsContainer }
  | { type: 'CONTAINER_UPDATED'; container: OptionsContainer }
  | { type: 'CONTAINER_DELETED'; id: string }
  | { type: 'CONTAINER_ITEM_ADDED'; containerId: string; item: ContainerOptionItem }
  | { type: 'CONTAINER_ITEM_REMOVED'; containerId: string; itemId: string }
  | { type: 'CONTAINER_ITEM_PATCHED'; containerId: string; item: ContainerOptionItem }
  | { type: 'CONTAINERS_REORDERED'; containers: OptionsContainer[] }
  | { type: 'CONTAINER_ITEMS_REORDERED'; containerId: string; items: ContainerOptionItem[] }
  | { type: 'ERROR'; message: string }

// ─── Action creators ─────────────────────────────────────────────────────────

export const ContainersActions = {
  LOADED(
    containers: OptionsContainer[],
    items: Record<string, ContainerOptionItem[]>,
  ): ContainersAction {
    return { type: 'LOADED', containers, items }
  },

  CONTAINER_CREATED(container: OptionsContainer): ContainersAction {
    return { type: 'CONTAINER_CREATED', container }
  },

  CONTAINER_UPDATED(container: OptionsContainer): ContainersAction {
    return { type: 'CONTAINER_UPDATED', container }
  },

  CONTAINER_DELETED(id: string): ContainersAction {
    return { type: 'CONTAINER_DELETED', id }
  },

  CONTAINER_ITEM_ADDED(containerId: string, item: ContainerOptionItem): ContainersAction {
    return { type: 'CONTAINER_ITEM_ADDED', containerId, item }
  },

  CONTAINER_ITEM_REMOVED(containerId: string, itemId: string): ContainersAction {
    return { type: 'CONTAINER_ITEM_REMOVED', containerId, itemId }
  },

  CONTAINER_ITEM_PATCHED(containerId: string, item: ContainerOptionItem): ContainersAction {
    return { type: 'CONTAINER_ITEM_PATCHED', containerId, item }
  },

  CONTAINERS_REORDERED(containers: OptionsContainer[]): ContainersAction {
    return { type: 'CONTAINERS_REORDERED', containers }
  },

  CONTAINER_ITEMS_REORDERED(containerId: string, items: ContainerOptionItem[]): ContainersAction {
    return { type: 'CONTAINER_ITEMS_REORDERED', containerId, items }
  },

  ERROR(message: string): ContainersAction {
    return { type: 'ERROR', message }
  },
}

// ─── Reducer ─────────────────────────────────────────────────────────────────

export function containersReducer(
  state: ContainersState,
  action: ContainersAction,
): ContainersState {
  switch (action.type) {
    case 'LOADED':
      return { ...state, containers: action.containers, items: action.items, isLoading: false }

    case 'CONTAINER_CREATED':
      return {
        ...state,
        containers: [...state.containers, action.container].sort(
          (a, b) => a.sortOrder - b.sortOrder,
        ),
        items: { ...state.items, [action.container.id]: [] },
      }

    case 'CONTAINER_UPDATED':
      return {
        ...state,
        containers: state.containers
          .map((c) => (c.id === action.container.id ? action.container : c))
          .sort((a, b) => a.sortOrder - b.sortOrder),
      }

    case 'CONTAINER_DELETED': {
      const { [action.id]: _removed, ...remainingItems } = state.items
      return {
        ...state,
        containers: state.containers.filter((c) => c.id !== action.id),
        items: remainingItems,
      }
    }

    case 'CONTAINER_ITEM_ADDED':
      return {
        ...state,
        items: {
          ...state.items,
          [action.containerId]: [
            ...(state.items[action.containerId] ?? []),
            action.item,
          ].sort((a, b) => a.sortOrder - b.sortOrder),
        },
      }

    case 'CONTAINER_ITEM_REMOVED':
      return {
        ...state,
        items: {
          ...state.items,
          [action.containerId]: (state.items[action.containerId] ?? []).filter(
            (i) => i.itemId !== action.itemId,
          ),
        },
      }

    case 'CONTAINER_ITEM_PATCHED':
      return {
        ...state,
        items: {
          ...state.items,
          [action.containerId]: (state.items[action.containerId] ?? []).map((i) =>
            i.itemId === action.item.itemId ? action.item : i,
          ),
        },
      }

    case 'CONTAINERS_REORDERED':
      return { ...state, containers: action.containers }

    case 'CONTAINER_ITEMS_REORDERED':
      return { ...state, items: { ...state.items, [action.containerId]: action.items } }

    case 'ERROR':
      return { ...state, error: action.message, isLoading: false }
  }
}
