<script setup lang="ts">
import FileCard from './media/FileCard.vue'

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
})

function gridClass(count: number) {
  if (props.attachments.some(a => !isImage(a.mime) && !isVideo(a.mime) && !isAudio(a.mime))) return 'grid-cols-1'
  if (count === 1) return 'grid-cols-1'
  if (count <= 4) return 'grid-cols-2'
  return 'grid-cols-3'
}

function imageClass(count: number) {
  if (count === 1) return 'max-h-96'
  return 'h-48'
}

const modalOpen = ref(false)
const modalIndex = ref(0)
const zoomLevel = ref(1)
const pan = ref({ x: 0, y: 0 })
let isDragging = false
let dragStart = { x: 0, y: 0 }
const modalImg = ref<HTMLImageElement | null>(null)

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
  <div ref="el" v-if="attachments.length" class="mt-2 grid gap-1.5"
    :class="gridClass(attachments.length)">
    <div v-for="(att, i) in attachments" :key="att.id"
      class="relative group rounded-lg overflow-hidden bg-slate-900/50">
      <template v-if="isImage(att.mime)">
        <img :src="displayUrl(att)"
          :class="['w-full object-cover cursor-pointer transition duration-300', imageClass(attachments.length)]"
          @click.stop="isBlurred(att) ? reveal(att.id) : (props.interactive ? emit('open', i) : openModal(i))"
          @dblclick="!props.interactive && openModal(i)" />

        <div v-if="isBlurred(att)"
          class="absolute inset-0 flex items-center justify-center cursor-pointer"
          @click="reveal(att.id)">
          <div class="bg-black/50 backdrop-blur-sm rounded-full px-4 py-2 text-white text-sm font-bold flex items-center gap-2">
            <Icon name="lucide:eye-off" class="w-4 h-4" />
            閲覧するにはクリック
          </div>
        </div>
      </template>

      <template v-else-if="isVideo(att.mime)">
        <video :src="att.url" controls preload="metadata"
          class="w-full h-48 object-cover bg-black" />
        <button v-if="props.interactive" type="button"
          @click.stop="emit('open', i)"
          class="absolute top-2 right-2 flex items-center gap-1 bg-black/70 hover:bg-black/90 text-white text-xs font-bold rounded-full px-2.5 py-1 transition">
          <Icon name="lucide:maximize-2" class="w-3 h-3" /> 詳細
        </button>
      </template>

      <template v-else-if="isAudio(att.mime)">
        <div class="flex items-center gap-2 mt-4 px-2 w-full">
          <audio :src="att.url" controls class="flex-1 h-12" />
          <button v-if="props.interactive" type="button"
            @click.stop="emit('open', i)"
            class="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition shrink-0" title="詳細を開く">
            <Icon name="lucide:maximize-2" class="w-4 h-4" />
          </button>
        </div>
      </template>

      <template v-else-if="isModel(att)">
        <div class="relative">
          <div class="h-32 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-fuchsia-900/40 to-slate-900">
            <Icon name="lucide:box" class="w-8 h-8 text-fuchsia-400" />
            <span class="text-[11px] text-slate-400">3Dモデル</span>
          </div>
          <button v-if="props.interactive" type="button"
            @click.stop="emit('open', i)"
            class="absolute top-2 right-2 flex items-center gap-1 bg-black/70 hover:bg-black/90 text-white text-xs font-bold rounded-full px-2.5 py-1 transition">
            <Icon name="lucide:maximize-2" class="w-3 h-3" /> 詳細
          </button>
        </div>
      </template>

      <template v-else>
        <FileCard :url="att.url" :mime="att.mime" />
        <button v-if="props.interactive" type="button"
          @click.stop="emit('open', i)"
          class="absolute top-2 right-2 flex items-center gap-1 bg-black/70 hover:bg-black/90 text-white text-xs font-bold rounded-full px-2.5 py-1 transition">
          <Icon name="lucide:maximize-2" class="w-3 h-3" /> 詳細
        </button>
      </template>
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
