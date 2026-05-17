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
}

export type SyncProductsResponse = {
  products: ProductRecord[]
  syncedAt: string
  connectionName: string
  authMethod: IntegrationStatus['authMethod']
}

export type CalculationBasis = 'YIELD_PCS' | 'LINEAR_M' | 'SQM' | 'PERIMETER' | 'PCS' | 'ORDER' | 'FREE'
export type DisplayMode = 'SELECTABLE' | 'HIDDEN' | 'REQUIRED'

export type OptionsGroup = {
  id: string
  name: string
  items?: OptionItem[]
}

export type OptionItem = {
  id: string
  name: string
  slug: string
  priceUnit: number
  calculationBasis: CalculationBasis
  displayMode: DisplayMode
  lengthMm: number | null
  widthMm: number | null
  groupId: string | null
}

export type OptionsContainer = {
  id: string
  name: string
  sortOrder: number
  defaultItemId: string | null
  defaultItem: OptionItem | null
}

export type ContainerOptionItem = {
  containerId: string
  itemId: string
  sortOrder: number
  priceUnit: number | null
  displayMode: DisplayMode | null
  item: OptionItem
}

export type PriceLineItem = {
  itemId: string
  name: string
  calculationBasis: CalculationBasis
  cost: number
}

export type PricingResult = {
  total: number
  breakdown: PriceLineItem[]
}

export type ValidationRule = {
  id: string
  name: string
  summary: string
  severity: string
}
