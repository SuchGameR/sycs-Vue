export interface BridgeStatus {
  enabled: boolean
  phpBase: string
  reachable: boolean
  plugins: PluginInfo[]
}

export interface PluginInfo {
  id: string
  name: string
  version: string
  source: string
  apiBase?: string
  capabilities: string[]
  events?: string[]
  registeredAt: string
}

export interface BridgeEvent {
  type: string
  source: string
  payload: Record<string, unknown>
  ts: number
}

export interface BridgeCallResult<T = unknown> {
  ok: boolean
  data?: T
  error?: string
  status?: number
  raw?: unknown
}

export const PHP_ACTIONS = {
  hello: 'hello',
  me: 'me',
  users: 'users',
  get_user: 'get_user',
  profile: 'profile',
  threads: 'get_threads',
  thread: 'get_thread',
  create_thread: 'create_thread',
  messages: 'get_messages',
  send_message: 'send_message',
  dm_list: 'get_dm_list',
  dm_messages: 'get_dm_messages',
  send_dm: 'send_dm',
  friends: 'get_friends',
  add_friend: 'add_friend',
  location: 'get_location',
  meeting: 'get_meeting',
} as const

export function usePhpBridge() {
  const status = useState<BridgeStatus | null>('php-bridge:status', () => null)
  const events = useState<BridgeEvent[]>('php-bridge:events', () => [])
  const busy = useState(false, () => false)

  async function refreshStatus(): Promise<BridgeStatus> {
    const res = await $fetch<BridgeStatus>('/api/bridge/status')
    status.value = res
    return res
  }

  async function call<T = unknown>(
    action: string,
    params: Record<string, unknown> = {},
    csrfToken?: string,
  ): Promise<BridgeCallResult<T>> {
    busy.value = true
    try {
      return await $fetch<BridgeCallResult<T>>('/api/bridge/call', {
        method: 'POST',
        body: { action, params, csrfToken },
      })
    } catch (e: unknown) {
      const err = e as { data?: { error?: string } }
      return { ok: false, error: err.data?.error ?? (e as Error).message }
    } finally {
      busy.value = false
    }
  }

  async function send(action: string, params: Record<string, unknown> = {}, csrfToken?: string) {
    const result = await call(action, params, csrfToken)
    if (result.ok) pushEvent({ type: `php.${action}`, source: 'nuxt', payload: (result.data ?? {}) as Record<string, unknown> })
    return result
  }

  async function register(plugin: Partial<PluginInfo>) {
    return await $fetch('/api/bridge/register', {
      method: 'POST',
      body: plugin,
    })
  }

  async function plugins() {
    return await $fetch<{ plugins: PluginInfo[]; self: PluginInfo }>('/api/bridge/plugins')
  }

  async function relay(type: string, payload: Record<string, unknown> = {}) {
    return await $fetch('/api/bridge/relay', {
      method: 'POST',
      body: { type, payload, source: 'nuxt' },
    })
  }

  function pushEvent(ev: BridgeEvent) {
    events.value = [ev, ...events.value].slice(0, 200)
  }

  return {
    status,
    events,
    busy,
    refreshStatus,
    call,
    send,
    register,
    plugins,
    relay,
    pushEvent,
  }
}