const FLOOD_WINDOW_MS = 10_000
const FLOOD_MAX_MESSAGES = 8
export const MAX_MESSAGE_LENGTH = 2000

const messageLog = new Map<string, number[]>()

export function checkMessageFlood(userId: string): number | null {
  const now = Date.now()
  const recent = (messageLog.get(userId) || []).filter(t => now - t < FLOOD_WINDOW_MS)
  if (recent.length >= FLOOD_MAX_MESSAGES) {
    messageLog.set(userId, recent)
    const wait = Math.ceil((FLOOD_WINDOW_MS - (now - recent[0])) / 1000)
    return Math.max(1, wait)
  }
  recent.push(now)
  messageLog.set(userId, recent)
  return null
}

export function validateMessageContent(content: unknown): string {
  const raw = typeof content === 'string' ? content : ''
  const trimmed = raw.trim()
  if (!trimmed) throw createError({ statusCode: 400, message: 'メッセージを入力してください' })
  if (trimmed.length > MAX_MESSAGE_LENGTH) {
    throw createError({ statusCode: 400, message: `メッセージは${MAX_MESSAGE_LENGTH}文字以内にしてください` })
  }
  return trimmed
}
