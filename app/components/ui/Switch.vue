<script setup lang="ts">
/**
 * アクセシブルなオン / オフスイッチ。
 * `role="switch"` と `aria-checked` を備え、触覚フィードバックも鳴らす。
 */
const props = withDefaults(
  defineProps<{
    modelValue: boolean
    disabled?: boolean
    label?: string
    size?: 'sm' | 'md'
  }>(),
  { disabled: false, label: '', size: 'md' },
)

const emit = defineEmits<{ 'update:modelValue': [value: boolean]; change: [value: boolean] }>()
const { pulse } = useHaptics()

function toggle() {
  if (props.disabled) return
  const next = !props.modelValue
  pulse('selection')
  emit('update:modelValue', next)
  emit('change', next)
}
</script>

<template>
  <button
    type="button"
    role="switch"
    :aria-checked="modelValue"
    :aria-label="label || undefined"
    :disabled="disabled"
    class="relative inline-flex shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:cursor-not-allowed disabled:opacity-40"
    :class="[
      size === 'sm' ? 'h-5 w-9' : 'h-6 w-11',
      modelValue ? 'bg-indigo-600' : 'bg-surface-container-highest',
    ]"
    @click="toggle"
  >
    <span
      class="inline-block transform rounded-full bg-white shadow transition-transform duration-200"
      :class="[
        size === 'sm' ? 'h-4 w-4' : 'h-5 w-5',
        modelValue
          ? size === 'sm' ? 'translate-x-[1.1rem]' : 'translate-x-[1.35rem]'
          : size === 'sm' ? 'translate-x-0.5' : 'translate-x-0.5',
      ]"
    />
  </button>
</template>
