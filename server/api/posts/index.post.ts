import { randomUUID } from 'crypto'
import { readFile } from 'fs/promises'
import { extname } from 'path'
import { db } from '../../db'
import * as schema from '../../db/schema'
import { eq, and } from 'drizzle-orm'
import { requireAuth } from '../../utils/auth'
import { saveFileWithWatermark, urlToFilePath } from '../../utils/upload'
import { emit } from '../../utils/eventBus'
import { isServerMember } from '../../utils/serverAuth'

const IMAGE_EXTENSIONS = ['.png', '.jpeg', '.jpg', '.gif', '.webp']

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const body = await readBody(event)
  if (!body.content?.trim() && !body.attachments?.length && !body.quotedPostId) {
    throw createError({ statusCode: 400, message: '本文またはファイルを入力してください' })
  }

  const postId = randomUUID()

  let serverId: string | null = null
  let channelId: string | null = null
  if (body.serverId) {
    serverId = String(body.serverId)
    const member = await isServerMember(user.id, serverId)
    if (!member) throw createError({ statusCode: 403, message: 'このサーバーのメンバーではありません' })
    if (body.channelId) {
      channelId = String(body.channelId)
      const channel = await db.query.serverChannels.findFirst({
        where: and(eq(schema.serverChannels.id, channelId), eq(schema.serverChannels.serverId, serverId)),
      })
      if (!channel) throw createError({ statusCode: 404, message: 'チャンネルが見つかりません' })
    }
  }

  const [post] = await db.insert(schema.posts).values({
    id: postId,
    userId: user.id,
    content: body.content || '',
    imageUrl: body.imageUrl || null,
    visibility: body.visibility || 'public',
    visibleTo: body.visibleTo ? JSON.stringify(body.visibleTo) : '[]',
    quotedPostId: body.quotedPostId ? String(body.quotedPostId) : null,
    serverId,
    channelId,
  }).returning()

  const values: any[] = []

  if (body.attachments?.length) {
    for (const [i, a] of body.attachments.entries()) {
      const ext = extname(a.url).toLowerCase()
      let url = a.url
      let blurUrl = (a.blur && a.blurUrl) || null
      let originalUrl = a.originalUrl || null
      let originalName = a.originalName || null

      if (a.watermark && IMAGE_EXTENSIONS.includes(ext)) {
        try {
          const srcUrl = a.originalUrl && !a.originalUrl.endsWith('/uploads/') && a.originalUrl.startsWith('/uploads/') ? a.originalUrl : a.url
          const filePath = urlToFilePath(srcUrl)
          const buffer = await readFile(filePath)
          const { url: newUrl, blurUrl: newBlur } = await saveFileWithWatermark(
            buffer,
            `wm_${srcUrl.replace('/uploads/', '')}`,
            user.username
          )
          url = newUrl
          // Prevent bypassing the watermark by downloading the "original"
          originalUrl = null
          originalName = null
          if (a.blur) {
            blurUrl = newBlur
          }
        } catch (e) {
          console.error('[Watermark] Application failed for', a.url, ':', e)
        }
      }

      values.push({
        id: randomUUID(), postId, url, blurUrl, originalUrl, originalName,
        type: a.type || 'image', mime: a.mime || a.type || 'image/png',
        position: i,
      })
    }
    await db.insert(schema.postAttachments).values(values)
  }

  const postWithUser = { ...post, user, attachments: values, liked: false, reposted: false, bookmarked: false }
  emit('post:created', { post: postWithUser })

  return { post: postWithUser }
})
