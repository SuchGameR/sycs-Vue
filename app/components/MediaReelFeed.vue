<script setup lang="ts">
const { map: customEmojiMap } = useCustomEmojis()
const mediaPane = useMediaPane()
const { setCompact } = useScrollCompact()

/** Genre / ordering come from the filter panel on /search. */
const props = withDefaults(defineProps<{ media?: string; sort?: string }>(), {
  media: '',
  sort: 'random',
})

const PAGE = 8

const posts = ref<any[]>([])
const seen = ref<string[]>([])
const loading = ref(false)
const exhausted = ref(false)
const scroller = ref<HTMLElement | null>(null)
/** Slide currently filling the viewport, used to gate autoplay. */
const visibleIndex = ref(0)

/**
 * One attachment per slide. A post can carry several (carousel), but a Reels
 * feed is one screen per post, so the first is what fills the frame.
 */
function firstAttachment(post: any) {
  return post?.attachments?.[0] || null
}

function kindOf(post: any): 'video' | 'image' | 'audio' | 'model' | 'file' {
  const a = firstAttachment(post)
  const mime = String(a?.mime || a?.type || '')
  if (mime.startsWith('video') || /\.(mp4|webm|mov)(\?|$)/i.test(String(a?.url || ''))) return 'video'
  if (mime.startsWith('audio') || /\.(mp3|wav|ogg|m4a|flac)(\?|$)/i.test(String(a?.url || ''))) return 'audio'
  if (/\.(glb|gltf|obj|fbx|stl|3ds)(\?|$)/i.test(String(a?.url || ''))) return 'model'
  if (mime.startsWith('image') || /\.(png|jpe?g|webp|gif|avif)(\?|$)/i.test(String(a?.url || ''))) return 'image'
  return 'file'
}

async function loadMore() {
  if (loading.value || exhausted.value) return
  loading.value = true
  try {
    const data = await $fetch<{ posts: any[] }>('/api/explore/media', {
      params: {
        limit: PAGE,
        exclude: seen.value.join(','),
        media: props.media || undefined,
        sort: props.sort,
      },
    })
    const incoming = (data.posts || []).filter((p: any) => !seen.value.includes(p.id))
    if (!incoming.length) {
      // Nothing left that the viewer is allowed to see. Stop rather than spin.
      exhausted.value = true
      return
    }
    for (const p of incoming) seen.value.push(p.id)
    posts.value = [...posts.value, ...incoming]
  } catch {
    exhausted.value = true
  } finally {
    loading.value = false
  }
}

function onScroll() {
  const el = scroller.value
  if (!el) return
  const slide = el.clientHeight || 1
  visibleIndex.value = Math.round(el.scrollTop / slide)
  // The pill nav shrinks while browsing a reel so it takes less of the frame.
  setCompact(el.scrollTop > 24)

  // Prefetch a slide or two before the bottom so the reel never visibly stalls.
  if (el.scrollTop + el.clientHeight > el.scrollHeight - slide * 2) loadMore()
}

onBeforeUnmount(() => setCompact(false))

function open(post: any) {
  mediaPane.openSmart(post, 'リール')
}

/**
 * A filter change invalidates every id we excluded, so the accumulated feed has
 * to be thrown away and rebuilt -- otherwise the exclusion list would keep the
 * new selection's posts out on the next page.
 */
watch(() => [props.media, props.sort], () => {
  posts.value = []
  seen.value = []
  exhausted.value = false
  if (scroller.value) scroller.value.scrollTop = 0
  visibleIndex.value = 0
  loadMore()
})

onMounted(loadMore)

/** Video slides only play while they are the one on screen. */
function shouldPlay(idx: number) {
  return visibleIndex.value === idx
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
  <div
    ref="scroller"
    class="h-full overflow-y-scroll snap-y snap-mandatory overscroll-contain"
    @scroll.passive="onScroll"
  >
    <template v-if="posts.length">
      <section
        v-for="(post, i) in posts"
        :key="post.id"
        class="snap-start snap-always relative w-full h-full overflow-hidden bg-black"
      >
        <!-- 画像 -->
        <img
          v-if="kindOf(post) === 'image'"
          :src="firstAttachment(post)?.url"
          class="w-full h-full object-cover"
          alt=""
          loading="lazy"
        />

        <!-- 動画 -->
        <video
          v-else-if="kindOf(post) === 'video'"
          :src="firstAttachment(post)?.url"
          class="w-full h-full object-contain"
          :autoplay="shouldPlay(i)"
          :loop="true"
          :muted="true"
          :playsinline="true"
          preload="metadata"
        />

        <!-- 音声: 専用のビジュアルはないが、再生コントロールを置く -->
        <div
          v-else-if="kindOf(post) === 'audio'"
          class="w-full h-full flex flex-col items-center justify-center gap-4 bg-gradient-to-br from-indigo-950 via-black to-fuchsia-950"
        >
          <div class="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center backdrop-blur">
            <Icon name="lucide:music-4" class="w-10 h-10 text-white/80" />
          </div>
          <audio :src="firstAttachment(post)?.url" controls class="w-[85%] max-w-sm" preload="metadata" />
        </div>

        <!-- 3Dモデル / その他ファイル -->
        <div v-else class="w-full h-full flex flex-col items-center justify-center gap-4 bg-surface">
          <div class="w-20 h-20 rounded-2xl bg-surface-container flex items-center justify-center">
            <Icon
              :name="kindOf(post) === 'model' ? 'lucide:box' : 'lucide:file'"
              class="w-9 h-9 text-on-surface-variant"
            />
          </div>
          <p class="text-sm text-on-surface-variant">タップして開きます</p>
        </div>

        <!-- オーバーレイ -->
        <div class="absolute inset-x-0 bottom-0 p-4 pb-[calc(1rem+var(--app-footer-h))] pt-16 bg-gradient-to-t from-black/85 via-black/45 to-transparent">
          <div class="flex items-center gap-2 mb-1.5">
            <NuxtLink :to="`/profile/@${post.user?.username}`" class="flex items-center gap-2 min-w-0">
              <img
                v-if="avatarSrc(post.user?.avatarUrl)"
                :src="avatarSrc(post.user.avatarUrl)"
                class="w-7 h-7 rounded-full object-cover ring-1 ring-white/30"
                alt=""
              />
              <div v-else class="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                {{ post.user?.displayName?.charAt(0) || '?' }}
              </div>
              <span class="text-sm font-bold text-white truncate">{{ post.user?.displayName || '不明' }}</span>
            </NuxtLink>
            <span class="text-xs text-white/60 shrink-0">{{ timeAgo(post.createdAt) }}</span>
          </div>
          <p
            v-if="post.content"
            class="text-sm text-white/90 leading-relaxed line-clamp-3 break-words"
            v-html="renderRichText(post.content, { custom: customEmojiMap })"
          />
          <button
            class="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur text-xs font-bold text-white hover:bg-white/25 transition"
            @click="open(post)"
          >
            <Icon name="lucide:maximize-2" class="w-3.5 h-3.5" />
            詳細を開く
          </button>
        </div>
      </section>
    </template>

    <div v-else-if="loading" class="h-full flex items-center justify-center">
      <Icon name="lucide:loader-2" class="w-6 h-6 text-white/60 animate-spin" />
    </div>

    <div v-else class="h-full flex flex-col items-center justify-center gap-2 px-8 text-center">
      <div class="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
        <Icon name="lucide:clapperboard" class="w-6 h-6 text-white/70" />
      </div>
      <p class="font-bold text-white">リールの投稿がありません</p>
      <p class="text-sm text-white/60">画像・動画・音楽を添付した投稿がここに流れてきます</p>
    </div>

    <!-- ローディング / 終端 -->
    <div v-if="posts.length && loading" class="h-16 flex items-center justify-center">
      <Icon name="lucide:loader-2" class="w-5 h-5 text-white/50 animate-spin" />
    </div>
    <p v-else-if="posts.length && exhausted" class="h-16 flex items-center justify-center text-xs text-white/40">
      すべてのリールを表示しました
    </p>
  </div>
</template>