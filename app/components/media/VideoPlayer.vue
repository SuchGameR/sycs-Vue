<script setup lang="ts">
const props = defineProps<{
  src: string
  poster?: string
  autoplay?: boolean
}>()

const video = ref<HTMLVideoElement | null>(null)
const playing = ref(false)
const muted = ref(false)
const current = ref(0)
const duration = ref(0)
const volume = ref(1)
const rate = ref(1)
const showControls = ref(true)
const container = ref<HTMLElement | null>(null)
let hideTimer: ReturnType<typeof setTimeout> | null = null

const RATES = [0.5, 0.75, 1, 1.25, 1.5, 2]

function toggle() {
  const el = video.value
  if (!el) return
  if (el.paused) el.play().catch(() => {}); else el.pause()
}

function onPlay() { playing.value = true; scheduleHide() }
function onPause() { playing.value = false; showControls.value = true }
function onTime() { current.value = video.value?.currentTime || 0 }
function onLoaded() { duration.value = video.value?.duration || 0 }

function seek(e: Event) {
  const el = video.value
  if (!el) return
  el.currentTime = Number((e.target as HTMLInputElement).value)
}

function setVolume(e: Event) {
  const v = Number((e.target as HTMLInputElement).value)
  volume.value = v
  if (video.value) { video.value.volume = v; video.value.muted = v === 0; muted.value = v === 0 }
}

function toggleMute() {
  const el = video.value
  if (!el) return
  el.muted = !el.muted
  muted.value = el.muted
}

function cycleRate() {
  const idx = RATES.indexOf(rate.value)
  rate.value = RATES[(idx + 1) % RATES.length]
  if (video.value) video.value.playbackRate = rate.value
}

async function toggleFullscreen() {
  const el = container.value
  if (!el) return
  if (document.fullscreenElement) await document.exitFullscreen().catch(() => {})
  else await el.requestFullscreen().catch(() => {})
}

function scheduleHide() {
  showControls.value = true
  if (hideTimer) clearTimeout(hideTimer)
  hideTimer = setTimeout(() => { if (playing.value) showControls.value = false }, 2600)
}

function fmt(t: number) {
  if (!isFinite(t)) return '0:00'
  const m = Math.floor(t / 60)
  const s = Math.floor(t % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}

const progress = computed(() => duration.value ? (current.value / duration.value) * 100 : 0)

onUnmounted(() => { if (hideTimer) clearTimeout(hideTimer) })
</script>

<template>
  <div
    ref="container"
    class="relative group/video rounded-xl overflow-hidden bg-black select-none"
    @mousemove="scheduleHide"
    @mouseleave="playing && (showControls = false)"
  >
    <video
      ref="video"
      :src="src"
      :poster="poster"
      :autoplay="autoplay !== false"
      playsinline
      class="w-full max-h-[60vh] bg-black cursor-pointer"
      @click="toggle"
      @play="onPlay"
      @pause="onPause"
      @timeupdate="onTime"
      @loadedmetadata="onLoaded"
      @ended="onPause"
    />

    <button
      v-if="!playing"
      class="absolute inset-0 flex items-center justify-center bg-black/20 transition"
      @click="toggle"
    >
      <span class="w-16 h-16 rounded-full bg-white/15 backdrop-blur flex items-center justify-center border border-white/20">
        <Icon name="lucide:play" class="w-7 h-7 text-white ml-1" />
      </span>
    </button>

    <div
      class="absolute inset-x-0 bottom-0 p-2.5 bg-gradient-to-t from-black/85 to-transparent transition-opacity duration-200"
      :class="showControls || !playing ? 'opacity-100' : 'opacity-0 pointer-events-none'"
    >
      <input
        type="range"
        min="0"
        :max="duration || 0"
        step="0.1"
        :value="current"
        @input="seek"
        class="w-full accent-indigo-500 h-1 cursor-pointer"
        :style="{ backgroundSize: progress + '% 100%' }"
      />
      <div class="flex items-center gap-2 mt-1.5">
        <button @click="toggle" class="p-1 rounded-md text-white hover:bg-white/15 transition">
          <Icon :name="playing ? 'lucide:pause' : 'lucide:play'" class="w-4 h-4" />
        </button>
        <span class="text-[11px] text-white/80 tabular-nums">{{ fmt(current) }} / {{ fmt(duration) }}</span>
        <div class="flex-1" />
        <button @click="cycleRate" class="px-1.5 py-0.5 rounded-md text-[11px] font-bold text-white/80 hover:bg-white/15 transition tabular-nums">
          {{ rate }}x
        </button>
        <div class="flex items-center gap-1 group/vol">
          <button @click="toggleMute" class="p-1 rounded-md text-white hover:bg-white/15 transition">
            <Icon :name="muted || volume === 0 ? 'lucide:volume-x' : volume < 0.5 ? 'lucide:volume-1' : 'lucide:volume-2'" class="w-4 h-4" />
          </button>
          <input type="range" min="0" max="1" step="0.05" :value="muted ? 0 : volume" @input="setVolume" class="w-0 group-hover/vol:w-16 transition-all accent-indigo-500 h-1 cursor-pointer" />
        </div>
        <button @click="toggleFullscreen" class="p-1 rounded-md text-white hover:bg-white/15 transition">
          <Icon name="lucide:maximize" class="w-4 h-4" />
        </button>
      </div>
    </div>
  </div>
</template>
