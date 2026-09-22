import { type Ref } from 'vue'

export interface PhpAction {
  key: string
  method?: 'GET' | 'POST'
  description: string
  args?: string[]
  notes?: string
}

export const PHP_ACTIONS: PhpAction[] = [
  { key: 'get_threads', description: 'スレッド一覧' },
  { key: 'get_messages', description: 'メッセージ一覧', args: ['thread_id'] },
  { key: 'send_message', description: 'メッセージ送信', args: ['thread_id', 'content', 'attachment'] },
  { key: 'edit_message', description: 'メッセージ編集', args: ['message_id', 'content'] },
  { key: 'delete_message', description: 'メッセージ削除', args: ['message_id'] },
  { key: 'toggle_pin', description: 'ピン切替', args: ['message_id'] },
  { key: 'get_direct_messages', description: 'DM履歴', args: ['partner_id'] },
  { key: 'send_direct_message', description: 'DM送信', args: ['receiver_id', 'content'] },
  { key: 'get_dm_partners', description: 'DM相手一覧' },
  { key: 'get_friends', description: 'フレンド一覧' },
  { key: 'get_friend_requests', description: 'フレンド申請一覧' },
  { key: 'send_friend_request', description: 'フレンド申請', args: ['user_id'] },
  { key: 'accept_friend', description: 'フレンド承認', args: ['request_id'] },
  { key: 'block_user', description: 'ブロック', args: ['user_id'] },
  { key: 'get_user_profile', description: 'プロフィール取得', args: ['user_id'] },
  { key: 'update_profile', description: 'プロフィール更新', args: ['...'] },
  { key: 'get_online_users', description: 'オンラインユーザー' },
  { key: 'search_users', description: 'ユーザー検索', args: ['term'] },
  { key: 'toggle_mute', description: 'ミュート切替', args: ['target_id'] },
  { key: 'get_mute_statuses', description: 'ミュート状態' },
  { key: 'update_status', description: 'ステータス更新', args: ['status'] },
  { key: 'set_lang', description: '言語設定', args: ['lang'] },
  { key: 'toggle_reaction', description: 'リアクション', args: ['message_id', 'emoji'] },
  { key: 'search_messages', description: 'メッセージ検索', args: ['term'] },
  { key: 'create_thread', description: 'スレッド作成', args: ['name'] },
  { key: 'get_pinned_messages', description: 'ピン済み' },
  { key: 'toggle_favorite', description: 'お気に入り', args: ['thread_id'] },
  { key: 'get_favorites', description: 'お気に入り一覧' },
  { key: 'create_group_thread', description: 'グループ作成', args: ['name'] },
  { key: 'get_group_threads', description: 'グループ一覧' },
  { key: 'get_group_messages', description: 'グループメッセージ', args: ['group_thread_id'] },
]

export interface BridgeStatus {
  enabled: boolean
  phpBase: string
  reachable: boolean
  plugins: Array<{ id: string; name: string; source: string }>
}

export function usePhpBridge() {
  const status = useState<BridgeStatus>('php-bridge-status', () => ({
    enabled: false,
    phpBase: '',
    reachable: false,
    plugins: [],
  }))

  const events: Ref<Array<{ ts: number; type: string; data: unknown }>> = useState(
    'php-bridge-events',
    () => [],
  )

  const refreshing = ref(false)

  async function refresh() {
    refreshing.value = true
    try {
      const s = await $fetch<BridgeStatus>('/api/bridge/status')
      status.value = s
    } catch {
      // ignore
    } finally {
      refreshing.value = false
    }
  }

  async function call<T = unknown>(action: string, params: Record<string, unknown> = {}) {
    return await $fetch<{ ok: boolean; data?: T; error?: string; status?: number; raw?: unknown }>(
      '/api/bridge/call',
      { method: 'POST', body: { action, params } },
    )
  }

  async function register(info: {
    id: string
    name: string
    version?: string
    source?: string
    apiBase?: string
    capabilities?: string[]
    events?: string[]
  }) {
    return await $fetch('/api/bridge/register', { method: 'POST', body: info })
  }

  async function relay(type: string, payload: Record<string, unknown> = {}) {
    return await $fetch('/api/bridge/relay', { method: 'POST', body: { type, payload } })
  }

  async function plugins() {
    return await $fetch<{ plugins: BridgeStatus['plugins']; self: unknown }>('/api/bridge/plugins')
  }

  function pushEvent(type: string, data: unknown) {
    events.value = [{ ts: Date.now(), type, data }, ...events.value].slice(0, 80)
  }

  return {
    status,
    events,
    refreshing,
    PHP_ACTIONS,
    refresh,
    call,
    register,
    relay,
    plugins,
    pushEvent,
  }
}