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
const loop = ref(false)

function toggle() {
  const el = audio.value
  if (!el) return
  if (el.paused) el.play().catch(() => {}); else el.pause()
}

function onTime() { current.value = audio.value?.currentTime || 0 }
function onLoaded() { duration.value = audio.value?.duration || 0 }

function seek(e: Event) {
  const el = audio.value
  if (!el) return
  el.currentTime = Number((e.target as HTMLInputElement).value)
}

function setVolume(e: Event) {
  const v = Number((e.target as HTMLInputElement).value)
  volume.value = v
  if (audio.value) audio.value.volume = v
}

function toggleLoop() {
  loop.value = !loop.value
  if (audio.value) audio.value.loop = loop.value
}

function skip(sec: number) {
  const el = audio.value
  if (!el) return
  el.currentTime = Math.max(0, Math.min(el.currentTime + sec, el.duration || 0))
}

function fmt(t: number) {
  if (!isFinite(t)) return '0:00'
  const m = Math.floor(t / 60)
  const s = Math.floor(t % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}

const progress = computed(() => duration.value ? (current.value / duration.value) * 100 : 0)
</script>

<template>
  <div class="rounded-2xl bg-gradient-to-br from-indigo-900/60 via-slate-900 to-slate-950 p-4 border border-indigo-500/20">
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

    <div class="flex items-center gap-4">
      <div class="relative w-20 h-20 rounded-2xl overflow-hidden shrink-0 bg-gradient-to-br from-indigo-500 to-purple-700 flex items-center justify-center shadow-lg">
        <img v-if="cover" :src="cover" class="w-full h-full object-cover" />
        <Icon v-else name="lucide:music" class="w-8 h-8 text-white/90" :class="playing ? 'animate-pulse' : ''" />
        <div v-if="playing" class="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-black/70 border border-white/20 flex items-end justify-center gap-0.5 pb-1">
          <span class="w-0.5 bg-indigo-400 animate-[eq_0.9s_ease-in-out_infinite] h-3" />
          <span class="w-0.5 bg-indigo-400 animate-[eq_1.1s_ease-in-out_infinite] h-2" />
          <span class="w-0.5 bg-indigo-400 animate-[eq_0.8s_ease-in-out_infinite] h-3.5" />
        </div>
      </div>

      <div class="min-w-0 flex-1">
        <p class="text-sm font-bold text-white truncate">{{ title || 'オーディオ' }}</p>
        <p class="text-[11px] text-slate-400 truncate">{{ artist || '' }}</p>

        <div class="flex items-center gap-2 mt-2">
          <span class="text-[10px] text-slate-400 tabular-nums w-8 text-right">{{ fmt(current) }}</span>
          <input
            type="range" min="0" :max="duration || 0" step="0.1" :value="current"
            @input="seek"
            class="flex-1 accent-indigo-500 h-1 cursor-pointer"
            :style="{ backgroundSize: progress + '% 100%' }"
          />
          <span class="text-[10px] text-slate-400 tabular-nums w-8">{{ fmt(duration) }}</span>
        </div>
      </div>
    </div>

    <div class="flex items-center justify-center gap-3 mt-3">
      <button @click="skip(-10)" class="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition" title="10秒戻す">
        <Icon name="lucide:rotate-ccw" class="w-4 h-4" />
      </button>
      <button @click="toggle" class="w-11 h-11 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center transition shadow-lg shadow-indigo-900/40">
        <Icon :name="playing ? 'lucide:pause' : 'lucide:play'" class="w-5 h-5" :class="!playing ? 'ml-0.5' : ''" />
      </button>
      <button @click="skip(10)" class="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition" title="10秒進める">
        <Icon name="lucide:rotate-cw" class="w-4 h-4" />
      </button>

      <div class="flex items-center gap-1 ml-2">
        <button @click="toggleLoop" class="p-1.5 rounded-lg transition" :class="loop ? 'text-indigo-400 bg-white/10' : 'text-slate-300 hover:text-white hover:bg-white/10'" title="リピート">
          <Icon name="lucide:repeat" class="w-4 h-4" />
        </button>
        <Icon name="lucide:volume-2" class="w-4 h-4 text-slate-300" />
        <input type="range" min="0" max="1" step="0.05" :value="volume" @input="setVolume" class="w-16 accent-indigo-500 h-1 cursor-pointer" />
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes eq {
  0%, 100% { transform: scaleY(0.4); }
  50% { transform: scaleY(1); }
}
</style>
