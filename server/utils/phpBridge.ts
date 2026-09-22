export interface PhpBridgeConfig {
  base: string
  enabled: boolean
  paramName: string
  forwardCookie: boolean
  staticCookie: string
  secret: string
  timeoutMs: number
}

export interface PhpCallResult<T = unknown> {
  ok: boolean
  data?: T
  error?: string
  status?: number
  raw?: unknown
}

export function phpBridgeConfig(): PhpBridgeConfig {
  const config = useRuntimeConfig()
  const base = (config.phpApiBase as string) ?? ''
  return {
    base: base.trim().replace(/\/+$/, ''),
    enabled: !!base.trim(),
    paramName: (config.phpApiParam as string) || 'api',
    forwardCookie: (config.phpForwardCookie as boolean) !== false,
    staticCookie: (config.phpStaticCookie as string) ?? '',
    secret: (config.phpBridgeSecret as string) ?? '',
    timeoutMs: 8000,
  }
}

export function phpBridgeSecretOk(cfg: PhpBridgeConfig, supplied?: string | null): boolean {
  if (!cfg.secret) return true
  return !!supplied && cfg.secret === supplied
}

export function normalizePhpResult(raw: unknown): PhpCallResult {
  if (raw && typeof raw === 'object') {
    const o = raw as Record<string, unknown>
    if (o.success === false) {
      return { ok: false, error: typeof o.error === 'string' ? o.error : 'PHP action failed', raw }
    }
    if (o.success === true) {
      return { ok: true, data: 'data' in o ? o.data : o, raw }
    }
    if ('error' in o && !('data' in o)) {
      const msg = typeof o.error === 'string' ? o.error : 'PHP error'
      if (msg === 'Unauthorized') return { ok: false, error: 'PHP Unauthorized (session required)', raw }
      return { ok: false, error: msg, raw }
    }
    return { ok: true, data: o, raw }
  }
  if (raw === null || raw === undefined) return { ok: true, data: null, raw }
  if (typeof raw === 'string') {
    const trimmed = raw.trim()
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      try {
        return normalizePhpResult(JSON.parse(trimmed))
      } catch {
        return { ok: true, data: trimmed, raw }
      }
    }
    return { ok: true, data: trimmed, raw }
  }
  return { ok: true, data: raw, raw }
}

export async function phpCall<T = unknown>(
  action: string,
  params: Record<string, unknown> = {},
  opts: { csrfToken?: string | null; cookie?: string | null; timeoutMs?: number } = {},
): Promise<PhpCallResult<T>> {
  const cfg = phpBridgeConfig()
  if (!cfg.enabled) {
    return { ok: false, error: 'PHP bridge is not configured (set PHP_API_BASE in environment)' }
  }

  const url = new URL(cfg.base)
  url.searchParams.set(cfg.paramName, action)

  const body: Record<string, unknown> = { ...params }
  if (opts.csrfToken) body.csrf_token = opts.csrfToken

  const headers: Record<string, string> = { 'content-type': 'application/json' }
  const cookie = opts.cookie ?? cfg.staticCookie
  if (cookie) headers.cookie = joinCookies(cookie)

  let res: Response
  try {
    res = await fetch(url.toString(), {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(opts.timeoutMs ?? cfg.timeoutMs),
    })
  } catch (e) {
    return { ok: false, error: `PHP unreachable: ${(e as Error).message}` }
  }

  const text = await res.text().catch(() => '')
  let raw: unknown = null
  try {
    raw = text ? JSON.parse(text) : null
  } catch {
    raw = text
  }

  if (res.status === 401) {
    return { ok: false, status: 401, error: 'PHP Unauthorized (session required)', raw }
  }
  if (res.status === 403) {
    return { ok: false, status: 403, error: 'PHP CSRF verification failed', raw }
  }
  if (!res.ok) {
    return { ok: false, status: res.status, error: `PHP returned HTTP ${res.status}`, raw }
  }

  return normalizePhpResult<T>(raw)
}

function joinCookies(value: string): string {
  return value.split(';').map((part) => part.trim()).filter(Boolean).join('; ')
}