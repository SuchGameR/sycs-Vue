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
const buffered = ref(0)
const volume = ref(1)
const rate = ref(1)
const showControls = ref(true)
const seeking = ref(false)
const settingsOpen = ref(false)
const isFullscreen = ref(false)
const stageAspect = ref(16 / 9)
const hoverTime = ref<number | null>(null)
const hoverRatio = ref(0)
const container = ref<HTMLElement | null>(null)
const track = ref<HTMLElement | null>(null)
const menu = ref<HTMLElement | null>(null)
let hideTimer: ReturnType<typeof setTimeout> | null = null
let menuTimer: ReturnType<typeof setTimeout> | null = null

const RATES = [0.5, 0.75, 1, 1.25, 1.5, 2]

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v))
}

function toggle() {
  const el = video.value
  if (!el) return
  if (el.paused) el.play().catch(() => {}); else el.pause()
}

function onPlay() { playing.value = true; scheduleHide() }
function onPause() { playing.value = false; showControls.value = true }
function onTime() {
  if (!seeking.value) current.value = video.value?.currentTime || 0
  readBuffer()
}
function onLoaded() {
  const el = video.value
  if (!el) return
  duration.value = el.duration || 0
  if (el.videoWidth > 0 && el.videoHeight > 0) stageAspect.value = el.videoWidth / el.videoHeight
  readBuffer()
}

function readBuffer() {
  const el = video.value
  if (!el || !el.duration || el.buffered.length === 0) { buffered.value = 0; return }
  buffered.value = clamp((el.buffered.end(el.buffered.length - 1) / el.duration) * 100, 0, 100)
}

function seekToTime(t: number) {
  const el = video.value
  if (!el || !isFinite(t)) return
  const d = el.duration || duration.value || 0
  if (d <= 0) return
  el.currentTime = clamp(t, 0, d)
  current.value = el.currentTime
}

function ratioFromEvent(e: MouseEvent | TouchEvent) {
  const bar = track.value
  if (!bar) return 0
  const rect = bar.getBoundingClientRect()
  if (rect.width <= 0) return 0
  const x = 'touches' in e ? e.touches[0].clientX : e.clientX
  return clamp((x - rect.left) / rect.width, 0, 1)
}

function onBarMove(e: MouseEvent) {
  if (duration.value <= 0) return
  const p = ratioFromEvent(e)
  hoverRatio.value = p
  hoverTime.value = p * duration.value
}

function onBarLeave() { hoverTime.value = null }

function onBarDown(e: MouseEvent | TouchEvent) {
  if (duration.value <= 0) return
  seeking.value = true
  hoverTime.value = null
  current.value = ratioFromEvent(e) * duration.value
  window.addEventListener('mousemove', onBarDrag)
  window.addEventListener('touchmove', onBarDrag, { passive: false })
  window.addEventListener('mouseup', onBarUp)
  window.addEventListener('touchend', onBarUp)
}

function onBarDrag(e: MouseEvent | TouchEvent) {
  if ('touches' in e) e.preventDefault()
  if (duration.value <= 0) return
  const p = ratioFromEvent(e)
  current.value = p * duration.value
  hoverRatio.value = p
  hoverTime.value = p * duration.value
}

function onBarUp() {
  if (seeking.value) seekToTime(current.value)
  seeking.value = false
  window.removeEventListener('mousemove', onBarDrag)
  window.removeEventListener('touchmove', onBarDrag)
  window.removeEventListener('mouseup', onBarUp)
  window.removeEventListener('touchend', onBarUp)
}

function onKeySeek(delta: number) {
  seekToTime((video.value?.currentTime || current.value) + delta)
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

function setRate(r: number) {
  rate.value = r
  settingsOpen.value = false
  if (video.value) video.value.playbackRate = r
}

async function toggleFullscreen() {
  const el = container.value
  if (!el) return
  if (document.fullscreenElement) await document.exitFullscreen().catch(() => {})
  else await el.requestFullscreen().catch(() => {})
}

function onFullscreenChange() {
  isFullscreen.value = !!document.fullscreenElement
}

function scheduleHide() {
  showControls.value = true
  if (hideTimer) clearTimeout(hideTimer)
  hideTimer = setTimeout(() => {
    if (playing.value && !seeking.value && !settingsOpen.value) showControls.value = false
  }, 2600)
}

function onLeave() {
  if (playing.value && !settingsOpen.value) showControls.value = false
}

function onDocPointer(e: PointerEvent) {
  if (menu.value && !menu.value.contains(e.target as Node)) settingsOpen.value = false
}

function onMenuKey(e: KeyboardEvent) {
  if (e.key === 'Escape') settingsOpen.value = false
}

function fmt(t: number) {
  if (!isFinite(t)) return '0:00'
  const m = Math.floor(t / 60)
  const s = Math.floor(t % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}

const progress = computed(() => {
  const d = duration.value
  if (d <= 0) return 0
  return clamp((current.value / d) * 100, 0, 100)
})

watch(settingsOpen, (open) => {
  if (menuTimer) clearTimeout(menuTimer)
  if (!open) {
    document.removeEventListener('pointerdown', onDocPointer)
    document.removeEventListener('keydown', onMenuKey)
    return
  }
  // 開いた直後の pointerdown caught 自分なので、次のタスクで購読する
  menuTimer = setTimeout(() => {
    document.addEventListener('pointerdown', onDocPointer)
    document.addEventListener('keydown', onMenuKey)
  }, 0)
})

onMounted(() => document.addEventListener('fullscreenchange', onFullscreenChange))

onUnmounted(() => {
  if (hideTimer) clearTimeout(hideTimer)
  if (menuTimer) clearTimeout(menuTimer)
  document.removeEventListener('pointerdown', onDocPointer)
  document.removeEventListener('keydown', onMenuKey)
  document.removeEventListener('fullscreenchange', onFullscreenChange)
  window.removeEventListener('mousemove', onBarDrag)
  window.removeEventListener('touchmove', onBarDrag)
  window.removeEventListener('mouseup', onBarUp)
  window.removeEventListener('touchend', onBarUp)
})
</script>

<template>
  <div
    ref="container"
    class="vp-stage group/video rounded-xl overflow-hidden bg-black select-none"
    :style="{ '--vp-ar': String(stageAspect) }"
    @mousemove="scheduleHide"
    @mouseleave="onLeave"
    @touchstart="scheduleHide"
  >
    <video
      ref="video"
      :src="src"
      :poster="poster"
      :autoplay="autoplay !== false"
      playsinline
      class="vp-video cursor-pointer"
      @click="toggle"
      @play="onPlay"
      @pause="onPause"
      @timeupdate="onTime"
      @progress="readBuffer"
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
      class="vp-controls transition-opacity duration-200"
      :class="showControls || !playing ? 'opacity-100' : 'opacity-0 pointer-events-none'"
    >
      <div class="vp-bar" @mousemove="onBarMove" @mouseleave="onBarLeave">
        <div
          ref="track"
          class="vp-track"
          role="slider"
          :aria-label="'再生位置'"
          :aria-valuenow="Math.round(current)"
          :aria-valuemin="0"
          :aria-valuemax="Math.round(duration) || 0"
          :aria-valuetext="fmt(current) + ' / ' + fmt(duration)"
          tabindex="0"
          @mousedown="onBarDown"
          @touchstart.prevent="onBarDown"
          @keydown.left.prevent="onKeySeek(-5)"
          @keydown.right.prevent="onKeySeek(5)"
          @keydown.home.prevent="seekToTime(0)"
          @keydown.end.prevent="seekToTime(duration || 0)"
        >
          <div class="vp-buffer" :style="{ width: buffered + '%' }" />
          <div class="vp-fill" :style="{ width: progress + '%' }" />
          <div class="vp-thumb" :class="{ 'is-active': seeking }" :style="{ left: 'calc(' + progress + '% - 6px)' }" />
          <div v-if="hoverTime !== null" class="vp-tip" :style="{ left: 'calc(' + (hoverRatio * 100) + '%)' }">
            {{ fmt(hoverTime) }}
          </div>
        </div>
      </div>

      <div class="vp-row">
        <button
          @click="toggle"
          class="p-1.5 rounded-md text-white hover:bg-white/15 transition"
          :title="playing ? '一時停止' : '再生'"
        >
          <Icon :name="playing ? 'lucide:pause' : 'lucide:play'" class="w-4 h-4" />
        </button>
        <span class="text-[11px] text-white/80 tabular-nums">{{ fmt(current) }} / {{ fmt(duration) }}</span>
        <div class="flex-1" />
        <div ref="menu" class="relative shrink-0">
          <button
            @click="settingsOpen = !settingsOpen"
            class="p-1.5 rounded-md hover:bg-white/15 transition"
            :class="rate === 1 ? 'text-white' : 'text-indigo-300'"
            title="再生速度"
            aria-label="再生速度"
          >
            <Icon name="lucide:settings" class="w-4 h-4" />
          </button>
          <div v-if="settingsOpen" class="vp-menu">
            <p class="vp-menu-label">再生速度</p>
            <button
              v-for="r in RATES"
              :key="r"
              @click="setRate(r)"
              class="vp-menu-item"
              :class="r === rate ? 'is-on' : ''"
            >
              {{ r === 1 ? '標準' : r + 'x' }}
            </button>
          </div>
        </div>
        <div class="flex items-center gap-1 group/vol">
          <button @click="toggleMute" class="p-1.5 rounded-md text-white hover:bg-white/15 transition" title="ミュート切替">
            <Icon :name="muted || volume === 0 ? 'lucide:volume-x' : volume < 0.5 ? 'lucide:volume-1' : 'lucide:volume-2'" class="w-4 h-4" />
          </button>
          <input type="range" min="0" max="1" step="0.05" :value="muted ? 0 : volume" @input="setVolume" class="vp-vol" />
        </div>
        <button
          @click="toggleFullscreen"
          class="p-1.5 rounded-md text-white hover:bg-white/15 transition"
          :title="isFullscreen ? '全画面を終了' : '全画面'"
        >
          <Icon :name="isFullscreen ? 'lucide:minimize' : 'lucide:maximize'" class="w-4 h-4" />
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 高さは動画そのものの比率で決める（横幅は max-width で頭打ち）。
   枠と動画の比率が常に一致するので、余白も歪みも起きない。 */
.vp-stage {
  position: relative;
  width: 100%;
  max-width: calc(65vh * var(--vp-ar, 1.7778));
  aspect-ratio: var(--vp-ar, 1.7778);
  margin-inline: auto;
  min-height: 7rem;
}
.vp-stage:fullscreen,
.vp-stage:-webkit-full-screen {
  width: 100vw;
  height: 100vh;
  max-width: none;
  max-height: none;
  aspect-ratio: auto;
  min-height: 0;
  border-radius: 0;
}
.vp-video {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
  background-color: rgb(var(--t-black));
}
.vp-controls {
  position: absolute;
  inset-inline: 0;
  bottom: 0;
  z-index: 3;
  padding: 1.75rem 0.75rem 0.5rem;
  background-image: linear-gradient(to top, rgb(0 0 0 / 0.85), rgb(0 0 0 / 0.55) 45%, rgb(0 0 0 / 0));
}
.vp-bar {
  position: relative;
  display: flex;
  align-items: flex-end;
  height: 1.25rem;
}
.vp-track {
  position: relative;
  width: 100%;
  height: 3px;
  border-radius: 9999px;
  background-color: rgb(var(--md-sys-color-outline-variant) / 0.55);
  cursor: pointer;
  touch-action: none;
  transition: height 0.15s ease;
}
.vp-track::before {
  content: '';
  position: absolute;
  inset: -0.5rem 0;
}
.vp-track:focus-visible {
  outline: 2px solid rgb(var(--t-indigo-500));
  outline-offset: 3px;
}
.vp-bar:hover .vp-track,
.vp-track:focus-visible,
.vp-thumb.is-active {
  height: 5px;
}
.vp-buffer,
.vp-fill {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  border-radius: 9999px;
}
.vp-buffer {
  background-color: rgb(255 255 255 / 0.3);
}
.vp-fill {
  background-color: rgb(var(--t-indigo-500));
}
.vp-thumb {
  position: absolute;
  top: 50%;
  width: 0.75rem;
  height: 0.75rem;
  margin-top: -0.375rem;
  border-radius: 9999px;
  background-color: rgb(var(--t-indigo-500));
  box-shadow: 0 1px 2px 0 rgb(var(--md-sys-color-shadow) / 0.4);
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.15s ease;
}
.vp-bar:hover .vp-thumb,
.vp-track:focus-visible .vp-thumb,
.vp-thumb.is-active {
  opacity: 1;
}
.vp-tip {
  position: absolute;
  bottom: 0.9rem;
  transform: translateX(-50%);
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  font-size: 0.6875rem;
  line-height: 1.1;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  color: rgb(var(--t-white));
  background-color: rgb(0 0 0 / 0.8);
  pointer-events: none;
}
.vp-row {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  margin-top: 0.25rem;
}
.vp-menu {
  position: absolute;
  bottom: calc(100% + 0.375rem);
  right: 0;
  min-width: 7rem;
  padding: 0.25rem;
  border-radius: 0.5rem;
  background-color: rgb(var(--md-sys-color-surface-container-high) / 0.96);
  border: 1px solid rgb(var(--md-sys-color-outline-variant));
  box-shadow: 0 4px 12px 2px rgb(var(--md-sys-color-shadow) / 0.2);
}
.vp-menu-label {
  padding: 0.25rem 0.5rem 0.125rem;
  font-size: 0.625rem;
  color: rgb(var(--md-sys-color-on-surface-variant));
}
.vp-menu-item {
  display: block;
  width: 100%;
  padding: 0.3125rem 0.5rem;
  border-radius: 0.375rem;
  text-align: left;
  font-size: 0.75rem;
  font-variant-numeric: tabular-nums;
  color: rgb(var(--md-sys-color-on-surface));
  transition: background-color 0.15s ease;
}
.vp-menu-item:hover {
  background-color: rgb(var(--md-sys-color-surface-container-highest));
}
.vp-menu-item.is-on {
  color: rgb(var(--t-indigo-500));
  font-weight: 700;
}
.vp-vol {
  width: 0;
  opacity: 0;
  height: 0.25rem;
  cursor: pointer;
  accent-color: rgb(var(--t-indigo-500));
  transition: width 0.2s ease, opacity 0.2s ease;
}
.group:hover .vp-vol,
.vp-vol:focus {
  width: 4rem;
  opacity: 1;
}
</style>
