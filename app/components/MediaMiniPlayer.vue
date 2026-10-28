<script setup lang="ts">
const { map: customEmojiMap } = useCustomEmojis()

import VideoPlayer from './media/VideoPlayer.vue'
import MusicPlayer from './media/MusicPlayer.vue'
import ImageGallery from './media/ImageGallery.vue'
import FileCard from './media/FileCard.vue'
import ModelViewer from './media/ModelViewer.vue'

const MODEL_EXT = /\.(glb|gltf|obj|fbx|stl|3ds)(\?|$)/i

const pane = useMediaPane()
const { selected, sourceLabel, mobileFull, threadOpen, kind } = pane

const miniRef = ref<HTMLElement | null>(null)
/**
 * This bar is 72px off the bottom edge on mobile -- taller than the pill's slot
 * and sitting *inside* the clearance a page reserves for the pill, so lists were
 * still being covered while media played. Registering its real height makes the
 * page pad past whichever overlay is currently tallest.
 */
useBottomInsetReporter(
  'mini-player',
  () => miniRef.value,
  () => !!selected.value && !mobileFull.value && !threadOpen.value
)

const mediaIndex = ref(0)
const threadDragStart = ref({ x: 0, y: 0 })
const threadDragX = ref(0)
const threadDragging = ref(false)
const threadPointerId = ref<number | null>(null)
const backdropDragStart = ref({ x: 0, y: 0 })
const backdropDragX = ref(0)
const backdropDragging = ref(false)
const backdropPointerId = ref<number | null>(null)
const threadStyle = computed(() => ({
  '--thread-drag-x': `${Math.max(0, threadDragX.value)}px`,
  ...(threadDragging.value ? { transition: 'none' } : {}),
}))

function onThreadPointerDown(event: PointerEvent) {
  if (event.pointerType === 'mouse' && event.button !== 0) return
  if ((event.target as HTMLElement).closest('button, a, input, textarea, select, [contenteditable="true"]')) return
  threadPointerId.value = event.pointerId
  threadDragStart.value = { x: event.clientX, y: event.clientY }
  threadDragX.value = 0
  threadDragging.value = false
}

function onThreadPointerMove(event: PointerEvent) {
  if (event.pointerId !== threadPointerId.value) return
  const dx = event.clientX - threadDragStart.value.x
  const dy = event.clientY - threadDragStart.value.y
  if (dx < 8 || Math.abs(dy) > dx) return
  if (!threadDragging.value) {
    threadDragging.value = true
    ;(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId)
  }
  if (event.cancelable) event.preventDefault()
  threadDragX.value = dx
}

function onThreadPointerUp(event: PointerEvent) {
  if (event.pointerId !== threadPointerId.value) return
  const shouldClose = threadDragX.value > 100
  threadDragging.value = false
  threadDragX.value = 0
  threadPointerId.value = null
  if (shouldClose) pane.closeComments()
}

function onBackdropPointerDown(event: PointerEvent) {
  if (event.pointerType === 'mouse' && event.button !== 0) return
  backdropPointerId.value = event.pointerId
  backdropDragStart.value = { x: event.clientX, y: event.clientY }
  backdropDragX.value = 0
  backdropDragging.value = false
}

function onBackdropPointerMove(event: PointerEvent) {
  if (event.pointerId !== backdropPointerId.value) return
  const dx = event.clientX - backdropDragStart.value.x
  const dy = event.clientY - backdropDragStart.value.y
  if (dx < 10 || Math.abs(dy) > dx) return
  if (!backdropDragging.value) {
    backdropDragging.value = true
    ;(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId)
  }
  if (event.cancelable) event.preventDefault()
  backdropDragX.value = dx
}

function onBackdropPointerUp(event: PointerEvent) {
  if (event.pointerId !== backdropPointerId.value) return
  const shouldClose = backdropDragX.value > 56
  backdropDragging.value = false
  backdropDragX.value = 0
  backdropPointerId.value = null
  if (shouldClose) pane.closeComments()
}
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
        v-if="selected && !mobileFull && !threadOpen"
        ref="miniRef"
        class="w-fit max-w-[300px] fixed left-3 right-3 bottom-[4.5rem] z-[80] bg-surface-container border border-outline rounded-xl shadow-2xl flex items-center gap-3 p-2"
      >
        <button class="shrink-0" @click="pane.openMobileFull()">
          <img v-if="firstImage" :src="firstImage.url" class="w-11 h-11 rounded-lg object-cover" />
          <div v-else class="w-11 h-11 rounded-lg bg-surface-container flex items-center justify-center">
            <Icon :name="kindIcon" class="w-5 h-5 text-indigo-400" />
          </div>
        </button>
        <button class="flex-1 min-w-0 text-left" @click="pane.openMobileFull()">
          <p class="text-sm font-bold text-white truncate">{{ selected.user?.displayName || 'メディア' }}</p>
          <p class="text-[11px] text-on-surface-variant truncate">{{ selected.content || sourceLabel || 'タップして開く' }}</p>
        </button>
        <button class="min-w-10 min-h-10 min-[681px]:min-w-8 min-[681px]:min-h-8 p-2 rounded-lg flex items-center justify-center text-on-surface-variant hover:text-white hover:bg-surface-container transition shrink-0" @click="pane.closeMobile()" title="閉じる" aria-label="ミニプレイヤーを閉じる">
          <Icon name="lucide:x" class="w-4 h-4" />
        </button>
      </div>
    </Transition>

    <!-- Right-edge thread drawer: leave the timeline underneath and swipe right to return. -->
    <Transition name="thread-drawer">
      <div v-if="selected && threadOpen" class="fixed inset-0 z-[130]">
        <button
          class="absolute inset-0 bg-black/25"
          aria-label="タイムラインに戻る"
          @click="pane.closeComments()"
          @pointerdown="onBackdropPointerDown"
          @pointermove="onBackdropPointerMove"
          @pointerup="onBackdropPointerUp"
          @pointercancel="onBackdropPointerUp"
        />
        <section
          class="thread-drawer-panel absolute inset-y-0 right-0 flex w-[min(94vw,34rem)] flex-col overflow-hidden border-l border-white/10 bg-surface shadow-[-24px_0_60px_rgba(0,0,0,.38)]"
          :style="threadStyle"
          @pointerdown="onThreadPointerDown"
          @pointermove="onThreadPointerMove"
          @pointerup="onThreadPointerUp"
          @pointercancel="onThreadPointerUp"
        >
          <header class="shrink-0 border-b border-outline-variant bg-surface/95 px-4 pb-3 pt-[max(env(safe-area-inset-top),0.75rem)] backdrop-blur">
            <div class="flex items-center gap-3">
              <span class="h-8 w-1 rounded-full bg-indigo-400/70" aria-hidden="true" />
              <div class="min-w-0 flex-1">
                <h2 class="text-sm font-bold text-white">返信</h2>
                <p class="truncate text-[11px] text-on-surface-variant">{{ selected.user?.displayName || '投稿' }} のスレッド</p>
              </div>
              <button
                class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-on-surface-variant transition hover:bg-surface-container hover:text-white"
                title="タイムラインに戻る"
                aria-label="タイムラインに戻る"
                @click="pane.closeComments()"
              >
                <Icon name="lucide:x" class="h-5 w-5" />
              </button>
            </div>
          </header>
          <div class="shrink-0 border-b border-outline-variant/70 px-4 py-3">
            <p v-if="selected.content" class="line-clamp-4 whitespace-pre-wrap break-words text-sm leading-relaxed text-on-surface" v-html="renderRichText(selected.content, { custom: customEmojiMap })" />
            <QuotedPostCard
              v-if="selected.quotedPost"
              :post="selected.quotedPost"
              class="mt-2"
              @open="pane.openSmart(selected.quotedPost, sourceLabel)"
            />
          </div>
          <div class="min-h-0 flex-1 overflow-hidden">
            <PostComments :post="selected" @update="onPatch" />
          </div>
          <div class="shrink-0 bg-surface" style="padding-bottom: env(safe-area-inset-bottom)" />
        </section>
      </div>
    </Transition>

    <!-- Fullscreen / action sheet detail -->
    <Transition name="sheet">
      <div v-if="selected && mobileFull" class="fixed inset-0 z-[120] flex flex-col justify-end">
        <div v-if="isSheet" class="absolute inset-0 bg-black/60" @click="pane.minimizeMobile()" />

        <div
          class="relative flex flex-col bg-surface overflow-hidden"
          :class="isSheet ? 'rounded-t-3xl border-t border-outline shadow-2xl max-h-[92vh]' : 'inset-0 h-full'"
          :style="isSheet ? { height: '92vh', ...sheetStyle } : {}"
        >
          <!-- Grab handle (action sheet) -->
          <div
            v-if="isSheet"
            class="shrink-0 flex flex-col items-center pt-2 pb-1 cursor-grab active:cursor-grabbing select-none touch-none"
            @pointerdown="onSheetDown" @pointermove="onSheetMove" @pointerup="onSheetUp" @pointercancel="onSheetUp"
          >
            <div class="w-10 h-1 rounded-full bg-surface-container-high" />
            <span class="text-[10px] text-slate-600 mt-1">下にドラッグして戻る</span>
          </div>

          <div class="h-12 px-2 flex items-center gap-2 border-b border-outline-variant shrink-0">
            <button class="min-w-10 min-h-10 min-[681px]:min-w-9 min-[681px]:min-h-9 p-2 rounded-lg flex items-center justify-center text-on-surface-variant hover:text-white hover:bg-surface-container transition" @click="pane.minimizeMobile()" title="戻る">
              <Icon :name="isSheet ? 'lucide:chevrons-down' : 'lucide:chevron-down'" class="w-5 h-5" />
            </button>
            <span class="text-sm font-bold text-white truncate flex-1">{{ selected.user?.displayName || 'メディア' }}</span>
            <a v-if="download.href" :href="download.href" :download="download.name" class="min-w-10 min-h-10 min-[681px]:min-w-9 min-[681px]:min-h-9 p-2 rounded-lg flex items-center justify-center text-on-surface-variant hover:text-white hover:bg-surface-container transition" title="元のファイルをダウンロード">
              <Icon name="lucide:download" class="w-5 h-5" />
            </a>
            <button class="min-w-10 min-h-10 min-[681px]:min-w-9 min-[681px]:min-h-9 p-2 rounded-lg flex items-center justify-center text-on-surface-variant hover:text-white hover:bg-surface-container transition" @click="pane.closeMobile()" title="閉じる">
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
              <FileCard v-for="f in files" :key="f.id" :url="f.url" :mime="f.mime" :name="f.originalName || f.name" />
            </div>
          </div>

          <div class="px-3 py-3">
            <p v-if="selected.content" class="text-on-surface text-sm leading-relaxed whitespace-pre-wrap break-words" v-html="renderRichText(selected.content, { custom: customEmojiMap })" />
            <PostEmbeds v-if="selected.content" :content="selected.content" class="mt-2" :max="2" compact />
            <div class="flex items-center gap-4 mt-3 text-on-surface-variant text-sm">
              <span class="flex items-center gap-1.5"><Icon name="lucide:smile-plus" class="w-4 h-4" />{{ (selected.reactions || []).reduce((n: number, r: any) => n + (r.count || 0), 0) }}</span>
              <span class="flex items-center gap-1.5"><Icon name="lucide:repeat-2" class="w-4 h-4" />{{ selected.repostCount || 0 }}</span>
              <span class="ml-auto">{{ timeAgo(selected.createdAt) }}</span>
            </div>
          </div>

          <div class="border-t border-outline-variant min-h-[40vh]">
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
.thread-drawer-enter-active .thread-drawer-panel,
.thread-drawer-leave-active .thread-drawer-panel { transition: transform 240ms cubic-bezier(.2,.8,.2,1); }
.thread-drawer-enter-from .thread-drawer-panel,
.thread-drawer-leave-to .thread-drawer-panel { transform: translateX(100%); }
.thread-drawer-enter-active > button,
.thread-drawer-leave-active > button { transition: opacity 200ms ease; }
.thread-drawer-enter-from > button,
.thread-drawer-leave-to > button { opacity: 0; }
.thread-drawer-panel {
  transform: translateX(var(--thread-drag-x, 0px));
  transition: transform 220ms cubic-bezier(.2,.8,.2,1);
  touch-action: pan-y;
}
</style>
