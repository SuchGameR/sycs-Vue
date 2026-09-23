<script setup lang="ts">
const { map: customEmojiMap } = useCustomEmojis()
import ChatEditor from '~/components/ChatEditor.vue'

definePageMeta({ middleware: 'auth' })

const route = useRoute()
const channelId = computed(() => route.params.id as string)
const dmCache = useDmCache()
const messages = ref<any[]>([])
const messageDraft = ref('')
const chatEditor = ref<InstanceType<typeof ChatEditor> | null>(null)
const loading = ref(true)

const voice = useVoiceCall()
const voiceStatus = voice.status
const voiceIncoming = voice.incoming

const otherMember = ref<any>(null)
const blocked = ref(false)
const blockedBy = ref(false)
const blockingBusy = ref(false)
const typingName = ref('')
const sendError = ref('')
let typingTimer: ReturnType<typeof setTimeout> | null = null

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

const cached = dmCache.get(channelId.value)
if (cached) messages.value = cached

async function loadMessages() {
  loading.value = !dmCache.has(channelId.value)
  try {
    const data = await $fetch(`/api/dm/channels/${channelId.value}/messages`)
    messages.value = data.messages
    dmCache.set(channelId.value, data.messages)
  } catch { /* keep cached copy on failure */ }
  finally {
    loading.value = false
  }
}

async function loadChannelInfo() {
  try {
    const data = await $fetch<any>(`/api/dm/channels/${channelId.value}`)
    const ch = data.channel
    otherMember.value = ch.otherUser || null
    blocked.value = !!ch.blocked
    blockedBy.value = !!ch.blockedBy
    dmCache.set(channelId.value, messages.value)
  } catch { /* ignore */ }
}

let lastTypingSent = 0
const TYPING_INTERVAL = 2200

function onDraftUpdate(text: string) {
  messageDraft.value = text
  if (!text.trim() || blocked.value || blockedBy.value) return
  const now = Date.now()
  if (now - lastTypingSent > TYPING_INTERVAL) {
    lastTypingSent = now
    $fetch(`/api/dm/channels/${channelId.value}/typing`, { method: 'POST' }).catch(() => {})
  }
}

function handleTyping(p: any) {
  if (!p.channelId || p.channelId !== channelId.value) return
  if (!otherMember.value || p.userId !== otherMember.value.id) return
  typingName.value = otherMember.value.displayName || '相手'
  if (typingTimer) clearTimeout(typingTimer)
  typingTimer = setTimeout(() => { typingName.value = '' }, 4500)
}

async function toggleBlock() {
  if (!otherMember.value || blockingBusy.value) return
  if (!blocked.value) {
    if (!confirm(`${otherMember.value.displayName} さんをブロックしますか？ブロックするとこのDMへ送信できなくなります。`)) return
  }
  blockingBusy.value = true
  try {
    if (blocked.value) {
      await $fetch(`/api/users/${otherMember.value.id}/block`, { method: 'DELETE' })
      blocked.value = false
    } else {
      await $fetch(`/api/users/${otherMember.value.id}/block`, { method: 'POST' })
      blocked.value = true
    }
  } catch (e: any) {
    alert(e?.data?.message || '操作できませんでした')
  } finally {
    blockingBusy.value = false
  }
}

async function sendMessage(text?: string) {
  const content = (text ?? messageDraft.value).trim()
  if (!content) return
  if (blocked.value || blockedBy.value) return
  try {
    const data = await $fetch(`/api/dm/channels/${channelId.value}/messages`, {
      method: 'POST',
      body: { content },
    })
    if (data.message) {
      messages.value.push(data.message)
      dmCache.append(channelId.value, data.message)
    }
    chatEditor.value?.clear()
    chatEditor.value?.focus()
  } catch (e: any) {
    sendError.value = e?.data?.message || 'メッセージを送信できませんでした'
    setTimeout(() => { sendError.value = '' }, 4000)
  }
}

async function startCall() {
  await voice.join(dmVoiceConfig())
}

const { data: me } = await useFetch('/api/auth/me', { key: 'dm-chat-me' })

const editingId = ref<string | null>(null)
const editDraft = ref('')

function startEdit(msg: any) {
  editingId.value = msg.id
  editDraft.value = msg.content
}

function cancelEdit() {
  editingId.value = null
  editDraft.value = ''
}

async function saveEdit() {
  const msgId = editingId.value
  const content = editDraft.value.trim()
  if (!msgId || !content) return
  try {
    const data = await $fetch(`/api/dm/channels/${channelId.value}/messages/${msgId}`, {
      method: 'PATCH',
      body: { content },
    })
    if (data.message) {
      const i = messages.value.findIndex((m: any) => m.id === msgId)
      if (i >= 0) messages.value[i] = data.message
      dmCache.update(channelId.value, data.message)
    }
  } catch (e: any) {
    alert(e?.data?.message || 'メッセージを編集できませんでした')
  } finally {
    editingId.value = null
    editDraft.value = ''
  }
}

function onEditKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    saveEdit()
  }
}

const historyMessage = ref<any>(null)
const historyEdits = ref<any[]>([])
const historyLoading = ref(false)

async function showHistory(msg: any) {
  historyLoading.value = true
  historyMessage.value = msg
  historyEdits.value = []
  try {
    const data = await $fetch(`/api/dm/channels/${channelId.value}/messages/${msg.id}/edits`)
    historyEdits.value = data.edits || []
    historyMessage.value = { ...msg, content: data.message?.content ?? msg.content }
  } catch { /* no history */ }
  finally {
    historyLoading.value = false
  }
}

function closeHistory() {
  historyMessage.value = null
  historyEdits.value = []
}

const { on } = useRealtime()
let offDm: (() => void)[] = []

function handleDmMessage(p: any) {
  if (!p.channelId || p.channelId !== channelId.value) return
  if (!p.message?.id) return
  if (messages.value.some(m => m.id === p.message.id)) return
  messages.value.push(p.message)
  dmCache.append(channelId.value, p.message)
}

function handleDmMessageEdited(p: any) {
  if (!p.channelId || p.channelId !== channelId.value) return
  if (!p.message?.id) return
  const i = messages.value.findIndex((m: any) => m.id === p.message.id)
  if (i >= 0) messages.value[i] = p.message
  dmCache.update(channelId.value, p.message)
  if (historyMessage.value?.id === p.message.id) historyMessage.value = p.message
}

onMounted(async () => {
  await loadMessages()
  await loadChannelInfo()
  useUnread().markDmRead(channelId.value)
  voice.watchRoom(dmVoiceConfig())
  offDm = [
    on('dm.message', handleDmMessage),
    on('dm.message.edited', handleDmMessageEdited),
    on('dm.typing', handleTyping),
  ]
})

onUnmounted(() => {
  offDm.forEach(off => off())
  if (typingTimer) clearTimeout(typingTimer)
})

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'たった今'
  if (minutes < 60) return `${minutes}分前`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}時間前`
  return `${Math.floor(hours / 24)}日前`
}

function formatDateTime(date: string) {
  const d = new Date(date)
  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
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
          <img v-if="avatarSrc(otherMember?.avatarUrl)" :src="avatarSrc(otherMember?.avatarUrl)" loading="lazy" class="w-full h-full object-cover" />
          <template v-else>{{ otherMember?.displayName?.charAt(0) || '?' }}</template>
        </div>
        <div class="min-w-0">
          <div class="flex items-center gap-1.5">
            <span class="font-bold text-white truncate block">{{ otherMember?.displayName || 'DM' }}</span>
            <Icon v-if="blocked" name="lucide:ban" class="w-3.5 h-3.5 text-red-400 shrink-0" title="ブロック中" />
          </div>
          <span v-if="otherMember?.username" class="text-xs text-slate-500 truncate block">@{{ otherMember.username }}</span>
          <span v-if="otherMember?.statusMessage" class="text-[11px] text-emerald-400/90 truncate block flex items-center gap-1">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 inline-block"></span>{{ otherMember.statusMessage }}
          </span>
          <span v-else-if="blockedBy" class="text-[11px] text-slate-500 truncate block">このユーザーにブロックされています</span>
        </div>
      </div>
      <div class="flex items-center gap-1.5 shrink-0">
        <button
          v-if="otherMember"
          @click="toggleBlock"
          :disabled="blockingBusy"
          :title="blocked ? 'ブロックを解除' : 'ブロック'"
          class="p-2 rounded-lg transition shrink-0 disabled:opacity-50"
          :class="blocked ? 'text-red-400 hover:text-red-300' : 'text-slate-500 hover:text-red-400'"
        >
          <Icon v-if="blockingBusy" name="lucide:loader-2" class="w-4 h-4 animate-spin" />
          <Icon v-else :name="blocked ? 'lucide:shield-check' : 'lucide:ban'" class="w-4 h-4" />
        </button>
        <button
          v-if="voiceStatus === 'idle' && !voiceIncoming"
          @click="startCall"
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 text-sm font-bold text-white hover:bg-indigo-700 transition shrink-0"
        >
          <Icon name="lucide:phone" class="w-4 h-4" />
          通話
        </button>
      </div>
    </div>

    <div class="flex-1 overflow-y-auto space-y-3 mb-4">
      <div v-if="loading && !messages.length" class="text-center text-slate-500 py-8">読み込み中...</div>
      <div v-else-if="!messages.length" class="text-center text-slate-500 py-8">
        <p>メッセージを送信してみましょう</p>
      </div>
      <div v-for="msg in messages" :key="msg.id" class="flex gap-3 group">
<div class="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-xs shrink-0 mt-0.5 overflow-hidden">
          <img v-if="avatarSrc(msg.sender?.avatarUrl)" :src="avatarSrc(msg.sender?.avatarUrl)" loading="lazy" class="w-full h-full object-cover" />
          <template v-else>{{ msg.sender?.displayName?.charAt(0) || '?' }}</template>
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2">
            <span class="font-bold text-white text-sm">{{ msg.sender?.displayName || '不明' }}</span>
            <span class="text-xs text-slate-600">{{ timeAgo(msg.createdAt) }}</span>
            <span v-if="msg.edited" class="text-xs text-slate-500">編集済み</span>
            <button v-if="msg.sender?.id === me?.user?.id && editingId !== msg.id" @click="startEdit(msg)"
              class="text-slate-600 hover:text-indigo-400 transition hidden group-hover:inline-flex" title="編集">
              <Icon name="lucide:pencil" class="w-3.5 h-3.5" />
            </button>
          </div>
          <template v-if="editingId === msg.id">
            <textarea v-model="editDraft" rows="3" @keydown="onEditKeydown"
              class="w-full bg-slate-800 border border-indigo-500 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none resize-none"
              placeholder="メッセージを編集（Enterで保存 / Shift+Enterで改行）" />
            <div class="flex gap-2 mt-1.5">
              <button @click="saveEdit" class="px-3 py-1 rounded-lg bg-indigo-600 text-xs font-bold text-white hover:bg-indigo-700 transition">保存</button>
              <button @click="cancelEdit" class="px-3 py-1 rounded-lg border border-slate-700 text-xs text-slate-300 hover:bg-slate-800 transition">キャンセル</button>
            </div>
          </template>
          <template v-else>
            <p class="text-slate-300 text-sm whitespace-pre-wrap break-words" v-html="renderRichText(msg.content, { custom: customEmojiMap })" />
            <button v-if="msg.edited || msg.sender?.id === me?.user?.id" @click="showHistory(msg)"
              class="text-xs text-slate-600 hover:text-indigo-400 transition mt-0.5">
              編集履歴を見る
            </button>
          </template>
        </div>
      </div>
    </div>

    <div v-if="blocked || blockedBy" class="shrink-0 mb-2 text-sm text-center py-2 rounded-lg border bg-slate-900/60 border-red-800/60 text-red-300">
      {{ blockedBy ? 'ブロックされているため、このDMには送信できません' : 'ブロック中のため、このDMには送信できません' }}
    </div>

    <div v-else class="flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 shrink-0">
      <div class="flex-1 min-w-0">
        <ChatEditor
          ref="chatEditor"
          placeholder="メッセージを入力（Enterで送信 / Shift+Enterで改行）"
          @submit="sendMessage"
          @update="onDraftUpdate"
        />
        <Transition name="typing-fade">
          <p v-if="typingName" class="text-[11px] text-slate-500 mt-1 flex items-center gap-1.5">
            <span class="w-1.5 h-1.5 rounded-full bg-indigo-400 inline-block animate-pulse"></span>{{ typingName }}さんが入力中...
          </p>
        </Transition>
      </div>
      <div class="flex flex-col items-end shrink-0">
        <button @click="sendMessage()" :disabled="!messageDraft.trim()" class="text-indigo-400 hover:text-indigo-300 transition disabled:opacity-50 shrink-0">
          <Icon name="lucide:send" class="w-4 h-4" />
        </button>
        <Transition name="typing-fade">
          <p v-if="sendError" class="text-[10px] text-red-400 mt-1 max-w-[180px] truncate" :title="sendError">{{ sendError }}</p>
        </Transition>
      </div>
    </div>

    <div v-if="historyMessage" class="fixed inset-0 bg-black/60 flex items-center justify-center z-[60]" @click.self="closeHistory">
      <div class="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-md mx-4 p-5 shadow-2xl">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-bold text-white flex items-center gap-2"><Icon name="lucide:history" class="w-4 h-4 text-indigo-400" /> 編集履歴</h3>
          <button @click="closeHistory" class="text-slate-500 hover:text-white transition"><Icon name="lucide:x" class="w-5 h-5" /></button>
        </div>
        <p v-if="historyLoading" class="text-sm text-slate-500">読み込み中...</p>
        <template v-else>
          <div v-if="!historyEdits.length" class="text-sm text-slate-400 bg-slate-800/50 border border-slate-800 rounded-lg p-3 mb-2">
            このメッセージはまだ編集されていません。
          </div>
          <div v-for="(edit, idx) in historyEdits" :key="edit.id" class="mb-2">
            <p class="text-[11px] text-slate-500 mb-0.5">{{ idx + 1 }}回目の編集・{{ formatDateTime(edit.editedAt) }}</p>
            <p class="text-sm text-slate-400 bg-slate-800/50 border border-slate-800 rounded-lg p-3 whitespace-pre-wrap break-words">{{ edit.content }}</p>
          </div>
          <div>
            <p class="text-[11px] text-emerald-500 mb-0.5">現在のメッセージ</p>
            <p class="text-sm text-slate-200 bg-indigo-900/30 border border-indigo-800/60 rounded-lg p-3 whitespace-pre-wrap break-words">{{ historyMessage.content }}</p>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
.typing-fade-enter-active, .typing-fade-leave-active { transition: opacity 0.18s ease; }
.typing-fade-enter-from, .typing-fade-leave-to { opacity: 0; }
</style>