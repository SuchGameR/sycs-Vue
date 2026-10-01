import { watchFile, unwatchFile } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { broadcast } from './realtime'

export interface PublicBadge {
  kind: 'icon' | 'image'
  value: string
  label?: string | null
}

export type BatchBadgeAssignments = Record<string, PublicBadge[]>

/**
 * Seed values.
 *
 * These are the assignments that used to live as a hard-coded literal in
 * `userExtras.ts`. They stay here as the fallback so that a missing or
 * unreadable `data/batch.json` can never silently strip badges off people --
 * losing a badge is far worse than ignoring a new file.
 */
const FALLBACK_ASSIGNMENTS: BatchBadgeAssignments = {
  '@suchgamer': [{ kind: 'icon', value: 'lucide:badge-check', label: '運営' }],
  '@Akinobu': [{ kind: 'icon', value: 'lucide:badge-check', label: '運営' }],
  '@sub2': [{ kind: 'icon', value: 'lucide:shield', label: 'メンバー' }],
}

let cache: BatchBadgeAssignments = { ...FALLBACK_ASSIGNMENTS }
let loaded = false
let watchingPath: string | null = null

function defaultPath(): string {
  return join(process.cwd(), 'data', 'batch.json')
}

function normalizeBadge(raw: unknown): PublicBadge | null {
  if (!raw || typeof raw !== 'object') return null
  const b = raw as Record<string, unknown>
  const value = typeof b.value === 'string' ? b.value.trim() : ''
  if (!value) return null
  const label = b.label == null ? null : String(b.label).trim()
  return {
    kind: b.kind === 'image' ? 'image' : 'icon',
    value,
    label: label || null,
  }
}

function normalizeAssignments(input: unknown): BatchBadgeAssignments | null {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return null
  const out: BatchBadgeAssignments = {}
  for (const [key, arr] of Object.entries(input as Record<string, unknown>)) {
    if (!key || !Array.isArray(arr)) continue
    const list: PublicBadge[] = []
    for (const item of arr) {
      const badge = normalizeBadge(item)
      if (badge) list.push(badge)
    }
    if (list.length) out[key] = list
  }
  return out
}

/**
 * Read `data/batch.json` into memory.
 *
 * Shape: `{ "@username": [{ kind, value, label? }], "<user-id>": [...] }`.
 * Keys must be an exact match -- case sensitive, no normalisation -- because
 * `configBadges()` looks up `@${username}` and the raw id.
 */
export async function loadBatchBadges(path?: string): Promise<BatchBadgeAssignments> {
  const filePath = path || watchingPath || defaultPath()
  let text: string
  try {
    text = await readFile(filePath, 'utf-8')
  } catch (err: any) {
    if (err?.code === 'ENOENT') {
      // No file yet: fall back rather than clearing everyone's badges.
      if (!loaded) cache = { ...FALLBACK_ASSIGNMENTS }
      loaded = true
      return cache
    }
    console.error('[batch-badges] Failed to read', filePath, err)
    return cache
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch (err) {
    // A half-written file must not wipe the live set.
    console.error('[batch-badges] Invalid JSON in', filePath, '- keeping previous badges', err)
    return cache
  }

  const next = normalizeAssignments(parsed)
  if (!next) {
    console.error('[batch-badges]', filePath, 'is not an object of badge arrays - keeping previous badges')
    return cache
  }

  cache = next
  loaded = true
  return cache
}

export function getBatchBadges(): BatchBadgeAssignments {
  return cache
}

/**
 * Poll the file for changes and push a realtime event when it changes.
 *
 * `watchFile` rather than `watch`: editors save via write-to-temp + rename, which
 * detaches an inode-bound `watch`, and this project already runs chokidar with
 * `usePolling` for the same reason (Docker bind mounts). Stat polling survives
 * both cases at the cost of a ~1s delay.
 */
export async function startBatchBadgeWatcher(path?: string, interval = 1000) {
  const filePath = path || defaultPath()
  await stopBatchBadgeWatcher()
  watchingPath = filePath
  await loadBatchBadges(filePath)

  watchFile(filePath, { persistent: true, interval }, async (curr, prev) => {
    if (curr.mtimeMs === prev.mtimeMs && curr.size === prev.size) return
    await loadBatchBadges(filePath)
    const users = Object.keys(cache)
    broadcast({ type: 'badge.update', source: 'batch.json', users, ts: Date.now() })
    console.log(`[batch-badges] Reloaded ${users.length} assignment(s) from batch.json`)
  })
}

export async function stopBatchBadgeWatcher() {
  if (!watchingPath) return
  unwatchFile(watchingPath)
  watchingPath = null
}
