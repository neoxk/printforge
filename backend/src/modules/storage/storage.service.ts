import {
  PutObjectCommand,
  CopyObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
} from '@aws-sdk/client-s3'
import { s3, S3_BUCKET } from '../../lib/s3.js'

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
      const destKey = `orders/${orderId}/${filename}`

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
