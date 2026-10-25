/**
 * オンライン / オフラインと、同期待ちの変更キュー。
 *
 * - オフライン中の変更は queue に積み、復帰時に自動で順番に送る
 * - 失敗した変更は捨てずに残す (次回の復帰で再試行)
 * - UI は pending / syncing / lastSyncedAt を見て状態を出す
 */

interface SyncTask {
  id: number
  label: string
  run: () => Promise<unknown>
}

let queue: SyncTask[] = []
let seq = 0
let listenersBound = false

export type NetworkState = 'online' | 'offline' | 'syncing' | 'error'

export function useNetworkStatus() {
  const online = useState<boolean>('net:online', () => true)
  const forcedOffline = useState<boolean>('net:forced-offline', () => false)
  const pending = useState<number>('net:pending', () => 0)
  const syncing = useState<boolean>('net:syncing', () => false)
  const lastError = useState<string>('net:last-error', () => '')
  const lastSyncedAt = useState<number | null>('net:last-synced', () => null)

  const isOnline = computed(() => online.value && !forcedOffline.value)

  const state = computed<NetworkState>(() => {
    if (!isOnline.value) return 'offline'
    if (syncing.value) return 'syncing'
    if (lastError.value) return 'error'
    return 'online'
  })

  function refreshPending() {
    pending.value = queue.length
  }

  async function flush() {
    if (!import.meta.client || !isOnline.value || syncing.value) return
    if (!queue.length) return
    syncing.value = true
    lastError.value = ''
    try {
      while (queue.length && isOnline.value) {
        const task = queue[0]!
        try {
          await task.run()
          queue.shift()
          lastSyncedAt.value = Date.now()
        } catch (e: any) {
          lastError.value = e?.message || e?.data?.message || '同期に失敗しました'
          break
        } finally {
          refreshPending()
        }
      }
    } finally {
      syncing.value = false
      refreshPending()
    }
  }

  /**
   * 変更を実行する。オフラインならキューに積んで true を返す。
   * 呼び出し側は「すぐ画面を更新してよい」と解釈できる。
   */
  async function enqueue(label: string, run: () => Promise<unknown>) {
    if (!import.meta.client || !isOnline.value) {
      queue.push({ id: ++seq, label, run })
      refreshPending()
      return { queued: true as const }
    }
    syncing.value = true
    lastError.value = ''
    try {
      await run()
      lastSyncedAt.value = Date.now()
      return { queued: false as const }
    } catch (e: any) {
      const task: SyncTask = { id: ++seq, label, run }
      queue.push(task)
      refreshPending()
      lastError.value = e?.message || e?.data?.message || '送信に失敗しました'
      return { queued: true as const }
    } finally {
      syncing.value = false
    }
  }

  function simulateOffline(value: boolean) {
    forcedOffline.value = value
    if (!value) void flush()
  }

  function init() {
    if (!import.meta.client || listenersBound) return
    listenersBound = true
    online.value = navigator.onLine
    window.addEventListener('online', () => {
      online.value = true
      void flush()
    })
    window.addEventListener('offline', () => {
      online.value = false
    })
  }

  return {
    online,
    forcedOffline,
    isOnline,
    state,
    pending,
    syncing,
    lastError,
    lastSyncedAt,
    init,
    enqueue,
    flush,
    simulateOffline,
  }
}
