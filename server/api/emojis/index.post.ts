import { randomUUID } from 'crypto'
import { db } from '../../db'
import * as schema from '../../db/schema'
import { eq } from 'drizzle-orm'
import { requireAuth } from '../../utils/auth'
import { validateEmojiFile, saveEmoji } from '../../utils/upload'
import { broadcast } from '../../utils/realtime'

const NAME_RE = /^[a-z0-9_]{2,32}$/

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const body = await readMultipartFormData(event)
  if (!body?.length) throw createError({ statusCode: 400, message: 'データがありません' })

  const namePart = body.find(p => p.name === 'name' && !p.filename)
  const filePart = body.find(p => p.filename && p.data)

  const rawName = (namePart?.data?.toString() || '').trim().toLowerCase().replace(/^:|:$/g, '')
  if (!NAME_RE.test(rawName)) {
    throw createError({ statusCode: 400, message: '絵文字名は英数字とアンダースコア2〜32文字にしてください' })
  }
  if (!filePart) throw createError({ statusCode: 400, message: '画像ファイルを選択してください' })

  const existing = await db.query.customEmojis.findFirst({
    where: eq(schema.customEmojis.name, rawName),
  })
  if (existing) throw createError({ statusCode: 409, message: 'この絵文字名は既に使われています' })

  validateEmojiFile(filePart.filename!, filePart.data!)
  const { url, mime, animated } = await saveEmoji(filePart.data!, filePart.filename!)

  const id = randomUUID()
  const [row] = await db.insert(schema.customEmojis).values({
    id,
    name: rawName,
    url,
    mime,
    animated,
    creatorId: user.id,
  }).returning()

  const emoji = { id, name: rawName, url, mime, animated, creatorId: user.id, createdAt: row.createdAt }
  broadcast({ type: 'emoji.new', emoji })

  return { emoji }
})
