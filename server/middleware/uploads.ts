import { createError, getRequestURL } from 'h3'
import { createReadStream, existsSync } from 'node:fs'
import { stat } from 'node:fs/promises'
import { join, normalize, extname } from 'node:path'

/**
 * Serve `/uploads/*` straight from `public/uploads`.
 *
 * Nitro bakes a static-file manifest at build time, so anything added to
 * `public/uploads` *after* the build 404s -- including every file uploaded
 * through `/api/upload`, and including the whole `uploads` docker volume
 * (`docker-compose.yml` mounts it at `/app/public/uploads`, which is not the
 * directory the running server reads from).
 *
 * This handler is registered last and only claims the `/uploads/` prefix, so it
 * costs the manifest-driven static handler nothing for the rest of the site.
 */
const UPLOAD_DIR = join(process.cwd(), 'public', 'uploads')

const MIME: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.avif': 'image/avif',
  '.svg': 'image/svg+xml',
  '.webm': 'video/webm',
  '.mp4': 'video/mp4',
  '.mov': 'video/quicktime',
  '.mp3': 'audio/mpeg',
  '.ogg': 'audio/ogg',
  '.wav': 'audio/wav',
  '.m4a': 'audio/mp4',
  '.pdf': 'application/pdf',
  '.zip': 'application/zip',
  '.gz': 'application/gzip',
  '.glb': 'model/gltf-binary',
  '.gltf': 'model/gltf+json',
  '.obj': 'text/plain',
  '.fbx': 'application/octet-stream',
  '.stl': 'application/octet-stream',
  '.txt': 'text/plain; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
  '.json': 'application/json',
  '.csv': 'text/csv; charset=utf-8',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
}

export default defineEventHandler(async (event) => {
  const rawPath = decodeURIComponent(getRequestURL(event).pathname)
  if (!rawPath.startsWith('/uploads/')) return

  const rel = normalize(rawPath.slice('/uploads/'.length)).replace(/^(\.\.[/\\])+/, '')
  const filePath = join(UPLOAD_DIR, rel)

  // Reject anything that escapes the upload directory.
  if (!filePath.startsWith(UPLOAD_DIR)) {
    throw createError({ statusCode: 403, message: 'アクセスが拒否されました' })
  }
  if (!existsSync(filePath)) {
    throw createError({ statusCode: 404, message: 'ファイルが見つかりません' })
  }

  const info = await stat(filePath)
  if (!info.isFile()) {
    throw createError({ statusCode: 404, message: 'ファイルが見つかりません' })
  }

  setHeader(event, 'Content-Type', MIME[extname(filePath).toLowerCase()] || 'application/octet-stream')
  setHeader(event, 'Content-Length', info.size)
  setHeader(event, 'Cache-Control', 'public, max-age=31536000, immutable')
  return sendStream(event, createReadStream(filePath))
})
