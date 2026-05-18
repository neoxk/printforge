export type ConfigItem = {
  id: string
  name: string
  slug: string
}

export type ConfigContainer = {
  id: string
  name: string
  containerType: 'SINGLE_SELECT' | 'MULTI_SELECT' | 'AUTO_APPLIED'
  isHidden: boolean
  isRequired: boolean
  defaultItemId: string | null
  items: ConfigItem[]
}

export type ProductConfig = {
  containers: ConfigContainer[]
}
