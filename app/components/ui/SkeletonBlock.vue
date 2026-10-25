<script setup lang="ts">
/**
 * スケルトンのブロック。
 *
 * 高さと行数を指定するだけで、完成形に近い骨格を作れる。
 * 実際の内容と同じ幅・余白で置くと、読み込み完了時のガタつきが減る。
 */
withDefaults(
  defineProps<{
    lines?: number
    height?: string
    width?: string
    circle?: boolean
    /** 角丸を circle / sm / md / lg から選ぶ */
    rounded?: string
  }>(),
  { lines: 1, height: '0.9rem', width: '100%', circle: false, rounded: 'md' },
)

const radiusClass = {
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-xl',
  full: 'rounded-full',
} as Record<string, string>
</script>

<template>
  <div v-if="circle" class="flex items-center gap-3">
    <div class="sycs-skeleton h-10 w-10 shrink-0 rounded-full" />
    <div class="flex-1 space-y-2">
      <div class="sycs-skeleton h-3 w-1/3 rounded-full" />
      <div class="sycs-skeleton h-3 w-2/3 rounded-full" />
    </div>
  </div>
  <div v-else class="space-y-2" aria-hidden="true">
    <div
      v-for="i in Math.max(1, lines)"
      :key="i"
      class="sycs-skeleton"
      :class="radiusClass[rounded] || 'rounded-md'"
      :style="{
        height,
        width: i === lines && lines > 1 ? '68%' : width,
      }"
    />
  </div>
</template>
