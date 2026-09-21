<script setup lang="ts">
const props = defineProps<{
  images: Array<{ id: string; url: string; blurUrl?: string | null; name?: string }>
  index: number
}>()
const emit = defineEmits<{ 'update:index': [value: number] }>()

const zoom = ref(1)
const pan = ref({ x: 0, y: 0 })
const dragging = ref(false)
const imgEl = ref<HTMLImageElement | null>(null)
let dragStart = { x: 0, y: 0 }

const current = computed(() => props.images[props.index] || null)

function reset() {
  zoom.value = 1
  pan.value = { x: 0, y: 0 }
}

function go(delta: number) {
  if (props.images.length < 2) return
  const next = (props.index + delta + props.images.length) % props.images.length
  emit('update:index', next)
  reset()
}

function setIndex(i: number) {
  emit('update:index', i)
  reset()
}

function zoomIn() { zoom.value = Math.min(zoom.value + 0.5, 5); nextTick(clamp) }
function zoomOut() { zoom.value = Math.max(zoom.value - 0.5, 0.5); nextTick(clamp) }

function onWheel(e: WheelEvent) {
  e.preventDefault()
  zoom.value = Math.min(Math.max(zoom.value + (e.deltaY > 0 ? -0.25 : 0.25), 0.5), 5)
  nextTick(clamp)
}

function clamp() {
  const el = imgEl.value
  if (!el || zoom.value <= 1) { pan.value = { x: 0, y: 0 }; return }
  const rect = el.getBoundingClientRect()
  const ox = Math.max(0, (rect.width - window.innerWidth) / 2)
  const oy = Math.max(0, (rect.height - window.innerHeight) / 2)
  pan.value.x = Math.min(Math.max(pan.value.x, -ox), ox)
  pan.value.y = Math.min(Math.max(pan.value.y, -oy), oy)
}

function onDown(e: PointerEvent) {
  if (zoom.value <= 1) return
  dragging.value = true
  dragStart = { x: e.clientX - pan.value.x, y: e.clientY - pan.value.y }
  ;(e.target as HTMLElement).setPointerCapture?.(e.pointerId)
}
function onMove(e: PointerEvent) {
  if (!dragging.value) return
  pan.value = { x: e.clientX - dragStart.x, y: e.clientY - dragStart.y }
}
function onUp() {
  if (!dragging.value) return
  dragging.value = false
  clamp()
}

function download() {
  if (!current.value) return
  const a = document.createElement('a')
  a.href = current.value.url
  a.download = current.value.name || current.value.url.split('/').pop() || 'image'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

watch(() => props.index, reset)
</script>

<template>
  <div class="rounded-xl overflow-hidden bg-black/40 relative">
    <div class="relative flex items-center justify-center min-h-[200px]">
      <img
        ref="imgEl"
        :src="current?.url"
        class="w-full max-h-[55vh] object-contain select-none"
        :class="zoom > 1 ? (dragging ? 'cursor-grabbing' : 'cursor-grab') : ''"
        :style="{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }"
        draggable="false"
        @wheel="onWheel"
        @pointerdown="onDown"
        @pointermove="onMove"
        @pointerup="onUp"
        @pointerleave="onUp"
      />

      <button v-if="images.length > 1" @click="go(-1)" class="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition">
        <Icon name="lucide:chevron-left" class="w-5 h-5" />
      </button>
      <button v-if="images.length > 1" @click="go(1)" class="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition">
        <Icon name="lucide:chevron-right" class="w-5 h-5" />
      </button>
    </div>

    <div class="absolute top-2 right-2 flex items-center gap-1 bg-black/60 rounded-full px-1.5 py-1">
      <button @click="zoomOut" class="p-1 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition" title="縮小">
        <Icon name="lucide:zoom-out" class="w-4 h-4" />
      </button>
      <span class="text-[10px] text-white/70 w-9 text-center tabular-nums">{{ Math.round(zoom * 100) }}%</span>
      <button @click="zoomIn" class="p-1 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition" title="拡大">
        <Icon name="lucide:zoom-in" class="w-4 h-4" />
      </button>
      <button @click="reset" class="p-1 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition" title="リセット">
        <Icon name="lucide:rotate-ccw" class="w-3.5 h-3.5" />
      </button>
      <button @click="download" class="p-1 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition" title="ダウンロード">
        <Icon name="lucide:download" class="w-4 h-4" />
      </button>
    </div>

    <div v-if="images.length > 1" class="absolute bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-black/60 text-[10px] text-white/80 tabular-nums">
      {{ index + 1 }} / {{ images.length }}
    </div>

    <div v-if="images.length > 1" class="flex gap-1.5 p-2 overflow-x-auto">
      <button
        v-for="(img, i) in images"
        :key="img.id"
        @click="setIndex(i)"
        class="w-12 h-12 rounded-lg overflow-hidden shrink-0 border-2 transition"
        :class="i === index ? 'border-indigo-500' : 'border-transparent opacity-60 hover:opacity-100'"
      >
        <img :src="img.url" class="w-full h-full object-cover" />
      </button>
    </div>
  </div>
</template>
