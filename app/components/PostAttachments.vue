<script setup lang="ts">
import FileCard from './media/FileCard.vue'
import MusicPlayer from './media/MusicPlayer.vue'

const MODEL_EXT = /\.(glb|gltf|obj|fbx|stl|3ds)(\?|$)/i

const props = defineProps<{
  attachments: Array<{
    id: string
    url: string
    blurUrl?: string | null
    type: string
    mime: string
  }>
  interactive?: boolean
  imageLightbox?: boolean
  postId?: string
}>()

const emit = defineEmits<{ open: [index: number] }>()

const pane = useMediaPane()
const inPane = computed(() => !!props.postId && pane.selected.value?.id === props.postId)

watch(inPane, (pause) => {
  if (!pause || !el.value) return
  el.value.querySelectorAll('video,audio').forEach((node) => (node as HTMLMediaElement).pause())
})

const blurredMap = ref<Record<string, boolean>>({})

for (const att of props.attachments) {
  blurredMap.value[att.id] = !!att.blurUrl
}

function reveal(id: string) {
  blurredMap.value[id] = false
}

function displayUrl(att: any) {
  if (att.blurUrl && blurredMap.value[att.id]) return att.blurUrl
  return att.url
}

function isBlurred(att: any) {
  return att.blurUrl && blurredMap.value[att.id]
}

function isImage(mime: string) { return mime.startsWith('image/') }
function isVideo(mime: string) { return mime.startsWith('video/') }
function isAudio(mime: string) { return mime.startsWith('audio/') }
function isModel(att: any) {
  const m = String(att?.mime || att?.type || '').toLowerCase()
  return m.startsWith('model/') || MODEL_EXT.test(String(att?.url || ''))
}

const el = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null

onMounted(() => {
  if (!el.value) return
  observer = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting) {
      for (const att of props.attachments) {
        if (att.blurUrl) {
          blurredMap.value[att.id] = true
        }
      }
    }
  }, { threshold: 0 })
  observer.observe(el.value)
})

onUnmounted(() => {
  observer?.disconnect()
  if (trackRaf) cancelAnimationFrame(trackRaf)
})

function gridClass(count: number) {
  if (props.attachments.some(a => !isImage(a.mime) && !isVideo(a.mime) && !isAudio(a.mime))) return 'grid-cols-1'
  if (count === 1) return 'grid-cols-1'
  if (count <= 4) return 'grid-cols-2'
  return 'grid-cols-3'
}

/**
 * 1 枚だけのときはトリミングせず原寸比のまま収める。
 * 縦長は「縦を優先」して最大 600px まで見せ、横長は幅で詰める。
 * max-w / max-h を同時に効かせればブラウザが比を保ったまま縮尺を決める。
 * 複数枚は画像はカルーセルに回るので、ここに残るのは動画などの非画像だけ。
 */
function mediaClass(count: number) {
  if (count === 1) return 'mx-auto block w-auto h-auto max-w-full max-h-[600px] object-contain'
  return 'w-full h-48 object-cover'
}

type AttachmentItem = { att: any; index: number }

/**
 * 画像はカルーセル、非画像は従来のグリッドに振り分ける。
 * emit('open') / openModal() が参照するのは attachments の添字なので、
 * 振り分け後も元の添字を必ず一緒に持ち回す。
 */
function splitBy(pred: (att: any) => boolean) {
  const out: AttachmentItem[] = []
  props.attachments.forEach((att, index) => {
    if (pred(att)) out.push({ att, index })
  })
  return out
}

const imageItems = computed<AttachmentItem[]>(() => splitBy((att) => isImage(att.mime)))
const otherItems = computed<AttachmentItem[]>(() => splitBy((att) => !isImage(att.mime)))

/** 画像は 2 枚以上あるときだけカルーセル (1 枚は従来どおりの表示) */
const carousel = computed(() => imageItems.value.length > 1)

const gridItems = computed<AttachmentItem[]>(() => (carousel.value
  ? otherItems.value
  : props.attachments.map((att, index) => ({ att, index }))))

const trackEl = ref<HTMLElement | null>(null)
const slideIndex = ref(0)
let trackRaf = 0

/** snap-center なので「スクロール位置 / トラック幅」で今どの画像か分かる */
function onTrackScroll() {
  if (trackRaf) return
  trackRaf = requestAnimationFrame(() => {
    trackRaf = 0
    const track = trackEl.value
    if (!track) return
    const width = track.clientWidth || 1
    slideIndex.value = Math.min(Math.max(0, Math.round(track.scrollLeft / width)), imageItems.value.length - 1)
  })
}

function scrollSlide(delta: number) {
  const track = trackEl.value
  if (!track) return
  const next = Math.min(Math.max(0, slideIndex.value + delta), imageItems.value.length - 1)
  track.scrollTo({ left: next * track.clientWidth, behavior: 'smooth' })
}

const modalOpen = ref(false)
const modalIndex = ref(0)
const zoomLevel = ref(1)
const pan = ref({ x: 0, y: 0 })
let isDragging = false
let dragStart = { x: 0, y: 0 }
const modalImg = ref<HTMLImageElement | null>(null)

/**
 * 長押しで「詳細」を見る。
 * interactive (タイムライン内) なら既存のメディアペインへ、
 * それ以外はコンポーネント内のライトボックスを開く。
 */
function onLongPressAtt(att: any, index: number) {
  if (props.interactive && !props.imageLightbox) {
    emit('open', index)
    return
  }
  openModal(index)
}

function openModal(index: number) {
  modalIndex.value = index
  zoomLevel.value = 1
  pan.value = { x: 0, y: 0 }
  modalOpen.value = true
}

function closeModal() {
  modalOpen.value = false
}

function downloadCurrent() {
  const att = props.attachments[modalIndex.value]
  if (!att) return
  const link = document.createElement('a')
  link.href = att.url
  link.download = att.url.split('/').pop() || 'download'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

function zoomIn() {
  zoomLevel.value = Math.min(zoomLevel.value + 0.5, 5)
  nextTick(clampPan)
}

function zoomOut() {
  zoomLevel.value = Math.max(zoomLevel.value - 0.5, 0.5)
  nextTick(clampPan)
}

function zoomReset() {
  zoomLevel.value = 1
  pan.value = { x: 0, y: 0 }
}

function clampPan() {
  if (!modalImg.value || zoomLevel.value <= 1) {
    pan.value = { x: 0, y: 0 }
    return
  }
  const rect = modalImg.value.getBoundingClientRect()
  const viewW = window.innerWidth
  const viewH = window.innerHeight
  const overX = Math.max(0, (rect.width - viewW) / 2)
  const overY = Math.max(0, (rect.height - viewH) / 2)
  pan.value.x = Math.min(Math.max(pan.value.x, -overX), overX)
  pan.value.y = Math.min(Math.max(pan.value.y, -overY), overY)
}

function onWheel(e: WheelEvent) {
  e.preventDefault()
  const delta = e.deltaY > 0 ? -0.25 : 0.25
  zoomLevel.value = Math.min(Math.max(zoomLevel.value + delta, 0.5), 5)
  nextTick(clampPan)
}

function onMouseDown(e: MouseEvent) {
  if (zoomLevel.value <= 1) return
  isDragging = true
  dragStart = { x: e.clientX - pan.value.x, y: e.clientY - pan.value.y }
}

function onMouseMove(e: MouseEvent) {
  if (!isDragging) return
  pan.value = { x: e.clientX - dragStart.x, y: e.clientY - dragStart.y }
}

function onMouseUp() {
  if (!isDragging) return
  isDragging = false
  clampPan()
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') closeModal()
}

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
})
</script>

<template>
  <div ref="el" v-if="attachments.length" class="mt-2">
    <div v-if="carousel" class="relative group rounded-lg overflow-hidden bg-surface/50">
      <div ref="trackEl" class="sycs-hscroll flex overflow-x-auto snap-x snap-mandatory"
        @scroll.passive="onTrackScroll">
        <LongPress
          v-for="item in imageItems"
          :key="item.att.id"
          :delay="420"
          :move-tolerance="24"
          class="sycs-pressable snap-center shrink-0 w-full"
          @longpress="onLongPressAtt(item.att, item.index)"
        >
          <div class="relative w-full flex items-center justify-center">
            <img :src="displayUrl(item.att)" loading="lazy" draggable="false"
              class="w-full max-h-[600px] object-contain select-none cursor-pointer transition duration-300"
              @click.stop="isBlurred(item.att) ? reveal(item.att.id) : ((props.interactive && !props.imageLightbox) ? emit('open', item.index) : openModal(item.index))"
              @dblclick="!props.interactive && openModal(item.index)" />

            <div v-if="isBlurred(item.att)"
              class="absolute inset-0 flex items-center justify-center cursor-pointer"
              @click="reveal(item.att.id)">
              <div class="bg-black/50 backdrop-blur-sm rounded-full px-4 py-2 text-white text-sm font-bold flex items-center gap-2">
                <Icon name="lucide:eye-off" class="w-4 h-4" />
                閲覧するにはクリック
              </div>
            </div>
          </div>
        </LongPress>
      </div>

      <div class="absolute bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-black/60 text-[10px] text-white/80 tabular-nums pointer-events-none">
        {{ slideIndex + 1 }} / {{ imageItems.length }}
      </div>

      <button v-if="slideIndex > 0" @click.stop="scrollSlide(-1)" title="前の画像"
        class="hidden min-[1024px]:flex absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 text-white items-center justify-center transition opacity-0 group-hover:opacity-100 focus-visible:opacity-100">
        <Icon name="lucide:chevron-left" class="w-5 h-5" />
      </button>
      <button v-if="slideIndex < imageItems.length - 1" @click.stop="scrollSlide(1)" title="次の画像"
        class="hidden min-[1024px]:flex absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 text-white items-center justify-center transition opacity-0 group-hover:opacity-100 focus-visible:opacity-100">
        <Icon name="lucide:chevron-right" class="w-5 h-5" />
      </button>
    </div>

    <div v-if="gridItems.length" class="grid gap-1.5"
      :class="[gridClass(attachments.length), carousel ? 'mt-1.5' : '']">
    <LongPress
      v-for="item in gridItems"
      :key="item.att.id"
      :delay="420"
      class="sycs-pressable"
      @longpress="onLongPressAtt(item.att, item.index)"
    >
    <div
      class="relative group rounded-lg overflow-hidden bg-surface/50"
      :class="attachments.length === 1 ? 'w-fit mx-auto max-w-full' : ''">
      <template v-if="isImage(item.att.mime)">
        <img :src="displayUrl(item.att)" loading="lazy"
          :class="['cursor-pointer transition duration-300', mediaClass(attachments.length)]"
          @click.stop="isBlurred(item.att) ? reveal(item.att.id) : ((props.interactive && !props.imageLightbox) ? emit('open', item.index) : openModal(item.index))"
          @dblclick="!props.interactive && openModal(item.index)" />

        <div v-if="isBlurred(item.att)"
          class="absolute inset-0 flex items-center justify-center cursor-pointer"
          @click="reveal(item.att.id)">
          <div class="bg-black/50 backdrop-blur-sm rounded-full px-4 py-2 text-white text-sm font-bold flex items-center gap-2">
            <Icon name="lucide:eye-off" class="w-4 h-4" />
            閲覧するにはクリック
          </div>
        </div>
      </template>

      <template v-else-if="isVideo(item.att.mime)">
        <video :src="item.att.url" controls preload="metadata"
          :class="[mediaClass(attachments.length), 'bg-black']" />
        <button v-if="props.interactive" type="button"
          @click.stop="emit('open', item.index)"
          class="absolute top-2 right-2 flex items-center gap-1 bg-black/70 hover:bg-black/90 text-white text-xs font-bold rounded-full px-2.5 py-1 transition">
          <Icon name="lucide:maximize-2" class="w-3 h-3" /> 詳細
        </button>
      </template>

      <template v-else-if="isAudio(item.att.mime)">
        <div class="flex flex-col gap-2 mt-2 px-2 w-full">
          <MusicPlayer :src="item.att.url" />
          <button v-if="props.interactive" type="button"
            @click.stop="emit('open', item.index)"
            class="self-end p-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface transition shrink-0" title="詳細を開く">
            <Icon name="lucide:maximize-2" class="w-4 h-4" />
          </button>
        </div>
      </template>

      <template v-else-if="isModel(item.att)">
        <div class="relative">
          <div class="h-32 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-fuchsia-900/40 to-slate-900">
            <Icon name="lucide:box" class="w-8 h-8 text-fuchsia-400" />
            <span class="text-[11px] text-on-surface-variant">3Dモデル</span>
          </div>
          <button v-if="props.interactive" type="button"
            @click.stop="emit('open', item.index)"
            class="absolute top-2 right-2 flex items-center gap-1 bg-black/70 hover:bg-black/90 text-white text-xs font-bold rounded-full px-2.5 py-1 transition">
            <Icon name="lucide:maximize-2" class="w-3 h-3" /> 詳細
          </button>
        </div>
      </template>

      <template v-else>
        <FileCard :url="item.att.url" :mime="item.att.mime" />
        <button v-if="props.interactive" type="button"
          @click.stop="emit('open', item.index)"
          class="absolute top-2 right-2 flex items-center gap-1 bg-black/70 hover:bg-black/90 text-white text-xs font-bold rounded-full px-2.5 py-1 transition">
          <Icon name="lucide:maximize-2" class="w-3 h-3" /> 詳細
        </button>
      </template>
    </div>
    </LongPress>
  </div>
  </div>

  <Teleport to="body">
    <div v-if="modalOpen"
      class="fixed inset-0 z-[300] flex items-center justify-center bg-black/90 select-none"
      @wheel.prevent="onWheel"
      @mousedown="onMouseDown"
      @mousemove="onMouseMove"
      @mouseup="onMouseUp"
      @mouseleave="onMouseUp">
      <div class="relative w-full h-full flex items-center justify-center overflow-hidden" @click="closeModal">
        <img v-if="attachments[modalIndex]"
          :src="attachments[modalIndex].url"
          ref="modalImg"
          class="max-w-none"
          :class="{ 'cursor-grab': zoomLevel > 1, 'cursor-grabbing': isDragging }"
          :style="{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoomLevel})`,
            maxWidth: zoomLevel <= 1 ? '90%' : 'none',
            maxHeight: zoomLevel <= 1 ? '90vh' : 'none',
          }"
          @click.stop
          draggable="false" />

        <div class="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-black/60 rounded-full px-4 py-2" @click.stop>
          <button @click="zoomOut" class="text-white hover:text-indigo-400 transition p-1" title="縮小">
            <Icon name="lucide:zoom-out" class="w-5 h-5" />
          </button>
          <span class="text-white text-sm min-w-[3rem] text-center">{{ Math.round(zoomLevel * 100) }}%</span>
          <button @click="zoomIn" class="text-white hover:text-indigo-400 transition p-1" title="拡大">
            <Icon name="lucide:zoom-in" class="w-5 h-5" />
          </button>
          <span class="w-px h-6 bg-white/20" />
          <button @click="zoomReset" class="text-white hover:text-indigo-400 transition p-1" title="リセット">
            <Icon name="lucide:rotate-ccw" class="w-4 h-4" />
          </button>
          <button @click="downloadCurrent" class="text-white hover:text-indigo-400 transition p-1" title="ダウンロード">
            <Icon name="lucide:download" class="w-5 h-5" />
          </button>
        </div>

        <button @click="closeModal" class="absolute top-4 right-4 p-2 rounded-full bg-black/60 text-white hover:bg-black/80 transition">
          <Icon name="lucide:x" class="w-5 h-5" />
        </button>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.sycs-hscroll {
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.sycs-hscroll::-webkit-scrollbar {
  display: none;
}
</style>
