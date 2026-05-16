import { Prisma } from '@prisma/client'
import { prisma } from '../../lib/prisma.js'
import { NotFoundError, ConflictError } from '../../lib/errors.js'
import { calculate, buildOrderContext } from '../../lib/pricing/index.js'
import type { OptionItemShape } from '../../lib/pricing/index.js'

// ─── Groups ──────────────────────────────────────────────────────────────────

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
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
      throw new ConflictError('A group with that name already exists.')
    }
    throw e
  }
}

export async function updateGroup(id: string, name: string) {
  try {
    return await prisma.optionsGroup.update({ where: { id }, data: { name } })
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === 'P2025') throw new NotFoundError('Group not found.')
      if (e.code === 'P2002') throw new ConflictError('A group with that name already exists.')
    }
    throw e
  }
}

export async function deleteGroup(id: string) {
  const group = await prisma.optionsGroup.findUnique({ where: { id } })
  if (!group) throw new NotFoundError('Group not found.')
  await prisma.$transaction(async (tx) => {
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
  displayMode?: string
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
        displayMode: (body.displayMode as never) ?? 'SELECTABLE',
        lengthMm: body.lengthMm ?? null,
        widthMm: body.widthMm ?? null,
      },
    })
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
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
        displayMode: (body.displayMode as never) ?? 'SELECTABLE',
        lengthMm: body.lengthMm ?? null,
        widthMm: body.widthMm ?? null,
      },
    })
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
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
  const product = await prisma.product.findUnique({ where: { id: productId } })
  if (!product) throw new NotFoundError('Product not found.')

  const slots = await Promise.all(
    selectedItemIds.map((itemId) =>
      prisma.containerOptionItem.findFirst({
        where: { itemId, container: { productId } },
        include: { item: true },
      }),
    ),
  )

  const items: OptionItemShape[] = slots
    .filter((slot) => slot !== null)
    .map((slot) => ({
      id: slot!.item.id,
      name: slot!.item.name,
      priceUnit: (slot!.priceUnit ?? slot!.item.priceUnit).toNumber(),
      lengthMm: slot!.item.lengthMm,
      widthMm: slot!.item.widthMm,
      calculationBasis: (slot!.item.calculationBasis as string) as OptionItemShape['calculationBasis'],
      displayMode: ((slot!.displayMode ?? slot!.item.displayMode) as string) as OptionItemShape['displayMode'],
    }))

  const ctx = buildOrderContext(rawContext)
  return calculate(items, ctx)
}
