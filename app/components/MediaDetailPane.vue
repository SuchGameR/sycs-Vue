<script setup lang="ts">
const { map: customEmojiMap } = useCustomEmojis()

import VideoPlayer from './media/VideoPlayer.vue'
import MusicPlayer from './media/MusicPlayer.vue'
import ImageGallery from './media/ImageGallery.vue'
import FileCard from './media/FileCard.vue'
import ModelViewer from './media/ModelViewer.vue'

const MODEL_EXT = /\.(glb|gltf|obj|fbx|stl|3ds)(\?|$)/i

const pane = useMediaPane()
const { selected, sourceLabel, width } = pane

const mediaIndex = ref(0)

watch(() => [selected.value?.id, pane.kind.value], () => { mediaIndex.value = 0 })

const attachments = computed<any[]>(() => selected.value?.attachments || [])
const kind = computed(() => pane.kind.value)

const images = computed(() => attachments.value.filter(a => String(a.mime || '').startsWith('image/')))
const videos = computed(() => attachments.value.filter(a => String(a.mime || '').startsWith('video/')))
const audios = computed(() => attachments.value.filter(a => String(a.mime || '').startsWith('audio/')))
const models = computed(() => attachments.value.filter(a => String(a.mime || '').toLowerCase().startsWith('model/') || MODEL_EXT.test(String(a.url || ''))))
const files = computed(() => attachments.value.filter(a => {
  const mime = String(a.mime || '')
  return !mime.startsWith('image/') && !mime.startsWith('video/') && !mime.startsWith('audio/') && !String(a.mime || '').toLowerCase().startsWith('model/') && !MODEL_EXT.test(String(a.url || ''))
}))

const mediaList = computed(() => {
  if (kind.value === 'video') return videos.value
  if (kind.value === 'audio') return audios.value
  if (kind.value === 'model') return models.value
  return []
})
const currentMedia = computed(() => mediaList.value[Math.min(mediaIndex.value, mediaList.value.length - 1)] || null)

const currentAttachment = computed<any | null>(() => {
  if (kind.value === 'image') return images.value[Math.min(mediaIndex.value, images.value.length - 1)] || null
  if (kind.value === 'file') return files.value[Math.min(mediaIndex.value, files.value.length - 1)] || null
  return currentMedia.value
})
const download = computed<{ href: string | null; name: string | undefined }>(() => ({
  href: currentAttachment.value?.originalUrl || currentAttachment.value?.url || null,
  name: currentAttachment.value?.originalName || undefined,
}))

const kindLabel = computed(() => {
  if (kind.value === 'video') return '動画'
  if (kind.value === 'image') return '画像'
  if (kind.value === 'audio') return '音楽'
  if (kind.value === 'model') return '3Dモデル'
  if (kind.value === 'file') return 'ファイル'
  return 'スレッド'
})
const kindIcon = computed(() => {
  if (kind.value === 'video') return 'lucide:video'
  if (kind.value === 'image') return 'lucide:image'
  if (kind.value === 'audio') return 'lucide:music'
  if (kind.value === 'model') return 'lucide:box'
  if (kind.value === 'file') return 'lucide:file'
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
  <aside
    class="hidden min-[1024px]:flex flex-col shrink-0 bg-[#0d1220] h-[calc(100vh-56px-var(--app-footer-h))] sticky top-14 relative overflow-hidden"
    :class="selected ? 'border-l border-slate-800' : 'border-l-0'"
    :style="{
      width: (selected ? width : 0) + 'px',
      transition: resizing ? 'none' : 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    }"
    :aria-hidden="!selected"
  >
    <!-- resize handle -->
    <div
      class="absolute left-0 top-0 bottom-0 w-1.5 cursor-col-resize z-20 group"
      :class="selected ? '' : 'pointer-events-none'"
      @mousedown.prevent="startResize"
    >
      <div class="w-full h-full transition" :class="resizing ? 'bg-indigo-500' : 'group-hover:bg-indigo-500/50'" />
    </div>

    <Transition name="pane-inner">
      <div
        v-if="selected"
        class="h-full flex flex-col shrink-0"
        :style="{ width: width + 'px' }"
      >
        <!-- header -->
        <div class="h-12 px-4 flex items-center gap-2 border-b border-slate-800 shrink-0">
          <button @click="pane.close()" class="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition flex items-center gap-1 text-xs" title="戻る">
            <Icon name="lucide:chevron-left" class="w-4 h-4" />
            <span class="hidden min-[1300px]:inline">戻る</span>
          </button>
          <Icon :name="kindIcon" class="w-4 h-4 text-indigo-400 shrink-0 ml-1" />
          <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">{{ kindLabel }}</span>
          <span v-if="sourceLabel" class="text-[11px] text-slate-600 truncate">· {{ sourceLabel }}</span>
          <a v-if="download.href" :href="download.href" :download="download.name" class="ml-1 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition" title="元のファイルをダウンロード">
            <Icon name="lucide:download" class="w-4 h-4" />
          </a>
          <button @click="pane.close()" class="ml-auto p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition" title="閉じる">
            <Icon name="lucide:x" class="w-4 h-4" />
          </button>
        </div>

        <div class="flex-1 overflow-y-auto min-h-0">
          <!-- Author -->
          <div class="px-4 py-3 flex items-center gap-3">
            <NuxtLink :to="`/profile/@${selected.user?.username}`" class="shrink-0">
              <img v-if="avatarSrc(selected.user.avatarUrl)" :src="avatarSrc(selected.user.avatarUrl)" class="w-9 h-9 rounded-full object-cover" />
              <div v-else class="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                {{ selected.user?.displayName?.charAt(0) || '?' }}
              </div>
            </NuxtLink>
            <div class="min-w-0">
              <p class="text-sm font-bold text-white truncate flex items-center gap-1">{{ selected.user?.displayName || '不明' }}<UserBadges :badges="selected.user?.badges" /></p>
              <p class="text-[11px] text-slate-500 truncate">@{{ selected.user?.username }} · {{ timeAgo(selected.createdAt) }}</p>
            </div>
          </div>

          <!-- Media -->
          <div class="px-4">
            <!-- Video -->
            <template v-if="kind === 'video' && currentMedia">
              <Transition name="media-swap" mode="out-in">
                <VideoPlayer :key="currentMedia.id" :src="currentMedia.url" />
              </Transition>
              <div v-if="videos.length > 1" class="flex gap-1.5 mt-2 overflow-x-auto pb-1">
                <button
                  v-for="(v, i) in videos"
                  :key="v.id"
                  @click="mediaIndex = i"
                  class="h-12 w-16 rounded-lg shrink-0 border-2 flex items-center justify-center bg-black/50 transition"
                  :class="i === mediaIndex ? 'border-indigo-500' : 'border-transparent opacity-60 hover:opacity-100'"
                >
                  <Icon name="lucide:play" class="w-4 h-4 text-white/80" />
                </button>
              </div>
            </template>

            <!-- Image gallery -->
            <template v-else-if="kind === 'image'">
              <ImageGallery :images="images" :index="mediaIndex" @update:index="mediaIndex = $event" />
            </template>

            <!-- Audio / music -->
            <template v-else-if="kind === 'audio' && currentMedia">
              <Transition name="media-swap" mode="out-in">
                <MusicPlayer
                  :key="currentMedia.id"
                  :src="currentMedia.url"
                  :title="`オーディオ ${mediaIndex + 1} / ${audios.length}`"
                  :artist="'@' + (selected.user?.username || '')"
                />
              </Transition>
              <div v-if="audios.length > 1" class="flex flex-wrap gap-1.5 mt-3">
                <button
                  v-for="(a, i) in audios"
                  :key="a.id"
                  @click="mediaIndex = i"
                  class="px-2.5 py-1 rounded-lg text-xs font-bold transition"
                  :class="i === mediaIndex ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'"
                >
                  {{ i + 1 }}
                </button>
              </div>
            </template>

            <!-- 3D model -->
            <template v-else-if="kind === 'model' && currentMedia">
              <Transition name="media-swap" mode="out-in">
                <ModelViewer :key="currentMedia.id" :src="currentMedia.url" />
              </Transition>
              <div v-if="models.length > 1" class="flex flex-wrap gap-1.5 mt-3">
                <button
                  v-for="(m, i) in models"
                  :key="m.id"
                  @click="mediaIndex = i"
                  class="px-2.5 py-1 rounded-lg text-xs font-bold transition"
                  :class="i === mediaIndex ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'"
                >
                  {{ i + 1 }}
                </button>
              </div>
            </template>

            <!-- Files -->
            <template v-else-if="kind === 'file'">
              <div class="space-y-2">
                <FileCard
                  v-for="f in files"
                  :key="f.id"
                  :url="f.url"
                  :mime="f.mime"
                />
              </div>
            </template>
          </div>

          <!-- Text -->
          <p v-if="selected.content" class="px-4 py-3 text-slate-200 text-sm leading-relaxed whitespace-pre-wrap break-words" v-html="renderRichText(selected.content, { custom: customEmojiMap })" />

          <!-- Actions -->
          <div class="px-4 pb-3 flex items-center gap-4 text-slate-500 border-b border-slate-800/60">
            <span class="flex items-center gap-1.5 text-sm">
              <Icon name="lucide:smile-plus" class="w-4 h-4" />
              {{ (selected.reactions || []).reduce((n: number, r: any) => n + (r.count || 0), 0) }}
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
          <div class="min-h-[320px] flex flex-col">
            <PostComments :post="selected" @update="onPatch" />
          </div>
        </div>
      </div>
    </Transition>
  </aside>
</template>

<style scoped>
.pane-inner-enter-active { transition: opacity 0.28s ease 0.05s; }
.pane-inner-leave-active { transition: opacity 0.12s ease; }
.pane-inner-enter-from, .pane-inner-leave-to { opacity: 0; }

.media-swap-enter-active { transition: opacity 0.22s ease; }
.media-swap-leave-active { transition: opacity 0.12s ease; }
.media-swap-enter-from, .media-swap-leave-to { opacity: 0; }
</style>
