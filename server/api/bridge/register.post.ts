import { registerPlugin, nuxtPluginInfo, registerNuxtSelf, hasPlugin, type PluginInfo } from '../../utils/pluginRegistry'
import { phpBridgeConfig } from '../../utils/phpBridge'

export default defineEventHandler(async (event) => {
  const cfg = phpBridgeConfig()

  const body = await readBody(event)
  const id = typeof body.id === 'string' ? body.id : ''
  const name = typeof body.name === 'string' ? body.name : ''
  if (!id || !name) {
    throw createError({ statusCode: 400, message: 'id and name are required' })
  }

  const info = registerPlugin({
    id,
    name,
    version: typeof body.version === 'string' ? body.version : '1.0.0',
    source: (typeof body.source === 'string' && body.source) || 'php',
    apiBase: typeof body.apiBase === 'string' ? body.apiBase : undefined,
    capabilities: Array.isArray(body.capabilities) ? (body.capabilities.filter((c) => typeof c === 'string') as string[]) : [],
    events: Array.isArray(body.events) ? (body.events.filter((e) => typeof e === 'string') as string[]) : [],
  })

  if (cfg.enabled && !hasPlugin('nuxt-brandnew')) {
    registerNuxtSelf()
  }

  return { ok: true, plugin: info, self: nuxtPluginInfo() }
})

export type { PluginInfo }