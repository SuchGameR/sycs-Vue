<script setup lang="ts">
/**
 * 常駐ミニプレイヤー。
 *
 * 画面を移動しても再生状態を保持する想定のバー。
 * デモでは一定間隔で進捗を進め、閉じる / 再生 / 一時停止ができる。
 */
withDefaults(
  defineProps<{
    title?: string
    artist?: string
    autoplay?: boolean
  }>(),
  {
    title: 'Midnight Drive',
    artist: 'SYCS Radio',
    autoplay: true,
  },
)

const emit = defineEmits<{ close: [] }>()

const playing = ref(true)
const progress = ref(18)
const expanded = ref(false)
let timer: ReturnType<typeof setInterval> | null = null

function tick() {
  if (!playing.value) return
  progress.value = (progress.value + 0.45) % 100
}

onMounted(() => {
  playing.value = true
  timer = setInterval(tick, 500)
})

onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
})

function toggle() {
  playing.value = !playing.value
}

function next() {
  progress.value = 0
}

function previous() {
  progress.value = 0
}
</script>

<template>
  <div class="overflow-hidden rounded-2xl border border-outline-variant bg-surface-container-high/95 shadow-xl backdrop-blur-xl">
    <div class="flex items-center gap-2.5 p-2.5">
      <div class="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500">
        <Icon name="lucide:audio-lines" class="h-5 w-5 text-white/90" />
        <span
          v-if="playing"
          class="absolute bottom-1 left-1 flex items-end gap-0.5"
          aria-hidden="true"
        >
          <span class="sycs-eq h-1.5 w-0.5 rounded-full bg-white/80" style="animation-delay: 0ms" />
          <span class="sycs-eq h-2.5 w-0.5 rounded-full bg-white/80" style="animation-delay: 140ms" />
          <span class="sycs-eq h-2 w-0.5 rounded-full bg-white/80" style="animation-delay: 280ms" />
        </span>
      </div>

      <div class="min-w-0 flex-1">
        <p class="truncate text-xs font-bold text-on-surface">{{ title }}</p>
        <p class="truncate text-[10px] text-on-surface-variant">{{ artist }}</p>
      </div>

      <button
        type="button"
        class="rounded-lg p-1.5 text-on-surface-variant transition hover:bg-white/10 hover:text-on-surface"
        aria-label="前のトラック"
        @click="previous"
      >
        <Icon name="lucide:skip-back" class="h-4 w-4" />
      </button>
      <button
        type="button"
        class="flex h-8 w-8 items-center justify-center rounded-full bg-white text-black transition active:scale-90"
        :aria-label="playing ? '一時停止' : '再生'"
        @click="toggle"
      >
        <Icon :name="playing ? 'lucide:pause' : 'lucide:play'" class="h-4 w-4" />
      </button>
      <button
        type="button"
        class="rounded-lg p-1.5 text-on-surface-variant transition hover:bg-white/10 hover:text-on-surface"
        aria-label="次のトラック"
        @click="next"
      >
        <Icon name="lucide:skip-forward" class="h-4 w-4" />
      </button>
      <button
        type="button"
        class="ml-0.5 rounded-lg p-1.5 text-on-surface-variant transition hover:bg-white/10 hover:text-on-surface"
        aria-label="プレイヤーを閉じる"
        @click="emit('close')"
      >
        <Icon name="lucide:x" class="h-3.5 w-3.5" />
      </button>
    </div>

    <div class="h-0.5 w-full bg-white/10">
      <div class="h-full bg-indigo-500 transition-[width] duration-500" :style="{ width: `${progress}%` }" />
    </div>
  </div>
</template>
