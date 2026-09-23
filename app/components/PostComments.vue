<script setup lang="ts">
const { map: customEmojiMap } = useCustomEmojis()

const props = defineProps<{
  post: any
}>()
const emit = defineEmits<{ update: [postId: string, patch: any] }>()

const { on } = useRealtime()
const me = useState<any>('comments-me', () => null)

const comments = ref<any[]>([])
const loading = ref(true)
const draft = ref('')
const submitting = ref(false)
const error = ref('')
const uploading = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)
const dragging = ref(false)
const MAX_FILES = 8
const pendingFiles = ref<Array<{ file: File; preview: string; type: string; mime: string }>>([])

function fileType(mime: string) {
  if (!mime) return 'file'
  return mime.split('/')[0]
}

function addFiles(files: FileList | File[]) {
  const remaining = MAX_FILES - pendingFiles.value.length
  for (const file of Array.from(files).slice(0, Math.max(0, remaining))) {
    const mime = file.type || 'application/octet-stream'
    pendingFiles.value.push({ file, preview: URL.createObjectURL(file), type: fileType(mime), mime })
  }
}

function onFileSelect(e: Event) {
  const input = e.target as HTMLInputElement
  if (input.files?.length) addFiles(input.files)
  input.value = ''
}

function onPaste(e: ClipboardEvent) {
  const files = e.clipboardData?.files
  if (files?.length) { e.preventDefault(); addFiles(files) }
}

function onDrop(e: DragEvent) {
  dragging.value = false
  if (e.dataTransfer?.files?.length) { e.preventDefault(); addFiles(e.dataTransfer.files) }
}

function removeFile(index: number) {
  const f = pendingFiles.value[index]
  if (f?.preview) URL.revokeObjectURL(f.preview)
  pendingFiles.value.splice(index, 1)
}

function fileIcon(mime: string) {
  if (mime.startsWith('image/')) return 'lucide:image'
  if (mime.startsWith('video/')) return 'lucide:video'
  if (mime.startsWith('audio/')) return 'lucide:music'
  return 'lucide:file'
}

const commentOffset = ref(0)
const commentHasMore = ref(true)
const { sentinel: commentSentinel, loading: loadingMoreComments, reset: resetCommentScroll } = useInfiniteScroll(async () => {
  return await loadComments(false)
})

function sortComments() {
  comments.value = [...comments.value].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  )
}

async function loadComments(reset = true) {
  if (reset) {
    commentOffset.value = 0
    commentHasMore.value = true
    resetCommentScroll()
    loading.value = true
  } else if (!commentHasMore.value) {
    return { hasMore: false }
  }
  try {
    const data = await $fetch(`/api/posts/${props.post.id}/comments`, {
      params: { limit: FEED_PAGE_SIZE, offset: commentOffset.value },
    })
    const incoming = data.comments || []
    commentOffset.value = data.nextOffset ?? (commentOffset.value + incoming.length)
    commentHasMore.value = data.hasMore ?? incoming.length === FEED_PAGE_SIZE
    if (reset) {
      comments.value = incoming
    } else {
      const seen = new Set(comments.value.map(c => c.id))
      comments.value = [...comments.value, ...incoming.filter(c => !seen.has(c.id))]
      sortComments()
    }
    return { hasMore: commentHasMore.value }
  } catch {
    if (reset) comments.value = []
    return { hasMore: false }
  } finally {
    if (reset) loading.value = false
  }
}

async function ensureMe() {
  if (me.value) return
  try {
    const data = await $fetch('/api/auth/me')
    me.value = data.user
  } catch { /* ignore */ }
}

let offComment: (() => void) | null = null
let offReaction: (() => void) | null = null

onMounted(() => {
  loadComments()
  ensureMe()
  offComment = on('comment.new', (p: any) => {
    if (p.postId !== props.post.id) return
    if (comments.value.some(c => c.id === p.comment.id)) return
    comments.value.push(p.comment)
    emit('update', props.post.id, { commentCount: (props.post.commentCount || 0) + 1 })
  })
  offReaction = on('reaction.update', (p: any) => {
    if (p.postId !== props.post.id) return
    applyReactionDelta(p.emoji, p.userId, p.active, p.userId === me.value?.id)
  })
})

onUnmounted(() => {
  offComment?.()
  offReaction?.()
})

watch(() => props.post.id, () => {
  comments.value = []
  loadComments(true)
})

function applyReactionDelta(emoji: string, userId: string, active: boolean, isMe: boolean) {
  const reactions = [...(props.post.reactions || [])]
  let group = reactions.find((r: any) => r.emoji === emoji)
  if (active) {
    if (!group) {
      group = { emoji, count: 0, mine: false, users: [] }
      reactions.push(group)
    }
    if (!group.users?.some((u: any) => u.id === userId)) {
      group.count += 1
      group.users = [...(group.users || []), { id: userId }]
    }
    if (isMe) group.mine = true
  } else if (group) {
    group.count = Math.max(0, group.count - 1)
    group.users = (group.users || []).filter((u: any) => u.id !== userId)
    if (isMe) group.mine = false
    if (group.count === 0) {
      const idx = reactions.indexOf(group)
      if (idx >= 0) reactions.splice(idx, 1)
    }
  }
  emit('update', props.post.id, { reactions: [...reactions] })
}

async function toggleReaction(emoji: string) {
  try {
    const res = await $fetch<{ active: boolean }>(`/api/posts/${props.post.id}/reactions`, {
      method: 'POST',
      body: { emoji },
    })
    const uid = me.value?.id
    if (uid) applyReactionDelta(emoji, uid, res.active, true)
  } catch { /* ignore */ }
}

async function submitComment() {
  const content = draft.value.trim()
  if ((!content && !pendingFiles.value.length) || submitting.value) return
  submitting.value = true
  error.value = ''
  try {
    let attachments: Array<any> | undefined
    if (pendingFiles.value.length) {
      uploading.value = true
      const formData = new FormData()
      for (const f of pendingFiles.value) formData.append('files', f.file)
      const res = await $fetch<{ files: Array<{ url: string; blurUrl: string | null; type: string; mime: string; name: string }> }>('/api/upload', {
        method: 'POST', body: formData,
      })
      attachments = res.files.map((f, i) => ({ ...f, mime: pendingFiles.value[i]?.mime || f.mime }))
    }
    const res = await $fetch(`/api/posts/${props.post.id}/comments`, {
      method: 'POST',
      body: { content, attachments },
    })
    if (!comments.value.some(c => c.id === res.comment.id)) {
      comments.value.push(res.comment)
      emit('update', props.post.id, { commentCount: (props.post.commentCount || 0) + 1 })
    }
    draft.value = ''
    for (const f of pendingFiles.value) { if (f.preview) URL.revokeObjectURL(f.preview) }
    pendingFiles.value = []
  } catch (e: any) {
    error.value = e?.data?.message || 'コメントを送信できませんでした'
  } finally {
    submitting.value = false
    uploading.value = false
  }
}

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
  <div class="flex flex-col h-full min-h-0">
    <!-- Reactions -->
    <div class="px-4 pt-3 pb-2 flex flex-wrap items-center gap-1.5 shrink-0 border-b border-slate-800/60">
      <button
        v-for="r in (post.reactions || [])"
        :key="r.emoji"
        @click="toggleReaction(r.emoji)"
        class="flex items-center gap-1 px-2 py-1 rounded-full text-sm border transition"
        :class="r.mine ? 'bg-indigo-600/25 border-indigo-500/50 text-indigo-200' : 'bg-slate-800/50 border-slate-700 text-slate-300 hover:border-slate-500'"
        :title="(r.users || []).map((u: any) => u.displayName || '').join(', ')"
      >
        <EmojiIcon :emoji="r.emoji" size="sm" />
        <span class="text-xs">{{ r.count }}</span>
      </button>

      <ReactionPicker @select="toggleReaction" />
    </div>

    <!-- Comments -->
    <div class="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-0">
      <div v-if="loading" class="text-center text-slate-500 text-sm py-6">読み込み中...</div>
      <template v-else>
        <div v-for="c in comments" :key="c.id" class="flex gap-2.5">
          <NuxtLink :to="`/profile/@${c.user?.username || c.userId}`" class="shrink-0">
            <img v-if="avatarSrc(c.user?.avatarUrl)" :src="avatarSrc(c.user.avatarUrl)" class="w-7 h-7 rounded-full object-cover" />
            <div v-else class="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center text-white text-xs font-bold">
              {{ c.user?.displayName?.charAt(0) || '?' }}
            </div>
          </NuxtLink>
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-2">
              <span class="text-sm font-bold text-white truncate">{{ c.user?.displayName || '不明' }}</span>
              <UserBadges :badges="c.user?.badges" />
              <UserTitle :title="c.user?.title" />
              <span class="text-[11px] text-slate-600 shrink-0">{{ timeAgo(c.createdAt) }}</span>
            </div>
            <p v-if="c.content" class="text-sm text-slate-300 whitespace-pre-wrap break-words" v-html="renderRichText(c.content, { custom: customEmojiMap })" />
            <PostAttachments v-if="c.attachments?.length" :attachments="c.attachments" class="max-w-md" />
          </div>
        </div>
        <p v-if="!comments.length" class="text-center text-slate-500 text-sm py-8">まだコメントはありません</p>
        <div ref="commentSentinel" class="h-1" aria-hidden="true"></div>
        <div v-if="loadingMoreComments" class="text-center text-slate-500 text-xs py-2">読み込み中...</div>
        <p v-else-if="comments.length && !commentHasMore" class="text-center text-slate-600 text-[11px] py-2">すべて表示しました</p>
      </template>
    </div>

    <!-- Composer -->
    <div class="border-t border-slate-800 p-3 shrink-0">
      <div
        class="bg-slate-900 border rounded-xl px-3 py-2 transition"
        :class="dragging ? 'border-indigo-500 bg-indigo-600/10' : 'border-slate-700 focus-within:border-indigo-500'"
        @dragover.prevent="dragging = true"
        @dragleave.prevent="dragging = false"
        @drop="onDrop"
        @paste="onPaste"
      >
        <div v-if="pendingFiles.length" class="flex flex-wrap gap-2 mb-2">
          <div v-for="(f, i) in pendingFiles" :key="i"
            class="relative group w-16 h-16 rounded-lg overflow-hidden bg-slate-800 border border-slate-700 shrink-0">
            <img v-if="f.type === 'image'" :src="f.preview" class="w-full h-full object-cover" />
            <div v-else class="w-full h-full flex flex-col items-center justify-center gap-1 text-slate-400 px-1">
              <Icon :name="fileIcon(f.mime)" class="w-5 h-5" />
              <span class="text-[9px] truncate w-full text-center">{{ f.file.name }}</span>
            </div>
            <button @click="removeFile(i)"
              class="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-black/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
              <Icon name="lucide:x" class="w-3 h-3" />
            </button>
          </div>
        </div>

        <EmojiTextarea
          v-model="draft"
          class="w-full"
          :rows="1"
          submit-on-enter
          placeholder="コメントを追加..."
          textarea-class="w-full bg-transparent border-none focus:ring-0 text-sm text-white placeholder-slate-500 resize-none py-0.5 max-h-28"
        />

        <div class="flex items-center gap-1 mt-1">
          <button @click="fileInput?.click()" :disabled="pendingFiles.length >= MAX_FILES || submitting"
            class="p-1.5 rounded-full text-slate-500 hover:text-indigo-400 hover:bg-slate-800/50 transition disabled:opacity-30"
            :title="`ファイル添付 (${pendingFiles.length}/${MAX_FILES})`">
            <Icon name="lucide:paperclip" class="w-4 h-4" />
          </button>
          <span v-if="pendingFiles.length" class="text-[10px] text-slate-600">{{ pendingFiles.length }}/{{ MAX_FILES }}</span>
          <span class="flex-1" />
          <button @click="submitComment" :disabled="(!draft.trim() && !pendingFiles.length) || submitting"
            class="p-1.5 text-indigo-400 hover:text-indigo-300 disabled:opacity-40 transition shrink-0" title="送信">
            <Icon :name="submitting ? 'lucide:loader-2' : 'lucide:send'" class="w-4 h-4" :class="{ 'animate-spin': submitting }" />
          </button>
        </div>
      </div>
      <input ref="fileInput" type="file" multiple class="hidden" @change="onFileSelect" />
      <p v-if="error" class="text-xs text-red-400 mt-1">{{ error }}</p>
    </div>
  </div>
</template>
