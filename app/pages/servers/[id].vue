<script setup lang="ts">
import { PERMISSIONS, hasPermission } from '~/utils/serverPermissions'

definePageMeta({ middleware: 'auth' })

const route = useRoute()
const serverId = computed(() => route.params.id as string)

const server = ref<any>(null)
const channels = ref<any[]>([])
const members = ref<any[]>([])
const roles = ref<any[]>([])
const messages = ref<any[]>([])
const loading = ref(true)
const loadError = ref<string | null>(null)
const activeChannelId = ref<string | null>(null)
const messageInput = ref('')
const showMemberList = ref(true)
const showSettings = ref(false)
const settingsTab = ref('overview')
const settingsChannelId = ref<string | null>(null)

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

const messageListEl = ref<HTMLElement | null>(null)
let scrolledToBottom = true

async function fetchServerData() {
  const data = await $fetch(`/api/servers/${serverId.value}`)
  server.value = data.server
  channels.value = data.channels
  members.value = data.members
  roles.value = data.roles
  myPermissions.value = data.myPermissions || 0
  isOwner.value = !!data.isOwner
  if (channels.value.length && !channels.value.some(c => c.id === activeChannelId.value)) {
    activeChannelId.value = channels.value[0].id
  }
  if (activeChannelId.value) {
    await loadMessages()
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

async function loadMessages() {
  if (!activeChannelId.value) return
  try {
    const data = await $fetch(`/api/servers/${serverId.value}/channels/${activeChannelId.value}/messages`)
    messages.value = data.messages
  } catch (e: any) {
    messages.value = []
    loadError.value = e?.data?.message || null
  }
}

function handleMessageNew(payload: any) {
  if (payload.serverId !== serverId.value || payload.channelId !== activeChannelId.value) return
  if (!payload.message?.id) return
  if (messages.value.some(m => m.id === payload.message.id)) return
  messages.value.push(payload.message)
}

function handleServerUpdated(payload: any) {
  if (payload.serverId !== serverId.value) return
  fetchServerData()
}

async function handleServerDeleted(payload: any) {
  if (payload.serverId !== serverId.value) return
  await navigateTo('/home')
}

function onMessagesScroll() {
  const el = messageListEl.value
  if (!el) return
  scrolledToBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80
}

function scrollMessagesToBottom(force = false) {
  const el = messageListEl.value
  if (!el) return
  if (force || scrolledToBottom) el.scrollTop = el.scrollHeight
}

watch(() => messages.value.length, () => {
  nextTick(() => scrollMessagesToBottom())
})

function selectChannel(ch: any) {
  if (activeChannelId.value === ch.id) return
  activeChannelId.value = ch.id
  scrolledToBottom = true
  loadMessages().then(() => nextTick(() => scrollMessagesToBottom(true)))
}

async function sendMessage() {
  if (!messageInput.value.trim() || !activeChannelId.value) return
  const content = messageInput.value
  try {
    await $fetch(`/api/servers/${serverId.value}/channels/${activeChannelId.value}/messages`, {
      method: 'POST',
      body: { content },
    })
    messageInput.value = ''
    await loadMessages()
  } catch (e: any) {
    alert(e?.data?.message || '送信に失敗しました')
  }
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

async function deleteServer() {
  await navigateTo('/servers')
}

function memberName(member: any) {
  return member.nickname || member.user?.displayName || member.user?.username || '不明'
}

const { on } = useRealtime()

watch(serverId, () => {
  server.value = null
  channels.value = []
  members.value = []
  roles.value = []
  messages.value = []
  activeChannelId.value = null
  loadError.value = null
  loadServer()
})

onMounted(async () => {
  offRealtime = [
    on('message.new', handleMessageNew),
    on('server.updated', handleServerUpdated),
    on('server.deleted', handleServerDeleted),
  ]
  await loadServer()
})

let offRealtime: (() => void)[] = []

onUnmounted(() => {
  offRealtime.forEach(off => off())
  offRealtime = []
})

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'たった今'
  if (minutes < 60) return `${minutes}分前`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}時間前`
  const days = Math.floor(hours / 24)
  return `${days}日前`
}
</script>

<template>
  <div class="h-full flex bg-[#0b0f19] text-slate-200 overflow-hidden">
    <!-- Channel Sidebar -->
    <aside class="w-60 bg-slate-900 flex flex-col shrink-0 border-r border-slate-800">
      <div class="h-12 px-4 flex items-center justify-between border-b border-slate-800 shrink-0">
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
        <div class="flex items-center justify-between px-2 py-1">
          <span class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">テキストチャンネル</span>
          <button v-if="canManage" @click="openSettings('channels')" class="text-slate-500 hover:text-white transition">
            <Icon name="lucide:plus" class="w-3.5 h-3.5" />
          </button>
        </div>
        <button
          v-for="ch in channels"
          :key="ch.id"
          @click="selectChannel(ch)"
          @contextmenu.prevent="canManage && openChannelSettings(ch.id)"
          :title="canManage ? '右クリックでチャンネル設定' : undefined"
          :class="[
            'w-full text-left px-2 py-1.5 rounded-md transition flex items-center gap-1.5 text-sm',
            activeChannelId === ch.id
              ? 'bg-slate-700/50 text-white'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          ]"
        >
          <span class="text-slate-500">#</span>
          <span class="truncate flex-1">{{ ch.name }}</span>
          <Icon v-if="ch.nsfw" name="lucide:alert-triangle" class="w-3 h-3 text-red-500" />
        </button>
      </div>
      <div class="p-3 border-t border-slate-800 shrink-0">
        <NuxtLink to="/home" class="flex items-center gap-2 text-sm text-slate-500 hover:text-white transition">
          <Icon name="lucide:arrow-left" class="w-4 h-4" />
          タイムラインに戻る
        </NuxtLink>
      </div>
    </aside>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col min-w-0">
      <!-- Channel Header -->
      <div class="h-12 px-4 flex items-center border-b border-slate-800 shrink-0 gap-2">
        <button @click="showMemberList = !showMemberList" class="lg:hidden text-slate-500 hover:text-white mr-1">
          <Icon name="lucide:users" class="w-4 h-4" />
        </button>
        <span class="text-slate-500 font-semibold text-lg">#</span>
        <span class="font-bold text-white text-sm">{{ activeChannel?.name || 'チャンネルを選択' }}</span>
        <button
          v-if="activeChannel && canManage"
          @click="openSettings('channels')"
          class="ml-1 text-slate-500 hover:text-white transition"
          title="チャンネル設定"
        >
          <Icon name="lucide:settings-2" class="w-4 h-4" />
        </button>
      </div>

      <!-- Messages -->
      <div ref="messageListEl" @scroll="onMessagesScroll" class="flex-1 overflow-y-auto p-4 space-y-3">
        <div v-if="!activeChannelId" class="flex items-center justify-center h-full text-slate-500">
          チャンネルを選択してください
        </div>
        <template v-else>
          <div v-for="msg in messages" :key="msg.id" class="flex gap-3 group">
            <img
              v-if="msg.user?.avatarUrl"
              :src="msg.user.avatarUrl"
              class="w-9 h-9 rounded-full mt-0.5 object-cover shrink-0"
            />
            <div v-else class="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-xs shrink-0 mt-0.5">
              {{ msg.user?.displayName?.charAt(0) || '?' }}
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2">
                <span class="font-bold text-white text-sm hover:underline cursor-pointer">{{ msg.user?.displayName || '不明' }}</span>
                <span class="text-[11px] text-slate-600">{{ timeAgo(msg.createdAt) }}</span>
              </div>
              <p class="text-slate-300 text-sm whitespace-pre-wrap break-words">{{ msg.content }}</p>
            </div>
          </div>
          <div v-if="!messages.length" class="text-center text-slate-500 py-8">
            <p class="text-sm">メッセージはまだありません</p>
            <p class="text-xs text-slate-600 mt-1">最初のメッセージを送信しましょう</p>
          </div>
        </template>
      </div>

      <!-- Message Input -->
      <div v-if="activeChannelId" class="px-4 pb-4 shrink-0">
        <div v-if="canSend" class="flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2">
          <input
            v-model="messageInput"
            @keydown.enter.prevent="sendMessage"
            type="text"
            :placeholder="`#${activeChannel?.name || ''} にメッセージを送信`"
            class="flex-1 bg-transparent border-none focus:ring-0 text-sm text-slate-200 placeholder-slate-500"
          />
          <button
            @click="sendMessage"
            :disabled="!messageInput.trim()"
            class="text-indigo-400 hover:text-indigo-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Icon name="lucide:send" class="w-4 h-4" />
          </button>
        </div>
        <div v-else class="bg-slate-900 border border-slate-800 rounded-lg px-4 py-3 text-sm text-slate-500 text-center">
          このサーバーでメッセージを送信する権限がありません
        </div>
      </div>
    </div>

    <!-- Member List -->
    <aside
      v-if="showMemberList"
      class="w-60 bg-slate-900/50 flex flex-col shrink-0 border-l border-slate-800 hidden lg:flex"
    >
      <div class="h-12 px-4 flex items-center border-b border-slate-800 shrink-0">
        <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">メンバー — {{ members.length }}</span>
        <button v-if="canManage" @click="openSettings('members')" class="ml-auto text-slate-500 hover:text-white transition">
          <Icon name="lucide:settings-2" class="w-4 h-4" />
        </button>
      </div>
      <div class="flex-1 overflow-y-auto p-3 space-y-1">
        <div v-for="member in members" :key="member.id" class="flex items-center gap-2.5 px-2 py-1.5 rounded-md hover:bg-slate-800/50 transition">
          <div class="relative">
            <img
              v-if="member.user?.avatarUrl"
              :src="member.user.avatarUrl"
              class="w-8 h-8 rounded-full object-cover"
            />
            <div v-else class="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold text-xs">
              {{ memberName(member).charAt(0) }}
            </div>
            <div class="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-500 border-2 border-slate-900" />
          </div>
          <div class="min-w-0 flex-1">
            <p class="text-sm text-slate-300 truncate">{{ memberName(member) }}</p>
            <p v-if="member.role" class="text-[10px] truncate" :style="{ color: member.role.color || '#99aab5' }">
              {{ server?.ownerId === member.userId ? '所有者' : member.role.name }}
            </p>
            <p v-else-if="server?.ownerId === member.userId" class="text-[10px] text-amber-400">所有者</p>
          </div>
        </div>
      </div>
    </aside>

    <!-- Server Settings Modal -->
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
      @deleted="deleteServer"
    />

    <!-- Loading overlay -->
    <div v-if="loading" class="fixed inset-0 z-40 flex items-center justify-center bg-[#0b0f19]/80">
      <div class="text-slate-500">読み込み中...</div>
    </div>

    <!-- Error state -->
    <div v-if="loadError && !loading" class="fixed inset-0 z-40 flex items-center justify-center bg-[#0b0f19]/90">
      <div class="text-center space-y-3">
        <Icon name="lucide:alert-circle" class="w-10 h-10 text-red-500 mx-auto" />
        <p class="text-slate-400 text-sm">{{ loadError }}</p>
        <NuxtLink to="/servers" class="inline-block px-5 py-2 rounded-lg bg-indigo-600 text-sm font-bold text-white hover:bg-indigo-700 transition">
          サーバー一覧へ戻る
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
