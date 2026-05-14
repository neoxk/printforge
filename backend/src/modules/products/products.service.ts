import { Prisma } from '@prisma/client'
import { prisma } from '../../lib/prisma.js'
import { NotFoundError } from '../../lib/errors.js'
import { getCurrentConnectionRecord, listSyncedProducts } from '../integration/integration.service.js'

type ProductConfigurationPayload = {
  fields: Array<Record<string, unknown>>
  savedAt: string
}

function createDefaultConfigurationFields(product: {
  importedFields: unknown
}) {
  if (Array.isArray(product.importedFields)) {
    return product.importedFields
  }

  return []
}

function toJsonValue(value: unknown) {
  return value as Prisma.InputJsonValue
}

export async function getProductOptions(productId: string) {
  const connection = await getCurrentConnectionRecord()
  const product = await prisma.syncedProduct.findFirst({
    where: {
      connectionId: connection.id,
      wooProductId: BigInt(productId),
    },
  })

  if (!product) {
    throw new NotFoundError('Product not found.')
  }

  const configuration = await prisma.productConfiguration.findFirst({
    where: {
      connectionId: connection.id,
      wooProductId: BigInt(productId),
    },
  })

  const fields = configuration?.fields ?? createDefaultConfigurationFields(product)

  if (!Array.isArray(fields)) {
    return []
  }

  return fields.filter((field) => {
    if (!field || typeof field !== 'object') {
      return false
    }

    return (field as { visibleInProductDetails?: boolean }).visibleInProductDetails !== false
  })
}

export async function listProducts() {
  return listSyncedProducts()
}

export async function getProductConfiguration(productId: string) {
  const connection = await getCurrentConnectionRecord()
  const wooProductId = BigInt(productId)
  const product = await prisma.syncedProduct.findFirst({
    where: {
      connectionId: connection.id,
      wooProductId,
    },
  })

  if (!product) {
    throw new NotFoundError('Product not found.')
  }

  const configuration = await prisma.productConfiguration.findFirst({
    where: {
      connectionId: connection.id,
      wooProductId,
    },
  })

  return {
    productId,
    fields: configuration?.fields ?? createDefaultConfigurationFields(product),
    savedAt: configuration?.savedAt.toISOString() ?? 'Not saved yet',
  }
}

export async function saveProductConfiguration(
  productId: string,
  payload: ProductConfigurationPayload,
) {
  const connection = await getCurrentConnectionRecord()
  const wooProductId = BigInt(productId)
  const product = await prisma.syncedProduct.findFirst({
    where: {
      connectionId: connection.id,
      wooProductId,
    },
  })

  if (!product) {
    throw new NotFoundError('Product not found.')
  }

  const savedAt = new Date(payload.savedAt)
  const normalizedSavedAt = Number.isNaN(savedAt.getTime()) ? new Date() : savedAt
  const existingConfiguration = await prisma.productConfiguration.findFirst({
    where: {
      connectionId: connection.id,
      wooProductId,
    },
  })

  const configuration = existingConfiguration
    ? await prisma.productConfiguration.update({
        where: { id: existingConfiguration.id },
        data: {
          fields: toJsonValue(payload.fields),
          savedAt: normalizedSavedAt,
        },
      })
    : await prisma.productConfiguration.create({
        data: {
          connectionId: connection.id,
          wooProductId,
          fields: toJsonValue(payload.fields),
          savedAt: normalizedSavedAt,
        },
      })

  return {
    productId,
    fields: configuration.fields,
    savedAt: configuration.savedAt.toISOString(),
  }
}
