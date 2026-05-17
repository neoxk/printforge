import type { OptionsGroup, OptionItem } from '@printforge/ui'

// ─── State ───────────────────────────────────────────────────────────────────

export type PricingState = {
  groups: OptionsGroup[]
  items: OptionItem[]
  isLoading: boolean
  error: string | null
}

export const initialPricingState: PricingState = {
  groups: [],
  items: [],
  isLoading: true,
  error: null,
}

// ─── Actions ──────────────────────────────────────────────────────────────────

export type PricingAction =
  | { type: 'LOADED';        groups: OptionsGroup[]; items: OptionItem[] }
  | { type: 'GROUP_CREATED'; group: OptionsGroup }
  | { type: 'GROUP_RENAMED'; id: string; name: string }
  | { type: 'GROUP_DELETED'; id: string }
  | { type: 'ITEM_CREATED';  item: OptionItem }
  | { type: 'ITEM_UPDATED';  item: OptionItem }
  | { type: 'ITEM_DELETED';  id: string }
  | { type: 'ITEM_MOVED';    itemId: string; toGroupId: string }
  | { type: 'ERROR';         message: string }

// ─── Action creators ─────────────────────────────────────────────────────────
//
// Use these instead of writing dispatch({ type: '...' }) inline.
// Callers get autocomplete and never need to remember a string literal.

export const PricingActions = {
  LOADED(groups: OptionsGroup[], items: OptionItem[]): PricingAction {
    return { type: 'LOADED', groups, items }
  },

  GROUP_CREATED(group: OptionsGroup): PricingAction {
    return { type: 'GROUP_CREATED', group }
  },

  GROUP_RENAMED(id: string, name: string): PricingAction {
    return { type: 'GROUP_RENAMED', id, name }
  },

  GROUP_DELETED(id: string): PricingAction {
    return { type: 'GROUP_DELETED', id }
  },

  ITEM_CREATED(item: OptionItem): PricingAction {
    return { type: 'ITEM_CREATED', item }
  },

  ITEM_UPDATED(item: OptionItem): PricingAction {
    return { type: 'ITEM_UPDATED', item }
  },

  ITEM_DELETED(id: string): PricingAction {
    return { type: 'ITEM_DELETED', id }
  },

  ITEM_MOVED(itemId: string, toGroupId: string): PricingAction {
    return { type: 'ITEM_MOVED', itemId, toGroupId }
  },

  ERROR(message: string): PricingAction {
    return { type: 'ERROR', message }
  },
}

// ─── Reducer ─────────────────────────────────────────────────────────────────

export function pricingReducer(state: PricingState, action: PricingAction): PricingState {
  switch (action.type) {
    case 'LOADED':
      return {
        ...state,
        groups: action.groups,
        items: action.items,
        isLoading: false,
      }

    case 'GROUP_CREATED':
      return {
        ...state,
        groups: [...state.groups, action.group],
      }

    case 'GROUP_RENAMED':
      return {
        ...state,
        groups: state.groups.map((g) =>
          g.id === action.id ? { ...g, name: action.name } : g
        ),
      }

    case 'GROUP_DELETED':
      return {
        ...state,
        groups: state.groups.filter((g) => g.id !== action.id),
        // mirror the backend: orphaned items lose their groupId
        items: state.items.map((i) =>
          i.groupId === action.id ? { ...i, groupId: null } : i
        ),
      }

    case 'ITEM_CREATED':
      return {
        ...state,
        items: [...state.items, action.item],
      }

    case 'ITEM_UPDATED':
      return {
        ...state,
        items: state.items.map((i) => (i.id === action.item.id ? action.item : i)),
      }

    case 'ITEM_DELETED':
      return {
        ...state,
        items: state.items.filter((i) => i.id !== action.id),
      }

    case 'ITEM_MOVED':
      return {
        ...state,
        items: state.items.map((i) =>
          i.id === action.itemId ? { ...i, groupId: action.toGroupId } : i
        ),
      }

    case 'ERROR':
      return {
        ...state,
        error: action.message,
        isLoading: false,
      }
  }
}
