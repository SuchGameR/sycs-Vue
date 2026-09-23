<script setup lang="ts">
const { map: customEmojiMap } = useCustomEmojis()

import VideoPlayer from './media/VideoPlayer.vue'
import MusicPlayer from './media/MusicPlayer.vue'
import ImageGallery from './media/ImageGallery.vue'
import FileCard from './media/FileCard.vue'
import ModelViewer from './media/ModelViewer.vue'

const MODEL_EXT = /\.(glb|gltf|obj|fbx|stl|3ds)(\?|$)/i

const pane = useMediaPane()
const { selected, sourceLabel, mobileFull, kind } = pane

const mediaIndex = ref(0)
watch(() => selected.value?.id, () => { mediaIndex.value = 0 })

const attachments = computed<any[]>(() => selected.value?.attachments || [])
const images = computed(() => attachments.value.filter(a => String(a.mime || '').startsWith('image/')))
const firstImage = computed(() => images.value[0])
const firstVideo = computed(() => attachments.value.find(a => String(a.mime || '').startsWith('video/')))
const firstAudio = computed(() => attachments.value.find(a => String(a.mime || '').startsWith('audio/')))
const firstModel = computed(() => attachments.value.find(a => String(a.mime || '').toLowerCase().startsWith('model/') || MODEL_EXT.test(String(a.url || ''))))
const files = computed(() => attachments.value.filter(a => {
  const mime = String(a.mime || '')
  return !mime.startsWith('image/') && !mime.startsWith('video/') && !mime.startsWith('audio/') && !mime.toLowerCase().startsWith('model/') && !MODEL_EXT.test(String(a.url || ''))
}))

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

const currentFull = computed<any | null>(() => {
  if (kind.value === 'video') return firstVideo.value || null
  if (kind.value === 'audio') return firstAudio.value || null
  if (kind.value === 'model') return firstModel.value || null
  if (kind.value === 'image') return images.value[Math.min(mediaIndex.value, images.value.length - 1)] || null
  return files.value[0] || null
})
const download = computed<{ href: string | null; name: string | undefined }>(() => ({
  href: currentFull.value?.originalUrl || currentFull.value?.url || null,
  name: currentFull.value?.originalName || undefined,
}))

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'たった今'
  if (minutes < 60) return `${minutes}分前`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}時間前`
  return `${Math.floor(hours / 24)}日前`
}

// Lock body scroll while fullscreen
watch(mobileFull, (v) => {
  if (import.meta.client) document.body.style.overflow = v ? 'hidden' : ''
})
onUnmounted(() => { if (import.meta.client) document.body.style.overflow = '' })

const { mediaOpenMode } = useAppPreferences()
const isSheet = computed(() => mediaOpenMode.value === 'sheet')

// Drag-to-close on the sheet handle
const dragY = ref(0)
const dragStartY = ref(0)
const dragging = ref(false)
const sheetStyle = computed(() => {
  if (!dragging.value || dragY.value <= 0) return {}
  return { transform: `translateY(${dragY.value}px)`, transition: 'none' }
})
function onSheetDown(e: PointerEvent) {
  if (!isSheet.value) return
  dragging.value = true
  dragStartY.value = e.clientY
  dragY.value = 0
  ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
}
function onSheetMove(e: PointerEvent) {
  if (!dragging.value) return
  dragY.value = Math.max(0, e.clientY - dragStartY.value)
}
function onSheetUp() {
  if (!dragging.value) return
  dragging.value = false
  if (dragY.value > 90) {
    dragY.value = 0
    pane.minimizeMobile()
  } else {
    dragY.value = 0
  }
}
</script>

<template>
  <div class="min-[1024px]:hidden">
    <!-- Mini player -->
    <Transition name="mini">
      <div
        v-if="selected && !mobileFull"
        class="w-fit fixed left-3 right-3 bottom-[4.5rem] z-[80] bg-[#151a24] border border-slate-700 rounded-xl shadow-2xl flex items-center gap-3 p-2"
      >
        <button class="shrink-0" @click="pane.openMobileFull()">
          <img v-if="firstImage" :src="firstImage.url" class="w-11 h-11 rounded-lg object-cover" />
          <div v-else class="w-11 h-11 rounded-lg bg-slate-800 flex items-center justify-center">
            <Icon :name="kindIcon" class="w-5 h-5 text-indigo-400" />
          </div>
        </button>
        <button class="flex-1 min-w-0 text-left" @click="pane.openMobileFull()">
          <p class="text-sm font-bold text-white truncate">{{ selected.user?.displayName || 'メディア' }}</p>
          <p class="text-[11px] text-slate-500 truncate">{{ selected.content || sourceLabel || 'タップして開く' }}</p>
        </button>
        <button class="p-2 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition shrink-0" @click="pane.closeMobile()">
          <Icon name="lucide:x" class="w-4 h-4" />
        </button>
      </div>
    </Transition>

    <!-- Fullscreen / action sheet detail -->
    <Transition name="sheet">
      <div v-if="selected && mobileFull" class="fixed inset-0 z-[120] flex flex-col justify-end">
        <div v-if="isSheet" class="absolute inset-0 bg-black/60" @click="pane.minimizeMobile()" />

        <div
          class="relative flex flex-col bg-[#0b0f19] overflow-hidden"
          :class="isSheet ? 'rounded-t-3xl border-t border-slate-700 shadow-2xl max-h-[92vh]' : 'inset-0 h-full'"
          :style="isSheet ? { height: '92vh', ...sheetStyle } : {}"
        >
          <!-- Grab handle (action sheet) -->
          <div
            v-if="isSheet"
            class="shrink-0 flex flex-col items-center pt-2 pb-1 cursor-grab active:cursor-grabbing select-none touch-none"
            @pointerdown="onSheetDown" @pointermove="onSheetMove" @pointerup="onSheetUp" @pointercancel="onSheetUp"
          >
            <div class="w-10 h-1 rounded-full bg-slate-700" />
            <span class="text-[10px] text-slate-600 mt-1">下にドラッグして戻る</span>
          </div>

          <div class="h-12 px-2 flex items-center gap-2 border-b border-slate-800 shrink-0">
            <button class="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition" @click="pane.minimizeMobile()" title="戻る">
              <Icon :name="isSheet ? 'lucide:chevrons-down' : 'lucide:chevron-down'" class="w-5 h-5" />
            </button>
            <span class="text-sm font-bold text-white truncate flex-1">{{ selected.user?.displayName || 'メディア' }}</span>
            <a v-if="download.href" :href="download.href" :download="download.name" class="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition" title="元のファイルをダウンロード">
              <Icon name="lucide:download" class="w-5 h-5" />
            </a>
            <button class="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition" @click="pane.closeMobile()" title="閉じる">
              <Icon name="lucide:x" class="w-5 h-5" />
            </button>
          </div>

        <div class="flex-1 overflow-y-auto min-h-0">
          <div class="px-3 pt-3">
            <VideoPlayer v-if="firstVideo" :src="firstVideo.url" />
            <ImageGallery v-else-if="images.length" :images="images" :index="mediaIndex" @update:index="mediaIndex = $event" />
            <MusicPlayer
              v-else-if="firstAudio"
              :src="firstAudio.url"
              title="オーディオ"
              :artist="'@' + (selected.user?.username || '')"
            />
            <ModelViewer v-else-if="firstModel" :src="firstModel.url" />

            <div v-else-if="files.length" class="space-y-2">
              <FileCard v-for="f in files" :key="f.id" :url="f.url" :mime="f.mime" />
            </div>
          </div>

          <div class="px-3 py-3">
            <p v-if="selected.content" class="text-slate-200 text-sm leading-relaxed whitespace-pre-wrap break-words" v-html="renderRichText(selected.content, { custom: customEmojiMap })" />
            <div class="flex items-center gap-4 mt-3 text-slate-500 text-sm">
              <span class="flex items-center gap-1.5"><Icon name="lucide:smile-plus" class="w-4 h-4" />{{ (selected.reactions || []).reduce((n: number, r: any) => n + (r.count || 0), 0) }}</span>
              <span class="flex items-center gap-1.5"><Icon name="lucide:repeat-2" class="w-4 h-4" />{{ selected.repostCount || 0 }}</span>
              <span class="ml-auto">{{ timeAgo(selected.createdAt) }}</span>
            </div>
          </div>

          <div class="border-t border-slate-800 min-h-[40vh]">
            <PostComments :post="selected" @update="onPatch" />
          </div>
        </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.mini-enter-active, .mini-leave-active, .sheet-enter-active, .sheet-leave-active { transition: all 0.25s ease; }
.mini-enter-from, .mini-leave-to { opacity: 0; transform: translateY(12px); }
.sheet-enter-from, .sheet-leave-to { opacity: 0; transform: translateY(20px); }
</style>
