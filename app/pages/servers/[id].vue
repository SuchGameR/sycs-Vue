<script setup lang="ts">
import { PERMISSIONS, hasPermission } from '~/utils/serverPermissions'
import { mediaKindOf } from '~/composables/useMediaPane'

definePageMeta({ middleware: 'auth' })

const route = useRoute()
const serverId = computed(() => route.params.id as string)

const server = ref<any>(null)
const channels = ref<any[]>([])
const members = ref<any[]>([])
const roles = ref<any[]>([])
const posts = ref<any[]>([])
const loading = ref(true)
const loadError = ref<string | null>(null)
const activeChannelId = ref<string | null>(null)
const showMemberList = ref(false)
const showSettings = ref(false)
const settingsTab = ref('overview')
const settingsChannelId = ref<string | null>(null)
const posting = ref(false)
const postOffset = ref(0)
const postHasMore = ref(true)
const { sentinel: postSentinel, loading: loadingMorePosts, reset: resetPostScroll } = useInfiniteScroll(async () => {
  return await loadPosts(false)
})

const mediaPane = useMediaPane()
const voice = useVoiceCall()
const { presence: voicePresence } = voice
const voiceChannelId = ref<string | null>(null)

const CHANNEL_META: Record<string, { label: string; icon: string }> = {
  text: { label: 'テキストチャンネル', icon: 'lucide:hash' },
  video: { label: '動画チャンネル', icon: 'lucide:video' },
  music: { label: '音楽チャンネル', icon: 'lucide:music' },
  gallery: { label: '画像ギャラリー', icon: 'lucide:image' },
  model: { label: '3Dモデルチャンネル', icon: 'lucide:box' },
  file: { label: 'ファイルチャンネル', icon: 'lucide:paperclip' },
}

const textChannels = computed(() => channels.value.filter(c => c.type !== 'voice'))
const voiceChannels = computed(() => channels.value.filter(c => c.type === 'voice'))

const groupedChannels = computed(() => {
  const groups: Array<{ type: string; label: string; icon: string; channels: any[] }> = []
  for (const type of ['text', 'video', 'music', 'gallery', 'model', 'file']) {
    const list = channels.value.filter(c => (c.type || 'text') === type)
    if (list.length) groups.push({ type, ...(CHANNEL_META[type] || CHANNEL_META.text), channels: list })
  }
  return groups
})

const myPermissions = ref(0)
const isOwner = ref(false)
const activeChannel = computed(() => channels.value.find(c => c.id === activeChannelId.value))
const canSend = computed(() => isOwner.value || hasPermission(myPermissions.value, PERMISSIONS.SEND_MESSAGES))
const canManage = computed(() =>
  isOwner.value
  || hasPermission(myPermissions.value, PERMISSIONS.MANAGE_CHANNELS)
  || hasPermission(myPermissions.value, PERMISSIONS.MANAGE_ROLES)
  || hasPermission(myPermissions.value, PERMISSIONS.MANAGE_MEMBERS)
  || hasPermission(myPermissions.value, PERMISSIONS.MANAGE_INVITES)
  || hasPermission(myPermissions.value, PERMISSIONS.MANAGE_SERVER)
)

const composerMediaKind = computed<'any' | 'video' | 'image' | 'audio' | 'model' | 'file'>(() => {
  const t = activeChannel.value?.type
  if (t === 'video') return 'video'
  if (t === 'gallery') return 'image'
  if (t === 'music') return 'audio'
  if (t === 'model') return 'model'
  if (t === 'file') return 'file'
  return 'any'
})

function channelIcon(type?: string) {
  return CHANNEL_META[type || 'text']?.icon || 'lucide:hash'
}

async function fetchServerData() {
  const data = await $fetch(`/api/servers/${serverId.value}`)
  server.value = data.server
  channels.value = data.channels
  members.value = data.members
  roles.value = data.roles
  myPermissions.value = data.myPermissions || 0
  isOwner.value = !!data.isOwner
  if (textChannels.value.length && !textChannels.value.some(c => c.id === activeChannelId.value)) {
    activeChannelId.value = textChannels.value[0].id
  }
  if (activeChannelId.value) await loadPosts()
  if (voiceChannelId.value && !voiceChannels.value.some(c => c.id === voiceChannelId.value)) {
    voiceChannelId.value = null
    voice.leave()
  }
}

async function loadServer() {
  loading.value = true
  loadError.value = null
  try {
    await fetchServerData()
  } catch (e: any) {
    loadError.value = e?.data?.message || 'サーバーを読み込めませんでした'
  } finally {
    loading.value = false
  }
}

async function loadPosts(reset = true) {
  if (!activeChannelId.value) return { hasMore: false }
  if (reset) {
    postOffset.value = 0
    postHasMore.value = true
    resetPostScroll()
  }
  if (!postHasMore.value) return { hasMore: false }
  try {
    const pageSize = reset ? FEED_PAGE_SIZE : 5
    const data = await $fetch('/api/posts', {
      params: {
        serverId: serverId.value,
        channelId: activeChannelId.value,
        limit: pageSize,
        offset: postOffset.value,
      },
    })
    const incoming = data.posts || []
    postOffset.value = data.nextOffset ?? (postOffset.value + incoming.length)
    postHasMore.value = data.hasMore ?? incoming.length === pageSize
    if (reset) {
      posts.value = incoming
    } else {
      const seen = new Set(posts.value.map(p => p.id))
      posts.value = [...posts.value, ...incoming.filter(p => !seen.has(p.id))]
    }
    return { hasMore: postHasMore.value }
  } catch (e: any) {
    if (reset) posts.value = []
    return { hasMore: false }
  }
}

function selectChannel(ch: any) {
  if (activeChannelId.value === ch.id) return
  activeChannelId.value = ch.id
  posts.value = []
  loadPosts(true)
}

async function submitPost(content: string, attachments?: any[], visibility?: string, visibleTo?: string[]) {
  if (!activeChannelId.value) return
  posting.value = true
  try {
    await $fetch('/api/posts', {
      method: 'POST',
      body: {
        content,
        attachments,
        visibility: visibility || 'public',
        visibleTo,
        serverId: serverId.value,
        channelId: activeChannelId.value,
      },
    })
    await loadPosts()
  } catch (e: any) {
    alert(e?.data?.message || '投稿に失敗しました')
  } finally {
    posting.value = false
  }
}

function openMedia(post: any) {
  const label = activeChannel.value?.name ? `#${activeChannel.value.name}` : server.value?.name
  if (import.meta.client && window.innerWidth < 1024 && mediaKindOf(post) !== 'text') {
    mediaPane.openMobileFull(post, label)
  } else if (import.meta.client && window.innerWidth >= 1024) {
    mediaPane.openPost(post, label)
  } else {
    // Mobile plain-text thread: keep the fullscreen sheet for comments.
    mediaPane.openSmart(post, label)
  }
}

async function toggleRepost(postId: string) {
  const p = posts.value.find(x => x.id === postId)
  if (!p) return
  try {
    if (p.reposted) { await $fetch(`/api/posts/${postId}/unrepost`, { method: 'POST' }); p.reposted = false; p.repostCount = Math.max(0, (p.repostCount || 0) - 1) }
    else { await $fetch(`/api/posts/${postId}/repost`, { method: 'POST' }); p.reposted = true; p.repostCount = (p.repostCount || 0) + 1 }
  } catch {}
}
async function toggleBookmark(postId: string) {
  const p = posts.value.find(x => x.id === postId)
  if (!p) return
  try {
    const res = await $fetch<{ bookmarked: boolean }>('/api/bookmarks/toggle', { method: 'POST', body: { postId } })
    p.bookmarked = res.bookmarked
  } catch {}
}

/* Voice */
async function joinVoiceChannel(ch: any) {
  if (voiceChannelId.value === ch.id) {
    voiceChannelId.value = null
    await voice.leave()
    return
  }
  voiceChannelId.value = null
  await voice.join({
    roomKey: `server:${serverId.value}:${ch.id}`,
    joinPath: `/api/servers/${serverId.value}/channels/${ch.id}/voice/join`,
    leavePath: `/api/servers/${serverId.value}/channels/${ch.id}/voice/leave`,
    signalPath: `/api/servers/${serverId.value}/channels/${ch.id}/voice/signal`,
    label: `${server.value?.name || 'サーバー'} / ${ch.name}`,
    kind: 'server',
  })
  if (voice.status.value === 'active') voiceChannelId.value = ch.id
}

function openSettings(tab: string) {
  settingsTab.value = tab
  showSettings.value = true
}

function openChannelSettings(channelId: string) {
  settingsChannelId.value = channelId
  settingsTab.value = 'channels'
  showSettings.value = true
}

function memberName(member: any) {
  return member.nickname || member.user?.displayName || member.user?.username || '不明'
}

function deleteServerSafe() {
  navigateTo('/home')
}

const { on } = useRealtime()
let offRealtime: (() => void)[] = []

function handleServerUpdated(payload: any) {
  if (payload.serverId !== serverId.value) return
  fetchServerData()
}
function handleServerDeleted(payload: any) {
  if (payload.serverId !== serverId.value) return
  navigateTo('/home')
}

watch(serverId, () => {
  if (voiceChannelId.value) { voiceChannelId.value = null; voice.leave() }
  server.value = null; channels.value = []; members.value = []; roles.value = []; posts.value = []
  activeChannelId.value = null; loadError.value = null
  loadServer()
})

onMounted(async () => {
  offRealtime = [
    on('server.updated', handleServerUpdated),
    on('server.deleted', handleServerDeleted),
  ]
  await loadServer()
})

onUnmounted(() => {
  offRealtime.forEach(off => off())
  offRealtime = []
})
</script>

<template>
  <div class="h-full flex bg-[#0b0f19] text-slate-200 overflow-hidden">
    <!-- Channel Sidebar -->
    <aside class="w-56 bg-slate-900/60 flex flex-col shrink-0 border-r border-slate-800">
      <div class="h-12 px-3 flex items-center justify-between border-b border-slate-800 shrink-0">
        <h2 class="font-bold text-white truncate text-sm flex items-center gap-2 min-w-0">
          <div class="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0 overflow-hidden">
            <img v-if="server?.iconUrl" :src="server.iconUrl" class="w-full h-full object-cover" />
            <template v-else>{{ server?.name?.charAt(0) || '?' }}</template>
          </div>
          <span class="truncate">{{ server?.name || 'サーバー' }}</span>
        </h2>
        <button v-if="canManage" @click="openSettings('overview')" class="text-slate-500 hover:text-white transition">
          <Icon name="lucide:settings" class="w-4 h-4" />
        </button>
      </div>

      <div class="flex-1 overflow-y-auto p-2 space-y-0.5">
        <template v-for="group in groupedChannels" :key="group.type">
          <div class="flex items-center justify-between px-2 py-1 mt-2 first:mt-0">
            <span class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{{ group.label }}</span>
            <button v-if="canManage" @click="openSettings('channels')" class="text-slate-500 hover:text-white transition">
              <Icon name="lucide:plus" class="w-3.5 h-3.5" />
            </button>
          </div>
          <button
            v-for="ch in group.channels"
            :key="ch.id"
            @click="selectChannel(ch)"
            @contextmenu.prevent="canManage && openChannelSettings(ch.id)"
            :class="[
              'w-full text-left px-2 py-1.5 rounded-md transition flex items-center gap-1.5 text-sm',
              activeChannelId === ch.id ? 'bg-slate-700/60 text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            ]"
          >
            <Icon :name="channelIcon(ch.type)" class="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span class="truncate flex-1">{{ ch.name }}</span>
            <Icon v-if="ch.nsfw" name="lucide:alert-triangle" class="w-3 h-3 text-red-500" />
          </button>
        </template>

        <template v-if="voiceChannels.length">
          <div class="flex items-center justify-between px-2 py-1 mt-2">
            <span class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">音声チャンネル</span>
            <button v-if="canManage" @click="openSettings('channels')" class="text-slate-500 hover:text-white transition">
              <Icon name="lucide:plus" class="w-3.5 h-3.5" />
            </button>
          </div>
          <button
            v-for="ch in voiceChannels"
            :key="ch.id"
            @click="joinVoiceChannel(ch)"
            @contextmenu.prevent="canManage && openChannelSettings(ch.id)"
            :class="[
              'w-full text-left px-2 py-1.5 rounded-md transition flex items-center gap-1.5 text-sm',
              voiceChannelId === ch.id ? 'bg-emerald-700/40 text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            ]"
          >
            <Icon name="lucide:volume-2" class="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span class="truncate flex-1">{{ ch.name }}</span>
            <span v-if="voicePresence[`server:${serverId}:${ch.id}`]" class="text-[10px] text-emerald-400">
              {{ voicePresence[`server:${serverId}:${ch.id}`] }}
            </span>
          </button>
        </template>
      </div>

      <div class="p-3 border-t border-slate-800 shrink-0">
        <button @click="showMemberList = true" class="w-full flex items-center gap-2 text-sm text-slate-400 hover:text-white transition">
          <Icon name="lucide:users" class="w-4 h-4" />
          メンバー {{ members.length }}
        </button>
      </div>
    </aside>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col min-w-0">
      <div class="h-12 px-4 flex items-center border-b border-slate-800 shrink-0 gap-2">
        <Icon :name="channelIcon(activeChannel?.type)" class="w-4 h-4 text-slate-500 shrink-0" />
        <span class="font-bold text-white text-sm truncate">{{ activeChannel?.name || 'チャンネルを選択' }}</span>
        <span v-if="activeChannel?.description" class="text-xs text-slate-500 truncate hidden sm:inline">— {{ activeChannel.description }}</span>
        <button v-if="activeChannel && canManage" @click="openSettings('channels')" class="ml-1 text-slate-500 hover:text-white transition" title="チャンネル設定">
          <Icon name="lucide:settings-2" class="w-4 h-4" />
        </button>
        <button @click="showMemberList = true" class="ml-auto lg:hidden text-slate-500 hover:text-white transition" title="メンバー">
          <Icon name="lucide:users" class="w-4 h-4" />
        </button>
      </div>

      <!-- Posts -->
      <div class="flex-1 overflow-y-auto p-4 space-y-3">
        <div v-if="!activeChannelId" class="flex items-center justify-center h-full text-slate-500">
          チャンネルを選択してください
        </div>
        <template v-else>
          <div class="rounded-xl border border-slate-800 overflow-hidden bg-slate-900/20">
            <PostItem v-for="post in posts" :key="post.id" :post="post"
              :show-view-count="false" :current-user-id="undefined"
              @toggle-repost="toggleRepost" @toggle-bookmark="toggleBookmark"
              @open-media="openMedia" />
            <p v-if="!posts.length" class="text-center text-slate-500 py-8 text-sm">まだ投稿がありません。最初のメディアを投稿しましょう</p>
          </div>

          <div ref="postSentinel" class="h-1" aria-hidden="true"></div>
          <div v-if="loadingMorePosts" class="text-center text-slate-500 py-4 text-sm">読み込み中...</div>
          <p v-else-if="posts.length && !postHasMore" class="text-center text-slate-600 py-4 text-xs">すべて表示しました</p>
        </template>
      </div>

      <!-- Composer -->
      <div v-if="activeChannelId && canSend" class="px-4 pb-4 shrink-0">
        <div class="bg-slate-900/70 border border-slate-800 rounded-xl p-3">
          <PostComposer :media-kind="composerMediaKind" :placeholder="`${activeChannel?.name || ''} に投稿`" @submit="submitPost" />
        </div>
      </div>
      <div v-else-if="activeChannelId" class="px-4 pb-4 shrink-0 text-center text-sm text-slate-500">
        このサーバーで投稿する権限がありません
      </div>
    </div>

    <!-- Members drawer -->
    <Transition name="drawer">
      <div v-if="showMemberList" class="fixed inset-0 z-[80] flex justify-end" @click.self="showMemberList = false">
        <div class="absolute inset-0 bg-black/50" @click="showMemberList = false" />
        <aside class="relative w-64 bg-slate-900 border-l border-slate-800 h-full flex flex-col">
          <div class="h-12 px-4 flex items-center border-b border-slate-800 shrink-0">
            <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">メンバー — {{ members.length }}</span>
            <button @click="showMemberList = false" class="ml-auto text-slate-500 hover:text-white transition">
              <Icon name="lucide:x" class="w-4 h-4" />
            </button>
          </div>
          <div class="flex-1 overflow-y-auto p-3 space-y-1">
            <div v-for="member in members" :key="member.id" class="flex items-center gap-2.5 px-2 py-1.5 rounded-md hover:bg-slate-800/50 transition">
              <img v-if="avatarSrc(member.user?.avatarUrl)" :src="avatarSrc(member.user.avatarUrl)" class="w-8 h-8 rounded-full object-cover" />
              <div v-else class="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold text-xs">
                {{ memberName(member).charAt(0) }}
              </div>
              <div class="min-w-0 flex-1">
                <p class="text-sm text-slate-300 truncate">{{ memberName(member) }}</p>
                <p v-if="member.role" class="text-[10px] truncate" :style="{ color: member.role.color || '#99aab5' }">
                  {{ server?.ownerId === member.userId ? '所有者' : member.role.name }}
                </p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </Transition>

    <ServerSettingsModal
      v-if="showSettings"
      :server-id="serverId"
      :server="server"
      :channels="channels"
      :roles="roles"
      :members="members"
      :my-permissions="myPermissions"
      :is-owner="isOwner"
      :initial-tab="settingsTab"
      :initial-channel-id="settingsChannelId"
      @close="showSettings = false; settingsChannelId = null"
      @refresh="loadServer"
      @deleted="deleteServerSafe"
    />

    <div v-if="loading" class="fixed inset-0 z-40 flex items-center justify-center bg-[#0b0f19]/80">
      <div class="text-slate-500">読み込み中...</div>
    </div>

    <div v-if="loadError && !loading" class="fixed inset-0 z-40 flex items-center justify-center bg-[#0b0f19]/90">
      <div class="text-center space-y-3">
        <Icon name="lucide:alert-circle" class="w-10 h-10 text-red-500 mx-auto" />
        <p class="text-slate-400 text-sm">{{ loadError }}</p>
        <NuxtLink to="/home" class="inline-block px-5 py-2 rounded-lg bg-indigo-600 text-sm font-bold text-white hover:bg-indigo-700 transition">
          ホームへ戻る
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
.drawer-enter-active, .drawer-leave-active { transition: opacity 0.2s ease; }
.drawer-enter-from, .drawer-leave-to { opacity: 0; }
</style>
