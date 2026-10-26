<script setup lang="ts">
/**
 * フィルターチップ。
 *
 * multiple=true なら複数選択、false なら単一選択。
 * 横スクロールし、件数バッジも出せる。
 */
import type { FilterChipOption } from '~/utils/uiTypes'

const props = withDefaults(
  defineProps<{
    options: FilterChipOption[]
    modelValue: string[]
    multiple?: boolean
    allLabel?: string
    size?: 'sm' | 'md'
  }>(),
  { multiple: true, allLabel: '', size: 'md' },
)

const emit = defineEmits<{ 'update:modelValue': [value: string[]] }>()
const { pulse } = useHaptics()

function isSelected(id: string) {
  return props.modelValue.includes(id)
}

function toggle(id: string) {
  pulse('selection')
  if (props.multiple) {
    const next = isSelected(id)
      ? props.modelValue.filter((x) => x !== id)
      : [...props.modelValue, id]
    emit('update:modelValue', next)
    return
  }
  emit('update:modelValue', isSelected(id) ? [] : [id])
}

function clearAll() {
  pulse('selection')
  emit('update:modelValue', [])
}
</script>

<template>
  <div class="sycs-no-scrollbar flex items-center gap-1.5 overflow-x-auto py-1">
    <button
      v-if="allLabel"
      type="button"
      class="shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition active:scale-95"
      :class="
        modelValue.length === 0
          ? 'border-indigo-500/50 bg-indigo-600/20 text-indigo-200'
          : 'border-outline-variant bg-surface-container/40 text-on-surface-variant hover:bg-surface-container-high'
      "
      :aria-pressed="modelValue.length === 0"
      @click="clearAll"
    >
      {{ allLabel }}
    </button>

    <button
      v-for="option in options"
      :key="option.id"
      type="button"
      class="flex shrink-0 items-center gap-1.5 rounded-full border transition active:scale-95"
      :class="[
        size === 'sm' ? 'px-2.5 py-1 text-[11px]' : 'px-3 py-1.5 text-xs',
        isSelected(option.id)
          ? 'border-indigo-500/50 bg-indigo-600/20 text-indigo-200'
          : 'border-outline-variant bg-surface-container/40 text-on-surface-variant hover:bg-surface-container-high',
      ]"
      :aria-pressed="isSelected(option.id)"
      @click="toggle(option.id)"
    >
      <Icon v-if="option.icon" :name="option.icon" class="h-3.5 w-3.5" />
      <span>{{ option.label }}</span>
      <span
        v-if="typeof option.count === 'number'"
        class="rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums"
        :class="isSelected(option.id) ? 'bg-indigo-500/30' : 'bg-white/5'"
      >
        {{ option.count }}
      </span>
    </button>
  </div>
</template>
