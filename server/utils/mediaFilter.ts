import { sql, type SQL } from 'drizzle-orm'

export type MediaKind = 'image' | 'video' | 'audio' | 'model'

const MEDIA_KINDS: Record<MediaKind, { mime: string; exts: string[] }> = {
  image: { mime: 'image/', exts: [] },
  video: { mime: 'video/', exts: ['.webm', '.mp4'] },
  audio: { mime: 'audio/', exts: ['.mp3', '.ogg'] },
  // Browsers report `.glb`/`.gltf` inconsistently -- sometimes `model/gltf-binary`,
  // sometimes an empty string or `application/octet-stream` -- so the extension
  // fallback is what stops 3D uploads from silently dropping out of the filter.
  model: { mime: 'model/', exts: ['.glb', '.gltf', '.obj', '.fbx', '.stl'] },
}

export const MEDIA_KIND_LIST: MediaKind[] = ['image', 'video', 'audio', 'model']

export function isMediaKind(value: unknown): value is MediaKind {
  return typeof value === 'string' && Object.prototype.hasOwnProperty.call(MEDIA_KINDS, value)
}

/**
 * Attachment predicate matching one media kind.
 *
 * Columns are passed in rather than an alias name so the caller controls the
 * correlation (`pa` in one query, `post_attachments` in another) instead of the
 * helper guessing wrong and silently returning zero rows.
 */
export function attachmentKindFilter(kind: MediaKind, mimeCol: SQL, urlCol: SQL): SQL {
  const { mime, exts } = MEDIA_KINDS[kind]
  const clauses: SQL[] = [sql`${mimeCol} LIKE ${mime + '%'}`]
  for (const ext of exts) {
    clauses.push(sql`lower(${urlCol}) LIKE ${`%${ext}`}`)
  }
  return clauses.reduce((a, b) => sql`(${a} OR ${b})`)
}