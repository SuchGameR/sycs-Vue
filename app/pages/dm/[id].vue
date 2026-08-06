<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const route = useRoute()
const channelId = computed(() => route.params.id as string)
const messages = ref<any[]>([])
const messageInput = ref('')
const loading = ref(true)

const voice = useVoiceCall({ ring: true })
const voiceStatus = voice.status
const voiceMembers = voice.members
const voiceError = voice.errorMsg
const voiceMuted = voice.muted
const voiceIncoming = voice.incomingCaller

const otherMember = ref<any>(null)

function dmVoiceConfig() {
  const id = channelId.value
  return {
    roomKey: `dm:${id}`,
    joinPath: `/api/dm/channels/${id}/voice/join`,
    leavePath: `/api/dm/channels/${id}/voice/leave`,
    signalPath: `/api/dm/channels/${id}/voice/signal`,
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
  voice.setChannel(dmVoiceConfig())
})

onUnmounted(() => {
  voice.cleanup()
  voice.leave()
})

async function sendMessage() {
  if (!messageInput.value.trim()) return
  const data = await $fetch(`/api/dm/channels/${channelId.value}/messages`, {
    method: 'POST',
    body: { content: messageInput.value },
  })
  messages.value.push(data.message)
  messageInput.value = ''
}

async function startCall() {
  voice.setChannel(dmVoiceConfig())
  await voice.join()
}

function acceptIncomingCall() {
  voice.setChannel(dmVoiceConfig())
  voice.acceptCall()
}

async function endCall() {
  await voice.leave()
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
          <p class="text-slate-300 text-sm whitespace-pre-wrap break-words">{{ msg.content }}</p>
        </div>
      </div>
    </div>

    <div v-if="voiceError && voiceStatus === 'idle'" class="mb-3 shrink-0 bg-red-950/60 border border-red-800/50 rounded-lg px-4 py-2 text-sm text-red-300 flex items-center justify-between gap-3">
      <span>{{ voiceError }}</span>
      <button @click="voiceError = null" class="text-red-400 hover:text-white transition shrink-0">
        <Icon name="lucide:x" class="w-4 h-4" />
      </button>
    </div>

    <div v-if="voiceStatus === 'active' || voiceStatus === 'connecting'" class="mb-3 shrink-0 bg-slate-900 border border-emerald-800/50 rounded-lg px-4 py-2 flex items-center gap-2">
      <Icon name="lucide:volume-2" class="w-4 h-4 text-emerald-400 shrink-0" />
      <span v-if="voiceStatus === 'connecting'" class="text-sm text-slate-400">接続中...</span>
      <span v-else class="text-sm font-bold text-white">{{ otherMember?.displayName || '通話中' }}</span>
      <span v-if="voiceStatus === 'active'" class="text-xs text-emerald-400">通話中</span>
      <div class="ml-auto flex items-center gap-1 shrink-0">
        <button
          @click="voice.toggleMute()"
          class="p-1.5 rounded-md hover:bg-slate-800 transition"
          :title="voiceMuted ? 'ミュート解除' : 'ミュート'"
        >
          <Icon :name="voiceMuted ? 'lucide:mic-off' : 'lucide:mic'" class="w-4 h-4" :class="voiceMuted ? 'text-red-400' : 'text-slate-400'" />
        </button>
        <button @click="endCall" class="p-1.5 rounded-md hover:bg-red-600/20 transition" title="通話を終了">
          <Icon name="lucide:phone-off" class="w-4 h-4 text-red-400" />
        </button>
      </div>
    </div>

    <div class="flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 shrink-0">
      <input
        v-model="messageInput"
        @keydown.enter.prevent="sendMessage"
        type="text"
        placeholder="メッセージを入力"
        class="flex-1 bg-transparent border-none focus:ring-0 text-sm text-slate-200 placeholder-slate-500"
      />
      <button @click="sendMessage" :disabled="!messageInput.trim()" class="text-indigo-400 hover:text-indigo-300 transition disabled:opacity-50">
        <Icon name="lucide:send" class="w-4 h-4" />
      </button>
    </div>

    <!-- Incoming call -->
    <div v-if="voiceIncoming && voiceStatus === 'idle'" class="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div class="bg-[#151a24] border border-slate-700 rounded-2xl p-8 w-80 text-center space-y-4">
        <div class="w-20 h-20 mx-auto rounded-full bg-indigo-600 flex items-center justify-center text-2xl font-bold text-white overflow-hidden">
          <img v-if="voiceIncoming.avatarUrl" :src="voiceIncoming.avatarUrl" class="w-full h-full object-cover" />
          <template v-else>{{ voiceIncoming.displayName?.charAt(0) || '?' }}</template>
        </div>
        <div>
          <p class="text-white font-bold">着信中...</p>
          <p class="text-slate-400 text-sm mt-1">{{ voiceIncoming.displayName }} から通話が届いています</p>
        </div>
        <div class="flex justify-center gap-5">
          <button @click="voice.declineCall()" class="w-14 h-14 rounded-full bg-red-600 hover:bg-red-700 transition flex items-center justify-center">
            <Icon name="lucide:phone-off" class="w-6 h-6 text-white" />
          </button>
          <button @click="acceptIncomingCall" class="w-14 h-14 rounded-full bg-green-600 hover:bg-green-700 transition flex items-center justify-center">
            <Icon name="lucide:phone" class="w-6 h-6 text-white" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
