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
</script>

<template>
  <div class="max-w-2xl mx-auto p-4 space-y-4">
    <h1 class="text-2xl font-bold text-white">DM</h1>

    <div v-if="loading" class="text-center text-slate-500 py-8">読み込み中...</div>
    <div v-else-if="!channels.length" class="text-center text-slate-500 py-8">
      <p>まだDMチャンネルがありません</p>
    </div>
    <div v-else class="space-y-2">
      <NuxtLink
        v-for="ch in channels"
        :key="ch.id"
        :to="`/dm/${ch.id}`"
        class="flex items-center gap-3 p-3 bg-slate-800/30 rounded-xl hover:bg-slate-800/50 transition"
      >
        <div class="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold shrink-0 overflow-hidden">
          <img v-if="avatarSrc(otherMembers(ch)[0]?.avatarUrl)" :src="avatarSrc(otherMembers(ch)[0]?.avatarUrl)" class="w-full h-full object-cover" />
          <template v-else>{{ otherMembers(ch)[0]?.displayName?.charAt(0) || '?' }}</template>
        </div>
        <div class="min-w-0 flex-1">
          <div class="flex items-center justify-between gap-2">
            <p class="text-sm font-bold text-white truncate">{{ otherMembers(ch).map((m: any) => m.displayName).join(', ') || '不明' }}
              <span class="text-xs font-normal text-slate-500">@{{ otherMembers(ch).map((m: any) => m.username).join(', @') || '?' }}</span>
            </p>
            <span class="flex items-center gap-1.5 shrink-0">
              <span v-if="unread.hasDmUnread(ch.id)" class="min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[11px] font-bold flex items-center justify-center">1</span>
              <span v-if="ch.lastMessage?.createdAt" class="text-[11px] text-slate-600">{{ timeAgo(ch.lastMessage.createdAt) }}</span>
            </span>
          </div>
          <p v-if="ch.lastMessage" class="text-xs text-slate-400 truncate">
            <span :class="unread.hasDmUnread(ch.id) ? 'text-slate-200' : 'text-slate-300'">{{ ch.lastMessage.sender?.displayName }}<span v-if="ch.lastMessage.edited" class="text-slate-500">（編集済み）</span>: </span>{{ ch.lastMessage.content }}
          </p>
          <p v-else class="text-xs text-slate-500">DMを開く</p>
          <p v-if="otherMembers(ch)[0]?.statusMessage" class="text-[11px] text-emerald-400/80 truncate flex items-center gap-1 mt-0.5">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 inline-block"></span>{{ otherMembers(ch)[0].statusMessage }}
          </p>
        </div>
      </NuxtLink>
    </div>
  </div>
</template>