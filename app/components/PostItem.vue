<script setup lang="ts">
const { map: customEmojiMap } = useCustomEmojis()

const props = defineProps<{
  post: {
    id: string
    content: string
    imageUrl?: string
    repostCount?: number
    commentCount?: number
    viewCount?: number
    createdAt: string
    visibility?: string
    reposted?: boolean
    bookmarked?: boolean
    attachments?: Array<any>
    reactions?: Array<{ emoji: string; count: number; mine: boolean; users?: any[] }>
    boostedBy?: {
      user: {
        id: string
        username: string
        displayName: string
        avatarUrl?: string
      } | null
      repostedAt?: string
    }
    quotedPost?: any
    user: {
      id: string
      username: string
      displayName: string
      avatarUrl?: string
    }
  }
  showViewCount?: boolean
  currentUserId?: string
}>()

const emit = defineEmits<{
  toggleRepost: [postId: string]
  toggleBookmark: [postId: string]
  quotePost: [post: any]
  delete: [postId: string]
  report: [postId: string]
  openMedia: [post: any]
}>()

const showMenu = ref(false)
const showRepostMenu = ref(false)
const rootEl = ref<HTMLElement | null>(null)
const { observe, unobserve } = useViewTracker()
const { openAdd: openAddToPlaylist } = usePlaylists()

onMounted(() => observe(rootEl.value, props.post.id, (count) => { props.post.viewCount = count }))
onUnmounted(() => unobserve(rootEl.value))

const me = useState<any>('current-user', () => null)
const quote = useQuoteComposer()
const myId = computed(() => props.currentUserId || me.value?.id)

async function ensureMe() {
  if (me.value) return
  try { me.value = (await $fetch('/api/auth/me')).user } catch { /* ignore */ }
}

function openMedia() {
  emit('openMedia', props.post)
}

function openThread() {
  emit('openMedia', props.post)
}

function timeAgo(date: string) {
  const now = Date.now()
  const diff = now - new Date(date).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'たった今'
  if (minutes < 60) return `${minutes}分前`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}時間前`
  const days = Math.floor(hours / 24)
  return `${days}日前`
}

const isMine = computed(() => myId.value === props.post.user.id)

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
  props.post.reactions = [...reactions]
}

async function toggleReaction(emoji: string) {
  try {
    const res = await $fetch<{ active: boolean }>(`/api/posts/${props.post.id}/reactions`, {
      method: 'POST',
      body: { emoji },
    })
    const uid = myId.value
    if (uid) applyReactionDelta(emoji, uid, res.active, true)
    else applyReactionDelta(emoji, 'me', res.active, true)
  } catch { /* ignore */ }
}

onMounted(ensureMe)
</script>

<template>
  <div
    ref="rootEl"
    class="py-4 px-3 border-b border-slate-800 last:border-b-0 hover:bg-slate-800/30 transition"
    @click.self="openThread"
  >
    <div v-if="post.boostedBy" class="flex items-center gap-1.5 mb-1 text-sm text-green-400">
      <Icon name="lucide:repeat-2" class="w-3.5 h-3.5" />
      <NuxtLink :to="`/profile/@${post.boostedBy.user?.username || ''}`" class="hover:underline truncate">
        <span v-if="post.boostedBy.user" class="flex items-center gap-1">
          <img v-if="post.boostedBy.user.avatarUrl" :src="post.boostedBy.user.avatarUrl"
            class="w-4 h-4 rounded-full object-cover" />
          <span class="font-bold">{{ post.boostedBy.user.displayName }}</span>
        </span>
      </NuxtLink>
      <span class="text-slate-500 text-xs">がリポスト · {{ timeAgo(post.boostedBy.repostedAt || post.createdAt) }}</span>
    </div>

    <div class="flex gap-3" @click.self="openThread">
      <NuxtLink :to="`/profile/@${post.user.username}`" class="shrink-0">
        <img v-if="post.user.avatarUrl" :src="post.user.avatarUrl" class="w-10 h-10 rounded-full object-cover" />
        <div v-else class="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">
          {{ post.user.displayName.charAt(0) }}
        </div>
      </NuxtLink>
      <div class="flex-1 min-w-0" @click.self="openThread">
        <div class="flex items-center gap-2 mb-1">
          <NuxtLink :to="`/profile/@${post.user.username}`" class="font-bold text-white hover:underline truncate">
            {{ post.user.displayName }}
          </NuxtLink>
          <UserBadges :badges="post.user.badges" />
          <UserTitle :title="post.user.title" />
          <span class="text-slate-500 text-sm shrink-0">@{{ post.user.username }} · {{ timeAgo(post.createdAt) }}</span>

          <!-- "..." menu -->
          <div class="relative ml-auto">
            <button @click.stop="showMenu = !showMenu" class="p-1 rounded-full text-slate-500 hover:text-white hover:bg-slate-800 transition">
              <Icon name="lucide:ellipsis" class="w-4 h-4" />
            </button>
            <div v-if="showMenu" class="fixed inset-0 z-40" @click="showMenu = false" />
            <Transition name="menu-pop">
              <div v-if="showMenu"
                class="absolute top-full right-0 mt-1 bg-slate-900 border border-slate-800 rounded-xl py-1.5 shadow-xl z-50 min-w-40">
                <div class="px-4 py-1.5 text-xs text-slate-500 border-b border-slate-800">
                  閲覧数 {{ post.viewCount || 0 }}
                </div>
                <div class="px-4 py-1.5 text-xs text-slate-500">
                  公開範囲: {{ { public: '公開', followers: 'フォロワー', close_friends: '親しい友達', specific: '特定の人' }[post.visibility || 'public'] }}
                </div>
                <hr class="border-slate-800 my-1" />
                <button @click.stop="openAddToPlaylist(post); showMenu = false"
                  class="w-full text-left px-4 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-800/30 transition flex items-center gap-2">
                  <Icon name="lucide:list-video" class="w-4 h-4" />
                  プレイリストに追加
                </button>
                <button @click.stop="emit('report', post.id); showMenu = false"
                  class="w-full text-left px-4 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-800/30 transition">
                  報告
                </button>
                <button v-if="isMine" @click.stop="emit('delete', post.id); showMenu = false"
                  class="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-slate-800/30 transition">
                  削除
                </button>
              </div>
            </Transition>
          </div>
        </div>

        <p class="text-slate-200 leading-relaxed whitespace-pre-wrap break-words cursor-pointer" @click.self="openThread" v-html="renderRichText(post.content, { custom: customEmojiMap })" />

        <PostAttachments v-if="post.attachments?.length" :attachments="post.attachments" :post-id="post.id"
          interactive image-lightbox @open="openMedia" />

        <QuotedPostCard v-if="post.quotedPost" :post="post.quotedPost" class="mt-2" @open="emit('openMedia', post.quotedPost)" />

        <div class="flex items-center gap-4 mt-3 text-slate-500">
          <div class="relative">
            <button @click.stop="showRepostMenu = !showRepostMenu"
              class="flex items-center gap-1.5 transition text-sm"
              :class="post.reposted ? 'text-green-400' : 'hover:text-green-400'">
              <Icon name="lucide:repeat-2" class="w-4 h-4" />
              <span>{{ post.repostCount || 0 }}</span>
            </button>
            <div v-if="showRepostMenu" class="fixed inset-0 z-40" @click="showRepostMenu = false" />
            <Transition name="menu-pop">
              <div v-if="showRepostMenu"
                class="absolute top-full left-0 mt-1 bg-slate-900 border border-slate-800 rounded-xl py-1.5 shadow-xl z-50 min-w-44">
                <button @click.stop="emit('toggleRepost', post.id); showRepostMenu = false"
                  class="w-full text-left px-4 py-2 text-sm flex items-center gap-2 transition"
                  :class="post.reposted ? 'text-green-400' : 'text-slate-300 hover:text-white hover:bg-slate-800/30'">
                  <Icon name="lucide:repeat-2" class="w-4 h-4" />
                  {{ post.reposted ? 'リポストを取り消し' : 'リポスト' }}
                </button>
                <button @click.stop="quote.openQuote(post); showRepostMenu = false"
                  class="w-full text-left px-4 py-2 text-sm flex items-center gap-2 text-slate-300 hover:text-white hover:bg-slate-800/30 transition">
                  <Icon name="lucide:message-square-quote" class="w-4 h-4" />
                  引用リポスト
                </button>
              </div>
            </Transition>
          </div>

          <button @click.stop="openThread" class="flex items-center gap-1.5 transition text-sm hover:text-indigo-400">
            <Icon name="lucide:message-circle" class="w-4 h-4" />
            <span>{{ post.commentCount || 0 }}</span>
          </button>

          <button @click.stop="emit('toggleBookmark', post.id)"
            class="flex items-center gap-1.5 transition text-sm"
            :class="post.bookmarked ? 'text-amber-400' : 'hover:text-amber-400'">
            <svg viewBox="0 0 24 24" class="w-4 h-4" :class="post.bookmarked ? 'fill-amber-400 stroke-amber-400' : 'stroke-current fill-none'">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
            </svg>
          </button>

          <span v-if="showViewCount" class="flex items-center gap-1 text-xs text-slate-600 ml-auto">
            <Icon name="lucide:eye" class="w-3.5 h-3.5" />
            {{ post.viewCount || 0 }}
          </span>
        </div>

        <!-- Reactions -->
        <div class="flex flex-wrap items-center gap-1.5 mt-2">
          <button
            v-for="r in (post.reactions || [])"
            :key="r.emoji"
            @click.stop="toggleReaction(r.emoji)"
            class="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border transition"
            :class="r.mine ? 'bg-indigo-600/25 border-indigo-500/50 text-indigo-200' : 'bg-slate-800/50 border-slate-700 text-slate-300 hover:border-slate-500'"
            :title="(r.users || []).map((u: any) => u.displayName || '').filter(Boolean).join(', ')"
          >
            <EmojiIcon :emoji="r.emoji" size="sm" />
            <span>{{ r.count }}</span>
          </button>

          <ReactionPicker @select="toggleReaction" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.menu-pop-enter-active { transition: opacity 0.15s ease, transform 0.15s ease; }
.menu-pop-leave-active { transition: opacity 0.1s ease, transform 0.1s ease; }
.menu-pop-enter-from, .menu-pop-leave-to { opacity: 0; transform: translateY(-4px) scale(0.97); }
</style>
