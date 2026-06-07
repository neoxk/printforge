export type IntegrationStatus = {
  connectionName: string
  storeUrl: string
  restApiBase: string
  authMethod: 'public_store_api' | 'consumer_keys'
  consumerKey: string
  consumerSecret: string
  webhookSecret: string
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
  wooProductId: string
  name: string
  category: string
  status: string
  sku: string
  basePrice: string
}

export type SyncProductsResponse = {
  products: ProductRecord[]
  syncedAt: string
  connectionName: string
  authMethod: IntegrationStatus['authMethod']
}

export const CalcBasis = {
  YIELD_PCS: 'YIELD_PCS',
  LINEAR_M:  'LINEAR_M',
  SQM:       'SQM',
  PERIMETER: 'PERIMETER',
  PCS:       'PCS',
  ORDER:     'ORDER',
  FREE:      'FREE',
} as const
export type CalcBasis = typeof CalcBasis[keyof typeof CalcBasis]

export const ContainerType = {
  SINGLE_SELECT: 'SINGLE_SELECT',
  MULTI_SELECT:  'MULTI_SELECT',
  AUTO_APPLIED:  'AUTO_APPLIED',
} as const
export type ContainerType = typeof ContainerType[keyof typeof ContainerType]

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
  calculationBasis: CalcBasis
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
  containerType: ContainerType
  isHidden: boolean
  isRequired: boolean
}

export type ContainerOptionItem = {
  containerId: string
  itemId: string
  sortOrder: number
  priceUnit: number | null
  name: string | null
  item: OptionItem
}

export type PriceLineItem = {
  itemId: string
  name: string
  calculationBasis: CalcBasis
  cost: number
}

export type PricingResult = {
  total: number
  breakdown: PriceLineItem[]
}
