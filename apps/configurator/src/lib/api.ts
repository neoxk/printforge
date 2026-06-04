import type { ProductConfig, ProductPrintAreaConfig, PricingResult, QuantityPriceTable } from '../types.js'

export async function fetchProductConfig(productId: string): Promise<ProductConfig> {
  const res = await fetch(`/api/products/${productId}/config`)
  if (!res.ok) throw new Error(`Failed to load product config (${res.status})`)
  return res.json() as Promise<ProductConfig>
}

export async function fetchProductConfigByWooId(wooProductId: string): Promise<ProductConfig> {
  const res = await fetch(`/api/products/woo/${wooProductId}/config`)
  if (!res.ok) throw new Error(`Failed to load product config (${res.status})`)
  return res.json() as Promise<ProductConfig>
}

export async function fetchProductPrintAreas(productId: string): Promise<ProductPrintAreaConfig> {
  const res = await fetch(`/api/products/${productId}/print-areas`)
  if (!res.ok) throw new Error(`Failed to load print areas (${res.status})`)
  return res.json() as Promise<ProductPrintAreaConfig>
}

export async function fetchProductPrintAreasByWooId(
  wooProductId: string,
): Promise<ProductPrintAreaConfig> {
  const res = await fetch(`/api/products/woo/${wooProductId}/print-areas`)
  if (!res.ok) throw new Error(`Failed to load print areas (${res.status})`)
  return res.json() as Promise<ProductPrintAreaConfig>
}

export async function calculatePrice(
  productId: string,
  selectedItemIds: string[],
  context: { widthMm: number; heightMm: number; quantity: number },
): Promise<PricingResult> {
  const res = await fetch('/api/pricing/calculate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productId, selectedItemIds, context }),
  })
  if (!res.ok) throw new Error(`Price calculation failed (${res.status})`)
  return res.json() as Promise<PricingResult>
}

export async function calculateQuantityTable(
  productId: string,
  selectedItemIds: string[],
  context: { widthMm: number; heightMm: number; quantity: number },
  quantities: number[],
): Promise<QuantityPriceTable> {
  const res = await fetch('/api/pricing/quantity-table', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productId, selectedItemIds, context, quantities }),
  })
  if (!res.ok) throw new Error(`Quantity pricing failed (${res.status})`)
  return res.json() as Promise<QuantityPriceTable>
}
