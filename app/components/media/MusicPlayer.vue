<script setup lang="ts">
const props = defineProps<{
  src: string
  title?: string
  artist?: string
  cover?: string
  autoplay?: boolean
}>()

const audio = ref<HTMLAudioElement | null>(null)
const playing = ref(false)
const current = ref(0)
const duration = ref(0)
const volume = ref(1)
const muted = ref(false)
const loop = ref(false)
const seeking = ref(false)
const dragX = ref(0)

const progressBar = ref<HTMLElement | null>(null)

function toggle() {
  const el = audio.value
  if (!el) return
  if (el.paused) el.play().catch(() => {}); else el.pause()
}

function onTime() {
  if (!seeking.value) {
    current.value = audio.value?.currentTime || 0
  }
}
function onLoaded() { duration.value = audio.value?.duration || 0 }

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v))
}

function percentToTime(p: number) {
  const d = duration.value
  if (!isFinite(d) || d <= 0) return 0
  return clamp(p, 0, 1) * d
}

function seekToTime(t: number) {
  const el = audio.value
  if (!el || !isFinite(t)) return
  const d = el.duration || duration.value
  if (!isFinite(d) || d <= 0) return
  el.currentTime = clamp(t, 0, d)
  current.value = el.currentTime
}

function onProgressBarClick(e: MouseEvent) {
  const bar = progressBar.value
  if (!bar) return
  const rect = bar.getBoundingClientRect()
  const p = (e.clientX - rect.left) / rect.width
  seekToTime(percentToTime(p))
}

function onDragStart(e: MouseEvent | TouchEvent) {
  seeking.value = true
  const x = 'touches' in e ? e.touches[0].clientX : e.clientX
  dragX.value = x
  updateDrag(x)
  window.addEventListener('mousemove', onDragMove)
  window.addEventListener('touchmove', onDragMove, { passive: false })
  window.addEventListener('mouseup', onDragEnd)
  window.addEventListener('touchend', onDragEnd)
}

function onDragMove(e: MouseEvent | TouchEvent) {
  if ('touches' in e) e.preventDefault()
  const x = 'touches' in e ? e.touches[0].clientX : e.clientX
  dragX.value = x
  updateDrag(x)
}

function updateDrag(x: number) {
  const bar = progressBar.value
  if (!bar) return
  const rect = bar.getBoundingClientRect()
  const p = clamp((x - rect.left) / rect.width, 0, 1)
  current.value = percentToTime(p)
}

function onDragEnd() {
  const bar = progressBar.value
  if (bar && seeking.value) {
    const rect = bar.getBoundingClientRect()
    const p = clamp((dragX.value - rect.left) / rect.width, 0, 1)
    seekToTime(percentToTime(p))
  }
  seeking.value = false
  window.removeEventListener('mousemove', onDragMove)
  window.removeEventListener('touchmove', onDragMove)
  window.removeEventListener('mouseup', onDragEnd)
  window.removeEventListener('touchend', onDragEnd)
}

function onKeySeek(delta: number) {
  const el = audio.value
  if (!el) return
  const step = delta * 5
  seekToTime((el.currentTime || current.value) + step)
}

function setVolume(e: Event) {
  const v = Number((e.target as HTMLInputElement).value)
  volume.value = v
  muted.value = v <= 0
  if (audio.value) {
    audio.value.volume = v
    audio.value.muted = false
  }
}

function toggleMute() {
  muted.value = !muted.value
  if (muted.value) {
    volume.value = 0
  } else if (volume.value <= 0) {
    volume.value = 1
  }
  if (audio.value) {
    audio.value.volume = volume.value
    audio.value.muted = muted.value
  }
}

function toggleLoop() {
  loop.value = !loop.value
  if (audio.value) audio.value.loop = loop.value
}

function skip(sec: number) {
  const el = audio.value
  if (!el) return
  const d = el.duration || duration.value || 0
  seekToTime(Math.max(0, Math.min((el.currentTime || current.value) + sec, d)))
}

function fmt(t: number) {
  if (!isFinite(t) || t < 0) return '0:00'
  const m = Math.floor(t / 60)
  const s = Math.floor(t % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}

const progress = computed(() => {
  const d = duration.value
  if (!d || d <= 0) return 0
  return clamp((current.value / d) * 100, 0, 100)
})

onUnmounted(() => {
  window.removeEventListener('mousemove', onDragMove)
  window.removeEventListener('touchmove', onDragMove)
  window.removeEventListener('mouseup', onDragEnd)
  window.removeEventListener('touchend', onDragEnd)
})
</script>

<template>
    <div class="rounded-2xl bg-surface-container p-3 sm:p-4 border border-outline-variant shadow-m3-1">
      <audio
        ref="audio"
        :src="src"
        :autoplay="autoplay !== false"
        @play="playing = true"
        @pause="playing = false"
        @timeupdate="onTime"
        @loadedmetadata="onLoaded"
        @ended="playing = false"
      />

      <div class="mp-shell">
        <div class="mp-main">
          <div class="relative w-14 h-14 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl overflow-hidden shrink-0 bg-surface-container-high flex items-center justify-center shadow-m3-1">
            <img v-if="cover" :src="cover" class="w-full h-full object-cover" />
            <Icon v-else name="lucide:music" class="w-6 h-6 sm:w-8 sm:h-8 text-on-surface-variant" :class="playing ? 'animate-pulse' : ''" />
            <div v-if="playing" class="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-black/60 backdrop-blur-sm border border-outline-variant flex items-end justify-center gap-0.5 pb-1">
              <span class="w-0.5 bg-indigo-400 animate-[eq_0.9s_ease-in-out_infinite] h-3" />
              <span class="w-0.5 bg-indigo-400 animate-[eq_1.1s_ease-in-out_infinite] h-2" />
              <span class="w-0.5 bg-indigo-400 animate-[eq_0.8s_ease-in-out_infinite] h-3.5" />
            </div>
          </div>

          <div class="min-w-0 flex-1">
            <p class="text-sm font-bold text-on-surface truncate">{{ title || 'オーディオ' }}</p>
            <p class="text-[11px] text-on-surface-variant truncate">{{ artist || '' }}</p>
          </div>
        </div>

        <div class="mp-ctl">
          <div class="mp-progress">
            <span class="text-[10px] text-on-surface-variant tabular-nums w-8 text-right shrink-0">{{ fmt(current) }}</span>
            <div
              ref="progressBar"
              class="mp-track"
              role="slider"
              :aria-label="'再生位置'"
              :aria-valuenow="Math.round(current)"
              :aria-valuemin="0"
              :aria-valuemax="Math.round(duration) || 0"
              :aria-valuetext="fmt(current) + ' / ' + fmt(duration)"
              tabindex="0"
              @click="onProgressBarClick"
              @mousedown="onDragStart"
              @touchstart.prevent="onDragStart"
              @keydown.left.prevent="onKeySeek(-1)"
              @keydown.right.prevent="onKeySeek(1)"
              @keydown.home.prevent="seekToTime(0)"
              @keydown.end.prevent="seekToTime(duration || 0)"
            >
              <div class="mp-fill" :style="{ width: progress + '%' }" />
              <div class="mp-thumb" :class="{ 'is-active': seeking }" :style="{ left: 'calc(' + progress + '% - 6px)' }" />
            </div>
            <span class="text-[10px] text-on-surface-variant tabular-nums w-8 shrink-0">{{ fmt(duration) }}</span>
          </div>

          <div class="mp-row">
            <div class="flex items-center gap-1 shrink-0">
              <button @click="toggleLoop" class="mp-btn" :class="loop ? 'is-on' : ''" title="リピート">
                <Icon name="lucide:repeat" class="w-4 h-4" />
              </button>
            </div>

            <div class="flex items-center justify-center gap-2 sm:gap-3">
              <button @click="skip(-15)" class="mp-btn" title="15秒戻す">
                <Icon name="lucide:rotate-ccw" class="w-4 h-4" />
              </button>
              <button @click="toggle" class="mp-play">
                <Icon :name="playing ? 'lucide:pause' : 'lucide:play'" class="w-5 h-5" :class="!playing ? 'ml-0.5' : ''" />
              </button>
              <button @click="skip(15)" class="mp-btn" title="15秒進める">
                <Icon name="lucide:rotate-cw" class="w-4 h-4" />
              </button>
            </div>

            <div class="flex items-center shrink-0">
              <div class="group flex items-center gap-1">
                <button @click="toggleMute" class="mp-btn" title="ミュート切替">
                  <Icon :name="muted || volume <= 0 ? 'lucide:volume-x' : (volume < 0.5 ? 'lucide:volume-1' : 'lucide:volume-2')" class="w-4 h-4" />
                </button>
                <input type="range" min="0" max="1" step="0.05" :value="volume" @input="setVolume" class="mp-vol" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
</template>

<style scoped>
@keyframes eq {
  0%, 100% { transform: scaleY(0.4); }
  50% { transform: scaleY(1); }
}
.mp-shell {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem 1rem;
}
.mp-main {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-width: 0;
  flex: 1 1 12rem;
  max-width: 200px;
}
.mp-ctl {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1 1 16rem;
  min-width: 0;
  max-width: 100%;
}
.mp-progress {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
}
.mp-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}
.mp-track {
  position: relative;
  flex: 1 1 auto;
  min-width: 0;
  height: 0.25rem;
  border-radius: 9999px;
  background-color: rgb(var(--md-sys-color-outline-variant));
  cursor: pointer;
  touch-action: none;
  -webkit-user-select: none;
  user-select: none;
}
.mp-track::before {
  content: '';
  position: absolute;
  inset: -0.5rem 0;
}
.mp-track:focus-visible {
  outline: 2px solid rgb(var(--md-sys-color-outline));
  outline-offset: 3px;
}
.mp-fill {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  border-radius: 9999px;
  background-color: rgb(var(--t-indigo-500));
}
.mp-thumb {
  position: absolute;
  top: 50%;
  width: 0.75rem;
  height: 0.75rem;
  margin-top: -0.375rem;
  border-radius: 9999px;
  background-color: rgb(var(--t-indigo-500));
  box-shadow: 0 1px 2px 0 rgb(var(--md-sys-color-shadow) / 0.4);
  pointer-events: none;
  transition: opacity 0.15s ease;
}
.mp-track:hover .mp-thumb,
.mp-track:focus-visible .mp-thumb,
.mp-thumb.is-active {
  opacity: 1;
}
.mp-btn {
  padding: 0.375rem;
  border-radius: 0.5rem;
  color: rgb(var(--md-sys-color-on-surface-variant));
  transition: color 0.15s ease, background-color 0.15s ease;
}
.mp-btn:hover {
  color: rgb(var(--md-sys-color-on-surface));
  background-color: rgb(var(--md-sys-color-surface-container-high));
}
.mp-btn.is-on {
  color: rgb(var(--t-indigo-500));
  background-color: rgb(var(--md-sys-color-surface-container-high));
}
.mp-play {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.75rem;
  height: 2.75rem;
  border-radius: 9999px;
  color: rgb(var(--t-white));
  background-color: rgb(var(--t-indigo-600));
  box-shadow: 0 2px 6px 2px rgb(var(--md-sys-color-shadow) / 0.16);
  transition: background-color 0.15s ease;
}
.mp-play:hover {
  background-color: rgb(var(--t-indigo-500));
}
.mp-vol {
  width: 0;
  opacity: 0;
  height: 0.25rem;
  cursor: pointer;
  accent-color: rgb(var(--t-indigo-500));
  transition: width 0.2s ease, opacity 0.2s ease;
}
.group:hover .mp-vol,
.mp-vol:focus {
  width: 4rem;
  opacity: 1;
}
@media (min-width: 768px) {
  .mp-shell {
    flex-wrap: nowrap;
  }
  .mp-main {
    flex: 1 1 0;
  }
  .mp-ctl {
    flex: 0 1 15rem;
    align-items: flex-end;
  }
  .mp-progress {
    width: 100%;
    order: 2;
  }
  .mp-row {
    display: flex;
    width: 100%;
    order: 1;
    align-items: center;
    justify-content: flex-end;
    gap: 0.5rem;
  }
}
</style>
