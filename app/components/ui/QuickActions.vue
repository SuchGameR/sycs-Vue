<script setup lang="ts">
/**
 * クイックアクション。
 *
 * 対象のすぐ近くに、よく使う操作を横並びで置く。
 * アイコンだけ / ラベル付きを切り替えられる。
 */
import type { QuickAction } from '~/utils/uiTypes'

withDefaults(
  defineProps<{
    actions: QuickAction[]
    showLabels?: boolean
    compact?: boolean
  }>(),
  { showLabels: true, compact: false },
)

const emit = defineEmits<{ action: [action: QuickAction] }>()
const { pulse } = useHaptics()

const toneClass: Record<string, string> = {
  primary: 'border-indigo-500/30 bg-indigo-500/10 text-indigo-200 hover:bg-indigo-500/20',
  danger: 'border-red-500/30 bg-red-500/10 text-red-200 hover:bg-red-500/20',
  success: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200 hover:bg-emerald-500/20',
  neutral: 'border-outline-variant bg-surface-container/60 text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface',
}

function run(action: QuickAction) {
  pulse('light')
  emit('action', action)
}
</script>

<template>
  <div class="flex flex-wrap items-center gap-1.5">
    <button
      v-for="action in actions"
      :key="action.id"
      type="button"
      class="flex items-center gap-1.5 rounded-lg border font-medium transition active:scale-95"
      :class="[
        toneClass[action.tone || 'neutral'],
        compact ? 'px-2 py-1 text-[11px]' : 'px-2.5 py-1.5 text-xs',
      ]"
      :aria-label="action.label"
      :title="action.label"
      @click="run(action)"
    >
      <Icon :name="action.icon" :class="compact ? 'h-3.5 w-3.5' : 'h-4 w-4'" />
      <span v-if="showLabels">{{ action.label }}</span>
    </button>
  </div>
</template>
