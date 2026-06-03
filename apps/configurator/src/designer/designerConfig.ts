import { fetchProductPrintAreas, fetchProductPrintAreasByWooId } from '../lib/api.js'
import type { ProductPrintAreaConfig } from '../types.js'

const DESIGNER_ROUTE_PREFIX = '/pf/configurator/'
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const WOO_PRODUCT_ID_PATTERN = /^\d+$/

export function getDesignerProductIdFromPath(pathname: string): string | null {
  if (!pathname.startsWith(DESIGNER_ROUTE_PREFIX)) return null

  const productId = pathname.slice(DESIGNER_ROUTE_PREFIX.length).split('/')[0]
  return productId ? decodeURIComponent(productId) : null
}

export function isValidDesignerProductId(productId: string): boolean {
  return UUID_PATTERN.test(productId) || WOO_PRODUCT_ID_PATTERN.test(productId)
}

export function fetchDesignerConfig(productId: string): Promise<ProductPrintAreaConfig> {
  return UUID_PATTERN.test(productId)
    ? fetchProductPrintAreas(productId)
    : fetchProductPrintAreasByWooId(productId)
}
