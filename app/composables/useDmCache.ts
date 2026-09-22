const cache = new Map<string, any[]>()

export function useDmCache() {
  function get(channelId: string) {
    return cache.get(channelId) ?? null
  }
  function set(channelId: string, messages: any[]) {
    cache.set(channelId, messages)
  }
  function append(channelId: string, message: any) {
    const arr = cache.get(channelId)
    if (arr && !arr.some(m => m.id === message.id)) arr.push(message)
  }
  function update(channelId: string, message: any) {
    const arr = cache.get(channelId)
    if (arr) {
      const i = arr.findIndex(m => m.id === message.id)
      if (i >= 0) arr[i] = message
    }
  }
  function has(channelId: string) {
    return cache.has(channelId)
  }
  return { get, set, append, update, has }
}