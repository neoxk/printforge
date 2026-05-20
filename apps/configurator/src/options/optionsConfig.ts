import { fetchProductConfig, fetchProductConfigByWooId } from '../lib/api.js'
import type { ProductConfig } from '../types.js'
import type { DimensionsState, SelectedByContainer } from './types.js'

const OPTIONS_ROUTE_PREFIX = '/pf/options/'
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const WOO_PRODUCT_ID_PATTERN = /^\d+$/

export const DEFAULT_DIMENSIONS_STATE: DimensionsState = {
  widthMm: '',
  heightMm: '',
  quantity: '1',
}

export function getProductIdFromPath(pathname: string): string | null {
  if (!pathname.startsWith(OPTIONS_ROUTE_PREFIX)) return null

  const productId = pathname.slice(OPTIONS_ROUTE_PREFIX.length).split('/')[0]
  return productId ? decodeURIComponent(productId) : null
}

export function getBasePriceFromSearch(search: string): number | null {
  const value = new URLSearchParams(search).get('basePrice')
  if (!value) return null

  const basePrice = Number(value)
  return Number.isFinite(basePrice) && basePrice >= 0 ? basePrice : null
}

export function isValidProductId(productId: string): boolean {
  return UUID_PATTERN.test(productId) || WOO_PRODUCT_ID_PATTERN.test(productId)
}

export function fetchOptionsConfig(productId: string): Promise<ProductConfig> {
  return UUID_PATTERN.test(productId)
    ? fetchProductConfig(productId)
    : fetchProductConfigByWooId(productId)
}

export function getDefaultSelections(config: ProductConfig): SelectedByContainer {
  return config.containers.reduce<SelectedByContainer>((selected, container) => {
    if (container.containerType === 'SINGLE_SELECT' && container.defaultItemId) {
      selected[container.id] = [container.defaultItemId]
      return selected
    }

    if (container.containerType === 'AUTO_APPLIED') {
      selected[container.id] = container.items.map((item) => item.id)
      return selected
    }

    selected[container.id] = []
    return selected
  }, {})
}

export function getDimensionsState(config: ProductConfig): DimensionsState {
  if (config.dimensions.type === 'fixed') {
    return {
      widthMm: String(config.dimensions.widthMm),
      heightMm: String(config.dimensions.heightMm),
      quantity: '1',
    }
  }

  return DEFAULT_DIMENSIONS_STATE
}

export function getSelectedItemIds(selectedByContainer: SelectedByContainer): string[] {
  return [...new Set(Object.values(selectedByContainer).flat())]
}
