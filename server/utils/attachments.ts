import { randomUUID } from 'crypto'

export interface StoredAttachment {
  id: string
  url: string
  blurUrl: string | null
  type: string
  mime: string
  name: string
}

const MAX_ATTACHMENTS = 8

export function normalizeAttachments(input: any): StoredAttachment[] {
  if (!Array.isArray(input)) return []
  return input
    .filter(a => a && typeof a.url === 'string' && a.url)
    .slice(0, MAX_ATTACHMENTS)
    .map(a => ({
      id: typeof a.id === 'string' && a.id ? a.id : randomUUID(),
      url: a.url,
      blurUrl: a.blurUrl ?? null,
      type: a.type || (a.mime ? String(a.mime).split('/')[0] : 'file'),
      mime: a.mime || a.type || 'application/octet-stream',
      name: a.name || String(a.url).split('/').pop() || 'file',
    }))
}

export function parseAttachments(raw: string | null | undefined): StoredAttachment[] {
  if (!raw) return []
  try {
    const value = JSON.parse(raw)
    return Array.isArray(value) ? value : []
  } catch {
    return []
  }
}
