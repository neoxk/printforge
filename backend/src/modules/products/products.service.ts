import type { Prisma } from '@prisma/client'
import { prisma } from '../../lib/prisma.js'
import { NotFoundError, ConflictError } from '../../lib/errors.js'
import { getCurrentConnectionRecord, listSyncedProducts } from '../integration/integration.service.js'

// ─── Products ─────────────────────────────────────────────────────────────────

function hasPrismaErrorCode(error: unknown, code: string) {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === code
}

type ProductConfigContainer = {
  id: string
  name: string
  containerType: string
  isHidden: boolean
  isRequired: boolean
  defaultItemId: string | null
  items: Array<{
    itemId: string
    name: string | null
    item: {
      name: string
      slug: string
    }
  }>
}

type ProductPrintAreasPayload = {
  productId: string
  views: Prisma.JsonValue
}

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
  data: { name: string; containerType: string; sortOrder?: number; isHidden?: boolean; isRequired?: boolean },
) {
  await requireProduct(productId)
  return prisma.optionsContainer.create({
    data: {
      productId,
      name: data.name,
      containerType: data.containerType as never,
      sortOrder: data.sortOrder ?? 0,
      isHidden: data.isHidden ?? false,
      isRequired: data.isRequired ?? false,
    },
  })
}

export async function updateContainer(
  productId: string,
  containerId: string,
  data: { name?: string; containerType?: string; sortOrder?: number; defaultItemId?: string | null; isHidden?: boolean; isRequired?: boolean },
) {
  await requireContainer(productId, containerId)
  return prisma.optionsContainer.update({
    where: { id: containerId },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.containerType !== undefined && { containerType: data.containerType as never }),
      ...(data.sortOrder !== undefined && { sortOrder: data.sortOrder }),
      ...('defaultItemId' in data && { defaultItemId: data.defaultItemId }),
      ...(data.isHidden !== undefined && { isHidden: data.isHidden }),
      ...(data.isRequired !== undefined && { isRequired: data.isRequired }),
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
  data: { itemId: string; sortOrder?: number; priceUnit?: number; name?: string },
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
        name: data.name ?? null,
      },
      include: { item: true },
    })
  } catch (e) {
    if (hasPrismaErrorCode(e, 'P2002')) {
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
    if (hasPrismaErrorCode(e, 'P2025')) {
      throw new NotFoundError('Item not found in this container.')
    }
    throw e
  }
}

// ─── Product Update ───────────────────────────────────────────────────────────

export async function updateProduct(
  productId: string,
  data: { widthMm: number | null; heightMm: number | null },
) {
  await requireProduct(productId)
  const updated = await prisma.product.update({
    where: { id: productId },
    data: { width: data.widthMm, height: data.heightMm },
    select: { id: true, width: true, height: true },
  })
  return {
    id: updated.id,
    widthMm: updated.width != null ? Number(updated.width) : null,
    heightMm: updated.height != null ? Number(updated.height) : null,
  }
}

export async function getProductPrintAreas(productId: string): Promise<ProductPrintAreasPayload> {
  await requireProduct(productId)

  const config = await prisma.productPrintAreaConfig.findUnique({
    where: { productId },
    select: { views: true },
  })

  return {
    productId,
    views: config?.views ?? [],
  }
}

export async function saveProductPrintAreas(
  productId: string,
  data: { views: Prisma.JsonValue },
): Promise<ProductPrintAreasPayload> {
  await requireProduct(productId)

  const config = await prisma.productPrintAreaConfig.upsert({
    where: { productId },
    update: { views: data.views as Prisma.InputJsonValue },
    create: {
      productId,
      views: data.views as Prisma.InputJsonValue,
    },
    select: { views: true },
  })

  return {
    productId,
    views: config.views,
  }
}

// ─── Product Config ───────────────────────────────────────────────────────────

export async function getProductConfig(productId: string) {
  const product = await requireProduct(productId)
  const containers = await prisma.optionsContainer.findMany({
    where: { productId },
    orderBy: { sortOrder: 'asc' },
    include: {
      items: {
        include: { item: true },
        orderBy: { sortOrder: 'asc' },
      },
    },
  })

  const dimensions =
    product.width != null && product.height != null
      ? { type: 'fixed' as const, widthMm: Number(product.width), heightMm: Number(product.height) }
      : { type: 'custom' as const }

  return {
    productId: product.id,
    dimensions,
    containers: containers.map((c: ProductConfigContainer) => ({
      id: c.id,
      name: c.name,
      containerType: c.containerType,
      isHidden: c.isHidden,
      isRequired: c.isRequired,
      defaultItemId: c.defaultItemId,
      items: c.items.map((slot) => ({
        id: slot.itemId,
        name: slot.name ?? slot.item.name,
        slug: slot.item.slug,
      })),
    })),
  }
}

export async function getProductConfigByWooId(wooProductId: string) {
  const connection = await getCurrentConnectionRecord()
  const product = await prisma.product.findUnique({
    where: {
      uq_synced_product_connection_woo_id: {
        connectionId: connection.id,
        wooProductId: BigInt(wooProductId),
      },
    },
  })

  if (!product) throw new NotFoundError('Product not found.')

  return getProductConfig(product.id)
}

export async function getProductPrintAreasByWooId(wooProductId: string) {
  const connection = await getCurrentConnectionRecord()
  const product = await prisma.product.findUnique({
    where: {
      uq_synced_product_connection_woo_id: {
        connectionId: connection.id,
        wooProductId: BigInt(wooProductId),
      },
    },
    select: { id: true },
  })

  if (!product) throw new NotFoundError('Product not found.')

  return getProductPrintAreas(product.id)
}

export async function patchContainerItem(
  productId: string,
  containerId: string,
  itemId: string,
  data: { sortOrder?: number; priceUnit?: number | null; name?: string | null },
) {
  await requireContainer(productId, containerId)
  try {
    return await prisma.containerOptionItem.update({
      where: { uq_container_option_item: { containerId, itemId } },
      data: {
        ...(data.sortOrder !== undefined && { sortOrder: data.sortOrder }),
        ...('priceUnit' in data && { priceUnit: data.priceUnit }),
        ...('name' in data && { name: data.name }),
      },
      include: { item: true },
    })
  } catch (e) {
    if (hasPrismaErrorCode(e, 'P2025')) {
      throw new NotFoundError('Item not found in this container.')
    }
    throw e
  }
}
