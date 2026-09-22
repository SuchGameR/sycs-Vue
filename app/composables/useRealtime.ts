type RealtimeHandler = (payload: any) => void

const handlers: Record<string, Set<RealtimeHandler>> = {}
let es: EventSource | null = null

function connectRealtime() {
  if (es || !import.meta.client) return
  es = new EventSource('/api/events')
  es.addEventListener('message', (ev) => {
    let payload: any
    try {
      payload = JSON.parse((ev as MessageEvent).data)
    } catch {
      return
    }
    const set = handlers[payload?.type]
    if (set) {
      for (const fn of [...set]) {
        try { fn(payload) } catch { /* ignore */ }
      }
    }
    const type = `${payload?.type ?? ''}`
    for (const key of Object.keys(handlers)) {
      if (key.endsWith('*') && type.startsWith(key.slice(0, -1))) {
        for (const fn of [...handlers[key]]) {
          try { fn(payload) } catch { /* ignore */ }
        }
      }
    }
  })
  es.onerror = () => {
    // EventSource reconnects automatically
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
