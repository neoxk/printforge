import type { IntegrationStatus, ProductField, ProductFieldOption, ProductRecord } from '../types/domain'

const WOO_SYNC_PROXY_PATH = '/__printforge/woocommerce-sync'

type WooAttributeTerm = {
  id?: number
  name?: string
  slug?: string
}

type WooStoreAttribute = {
  id?: number
  name: string
  terms?: WooAttributeTerm[]
  options?: string[]
}

type WooStoreProduct = {
  id: number
  name: string
  slug: string
  sku?: string
  categories?: Array<{ name: string }>
  attributes?: WooStoreAttribute[]
  prices?: {
    price?: string
    currency_prefix?: string
    currency_suffix?: string
    currency_minor_unit?: number
  }
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
}

function createOption(
  productId: number,
  attributeKey: string,
  label: string,
  index: number,
): ProductFieldOption {
  const normalizedLabel = label.trim()

  return {
    id: `${productId}-${attributeKey}-${index}`,
    label: normalizedLabel,
    value: slugify(normalizedLabel),
    description: '',
    price: '',
  }
}

function mapWooAttributeToField(productId: number, attribute: WooStoreAttribute): ProductField | null {
  const attributeKey = slugify(attribute.name)
  const termOptions =
    attribute.terms
      ?.map((term, index) => {
        const label = term.name?.trim()

        if (!label) {
          return null
        }

        return createOption(productId, attributeKey, label, index)
      })
      .filter((option): option is ProductFieldOption => option !== null) ?? []

  const fallbackOptions =
    attribute.options?.map((option, index) => createOption(productId, attributeKey, option, index)) ??
    []

  const options = termOptions.length > 0 ? termOptions : fallbackOptions

  if (options.length === 0) {
    return null
  }

  return {
    id: `${productId}-${attribute.id ?? attributeKey}`,
    key: attributeKey,
    label: attribute.name,
    type: 'select',
    source: 'woocommerce',
    sourceAttributeId: attribute.id ?? null,
    options,
    visibleInProductDetails: true,
    usedForPricing: attributeKey === 'material',
    helpText: 'Imported automatically from the WooCommerce product attribute.',
  }
}

function mapWooAttributesToFields(product: WooStoreProduct): ProductField[] {
  return (
    product.attributes
      ?.map((attribute) => mapWooAttributeToField(product.id, attribute))
      .filter((field): field is ProductField => field !== null) ?? []
  )
}

function formatStorePrice(product: WooStoreProduct) {
  const rawPrice = product.prices?.price

  if (!rawPrice) {
    return 'N/A'
  }

  const minorUnit = product.prices?.currency_minor_unit ?? 2
  const amount = Number(rawPrice) / 10 ** minorUnit

  if (!Number.isFinite(amount)) {
    return 'N/A'
  }

  return `${product.prices?.currency_prefix ?? '$'}${amount.toFixed(minorUnit)}${product.prices?.currency_suffix ?? ''}`
}

function getSku(product: WooStoreProduct) {
  if (product.sku?.trim()) {
    return product.sku
  }

  return String(product.id)
}

function mapWooProductToRecord(product: WooStoreProduct): ProductRecord {
  return {
    id: String(product.id),
    name: product.name,
    category: product.categories?.map((category) => category.name).join(', ') || 'Uncategorized',
    status: 'Store synced',
    syncStatus: 'Live from WooCommerce',
    sku: getSku(product),
    material: 'Configured later',
    printArea: 'Configured later',
    template: 'Configured later',
    basePrice: formatStorePrice(product),
    updatedAt: 'Live store data',
    importedFields: mapWooAttributesToFields(product),
  }
}

export async function fetchConfiguredStoreProducts(settings: IntegrationStatus) {
  const response = await fetch(WOO_SYNC_PROXY_PATH, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      authMethod: settings.authMethod,
      restApiBase: settings.restApiBase,
      consumerKey: settings.consumerKey,
      consumerSecret: settings.consumerSecret,
    }),
  })

  if (!response.ok) {
    let errorMessage = `Store API request failed with status ${response.status}`

    try {
      const errorPayload = (await response.json()) as { error?: string }
      if (errorPayload.error) {
        errorMessage = errorPayload.error
      }
    } catch {
      // Keep the status-based fallback message if the proxy did not return JSON.
    }

    throw new Error(errorMessage)
  }

  const data = (await response.json()) as WooStoreProduct[]
  return data.map(mapWooProductToRecord)
}
