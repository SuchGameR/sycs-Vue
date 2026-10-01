<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const { on } = useRealtime()
const unread = useUnread()
const { openSwitcher } = useAccounts()
const showSettings = ref(false)
let offRealtime: (() => void)[] = []

const { data: me } = await useFetch('/api/auth/me', { key: 'dm-me' })
const myUser = computed<any>(() => me.value?.user || null)
const myId = computed<string | undefined>(() => myUser.value?.id)

/* ==========================================================================
   Top tabs: サーバー / メッセージ
   --------------------------------------------------------------------------
   The remembered mode matters because this is a hub you flip between all day:
   re-picking a tab on every visit is the kind of small friction that makes a
   page feel broken. Persisted to localStorage so it survives a reload as well
   as in-app navigation.
   ========================================================================== */
type Mode = 'servers' | 'messages'
const MODE_KEY = 'sycs:social-mode'

const mode = useState<Mode>('sycs:social-mode', () => 'messages')

onMounted(() => {
  try {
    const saved = localStorage.getItem(MODE_KEY)
    if (saved === 'servers' || saved === 'messages') mode.value = saved
  } catch { /* ignore */ }
})
watch(mode, (v) => {
  if (import.meta.client) {
    try { localStorage.setItem(MODE_KEY, v) } catch { /* ignore */ }
  }
})

const modes = [
  { key: 'servers' as const, label: 'サーバー', icon: 'lucide:server' },
  { key: 'messages' as const, label: 'メッセージ', icon: 'lucide:messages-square' },
]

/* ==========================================================================
   サーバー
   ========================================================================== */
const servers = ref<any[]>([])
const serversLoading = ref(false)
const serversError = ref('')
const serversLoaded = ref(false)
const showServerSheet = ref(false)

async function loadServers(force = false) {
  if (serversLoaded.value && !force) return
  serversLoading.value = true
  serversError.value = ''
  try {
    const data = await $fetch<{ servers: any[] }>('/api/servers')
    servers.value = data.servers || []
    serversLoaded.value = true
  } catch (e: any) {
    serversError.value = e?.data?.message || 'サーバーを読み込めませんでした'
  } finally {
    serversLoading.value = false
  }
}

// Load each tab's data the first time it is actually opened, so landing on
// メッセージ doesn't pay for the server list (and vice versa).
// Client-only: during SSR the auth cookie is not forwarded to this internal
// $fetch, so the request would 401 and paint an error state before hydration.
onMounted(() => { if (mode.value === 'servers') loadServers() })
watch(mode, (v) => { if (v === 'servers') loadServers() })

/* ==========================================================================
   メッセージ (DM)
   ========================================================================== */
const channels = ref<any[]>([])
const channelsLoading = ref(true)

async function loadChannels() {
  channelsLoading.value = true
  try {
    const data = await $fetch('/api/dm/channels')
    channels.value = data.channels
  } catch {
    channels.value = []
  } finally {
    channelsLoading.value = false
  }
}

function patchChannel(p: any) {
  if (!p.channelId || !p.message?.id) return
  const i = channels.value.findIndex((c: any) => c.id === p.channelId)
  if (i < 0) return
  channels.value[i] = { ...channels.value[i], lastMessage: p.message, updatedAt: p.message.createdAt }
}

function handleNewMessage(p: any) {
  if (!p.channelId) return
  // Only refetch channels on the first load; live updates patch the row in place.
  if (channels.value.length) patchChannel(p)
  else loadChannels()
}

onMounted(() => {
  loadChannels()
  offRealtime = [
    on('dm.message', handleNewMessage),
    on('dm.message.edited', handleNewMessage),
  ]
})

onUnmounted(() => { offRealtime.forEach(off => off()) })

function otherMembers(ch: any) {
  return (ch.members || []).filter((m: any) => m.id !== myId.value)
}

function timeAgo(date?: string) {
  if (!date) return ''
  const diff = Date.now() - new Date(date).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'たった今'
  if (minutes < 60) return `${minutes}分前`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}時間前`
  return `${Math.floor(hours / 24)}日前`
}

/* ==========================================================================
   フレンド
   --------------------------------------------------------------------------
   Friend requests are rare, so the list no longer occupies the top of the hub
   permanently. It loads lazily the first time the sheet is opened, which also
   means opening /social no longer fires a request nobody was going to look at.
   ========================================================================== */
interface Friend {
  id: string
  username: string
  displayName: string
  avatarUrl: string | null
  bio: string
  statusMessage: string
}

const friends = ref<Friend[]>([])
const friendsLoading = ref(false)
const friendsError = ref('')
const friendsLoaded = ref(false)
const showFriends = ref(false)
const startingDmId = ref<string | null>(null)

/**
 * `/api/users/:id/friends` returns raw `users` rows (passwordHash / email /
 * settings included), so only the columns the UI needs are carried over.
 *
 * Self is excluded by BOTH id and username: the id filter alone relied on the
 * current user already being resolved when the list was built, which is not
 * guaranteed while `/api/auth/me` is still in flight.
 */
function toFriends(rows: unknown): Friend[] {
  const list = Array.isArray(rows) ? (rows as any[]) : []
  const selfId = myId.value
  const selfName = (myUser.value?.username || '').toLowerCase()
  return list
    .filter((r: any) => {
      if (!r?.id) return false
      if (selfId && String(r.id) === selfId) return false
      if (selfName && String(r.username || '').toLowerCase() === selfName) return false
      return true
    })
    .map((r: any) => ({
      id: String(r.id),
      username: String(r.username || ''),
      displayName: String(r.displayName || r.username || '不明'),
      avatarUrl: r.avatarUrl ?? null,
      bio: r.bio ?? '',
      statusMessage: r.statusMessage ?? '',
    }))
    .sort((a, b) => a.displayName.localeCompare(b.displayName, 'ja'))
}

async function loadFriends() {
  if (friendsLoaded.value) return
  if (!myId.value) { friendsError.value = 'サインインが必要です'; return }
  friendsLoading.value = true
  friendsError.value = ''
  try {
    const data = await $fetch(`/api/users/${myId.value}/friends`)
    friends.value = toFriends(data?.friends)
    friendsLoaded.value = true
  } catch (e: any) {
    friends.value = []
    friendsError.value = e?.data?.message || 'フレンドを読み込めませんでした'
  } finally {
    friendsLoading.value = false
  }
}

// Open lazily so the count badge is still available without paying for it up
// front: it only refreshes once the sheet has been opened at least once.
async function openFriends() {
  showFriends.value = true
  await loadFriends()
}

async function startDM(participantId: string) {
  if (startingDmId.value) return
  startingDmId.value = participantId
  try {
    const data = await $fetch('/api/dm/channels', { method: 'POST', body: { participantId } })
    showFriends.value = false
    await navigateTo(`/social/${data.channel.id}`)
  } catch (e: any) {
    if ((e?.statusCode ?? e?.response?.status) === 401) {
      await navigateTo(`/signin?redirect=${encodeURIComponent('/social')}`)
    } else {
      alert(e?.data?.message || '会話を開始できませんでした')
    }
  } finally {
    startingDmId.value = null
  }
}
</script>

<template>
  <div class="max-w-2xl mx-auto p-4 space-y-4 pb-24 min-[681px]:pb-6">
    <div class="flex items-center gap-2 p-2.5 rounded-xl bg-surface-container/40 border border-outline-variant">
      <button
        type="button"
        @click="openSwitcher"
        class="flex-1 min-w-0 flex items-center gap-3 text-left"
        :title="`${myUser?.displayName || 'マイアカウント'} を切り替える`"
      >
        <div class="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold shrink-0 overflow-hidden relative group">
          <img v-if="avatarSrc(myUser?.avatarUrl)" :src="avatarSrc(myUser?.avatarUrl)" class="w-full h-full object-cover" alt="" />
          <template v-else>{{ myUser?.displayName?.charAt(0) || '?' }}</template>
          <span class="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition">
            <Icon name="lucide:repeat-2" class="w-3.5 h-3.5 text-white" />
          </span>
        </div>
        <div class="min-w-0 flex-1">
          <p class="text-sm font-bold text-on-surface truncate">{{ myUser?.displayName || 'マイアカウント' }}</p>
          <p class="text-xs text-on-surface-variant truncate">@{{ myUser?.username || '?' }}</p>
        </div>
        <Icon name="lucide:chevron-down" class="w-4 h-4 text-on-surface-variant shrink-0" />
      </button>
      <button
        type="button"
        @click="showSettings = true"
        aria-label="アカウント設定"
        title="アカウント設定"
        class="shrink-0 p-2 rounded-full text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition"
      >
        <Icon name="lucide:settings" class="w-[18px] h-[18px]" />
      </button>
      <button
        @click="openFriends"
        class="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-full bg-surface-container/70 border border-outline-variant text-sm text-on-surface hover:bg-surface-container transition"
      >
        <Icon name="lucide:user-round-check" class="w-4 h-4 text-indigo-400" />
        フレンド
        <span
          v-if="friendsLoaded && friends.length"
          class="min-w-[18px] h-[18px] px-1 rounded-full bg-indigo-600 text-white text-[11px] font-bold flex items-center justify-center"
        >{{ friends.length }}</span>
      </button>
    </div>

    <!-- ===== 上部タブ: サーバー / メッセージ ===== -->
    <div class="flex gap-1 p-1 rounded-full bg-surface-container/50 border border-outline-variant" role="tablist">
      <button
        v-for="m in modes"
        :key="m.key"
        role="tab"
        :aria-selected="mode === m.key"
        @click="mode = m.key"
        class="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-full text-sm font-bold transition"
        :class="mode === m.key
          ? 'bg-indigo-600 text-white shadow-sm'
          : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container/60'"
      >
        <Icon :name="m.icon" class="w-4 h-4" />
        {{ m.label }}
      </button>
    </div>

    <!-- ===== サーバー ===== -->
    <template v-if="mode === 'servers'">
      <div class="flex gap-2">
        <button
          @click="showServerSheet = true"
          class="flex-1 py-2.5 rounded-lg border border-outline text-sm text-on-surface hover:bg-surface-container transition flex items-center justify-center gap-1.5"
        >
          <Icon name="lucide:log-in" class="w-4 h-4" />
          参加
        </button>
        <button
          @click="showServerSheet = true"
          class="flex-1 py-2.5 rounded-lg bg-indigo-600 text-sm font-bold text-white hover:bg-indigo-700 transition flex items-center justify-center gap-1.5"
        >
          <Icon name="lucide:plus" class="w-4 h-4" />
          作成
        </button>
      </div>

      <div v-if="serversLoading" class="text-center text-on-surface-variant py-8">読み込み中...</div>
      <div v-else-if="serversError" class="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-sm text-red-400 flex items-center justify-between gap-2">
        <span>{{ serversError }}</span>
        <button @click="loadServers(true)" class="shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-outline-variant hover:bg-surface-container transition">
          <Icon name="lucide:rotate-cw" class="w-3.5 h-3.5" />再試行
        </button>
      </div>
      <div v-else-if="!servers.length" class="text-center text-on-surface-variant py-10 text-sm">
        参加しているサーバーはありません
      </div>
      <div v-else class="space-y-2">
        <NuxtLink
          v-for="s in servers"
          :key="s.id"
          :to="`/servers/${s.id}`"
          class="flex items-center gap-3 p-3 bg-surface-container/30 rounded-xl border border-outline-variant hover:bg-surface-container/50 transition"
        >
          <div class="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold shrink-0 overflow-hidden">
            <img v-if="s.iconUrl || s.icon_url" :src="s.iconUrl || s.icon_url" class="w-full h-full object-cover" alt="" />
            <template v-else>{{ s.name?.charAt(0) || '?' }}</template>
          </div>
          <div class="min-w-0 flex-1">
            <p class="text-sm font-bold text-on-surface truncate">{{ s.name }}</p>
            <p class="text-xs text-on-surface-variant truncate">
              {{ s.description || `メンバー ${s.memberCount ?? s.member_count ?? 0} 人` }}
            </p>
          </div>
          <Icon name="lucide:chevron-right" class="w-4 h-4 text-on-surface-variant shrink-0" />
        </NuxtLink>
      </div>
    </template>

    <!-- ===== メッセージ ===== -->
    <template v-else>
      <div v-if="channelsLoading" class="text-center text-on-surface-variant py-8">読み込み中...</div>
      <div v-else-if="!channels.length" class="text-center text-on-surface-variant py-10 text-sm space-y-3">
        <p>まだ会話がありません</p>
        <button
          @click="openFriends"
          class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-indigo-600 text-sm font-bold text-white hover:bg-indigo-700 transition"
        >
          <Icon name="lucide:user-round-check" class="w-4 h-4" />
          フレンドから会話を始める
        </button>
      </div>
      <div v-else class="space-y-2">
        <NuxtLink
          v-for="ch in channels"
          :key="ch.id"
          :to="`/social/${ch.id}`"
          class="flex items-center gap-3 p-3 bg-surface-container/30 rounded-xl border border-outline-variant hover:bg-surface-container/50 transition"
        >
          <div class="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold shrink-0 overflow-hidden">
            <img v-if="avatarSrc(otherMembers(ch)[0]?.avatarUrl)" :src="avatarSrc(otherMembers(ch)[0]?.avatarUrl)" class="w-full h-full object-cover" alt="" />
            <template v-else>{{ otherMembers(ch)[0]?.displayName?.charAt(0) || '?' }}</template>
          </div>
          <div class="min-w-0 flex-1">
            <div class="flex items-center justify-between gap-2">
              <p class="text-sm font-bold text-on-surface truncate">
                {{ otherMembers(ch).map((m: any) => m.displayName).join(', ') || '不明' }}
                <span class="text-xs font-normal text-on-surface-variant">@{{ otherMembers(ch).map((m: any) => m.username).join(', @') || '?' }}</span>
              </p>
              <span class="flex items-center gap-1.5 shrink-0">
                <span v-if="unread.hasDmUnread(ch.id)" class="min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[11px] font-bold flex items-center justify-center">1</span>
                <span v-if="ch.lastMessage?.createdAt" class="text-[11px] text-slate-600">{{ timeAgo(ch.lastMessage.createdAt) }}</span>
              </span>
            </div>
            <p v-if="ch.lastMessage" class="text-xs text-on-surface-variant truncate">
              <span class="text-on-surface">{{ ch.lastMessage.sender?.displayName }}<span v-if="ch.lastMessage.edited" class="text-on-surface-variant">（編集済み）</span>: </span>{{ ch.lastMessage.content }}
            </p>
            <p v-else class="text-xs text-on-surface-variant">会話を開く</p>
            <p v-if="otherMembers(ch)[0]?.statusMessage" class="text-[11px] text-emerald-400/80 truncate flex items-center gap-1 mt-0.5">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 inline-block"></span>{{ otherMembers(ch)[0].statusMessage }}
            </p>
          </div>
        </NuxtLink>
      </div>
    </template>

    <!-- フレンドシート: 申請は滅多に無いので常時表示せずボタンから開く -->
    <BottomSheet :open="showFriends" height="min(75dvh, 34rem)" :dismiss-on-backdrop="true" @close="showFriends = false">
      <div class="p-4">
        <div class="flex items-center justify-between mb-3">
          <span class="font-bold text-on-surface">フレンド</span>
          <button @click="showFriends = false" class="p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition">
            <Icon name="lucide:x" class="w-5 h-5" />
          </button>
        </div>

        <div v-if="friendsLoading" class="space-y-2">
          <div v-for="i in 3" :key="`skeleton-${i}`" class="flex items-center gap-3 p-2.5 rounded-xl bg-surface-container/30 border border-outline-variant">
            <div class="w-9 h-9 rounded-full bg-surface-container animate-pulse shrink-0"></div>
            <div class="flex-1 min-w-0 space-y-2">
              <div class="h-3 w-1/3 rounded bg-surface-container animate-pulse"></div>
              <div class="h-2.5 w-1/4 rounded bg-surface-container animate-pulse"></div>
            </div>
          </div>
        </div>

        <div v-else-if="friendsError" class="p-3 rounded-xl bg-surface-container/40 border border-outline-variant text-center">
          <p class="text-sm text-on-surface">{{ friendsError }}</p>
          <button
            @click="friendsLoaded = false; loadFriends()"
            class="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-outline-variant text-sm text-on-surface hover:bg-surface-container transition"
          >
            <Icon name="lucide:rotate-cw" class="w-4 h-4" />再読み込み
          </button>
        </div>

        <div v-else-if="!friends.length" class="p-6 rounded-xl bg-surface-container/40 border border-outline-variant text-center">
          <div class="w-10 h-10 mx-auto rounded-full bg-surface-container flex items-center justify-center">
            <Icon name="lucide:user-round-x" class="w-5 h-5 text-on-surface-variant" />
          </div>
          <p class="mt-2 text-sm text-on-surface">まだフレンドがいません</p>
          <p class="text-xs text-on-surface-variant mt-1">プロフィールからフレンド申請を送ると、ここに表示されます</p>
        </div>

        <div v-else class="space-y-2">
          <button
            v-for="f in friends"
            :key="f.id"
            type="button"
            @click="startDM(f.id)"
            :disabled="!!startingDmId"
            class="w-full flex items-center gap-3 p-2.5 rounded-xl bg-surface-container/40 border border-outline-variant hover:bg-surface-container/70 active:bg-surface-container transition text-left disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div class="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shrink-0 overflow-hidden">
              <img v-if="avatarSrc(f.avatarUrl)" :src="avatarSrc(f.avatarUrl)" class="w-full h-full object-cover" alt="" />
              <template v-else>{{ f.displayName?.charAt(0) || '?' }}</template>
            </div>
            <div class="min-w-0 flex-1">
              <p class="text-sm font-bold text-on-surface truncate">{{ f.displayName }}</p>
              <p class="text-xs text-on-surface-variant truncate">@{{ f.username }}</p>
              <p v-if="f.statusMessage" class="text-[11px] text-emerald-400/80 truncate flex items-center gap-1 mt-0.5">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 inline-block"></span>{{ f.statusMessage }}
              </p>
              <p v-else-if="f.bio" class="text-[11px] text-on-surface-variant/80 truncate mt-0.5">{{ f.bio }}</p>
            </div>
            <Icon
              :name="startingDmId === f.id ? 'lucide:loader-2' : 'lucide:message-square'"
              :class="startingDmId === f.id ? 'w-4 h-4 text-indigo-400 animate-spin shrink-0' : 'w-4 h-4 text-indigo-400 shrink-0'"
            />
          </button>
        </div>
      </div>
    </BottomSheet>

    <ServerListModal v-if="showServerSheet" @close="showServerSheet = false; loadServers(true)" />

    <!-- SettingsModal はグローバルマウントではないためローカルに立てる。
         min-[681px]:hidden の内側に置くと display:none で不可視になるため、必ず外側。 -->
    <SettingsModal v-if="showSettings" @close="showSettings = false" />
  </div>
</template>
