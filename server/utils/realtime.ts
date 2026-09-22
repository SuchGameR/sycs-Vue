interface RealtimeSubscriber {
  userId?: string
  push(data: string): void | Promise<void>
}

const subscribers = new Set<RealtimeSubscriber>()

export function subscribeRealtime(sub: RealtimeSubscriber) {
  subscribers.add(sub)
}

export function unsubscribeRealtime(sub: RealtimeSubscriber) {
  subscribers.delete(sub)
}

export function broadcast(payload: Record<string, unknown>) {
  const data = JSON.stringify(payload)
  for (const sub of [...subscribers]) {
    try {
      sub.push(data)
    } catch {
      subscribers.delete(sub)
    }
  }
}

export function broadcastToUsers(payload: Record<string, unknown>, userIds: string[]) {
  const targets = new Set(userIds)
  const data = JSON.stringify(payload)
  for (const sub of [...subscribers]) {
    if (!sub.userId || !targets.has(sub.userId)) continue
    try {
      sub.push(data)
    } catch {
      subscribers.delete(sub)
    }
  }
}
