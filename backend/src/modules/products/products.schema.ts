import { z } from 'zod'

const containerTypeValues = ['SINGLE_SELECT', 'MULTI_SELECT', 'AUTO_APPLIED'] as const
const designerSourceModeValues = ['template', 'upload', 'blank'] as const
const zoneKeyValues = [
  'physicalSize',
  'cutArea',
  'bleedArea',
  'safeZone',
  'allowedPrintArea',
] as const

export const productIdParam = z.object({ id: z.string() })
export const wooProductIdParam = z.object({ wooProductId: z.string().regex(/^\d+$/) })

const zoneRectSchema = z.object({
  x: z.number().finite(),
  y: z.number().finite(),
  width: z.number().finite().nonnegative(),
  height: z.number().finite().nonnegative(),
  rotation: z.number().finite().optional(),
})

function createZoneFieldSchema(key: (typeof zoneKeyValues)[number]) {
  return z.object({
    key: z.literal(key),
    label: z.string().min(1).max(120),
    enabled: z.boolean(),
    optional: z.boolean(),
    rect: zoneRectSchema,
  })
}

const zoneFieldMapSchema = z.object({
  physicalSize: createZoneFieldSchema('physicalSize'),
  cutArea: createZoneFieldSchema('cutArea'),
  bleedArea: createZoneFieldSchema('bleedArea'),
  safeZone: createZoneFieldSchema('safeZone'),
  allowedPrintArea: createZoneFieldSchema('allowedPrintArea'),
})

const designerViewSchema = z.object({
  id: z.string().min(1).max(120),
  name: z.string().min(1).max(160),
  sourceMode: z.enum(designerSourceModeValues),
  templateId: z.string().min(1).max(120).nullable(),
  mockupName: z.string().min(1).max(255).nullable(),
  mockupSrc: z.string().min(1).nullable(),
  mockupRect: zoneRectSchema.nullable(),
  fields: zoneFieldMapSchema,
})

export const savePrintAreasBody = z.object({
  views: z.array(designerViewSchema),
})

// ─── Containers ───────────────────────────────────────────────────────────────

export const containerIdParams = z.object({
  id: z.string().uuid(),
  cid: z.string().uuid(),
})

export const containerItemParams = z.object({
  id: z.string().uuid(),
  cid: z.string().uuid(),
  itemId: z.string().uuid(),
})

export const createContainerBody = z.object({
  name: z.string().min(1).max(120),
  containerType: z.enum(containerTypeValues),
  sortOrder: z.number().int().optional(),
  isHidden: z.boolean().optional(),
  isRequired: z.boolean().optional(),
})

export const updateContainerBody = z.object({
  name: z.string().min(1).max(120).optional(),
  containerType: z.enum(containerTypeValues).optional(),
  sortOrder: z.number().int().optional(),
  defaultItemId: z.string().uuid().nullable().optional(),
  isHidden: z.boolean().optional(),
  isRequired: z.boolean().optional(),
})

export const addContainerItemBody = z.object({
  itemId: z.string().uuid(),
  sortOrder: z.number().int().optional(),
  priceUnit: z.number().nonnegative().optional(),
  name: z.string().max(120).optional(),
})

export const patchContainerItemBody = z.object({
  sortOrder: z.number().int().optional(),
  priceUnit: z.number().nonnegative().nullable().optional(),
  name: z.string().max(120).nullable().optional(),
})

export const updateProductBody = z.object({
  widthMm: z.number().int().positive().nullable(),
  heightMm: z.number().int().positive().nullable(),
})
