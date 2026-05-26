export type DesignerSourceMode = 'template' | 'upload' | 'blank'

export type DesignerTool = 'select' | 'pan' | 'draw'

export type ZoneKey =
  | 'physicalSize'
  | 'cutArea'
  | 'bleedArea'
  | 'safeZone'
  | 'allowedPrintArea'

export type ZoneRect = {
  x: number
  y: number
  width: number
  height: number
  rotation?: number
}

export type ZoneFieldDefinition = {
  key: ZoneKey
  label: string
  enabled: boolean
  optional: boolean
  rect: ZoneRect
}

export type ZoneFieldMap = Record<ZoneKey, ZoneFieldDefinition>

export type DesignerView = {
  id: string
  name: string
  sourceMode: DesignerSourceMode
  templateId: string | null
  mockupName: string | null
  mockupSrc: string | null
  mockupRect: ZoneRect | null
  fields: ZoneFieldMap
}

export type CreateViewDraft = {
  name: string
  sourceMode: DesignerSourceMode
  templateId: string
  mockupName: string | null
  mockupSrc: string | null
}

export type TemplatePreset = {
  id: string
  label: string
  description: string
  physicalSize: Pick<ZoneRect, 'width' | 'height'>
  fields: Partial<Record<Exclude<ZoneKey, 'physicalSize'>, Partial<ZoneRect> & { enabled?: boolean }>>
}

export type InlineAlertTone = 'error' | 'warning' | 'info'

export type InlineAlert = {
  tone: InlineAlertTone
  message: string
}
