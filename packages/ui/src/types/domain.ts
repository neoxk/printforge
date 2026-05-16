export type IntegrationStatus = {
  connectionName: string
  storeUrl: string
  restApiBase: string
  authMethod: 'public_store_api' | 'consumer_keys'
  consumerKey: string
  consumerSecret: string
  apiStatus: string
  lastSync: string
  mode: string
  importPublishedProducts: boolean
  importAttributes: boolean
  importVariations: boolean
}

export type UserSession = {
  id: string
  name: string
  email: string
  tenantName: string
}

export type AuthSession = {
  accessToken: string
  refreshToken: string
  user: UserSession
}

export type ProductRecord = {
  id: string
  name: string
  category: string
  status: string
  syncStatus: string
  sku: string
  material: string
  printArea: string
  template: string
  basePrice: string
  updatedAt: string
  importedFields?: ProductField[]
}

export type ProductFieldSource = 'woocommerce' | 'printforge'

export type ProductFieldType = 'select' | 'text' | 'number'

export type ProductFieldOption = {
  id: string
  label: string
  value: string
  description: string
  price: string
}

export type ProductField = {
  id: string
  key: string
  label: string
  type: ProductFieldType
  source: ProductFieldSource
  sourceAttributeId?: number | null
  options: ProductFieldOption[]
  visibleInProductDetails: boolean
  usedForPricing: boolean
  helpText: string
}

export type ProductConfiguration = {
  productId: string
  fields: ProductField[]
  savedAt: string
}

export type SyncProductsResponse = {
  products: ProductRecord[]
  syncedAt: string
  connectionName: string
  authMethod: IntegrationStatus['authMethod']
}

export type PricingRule = {
  id: string
  name: string
  summary: string
  trigger: string
  status: string
}

export type PricingBreakdownItem = {
  ruleId: string
  label: string
  amount: number
  trigger: string
}

export type PricingCalculation = {
  price: number
  breakdown: PricingBreakdownItem[]
  options: Record<string, string>
}

export type ValidationRule = {
  id: string
  name: string
  summary: string
  severity: string
}
