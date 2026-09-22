import { phpBridgeConfig, phpCall } from '../../utils/phpBridge'
import { requireAuth } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const cfg = phpBridgeConfig()
  if (!cfg.enabled) {
    throw createError({ statusCode: 503, message: 'PHP bridge is not configured (set PHP_API_BASE)' })
  }

  const body = await readBody(event)
  const action = typeof body.action === 'string' ? body.action.trim() : ''
  if (!action) {
    throw createError({ statusCode: 400, message: 'action is required' })
  }

  const params: Record<string, unknown> =
    body.params && typeof body.params === 'object' && !Array.isArray(body.params) ? body.params : {}

  let csrfToken: string | null = body.csrfToken && typeof body.csrfToken === 'string' ? body.csrfToken : null
  if (!csrfToken) {
    try {
      const user = await requireAuth(event)
      csrfToken = user?.csrfToken ?? null
    } catch {
      /* read-only discovery without Nuxt login is allowed; PHP decides */
    }
  }

  const clientCookie =
    cfg.forwardCookie ? (getHeader(event, 'cookie') ?? null) : null

  const result = await phpCall(action, params, { csrfToken, cookie: clientCookie })

  return result
})