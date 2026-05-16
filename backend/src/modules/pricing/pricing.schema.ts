import { z } from 'zod'

const calculationBasisValues = ['YIELD_PCS', 'LINEAR_M', 'SQM', 'PERIMETER', 'PCS', 'ORDER', 'FREE'] as const
const displayModeValues = ['SELECTABLE', 'HIDDEN', 'REQUIRED'] as const

export const groupIdParam = z.object({ id: z.string().uuid() })
export const itemIdParam = z.object({ id: z.string().uuid() })
export const groupItemParams = z.object({
  id: z.string().uuid(),
  itemId: z.string().uuid(),
})

export const createGroupBody = z.object({ name: z.string().min(1).max(120) })
export const updateGroupBody = createGroupBody

export const createItemBody = z.object({
  name: z.string().min(1).max(120),
  slug: z.string().min(1).max(120),
  priceUnit: z.number().nonnegative(),
  calculationBasis: z.enum(calculationBasisValues),
  displayMode: z.enum(displayModeValues).optional(),
  lengthMm: z.number().int().nullable().optional(),
  widthMm: z.number().int().nullable().optional(),
})
export const updateItemBody = createItemBody

export const listItemsQuery = z.object({ groupId: z.string().uuid().optional() })

export const calculateBody = z.object({
  productId: z.string().uuid(),
  selectedItemIds: z.array(z.string().uuid()),
  context: z.object({
    widthMm: z.number().positive(),
    heightMm: z.number().positive(),
    quantity: z.number().int().positive(),
  }),
})
