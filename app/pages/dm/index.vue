<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const channels = ref<any[]>([])
const loading = ref(true)

async function loadChannels() {
  loading.value = true
  try {
    const data = await $fetch('/api/dm/channels')
    channels.value = data.channels
  } finally {
    loading.value = false
  }
}

const { on } = useRealtime()
const unread = useUnread()
let offRealtime: (() => void)[] = []

function patchChannel(p: any) {
  if (!p.channelId || !p.message?.id) return
  const i = channels.value.findIndex((c: any) => c.id === p.channelId)
  if (i < 0) return
  channels.value[i] = { ...channels.value[i], lastMessage: p.message, updatedAt: p.message.createdAt }
}

function handleNewMessage(p: any) {
  if (!p.channelId) return
  // Only refetch channels on the first load; live updates patch the row in place.
  if (channels.value.length) {
    patchChannel(p)
  } else {
    loadChannels()
  }
}

onMounted(() => {
  loadChannels()
  if (isMobileNav.value) loadFriends()
  offRealtime = [
    on('dm.message', handleNewMessage),
    on('dm.message.edited', handleNewMessage),
  ]
})

onUnmounted(() => {
  offRealtime.forEach(off => off())
})

function otherMembers(ch: any) {
  return ch.members?.filter((m: any) => m.id !== me.value?.user?.id) || []
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

const { data: me } = await useFetch('/api/auth/me', { key: 'dm-me' })

/* ------------------------------------------------------------------------
 * モバイル専用（<681px）: アカウントカード + フレンドリスト
 * デスクトップの DM チャンネル一覧には一切影響させない。
 * ---------------------------------------------------------------------- */
const { openSwitcher } = useAccounts()
const showSettings = ref(false)

// ブレークポイントはコードベース全体で 681px（モバイル = 680px 以下）
const isMobileNav = useIsMobileNav()

const myUser = computed<any>(() => me.value?.user || null)
const myId = computed<string | undefined>(() => myUser.value?.id)

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
const friendsUnauthorized = ref(false)
const startingDmId = ref<string | null>(null)

/**
 * `/api/users/:id/friends` は users テーブルの生行をそのまま返すため
 * passwordHash / email / settings を含む。必要な列だけを拾い、
 * クライアントへ持ち込む値を絞る。
 */
function toFriends(rows: unknown): Friend[] {
  const list = Array.isArray(rows) ? (rows as any[]) : []
  return list
    .filter((r: any) => r?.id && r.id !== myId.value)
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
  if (!myId.value) {
    friends.value = []
    friendsUnauthorized.value = true
    friendsLoading.value = false
    return
  }
  friendsLoading.value = true
  friendsError.value = ''
  friendsUnauthorized.value = false
  try {
    const data = await $fetch(`/api/users/${myId.value}/friends`)
    friends.value = toFriends(data?.friends)
  } catch (e: any) {
    const status = e?.statusCode ?? e?.response?.status
    if (status === 401) {
      friends.value = []
      friendsUnauthorized.value = true
    } else {
      friends.value = []
      friendsError.value = e?.data?.message || 'フレンドを読み込めませんでした'
    }
  } finally {
    friendsLoading.value = false
  }
}

async function startDM(participantId: string) {
  if (startingDmId.value) return
  startingDmId.value = participantId
  try {
    const data = await $fetch('/api/dm/channels', { method: 'POST', body: { participantId } })
    await navigateTo(`/dm/${data.channel.id}`)
  } catch (e: any) {
    const status = e?.statusCode ?? e?.response?.status
    if (status === 401) {
      await navigateTo(`/signin?redirect=${encodeURIComponent('/dm')}`)
    } else {
      alert(e?.data?.message || 'DMを作成できませんでした')
    }
  } finally {
    startingDmId.value = null
  }
}

// 画面幅がリサイズでモバイル해진場合にのみ読み込む（デスクトップでは通信しない）
watch(isMobileNav, (v) => {
  if (v && !friends.value.length && !friendsLoading.value && !friendsError.value && !friendsUnauthorized.value) {
    loadFriends()
  }
})
</script>

<template>
  <div class="max-w-2xl mx-auto p-4 space-y-4">
    <h1 class="text-2xl font-bold text-white">DM</h1>

    <!-- ===== モバイル専用セクション（<681px） ===== -->
    <section class="min-[681px]:hidden space-y-3">
      <!-- (a) アカウント切り替え -->
      <button
        type="button"
        @click="openSwitcher"
        class="w-full flex items-center gap-3 p-3 rounded-xl bg-surface-container/40 border border-outline-variant hover:bg-surface-container/70 active:bg-surface-container transition text-left"
      >
        <div class="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold shrink-0 overflow-hidden">
          <img v-if="avatarSrc(myUser?.avatarUrl)" :src="avatarSrc(myUser?.avatarUrl)" class="w-full h-full object-cover" alt="" />
          <template v-else>{{ myUser?.displayName?.charAt(0) || '?' }}</template>
        </div>
        <div class="min-w-0 flex-1">
          <p class="text-sm font-bold text-on-surface truncate">{{ myUser?.displayName || 'マイアカウント' }}</p>
          <p class="text-xs text-on-surface-variant truncate">@{{ myUser?.username || '?' }}</p>
          <span class="mt-1.5 inline-flex items-center gap-1.5 text-[11px] font-medium text-indigo-300 bg-indigo-600/20 rounded-full px-2 py-0.5 max-w-full">
            <Icon name="lucide:repeat-2" class="w-3 h-3 shrink-0" />
            <span class="truncate">アカウントを切り替える</span>
          </span>
        </div>
        <Icon name="lucide:chevron-right" class="w-4 h-4 text-on-surface-variant shrink-0" />
      </button>

      <!-- (b) アカウント設定 -->
      <button
        type="button"
        @click="showSettings = true"
        class="w-full flex items-center gap-3 p-3 rounded-xl bg-surface-container/40 border border-outline-variant hover:bg-surface-container/70 active:bg-surface-container transition text-left"
      >
        <div class="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold shrink-0 overflow-hidden">
          <img v-if="avatarSrc(myUser?.avatarUrl)" :src="avatarSrc(myUser?.avatarUrl)" class="w-full h-full object-cover" alt="" />
          <template v-else>{{ myUser?.displayName?.charAt(0) || '?' }}</template>
        </div>
        <div class="min-w-0 flex-1">
          <p class="text-sm font-bold text-on-surface truncate">{{ myUser?.displayName || 'マイアカウント' }}</p>
          <p class="text-xs text-on-surface-variant truncate">@{{ myUser?.username || '?' }}</p>
          <span class="mt-1.5 inline-flex items-center gap-1.5 text-[11px] font-medium text-indigo-300 bg-indigo-600/20 rounded-full px-2 py-0.5 max-w-full">
            <Icon name="lucide:settings" class="w-3 h-3 shrink-0" />
            <span class="truncate">アカウント設定</span>
          </span>
        </div>
        <Icon name="lucide:chevron-right" class="w-4 h-4 text-on-surface-variant shrink-0" />
      </button>

      <!-- (c) フレンドリスト -->
      <div class="space-y-2">
        <div class="flex items-center justify-between px-1 gap-2">
          <h2 class="text-sm font-bold text-on-surface flex items-center gap-1.5">
            <Icon name="lucide:user-round-check" class="w-4 h-4 text-indigo-400" />
            フレンド
          </h2>
          <span v-if="!friendsLoading && !friendsError && !friendsUnauthorized" class="text-[11px] text-on-surface-variant shrink-0">
            {{ friends.length }}人
          </span>
        </div>

        <!-- 読み込み中 -->
        <div v-if="friendsLoading" class="space-y-2">
          <div v-for="i in 3" :key="`skeleton-${i}`" class="flex items-center gap-3 p-2.5 rounded-xl bg-surface-container/30 border border-outline-variant">
            <div class="w-9 h-9 rounded-full bg-surface-container animate-pulse shrink-0"></div>
            <div class="flex-1 min-w-0 space-y-2">
              <div class="h-3 w-1/3 rounded bg-surface-container animate-pulse"></div>
              <div class="h-2.5 w-1/4 rounded bg-surface-container animate-pulse"></div>
            </div>
            <div class="w-4 h-4 rounded bg-surface-container animate-pulse shrink-0"></div>
          </div>
        </div>

        <!-- 未ログイン / 401 -->
        <div v-else-if="friendsUnauthorized" class="p-3 rounded-xl bg-surface-container/40 border border-outline-variant text-center">
          <p class="text-sm text-on-surface">サインインが必要です</p>
          <p class="text-xs text-on-surface-variant mt-1">アカウントにサインインするとフレンドが表示されます</p>
          <NuxtLink to="/signin?redirect=%2Fdm" class="mt-3 inline-block px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition">
            サインイン
          </NuxtLink>
        </div>

        <!-- エラー -->
        <div v-else-if="friendsError" class="p-3 rounded-xl bg-surface-container/40 border border-outline-variant text-center">
          <p class="text-sm text-red-400">{{ friendsError }}</p>
          <button
            type="button"
            @click="loadFriends"
            class="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-outline-variant text-sm text-on-surface hover:bg-surface-container transition"
          >
            <Icon name="lucide:rotate-cw" class="w-4 h-4" />
            再読み込み
          </button>
        </div>

        <!-- フレンドがいない -->
        <div v-else-if="!friends.length" class="p-4 rounded-xl bg-surface-container/40 border border-outline-variant text-center">
          <div class="w-10 h-10 mx-auto rounded-full bg-surface-container flex items-center justify-center">
            <Icon name="lucide:user-round-x" class="w-5 h-5 text-on-surface-variant" />
          </div>
          <p class="mt-2 text-sm text-on-surface">まだフレンドがいません</p>
          <p class="text-xs text-on-surface-variant mt-1">プロフィールからフレンド申請を送ると、ここに表示されます</p>
        </div>

        <!-- 一覧 -->
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
    </section>

    <!-- ===== 既存: DM チャンネル一覧（デスクトップ / モバイル共通） ===== -->
    <div v-if="loading" class="text-center text-on-surface-variant py-8">読み込み中...</div>
    <div v-else-if="!channels.length" class="text-center text-on-surface-variant py-8">
      <p>まだDMチャンネルがありません</p>
    </div>
    <div v-else class="space-y-2">
      <NuxtLink
        v-for="ch in channels"
        :key="ch.id"
        :to="`/dm/${ch.id}`"
        class="flex items-center gap-3 p-3 bg-surface-container/30 rounded-xl hover:bg-surface-container/50 transition"
      >
        <div class="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold shrink-0 overflow-hidden">
          <img v-if="avatarSrc(otherMembers(ch)[0]?.avatarUrl)" :src="avatarSrc(otherMembers(ch)[0]?.avatarUrl)" class="w-full h-full object-cover" />
          <template v-else>{{ otherMembers(ch)[0]?.displayName?.charAt(0) || '?' }}</template>
        </div>
        <div class="min-w-0 flex-1">
          <div class="flex items-center justify-between gap-2">
            <p class="text-sm font-bold text-white truncate">{{ otherMembers(ch).map((m: any) => m.displayName).join(', ') || '不明' }}
              <span class="text-xs font-normal text-on-surface-variant">@{{ otherMembers(ch).map((m: any) => m.username).join(', @') || '?' }}</span>
            </p>
            <span class="flex items-center gap-1.5 shrink-0">
              <span v-if="unread.hasDmUnread(ch.id)" class="min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[11px] font-bold flex items-center justify-center">1</span>
              <span v-if="ch.lastMessage?.createdAt" class="text-[11px] text-slate-600">{{ timeAgo(ch.lastMessage.createdAt) }}</span>
            </span>
          </div>
          <p v-if="ch.lastMessage" class="text-xs text-on-surface-variant truncate">
            <span :class="unread.hasDmUnread(ch.id) ? 'text-on-surface' : 'text-on-surface'">{{ ch.lastMessage.sender?.displayName }}<span v-if="ch.lastMessage.edited" class="text-on-surface-variant">（編集済み）</span>: </span>{{ ch.lastMessage.content }}
          </p>
          <p v-else class="text-xs text-on-surface-variant">DMを開く</p>
          <p v-if="otherMembers(ch)[0]?.statusMessage" class="text-[11px] text-emerald-400/80 truncate flex items-center gap-1 mt-0.5">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 inline-block"></span>{{ otherMembers(ch)[0].statusMessage }}
          </p>
        </div>
      </NuxtLink>
    </div>

    <!-- SettingsModal はグローバルマウントではないためローカルに立てる。
         min-[681px]:hidden の内側に置くと display:none で不可視になるため、必ず外側。 -->
    <SettingsModal v-if="showSettings" @close="showSettings = false" />
  </div>
</template>
