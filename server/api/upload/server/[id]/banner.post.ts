import { requireServerPermission } from '../../../../utils/serverAuth'
import { PERMISSIONS } from '../../../../utils/permissions'
import { validateFile, saveCover } from '../../../../utils/upload'
import { broadcast } from '../../../../utils/realtime'
import { db } from '../../../../db'
import * as schema from '../../../../db/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const serverId = getRouterParam(event, 'id')
  await requireServerPermission(event, serverId, PERMISSIONS.MANAGE_SERVER, 'サーバーを管理する権限がありません')

  const body = await readMultipartFormData(event)
  if (!body?.length) throw createError({ statusCode: 400, message: 'ファイルがありません' })

  const file = body.find(p => p.filename && p.data)
  if (!file) throw createError({ statusCode: 400 })
  if (!file.type?.startsWith('image/')) {
    throw createError({ statusCode: 400, message: '画像ファイルのみアップロード可能です' })
  }
  if (file.data!.length > 8 * 1024 * 1024) {
    throw createError({ statusCode: 400, message: 'バナーは8MB以下にしてください' })
  }

  validateFile(file.filename!, file.type, file.data!)

  const url = await saveCover(file.data!, file.filename!, 1600, 450)

  await db.update(schema.servers)
    .set({ bannerUrl: url, updatedAt: new Date() })
    .where(eq(schema.servers.id, serverId))

  broadcast({ type: 'server.updated', serverId })
  return { url }
})
