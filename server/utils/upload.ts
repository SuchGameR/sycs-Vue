import { randomUUID } from 'crypto'
import { readFileSync } from 'fs'
import { writeFile, mkdir } from 'fs/promises'
import { join, extname } from 'path'
import sharp from 'sharp'
import opentype from 'opentype.js'

const ALLOWED = ['.png', '.jpeg', '.jpg', '.gif', '.webp', '.webm', '.mp4', '.mp3', '.ogg']
const IMAGE_TYPES = ['.png', '.jpeg', '.jpg', '.gif', '.webp']

const MAX_SIZE_IMAGE = 10 * 1024 * 1024
const MAX_SIZE_VIDEO = 50 * 1024 * 1024
const MAX_SIZE_AUDIO = 30 * 1024 * 1024

const UPLOAD_DIR = join(process.cwd(), 'public', 'uploads')

export function urlToFilePath(url: string): string {
  return join(UPLOAD_DIR, url.replace(/^\/uploads\//, ''))
}

export async function ensureDir() {
  await mkdir(UPLOAD_DIR, { recursive: true })
}

export function validateFile(filename: string, type: string, buffer: Buffer) {
  const ext = extname(filename).toLowerCase()
  if (!ALLOWED.includes(ext)) {
    throw createError({ statusCode: 400, message: `許可されていないファイル形式です: ${ext}` })
  }
  if (type.startsWith('image/') && buffer.length > MAX_SIZE_IMAGE) {
    throw createError({ statusCode: 400, message: '画像は10MB以下にしてください' })
  }
  if (type.startsWith('video/') && buffer.length > MAX_SIZE_VIDEO) {
    throw createError({ statusCode: 400, message: '動画は50MB以下にしてください' })
  }
  if (type.startsWith('audio/') && buffer.length > MAX_SIZE_AUDIO) {
    throw createError({ statusCode: 400, message: '音声は30MB以下にしてください' })
  }
}

export async function saveFile(buffer: Buffer, filename: string): Promise<{ url: string; blurUrl: string | null }> {
  await ensureDir()
  const ext = extname(filename).toLowerCase()
  const name = `${randomUUID()}${ext}`
  const filePath = join(UPLOAD_DIR, name)
  await writeFile(filePath, buffer)

  let blurUrl: string | null = null
  if (IMAGE_TYPES.includes(ext)) {
    try {
      const blurName = `${randomUUID()}-blur.jpg`
      const blurPath = join(UPLOAD_DIR, blurName)
      await sharp(buffer).blur(40).jpeg({ quality: 30 }).toFile(blurPath)
      blurUrl = `/uploads/${blurName}`
    } catch {}
  }

  return { url: `/uploads/${name}`, blurUrl }
}

function escapeXml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;')
}

let _wmFont: any = null

function getWmFont(): any {
  if (_wmFont) return _wmFont
  const root = process.env.SYSTEMROOT || 'C:\\Windows'
  const candidates = [
    join(root, 'Fonts', 'NotoSansJP-VF.ttf'),
    join(root, 'Fonts', 'meiryo.ttc'),
  ]
  for (const fp of candidates) {
    try {
      const buf = readFileSync(fp)
      _wmFont = opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength))
      break
    } catch { /* try next */ }
  }
  return _wmFont
}

function makeWmSvg(w: number, h: number, text: string, isDark: boolean): string {
  const font = getWmFont()
  const angle = -20
  const cosA = Math.cos(Math.abs(angle) * Math.PI / 180)

  const mainColor = isDark ? 'rgba(255,255,255,0.50)' : 'rgba(0,0,0,0.40)'
  const tileColor = isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.07)'

  const parts: string[] = [
    `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">`,
  ]

  if (font) {
    const fontSize = Math.round(Math.min(
      w / (Math.max(text.length, 1) * 0.35 * cosA),
      Math.min(w, h) / 1.2,
    ))
    const tileFontSize = Math.round(fontSize * 0.4)

    const mainPath = font.getPath(text, 0, 0, fontSize)
    const mainBBox = mainPath.getBoundingBox()
    const mainD = mainPath.toSVG()
    const mcx = (mainBBox.x1 + mainBBox.x2) / 2
    const mcy = (mainBBox.y1 + mainBBox.y2) / 2

    const tilePath = font.getPath(text, 0, 0, tileFontSize)
    const tileBBox = tilePath.getBoundingBox()
    const tileD = tilePath.toSVG()
    const tcx = (tileBBox.x1 + tileBBox.x2) / 2
    const tcy = (tileBBox.y1 + tileBBox.y2) / 2

    const cx = Math.round(w / 2)
    const cy = Math.round(h / 2)

    parts.push(`<path d="${mainD}" fill="${mainColor}" transform="translate(${Math.round(cx - mcx)}, ${Math.round(cy - mcy)}) rotate(${angle} ${mcx} ${mcy})"/>`)

    const tilePositions = [
      [w * 0.12, h * 0.10], [w * 0.88, h * 0.10],
      [w * 0.12, h * 0.90], [w * 0.88, h * 0.90],
      [w * 0.50, h * 0.04], [w * 0.50, h * 0.96],
      [w * 0.04, h * 0.50], [w * 0.96, h * 0.50],
    ]
    for (const [tx, ty] of tilePositions) {
      parts.push(`<path d="${tileD}" fill="${tileColor}" transform="translate(${Math.round(tx - tcx)}, ${Math.round(ty - tcy)}) rotate(${angle} ${tcx} ${tcy})"/>`)
    }
  } else {
    const safeText = escapeXml(text)
    const fontSize = Math.round(Math.min(w, h) / 1.5)
    const tileFontSize = Math.round(fontSize / 3)
    const cx = Math.round(w / 2)
    const cy = Math.round(h / 2)

    parts.push(`<text x="${cx}" y="${Math.round(cy + fontSize * 0.35)}" fill="${mainColor}" font-size="${fontSize}px" font-weight="bold" font-family="sans-serif" text-anchor="middle" transform="rotate(${angle} ${cx} ${cy})">${safeText}</text>`)

    const tilePositions = [
      [w * 0.12, h * 0.10], [w * 0.88, h * 0.10],
      [w * 0.12, h * 0.90], [w * 0.88, h * 0.90],
      [w * 0.50, h * 0.04], [w * 0.50, h * 0.96],
    ]
    for (const [tx, ty] of tilePositions) {
      parts.push(`<text x="${Math.round(tx)}" y="${Math.round(ty + tileFontSize * 0.35)}" fill="${tileColor}" font-size="${tileFontSize}px" font-weight="bold" font-family="sans-serif" text-anchor="middle" transform="rotate(${angle} ${tx} ${ty})">${safeText}</text>`)
    }
  }

  parts.push('</svg>')
  return parts.join('\n')
}

export async function saveFileWithWatermark(buffer: Buffer, filename: string, username: string): Promise<{ url: string; blurUrl: string | null }> {
  await ensureDir()
  const ext = extname(filename).toLowerCase()
  const name = `${randomUUID()}${ext}`
  const filePath = join(UPLOAD_DIR, name)

  let blurUrl: string | null = null

  if (IMAGE_TYPES.includes(ext)) {
    let watermarkApplied = false
    try {
      const metadata = await sharp(buffer).metadata()
      const w = metadata.width || 800
      const h = metadata.height || 600

      let isDark = true
      try {
        const small = await sharp(buffer)
          .resize(50, 50, { fit: 'cover' })
          .raw()
          .toBuffer()
        let total = 0
        for (let i = 0; i < small.length; i += 3) {
          total += 0.299 * small[i] + 0.587 * small[i + 1] + 0.114 * small[i + 2]
        }
        isDark = (total / (small.length / 3)) < 128
      } catch { /* use default dark */ }

      const text = `@${username}`
      const svgString = makeWmSvg(w, h, text, isDark)
      const svgBuffer = Buffer.from(svgString)

      const pipeline = sharp(buffer).composite([{ input: svgBuffer, top: 0, left: 0 }])
      if (ext === '.png') {
        await pipeline.png().toFile(filePath)
      } else if (ext === '.webp') {
        await pipeline.webp({ quality: 90 }).toFile(filePath)
      } else {
        await pipeline.jpeg({ quality: 92 }).toFile(filePath)
      }
      watermarkApplied = true

      const blurName = `${randomUUID()}-blur.jpg`
      const blurPath = join(UPLOAD_DIR, blurName)
      await sharp(buffer)
        .composite([{ input: svgBuffer, top: 0, left: 0 }])
        .blur(40)
        .jpeg({ quality: 30 })
        .toFile(blurPath)
      blurUrl = `/uploads/${blurName}`
    } catch (e) {
      console.error('[Watermark] Failed for', filename, ':', e)
      if (!watermarkApplied) {
        await writeFile(filePath, buffer)
      }
      if (!blurUrl) {
        try {
          const blurName = `${randomUUID()}-blur.jpg`
          const blurPath = join(UPLOAD_DIR, blurName)
          await sharp(buffer).blur(40).jpeg({ quality: 30 }).toFile(blurPath)
          blurUrl = `/uploads/${blurName}`
        } catch (blurErr) {
          console.error('[Watermark] Blur fallback also failed:', blurErr)
        }
      }
    }
  } else {
    await writeFile(filePath, buffer)
  }

  return { url: `/uploads/${name}`, blurUrl }
}

export async function saveAvatar(buffer: Buffer, filename: string): Promise<string> {
  await ensureDir()
  const ext = extname(filename).toLowerCase()
  const name = `${randomUUID()}${ext}`
  const filePath = join(UPLOAD_DIR, name)
  await sharp(buffer).resize(256, 256, { fit: 'cover' }).toFile(filePath)
  return `/uploads/${name}`
}

export async function saveCover(buffer: Buffer, filename: string, width: number, height: number): Promise<string> {
  await ensureDir()
  const name = `${randomUUID()}.jpg`
  const filePath = join(UPLOAD_DIR, name)
  await sharp(buffer)
    .resize(width, height, { fit: 'cover' })
    .jpeg({ quality: 85 })
    .toFile(filePath)
  return `/uploads/${name}`
}
