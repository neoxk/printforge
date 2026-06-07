import {
  PutObjectCommand,
  CopyObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
  GetObjectCommand,
} from '@aws-sdk/client-s3'
import type { Readable } from 'node:stream'
import { s3, S3_BUCKET } from '../../lib/s3.js'
import { NotFoundError } from '../../lib/errors.js'

export async function saveTempDesign(
  sessionId: string,
  filename: string,
  data: Buffer,
  mimetype: string,
) {
  const key = `temp/${sessionId}/${filename}`
  await s3.send(
    new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
      Body: data,
      ContentType: mimetype,
    }),
  )
  return { key }
}

export async function assignToOrder(sessionIds: string[], orderId: string) {
  const movedKeys: string[] = []

  for (const sessionId of sessionIds) {
    const prefix = `temp/${sessionId}/`
    const list = await s3.send(
      new ListObjectsV2Command({ Bucket: S3_BUCKET, Prefix: prefix }),
    )

    for (const obj of list.Contents ?? []) {
      if (!obj.Key) continue
      const filename = obj.Key.slice(prefix.length)
      // Keep each design under its own session folder. The per-view filename
      // (view-<viewId>.png) is stable across designs of the same product, so a
      // flat orders/<orderId>/<filename> layout would make multiple cart items
      // collide and overwrite one another. Each order line item stores its
      // session id, so this folder is directly retrievable per line item.
      const destKey = `orders/${orderId}/${sessionId}/${filename}`

      await s3.send(
        new CopyObjectCommand({
          Bucket: S3_BUCKET,
          CopySource: `${S3_BUCKET}/${obj.Key}`,
          Key: destKey,
        }),
      )
      await s3.send(
        new DeleteObjectCommand({ Bucket: S3_BUCKET, Key: obj.Key }),
      )
      movedKeys.push(destKey)
    }
  }

  return { movedCount: movedKeys.length, keys: movedKeys }
}

/**
 * List the design files attached to a single order line item. Each line item
 * stores its design `sessionId`, and assignToOrder() moves that session's files
 * under `orders/<orderId>/<sessionId>/`, so listing that prefix yields exactly
 * the files for that one item.
 */
export async function listOrderDesigns(orderId: string, sessionId: string) {
  const prefix = `orders/${orderId}/${sessionId}/`
  const list = await s3.send(
    new ListObjectsV2Command({ Bucket: S3_BUCKET, Prefix: prefix }),
  )

  const files = (list.Contents ?? [])
    .filter((obj) => obj.Key && obj.Key.length > prefix.length)
    .map((obj) => ({
      filename: obj.Key!.slice(prefix.length),
      size: obj.Size ?? 0,
    }))

  return { files }
}

/**
 * Fetch a single design file for streaming back to the caller. `filename` is a
 * bare basename (validated at the route), so the key cannot escape the folder.
 */
export async function getOrderDesign(
  orderId: string,
  sessionId: string,
  filename: string,
) {
  const key = `orders/${orderId}/${sessionId}/${filename}`

  try {
    const result = await s3.send(
      new GetObjectCommand({ Bucket: S3_BUCKET, Key: key }),
    )

    return {
      body: result.Body as Readable,
      contentType: result.ContentType,
      contentLength: result.ContentLength,
    }
  } catch (error) {
    if (error instanceof Error && error.name === 'NoSuchKey') {
      throw new NotFoundError('Design file not found')
    }
    throw error
  }
}
