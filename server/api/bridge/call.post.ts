import { phpBridgeConfig, phpCall } from '../../utils/phpBridge'

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

  const csrfToken: string | null = typeof body.csrfToken === 'string' ? body.csrfToken : null
  const clientCookie = cfg.forwardCookie ? (getHeader(event, 'cookie') ?? null) : null

  return await phpCall(action, params, { csrfToken, cookie: clientCookie })
})