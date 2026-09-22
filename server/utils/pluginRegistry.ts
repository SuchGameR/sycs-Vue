export interface PluginInfo {
  id: string
  name: string
  version: string
  source: 'nuxt' | 'php' | string
  apiBase?: string
  capabilities: string[]
  events?: string[]
  registeredAt: string
}

const registry = new Map<string, PluginInfo>()

export function registerPlugin(info: Omit<PluginInfo, 'registeredAt'>): PluginInfo {
  if (!info.id) throw new Error('Plugin id is required')
  const entry: PluginInfo = { ...info, registeredAt: new Date().toISOString() }
  registry.set(info.id, entry)
  return entry
}

export function unregisterPlugin(id: string): boolean {
  return registry.delete(id)
}

export function getPlugins(): PluginInfo[] {
  return [...registry.values()].sort((a, b) => a.name.localeCompare(b.name))
}

export function hasPlugin(id: string): boolean {
  return registry.has(id)
}

export const NUXT_PLUGIN_ID = 'nuxt-brandnew'

export function registerNuxtSelf(): PluginInfo {
  const existing = registry.get(NUXT_PLUGIN_ID)
  if (existing) return existing
  return registerPlugin(nuxtPluginInfo())
}

export function nuxtPluginInfo(): Omit<PluginInfo, 'registeredAt'> {
  return {
    id: NUXT_PLUGIN_ID,
    name: 'SYCS Media UI',
    version: '0.1.0',
    source: 'nuxt',
    capabilities: ['posts', 'timeline', 'comments', 'servers', 'channels', 'playlists', 'emojis', 'media', 'follow'],
    events: ['bridge.event'],
  }
}