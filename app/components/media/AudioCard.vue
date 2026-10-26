<script setup lang="ts">
/**
 * シンプルなオーディオカード。
 *
 * タイムラインのように「まず聴けること」が大事な場所では、ネイティブの
 * audio コントロールをそのまま使う。詳細ペインでは MusicPlayer を使う。
 * 自動再生はしない (複数並んだときに一斉に鳴らないように)。
 */
const props = withDefaults(
  defineProps<{
    src: string
    title?: string
    subtitle?: string
    compact?: boolean
  }>(),
  { title: '', subtitle: '', compact: false },
)

const fileName = computed(() => {
  if (props.title) return props.title
  const raw = props.src.split('?')[0]?.split('/').pop() || 'オーディオ'
  try {
    return decodeURIComponent(raw)
  } catch {
    return raw
  }
})

const isDataUrl = computed(() => props.src.startsWith('blob:') || props.src.startsWith('data:'))
</script>

<template>
  <div
    class="flex items-center gap-2.5 rounded-xl border border-outline-variant bg-surface-container/50 p-2.5"
    :class="compact ? '' : 'sm:gap-3 sm:p-3'"
  >
    <div
      class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-pink-500/25 to-rose-500/10 text-pink-300 ring-1 ring-pink-500/20"
      aria-hidden="true"
    >
      <Icon name="lucide:audio-lines" class="h-4 w-4" />
    </div>

    <div class="min-w-0 flex-1">
      <p class="truncate text-xs font-bold text-on-surface" :title="fileName">{{ fileName }}</p>
      <p v-if="subtitle" class="truncate text-[10px] text-on-surface-variant">{{ subtitle }}</p>
      <audio
        class="sycs-audio mt-1.5 w-full"
        :src="src"
        controls
        preload="metadata"
        :aria-label="fileName"
        @contextmenu="isDataUrl ? $event.preventDefault() : undefined"
      />
    </div>
  </div>
</template>
