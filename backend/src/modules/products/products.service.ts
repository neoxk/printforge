import { Prisma } from '@prisma/client'
import { prisma } from '../../lib/prisma.js'
import { NotFoundError, ConflictError } from '../../lib/errors.js'
import { listSyncedProducts } from '../integration/integration.service.js'

// ─── Products ─────────────────────────────────────────────────────────────────

export async function listProducts() {
  return listSyncedProducts()
}

// ─── Containers ───────────────────────────────────────────────────────────────

async function requireProduct(productId: string) {
  const product = await prisma.product.findUnique({ where: { id: productId } })
  if (!product) throw new NotFoundError('Product not found.')
  return product
}

async function requireContainer(productId: string, containerId: string) {
  const container = await prisma.optionsContainer.findFirst({
    where: { id: containerId, productId },
  })
  if (!container) throw new NotFoundError('Container not found.')
  return container
}

export async function listContainers(productId: string) {
  await requireProduct(productId)
  return prisma.optionsContainer.findMany({
    where: { productId },
    orderBy: { sortOrder: 'asc' },
    include: { defaultItem: true },
  })
}

export async function getContainer(productId: string, containerId: string) {
  await requireProduct(productId)
  const container = await prisma.optionsContainer.findFirst({
    where: { id: containerId, productId },
    include: {
      defaultItem: true,
      items: { include: { item: true }, orderBy: { sortOrder: 'asc' } },
    },
  })
  if (!container) throw new NotFoundError('Container not found.')
  return container
}

export async function createContainer(
  productId: string,
  data: { name: string; sortOrder?: number },
) {
  await requireProduct(productId)
  return prisma.optionsContainer.create({
    data: { productId, name: data.name, sortOrder: data.sortOrder ?? 0 },
  })
}

export async function updateContainer(
  productId: string,
  containerId: string,
  data: { name?: string; sortOrder?: number; defaultItemId?: string | null },
) {
  await requireContainer(productId, containerId)
  return prisma.optionsContainer.update({
    where: { id: containerId },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.sortOrder !== undefined && { sortOrder: data.sortOrder }),
      ...('defaultItemId' in data && { defaultItemId: data.defaultItemId }),
    },
    include: { defaultItem: true },
  })
}

export async function deleteContainer(productId: string, containerId: string) {
  await requireContainer(productId, containerId)
  await prisma.optionsContainer.delete({ where: { id: containerId } })
}

// ─── Container Items ──────────────────────────────────────────────────────────

export async function listContainerItems(productId: string, containerId: string) {
  await requireContainer(productId, containerId)
  return prisma.containerOptionItem.findMany({
    where: { containerId },
    include: { item: true },
    orderBy: { sortOrder: 'asc' },
  })
}

export async function addItemToContainer(
  productId: string,
  containerId: string,
  data: { itemId: string; sortOrder?: number; priceUnit?: number; displayMode?: string },
) {
  await requireContainer(productId, containerId)
  const item = await prisma.optionItem.findUnique({ where: { id: data.itemId } })
  if (!item) throw new NotFoundError('Item not found.')
  try {
    return await prisma.containerOptionItem.create({
      data: {
        containerId,
        itemId: data.itemId,
        sortOrder: data.sortOrder ?? 0,
        priceUnit: data.priceUnit ?? null,
        displayMode: (data.displayMode as never) ?? null,
      },
      include: { item: true },
    })
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
      throw new ConflictError('Item is already in this container.')
    }
    throw e
  }
}

export async function removeItemFromContainer(
  productId: string,
  containerId: string,
  itemId: string,
) {
  await requireContainer(productId, containerId)
  try {
    await prisma.containerOptionItem.delete({
      where: { uq_container_option_item: { containerId, itemId } },
    })
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
      throw new NotFoundError('Item not found in this container.')
    }
    throw e
  }
}

export async function patchContainerItem(
  productId: string,
  containerId: string,
  itemId: string,
  data: { sortOrder?: number; priceUnit?: number | null; displayMode?: string | null },
) {
  await requireContainer(productId, containerId)
  try {
    return await prisma.containerOptionItem.update({
      where: { uq_container_option_item: { containerId, itemId } },
      data: {
        ...(data.sortOrder !== undefined && { sortOrder: data.sortOrder }),
        ...('priceUnit' in data && { priceUnit: data.priceUnit }),
        ...('displayMode' in data && { displayMode: (data.displayMode as never) }),
      },
      include: { item: true },
    })
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
      throw new NotFoundError('Item not found in this container.')
    }
    throw e
  }
}
