import { phpBridgeConfig } from '../../utils/phpBridge'
import { getPlugins, type PluginInfo } from '../../utils/pluginRegistry'

export interface BridgeStatus {
  enabled: boolean
  phpBase: string
  reachable: boolean
  plugins: PluginInfo[]
}

let probeCache: { at: number; reachable: boolean } | null = null

export default defineEventHandler(async (): Promise<BridgeStatus> => {
  const cfg = phpBridgeConfig()

  if (!cfg.enabled) {
    return { enabled: false, phpBase: cfg.base, reachable: false, plugins: getPlugins() }
  }

  if (!probeCache || Date.now() - probeCache.at > 15000) {
    let ok = false
    try {
      const ctrl = new AbortController()
      const timer = setTimeout(() => ctrl.abort(), 3000)
      const url = new URL(cfg.base)
      url.searchParams.set(cfg.paramName, 'get_threads')
      await fetch(url.toString(), { method: 'GET', signal: ctrl.signal })
      clearTimeout(timer)
      ok = true
    } catch {
      ok = false
    }
    probeCache = { at: Date.now(), reachable: ok }
  }

  return { enabled: true, phpBase: cfg.base, reachable: probeCache.reachable, plugins: getPlugins() }
})