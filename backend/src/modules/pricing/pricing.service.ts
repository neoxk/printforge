import { prisma } from '../../lib/prisma.js'
import { AppError, NotFoundError, ConflictError } from '../../lib/errors.js'
import { calculate, buildOrderContext } from '../../lib/pricing/index.js'
import type { OptionItemShape } from '../../lib/pricing/index.js'

// ─── Groups ──────────────────────────────────────────────────────────────────

function hasPrismaErrorCode(error: unknown, code: string) {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === code
}

type PricingContainerSlot = {
  containerId: string
  itemId: string
  name: string | null
  priceUnit: { toNumber: () => number } | null
  item: {
    id: string
    name: string
    priceUnit: { toNumber: () => number }
    lengthMm: number | null
    widthMm: number | null
    calculationBasis: string
  }
}

type PricingContainer = {
  id: string
  name: string
  containerType: string
  isRequired: boolean
  items: PricingContainerSlot[]
}

type PricingSlot = PricingContainerSlot & {
  container: PricingContainer
}

export async function listGroups() {
  return prisma.optionsGroup.findMany({ orderBy: { name: 'asc' } })
}

export async function getGroup(id: string) {
  const group = await prisma.optionsGroup.findUnique({
    where: { id },
    include: { items: { orderBy: { name: 'asc' } } },
  })
  if (!group) throw new NotFoundError('Group not found.')
  return group
}

export async function createGroup(name: string) {
  try {
    return await prisma.optionsGroup.create({ data: { name } })
  } catch (e) {
    if (hasPrismaErrorCode(e, 'P2002')) {
      throw new ConflictError('A group with that name already exists.')
    }
    throw e
  }
}

export async function updateGroup(id: string, name: string) {
  try {
    return await prisma.optionsGroup.update({ where: { id }, data: { name } })
  } catch (e) {
    if (hasPrismaErrorCode(e, 'P2025')) throw new NotFoundError('Group not found.')
    if (hasPrismaErrorCode(e, 'P2002')) throw new ConflictError('A group with that name already exists.')
    throw e
  }
}

export async function deleteGroup(id: string) {
  const group = await prisma.optionsGroup.findUnique({ where: { id } })
  if (!group) throw new NotFoundError('Group not found.')
  await prisma.$transaction(async (tx: any) => {
    await tx.optionItem.updateMany({ where: { groupId: id }, data: { groupId: null } })
    await tx.optionsGroup.delete({ where: { id } })
  })
}

// ─── Items ────────────────────────────────────────────────────────────────────

type ItemBody = {
  name: string
  slug: string
  priceUnit: number
  calculationBasis: string
  lengthMm?: number | null
  widthMm?: number | null
}

export async function listItems(groupId?: string) {
  return prisma.optionItem.findMany({
    where: groupId ? { groupId } : undefined,
    orderBy: { name: 'asc' },
  })
}

export async function getItem(id: string) {
  const item = await prisma.optionItem.findUnique({ where: { id } })
  if (!item) throw new NotFoundError('Item not found.')
  return item
}

export async function createItem(body: ItemBody) {
  try {
    return await prisma.optionItem.create({
      data: {
        name: body.name,
        slug: body.slug,
        priceUnit: body.priceUnit,
        calculationBasis: body.calculationBasis as never,
        lengthMm: body.lengthMm ?? null,
        widthMm: body.widthMm ?? null,
      },
    })
  } catch (e) {
    if (hasPrismaErrorCode(e, 'P2002')) {
      throw new ConflictError('An item with that name or slug already exists.')
    }
    throw e
  }
}

export async function updateItem(id: string, body: ItemBody) {
  await getItem(id)
  try {
    return await prisma.optionItem.update({
      where: { id },
      data: {
        name: body.name,
        slug: body.slug,
        priceUnit: body.priceUnit,
        calculationBasis: body.calculationBasis as never,
        lengthMm: body.lengthMm ?? null,
        widthMm: body.widthMm ?? null,
      },
    })
  } catch (e) {
    if (hasPrismaErrorCode(e, 'P2002')) {
      throw new ConflictError('An item with that name or slug already exists.')
    }
    throw e
  }
}

export async function deleteItem(id: string) {
  await getItem(id)
  const usageCount = await prisma.containerOptionItem.count({ where: { itemId: id } })
  if (usageCount > 0) throw new ConflictError('Item is in use by one or more containers.')
  await prisma.optionItem.delete({ where: { id } })
}

export async function addItemToGroup(groupId: string, itemId: string) {
  const group = await prisma.optionsGroup.findUnique({ where: { id: groupId } })
  if (!group) throw new NotFoundError('Group not found.')
  const item = await prisma.optionItem.findUnique({ where: { id: itemId } })
  if (!item) throw new NotFoundError('Item not found.')
  return prisma.optionItem.update({ where: { id: itemId }, data: { groupId } })
}

export async function removeItemFromGroup(groupId: string, itemId: string) {
  const item = await prisma.optionItem.findUnique({ where: { id: itemId } })
  if (!item) throw new NotFoundError('Item not found.')
  if (item.groupId !== groupId) throw new NotFoundError('Item does not belong to this group.')
  return prisma.optionItem.update({ where: { id: itemId }, data: { groupId: null } })
}

// ─── Calculate ────────────────────────────────────────────────────────────────

export async function calculatePrice(
  productId: string,
  selectedItemIds: string[],
  rawContext: unknown,
) {
  const items = await getPricingItems(productId, selectedItemIds)
  const ctx = buildOrderContext(rawContext)
  return calculate(items, ctx)
}

export async function calculateQuantityTable(
  productId: string,
  selectedItemIds: string[],
  rawContext: unknown,
  quantities: number[],
) {
  const items = await getPricingItems(productId, selectedItemIds)
  const baseContext = buildOrderContext(rawContext)

  return {
    rows: quantities.map((quantity) => {
      const pricing = calculate(items, { ...baseContext, quantity })

      return {
        quantity,
        optionsTotal: pricing.total,
        breakdown: pricing.breakdown,
      }
    }),
  }
}

async function getPricingItems(productId: string, selectedItemIds: string[]) {
  const product = await prisma.product.findUnique({ where: { id: productId } })
  if (!product) throw new NotFoundError('Product not found.')

  const uniqueSelectedItemIds = [...new Set(selectedItemIds)]

  if (uniqueSelectedItemIds.length !== selectedItemIds.length) {
    throw new AppError(400, 'Duplicate option item selected.')
  }

  const containers = await prisma.optionsContainer.findMany({
    where: { productId },
    include: {
      items: { include: { item: true }, orderBy: { sortOrder: 'asc' } },
    },
    orderBy: { sortOrder: 'asc' },
  })

  const slots = (containers as PricingContainer[]).flatMap((container) =>
    container.items.map((slot): PricingSlot => ({ ...slot, container })),
  )
  const selectedSlots = slots.filter((slot) => uniqueSelectedItemIds.includes(slot.itemId))
  const selectedSlotIds = new Set(selectedSlots.map((slot) => slot.itemId))
  const invalidItemIds = uniqueSelectedItemIds.filter((itemId) => !selectedSlotIds.has(itemId))

  if (invalidItemIds.length > 0) {
    throw new AppError(400, 'One or more selected option items are not available for this product.')
  }

  for (const container of containers) {
    const selectedCount = selectedSlots.filter((slot) => slot.containerId === container.id).length

    if (container.containerType === 'AUTO_APPLIED') {
      continue
    }

    if (container.containerType === 'SINGLE_SELECT' && selectedCount > 1) {
      throw new AppError(400, `Only one option may be selected for ${container.name}.`)
    }

    if (container.isRequired && selectedCount === 0) {
      throw new AppError(400, `${container.name} is required.`)
    }
  }

  const autoAppliedSlots = slots.filter((slot) => slot.container.containerType === 'AUTO_APPLIED')
  const effectiveSlots = [...selectedSlots]

  for (const slot of autoAppliedSlots) {
    if (!effectiveSlots.some((selectedSlot) => selectedSlot.containerId === slot.containerId && selectedSlot.itemId === slot.itemId)) {
      effectiveSlots.push(slot)
    }
  }

  const items: OptionItemShape[] = slots
    .filter((slot) =>
      effectiveSlots.some(
        (selectedSlot) => selectedSlot.containerId === slot.containerId && selectedSlot.itemId === slot.itemId,
      ),
    )
    .map((slot) => ({
      id: slot.item.id,
      name: slot.name ?? slot.item.name,
      priceUnit: (slot.priceUnit ?? slot.item.priceUnit).toNumber(),
      lengthMm: slot.item.lengthMm,
      widthMm: slot.item.widthMm,
      calculationBasis: (slot.item.calculationBasis as string) as OptionItemShape['calculationBasis'],
    }))

  return items
}
