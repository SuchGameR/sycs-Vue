<script setup lang="ts">
const { map: customEmojiMap } = useCustomEmojis()
import ChatEditor from '~/components/ChatEditor.vue'

definePageMeta({ middleware: 'auth' })

const route = useRoute()
const channelId = computed(() => route.params.id as string)
const messages = ref<any[]>([])
const messageDraft = ref('')
const chatEditor = ref<InstanceType<typeof ChatEditor> | null>(null)
const loading = ref(true)

const voice = useVoiceCall()
const voiceStatus = voice.status
const voiceIncoming = voice.incoming

const otherMember = ref<any>(null)

function dmVoiceConfig() {
  const id = channelId.value
  return {
    roomKey: `dm:${id}`,
    joinPath: `/api/dm/channels/${id}/voice/join`,
    leavePath: `/api/dm/channels/${id}/voice/leave`,
    signalPath: `/api/dm/channels/${id}/voice/signal`,
    label: otherMember.value?.displayName || 'DM通話',
    kind: 'dm' as const,
  }
}

async function loadMessages() {
  loading.value = true
  try {
    const data = await $fetch(`/api/dm/channels/${channelId.value}/messages`)
    messages.value = data.messages
  } finally {
    loading.value = false
  }
}

async function loadChannelInfo() {
  try {
    const data = await $fetch('/api/dm/channels')
    const ch = data.channels.find((c: any) => c.id === channelId.value)
    if (ch) {
      const others = ch.members?.filter((m: any) => m.id !== me.value?.user?.id) || []
      otherMember.value = others[0] || null
    }
  } catch { /* ignore */ }
}

onMounted(async () => {
  await loadMessages()
  await loadChannelInfo()
  voice.watchRoom(dmVoiceConfig())
})

onUnmounted(() => {
  voice.unwatchRoom(`dm:${channelId.value}`)
})

async function sendMessage(text?: string) {
  const content = (text ?? messageDraft.value).trim()
  if (!content) return
  const data = await $fetch(`/api/dm/channels/${channelId.value}/messages`, {
    method: 'POST',
    body: { content },
  })
  messages.value.push(data.message)
  chatEditor.value?.clear()
  chatEditor.value?.focus()
}

async function startCall() {
  await voice.join(dmVoiceConfig())
}

const { data: me } = await useFetch('/api/auth/me', { key: 'dm-chat-me' })

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'たった今'
  if (minutes < 60) return `${minutes}分前`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}時間前`
  return `${Math.floor(hours / 24)}日前`
}
</script>

<template>
  <div class="max-w-2xl mx-auto p-4 h-[calc(100vh-56px-32px)] flex flex-col">
    <NuxtLink to="/dm" class="text-sm text-slate-500 hover:text-white transition mb-4 flex items-center gap-1">
      <Icon name="lucide:arrow-left" class="w-4 h-4" />
      DM一覧に戻る
    </NuxtLink>

    <div class="flex items-center justify-between mb-4 shrink-0">
      <div class="flex items-center gap-2.5 min-w-0">
        <div class="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shrink-0 overflow-hidden">
          <img v-if="otherMember?.avatarUrl" :src="otherMember.avatarUrl" class="w-full h-full object-cover" />
          <template v-else>{{ otherMember?.displayName?.charAt(0) || '?' }}</template>
        </div>
        <span class="font-bold text-white truncate">{{ otherMember?.displayName || 'DM' }}</span>
      </div>
      <button
        v-if="voiceStatus === 'idle' && !voiceIncoming"
        @click="startCall"
        class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 text-sm font-bold text-white hover:bg-indigo-700 transition shrink-0"
      >
        <Icon name="lucide:phone" class="w-4 h-4" />
        通話
      </button>
    </div>

    <div class="flex-1 overflow-y-auto space-y-3 mb-4">
      <div v-if="loading" class="text-center text-slate-500 py-8">読み込み中...</div>
      <div v-else-if="!messages.length" class="text-center text-slate-500 py-8">
        <p>メッセージを送信してみましょう</p>
      </div>
      <div v-for="msg in messages" :key="msg.id" class="flex gap-3">
        <div class="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-xs shrink-0 mt-0.5 overflow-hidden">
          <img v-if="msg.sender?.avatarUrl" :src="msg.sender.avatarUrl" class="w-full h-full object-cover" />
          <template v-else>{{ msg.sender?.displayName?.charAt(0) || '?' }}</template>
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2">
            <span class="font-bold text-white text-sm">{{ msg.sender?.displayName || '不明' }}</span>
            <span class="text-xs text-slate-600">{{ timeAgo(msg.createdAt) }}</span>
          </div>
          <p class="text-slate-300 text-sm whitespace-pre-wrap break-words" v-html="renderRichText(msg.content, { custom: customEmojiMap })" />
        </div>
      </div>
    </div>

    <div class="flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 shrink-0">
      <ChatEditor
        ref="chatEditor"
        placeholder="メッセージを入力（Enterで送信 / Shift+Enterで改行）"
        @submit="sendMessage"
        @update="messageDraft = $event"
      />
      <button @click="sendMessage()" :disabled="!messageDraft.trim()" class="text-indigo-400 hover:text-indigo-300 transition disabled:opacity-50 shrink-0">
        <Icon name="lucide:send" class="w-4 h-4" />
      </button>
    </div>
  </div>
</template>
