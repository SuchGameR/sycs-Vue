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
  if (!content || submitting.value) return
  submitting.value = true
  error.value = ''
  try {
    const res = await $fetch(`/api/posts/${props.post.id}/comments`, {
      method: 'POST',
      body: { content },
    })
    if (!comments.value.some(c => c.id === res.comment.id)) {
      comments.value.push(res.comment)
      emit('update', props.post.id, { commentCount: (props.post.commentCount || 0) + 1 })
    }
    draft.value = ''
  } catch (e: any) {
    error.value = e?.data?.message || 'コメントを送信できませんでした'
  } finally {
    submitting.value = false
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
            <img v-if="c.user?.avatarUrl" :src="c.user.avatarUrl" class="w-7 h-7 rounded-full object-cover" />
            <div v-else class="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center text-white text-xs font-bold">
              {{ c.user?.displayName?.charAt(0) || '?' }}
            </div>
          </NuxtLink>
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-2">
              <span class="text-sm font-bold text-white truncate">{{ c.user?.displayName || '不明' }}</span>
              <span class="text-[11px] text-slate-600 shrink-0">{{ timeAgo(c.createdAt) }}</span>
            </div>
            <p class="text-sm text-slate-300 whitespace-pre-wrap break-words" v-html="renderRichText(c.content, { custom: customEmojiMap })" />
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
      <div class="flex items-end gap-2 bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 focus-within:border-indigo-500 transition">
        <EmojiTextarea
          v-model="draft"
          class="flex-1"
          :rows="1"
          submit-on-enter
          placeholder="コメントを追加..."
          textarea-class="w-full bg-transparent border-none focus:ring-0 text-sm text-white placeholder-slate-500 resize-none py-1.5 max-h-28"
        />
        <button @click="submitComment" :disabled="!draft.trim() || submitting" class="p-1.5 text-indigo-400 hover:text-indigo-300 disabled:opacity-40 transition shrink-0">
          <Icon :name="submitting ? 'lucide:loader-2' : 'lucide:send'" class="w-4 h-4" :class="{ 'animate-spin': submitting }" />
        </button>
      </div>
      <p v-if="error" class="text-xs text-red-400 mt-1">{{ error }}</p>
    </div>
  </div>
</template>
