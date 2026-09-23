type RealtimeHandler = (payload: any) => void

const handlers: Record<string, Set<RealtimeHandler>> = {}
let es: EventSource | null = null
let everOpened = false
let retryTimer: ReturnType<typeof setTimeout> | null = null
let retryDelay = 1000

function emit(type: string, payload?: any) {
  const set = handlers[type]
  if (set) {
    for (const fn of [...set]) {
      try { fn(payload) } catch { /* ignore */ }
    }
  }
  if (type && type !== 'realtime.reconnect') {
    for (const key of Object.keys(handlers)) {
      if (!key.endsWith('*')) continue
      const prefix = key.slice(0, -1)
      for (const fn of [...handlers[key]]) {
        try { fn(payload) } catch { /* ignore */ }
      }
    }
  }
}

function connectRealtime() {
  if (es || !import.meta.client) return
  es = new EventSource('/api/events')
  es.onopen = () => {
    retryDelay = 1000
    if (everOpened) emit('realtime.reconnect')
    everOpened = true
  }
  es.addEventListener('message', (ev) => {
    let payload: any
    try {
      payload = JSON.parse((ev as MessageEvent).data)
    } catch {
      return
    }
    emit(payload?.type, payload)
  })
  es.onerror = () => {
    // Reconnect only explicitly when the stream has permanently closed so
    // signaling is not lost forever (e.g. after an auth/proxy failure).
    if (es && es.readyState === EventSource.CLOSED) {
      es.close()
      es = null
      if (retryTimer) clearTimeout(retryTimer)
      retryTimer = setTimeout(() => {
        retryTimer = null
        connectRealtime()
      }, retryDelay)
      retryDelay = Math.min(30000, retryDelay * 2)
    }
  }
}

export function useRealtime() {
  function on(type: string, handler: RealtimeHandler) {
    connectRealtime()
    const set = handlers[type] || (handlers[type] = new Set())
    set.add(handler)
    return () => { handlers[type]?.delete(handler) }
  }

  return { on }
}
