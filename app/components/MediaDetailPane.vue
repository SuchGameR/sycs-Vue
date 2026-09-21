<script setup lang="ts">
const pane = useMediaPane()
const { selected, sourceLabel, width } = pane

const mediaIndex = ref(0)

watch(selected, () => { mediaIndex.value = 0 })

const attachments = computed<any[]>(() => selected.value?.attachments || [])
const kind = computed(() => pane.kind.value)

const images = computed(() => attachments.value.filter(a => String(a.mime || '').startsWith('image/')))
const videos = computed(() => attachments.value.filter(a => String(a.mime || '').startsWith('video/')))
const audios = computed(() => attachments.value.filter(a => String(a.mime || '').startsWith('audio/')))

const kindLabel = computed(() => {
  if (kind.value === 'video') return '動画'
  if (kind.value === 'image') return '画像'
  if (kind.value === 'audio') return '音楽'
  return 'スレッド'
})
const kindIcon = computed(() => {
  if (kind.value === 'video') return 'lucide:video'
  if (kind.value === 'image') return 'lucide:image'
  if (kind.value === 'audio') return 'lucide:music'
  return 'lucide:message-square'
})

function onPatch(postId: string, patch: any) {
  if (selected.value?.id !== postId) return
  pane.updatePost({ ...selected.value, ...patch })
}

/* Resize */
const resizing = ref(false)
let startX = 0
let startW = 0

function startResize(e: MouseEvent) {
  resizing.value = true
  startX = e.clientX
  startW = width.value
  window.addEventListener('mousemove', onResizeMove)
  window.addEventListener('mouseup', stopResize)
  document.body.style.userSelect = 'none'
}
function onResizeMove(e: MouseEvent) {
  if (!resizing.value) return
  pane.setWidth(startW - (e.clientX - startX))
}
function stopResize() {
  resizing.value = false
  window.removeEventListener('mousemove', onResizeMove)
  window.removeEventListener('mouseup', stopResize)
  document.body.style.userSelect = ''
}
onUnmounted(stopResize)

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
  <Transition name="pane">
    <aside
      v-if="selected"
      class="hidden min-[1024px]:flex flex-col shrink-0 bg-[#0d1220] border-l border-slate-800 h-[calc(100vh-56px)] sticky top-14 relative"
      :style="{ width: width + 'px' }"
    >
      <!-- resize handle -->
      <div
        class="absolute left-0 top-0 bottom-0 w-1.5 -ml-0.5 cursor-col-resize z-20 group"
        @mousedown.prevent="startResize"
      >
        <div class="w-full h-full transition" :class="resizing ? 'bg-indigo-500' : 'group-hover:bg-indigo-500/50'" />
      </div>

      <!-- header -->
      <div class="h-12 px-4 flex items-center gap-2 border-b border-slate-800 shrink-0">
        <Icon :name="kindIcon" class="w-4 h-4 text-indigo-400 shrink-0" />
        <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">{{ kindLabel }}</span>
        <span v-if="sourceLabel" class="text-[11px] text-slate-600 truncate">· {{ sourceLabel }}</span>
        <button @click="pane.close()" class="ml-auto p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition" title="閉じる">
          <Icon name="lucide:x" class="w-4 h-4" />
        </button>
      </div>

      <div class="flex-1 overflow-y-auto min-h-0">
        <!-- Author -->
        <div class="px-4 py-3 flex items-center gap-3">
          <NuxtLink :to="`/profile/@${selected.user?.username}`" class="shrink-0">
            <img v-if="selected.user?.avatarUrl" :src="selected.user.avatarUrl" class="w-9 h-9 rounded-full object-cover" />
            <div v-else class="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">
              {{ selected.user?.displayName?.charAt(0) || '?' }}
            </div>
          </NuxtLink>
          <div class="min-w-0">
            <p class="text-sm font-bold text-white truncate">{{ selected.user?.displayName || '不明' }}</p>
            <p class="text-[11px] text-slate-500 truncate">@{{ selected.user?.username }} · {{ timeAgo(selected.createdAt) }}</p>
          </div>
        </div>

        <!-- Media -->
        <div class="px-4">
          <!-- Video -->
          <template v-if="kind === 'video'">
            <video
              v-for="v in videos"
              :key="v.id"
              :src="v.url"
              controls
              autoplay
              playsinline
              class="w-full rounded-xl bg-black mb-2"
            />
          </template>

          <!-- Image gallery -->
          <template v-else-if="kind === 'image'">
            <div class="rounded-xl overflow-hidden bg-black/40">
              <img :src="images[mediaIndex]?.url" class="w-full max-h-[45vh] object-contain" />
            </div>
            <div v-if="images.length > 1" class="flex gap-1.5 mt-2 overflow-x-auto pb-1">
              <button
                v-for="(img, i) in images"
                :key="img.id"
                @click="mediaIndex = i"
                class="w-14 h-14 rounded-lg overflow-hidden shrink-0 border-2 transition"
                :class="i === mediaIndex ? 'border-indigo-500' : 'border-transparent opacity-70 hover:opacity-100'"
              >
                <img :src="img.url" class="w-full h-full object-cover" />
              </button>
            </div>
          </template>

          <!-- Audio -->
          <template v-else-if="kind === 'audio'">
            <div class="rounded-xl bg-gradient-to-br from-indigo-900/50 to-slate-900 p-4">
              <div class="flex items-center gap-3 mb-3">
                <div class="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center shrink-0">
                  <Icon name="lucide:music" class="w-6 h-6 text-white" />
                </div>
                <div class="min-w-0">
                  <p class="text-sm font-bold text-white truncate">オーディオ</p>
                  <p class="text-[11px] text-slate-400 truncate">@{{ selected.user?.username }}</p>
                </div>
              </div>
              <audio v-for="a in audios" :key="a.id" :src="a.url" controls autoplay class="w-full" />
            </div>
          </template>
        </div>

        <!-- Text -->
        <p v-if="selected.content" class="px-4 py-3 text-slate-200 text-sm leading-relaxed whitespace-pre-wrap break-words">{{ selected.content }}</p>

        <!-- Actions -->
        <div class="px-4 pb-3 flex items-center gap-4 text-slate-500 border-b border-slate-800/60">
          <span class="flex items-center gap-1.5 text-sm">
            <Icon name="lucide:heart" class="w-4 h-4" :class="selected.liked ? 'text-indigo-400 fill-indigo-400' : ''" />
            {{ selected.likeCount || 0 }}
          </span>
          <span class="flex items-center gap-1.5 text-sm">
            <Icon name="lucide:repeat-2" class="w-4 h-4" />
            {{ selected.repostCount || 0 }}
          </span>
          <span class="flex items-center gap-1.5 text-sm ml-auto">
            <Icon name="lucide:eye" class="w-4 h-4" />
            {{ selected.viewCount || 0 }}
          </span>
        </div>

        <!-- Comments + reactions -->
        <div class="h-[calc(100%-0px)] min-h-[280px] flex flex-col">
          <PostComments :post="selected" @update="onPatch" />
        </div>
      </div>
    </aside>
  </Transition>
</template>

<style scoped>
.pane-enter-active, .pane-leave-active { transition: all 0.25s ease; }
.pane-enter-from, .pane-leave-to { opacity: 0; transform: translateX(20px); }
</style>
