<script setup lang="ts">
/**
 * 空状態。
 *
 * 「データがありません」で終わらせず、理由と次の一歩を必ず添える。
 */
const props = withDefaults(
  defineProps<{
    icon?: string
    title?: string
    description?: string
    actionLabel?: string
    secondaryLabel?: string
    compact?: boolean
    tone?: 'default' | 'error' | 'success'
  }>(),
  {
    icon: 'lucide:inbox',
    title: 'まだ何もありません',
    description: '最初の 1 件を作ると、ここに表示されます。',
    actionLabel: '',
    secondaryLabel: '',
    compact: false,
    tone: 'default',
  },
)

const emit = defineEmits<{ action: []; secondary: [] }>()

const toneClass: Record<'default' | 'error' | 'success', string> = {
  default: 'bg-indigo-500/10 text-indigo-300 ring-indigo-500/20',
  error: 'bg-red-500/10 text-red-300 ring-red-500/20',
  success: 'bg-emerald-500/10 text-emerald-300 ring-emerald-500/20',
}
</script>

<template>
  <div
    class="flex flex-col items-center justify-center text-center"
    :class="compact ? 'gap-2 px-4 py-6' : 'gap-3 px-6 py-12'"
  >
    <div
      class="flex items-center justify-center rounded-2xl ring-1"
      :class="[toneClass[props.tone], compact ? 'h-10 w-10' : 'h-14 w-14']"
    >
      <Icon :name="icon" :class="compact ? 'h-5 w-5' : 'h-7 w-7'" />
    </div>
    <div>
      <p class="font-bold text-on-surface" :class="compact ? 'text-sm' : 'text-base'">{{ title }}</p>
      <p v-if="description" class="mt-1 text-xs leading-relaxed text-on-surface-variant">
        {{ description }}
      </p>
    </div>
    <div
      v-if="actionLabel || secondaryLabel || $slots.default"
      class="mt-1 flex flex-wrap items-center justify-center gap-2"
    >
      <button
        v-if="actionLabel"
        type="button"
        class="rounded-full bg-indigo-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-indigo-500 active:scale-95"
        @click="emit('action')"
      >
        {{ actionLabel }}
      </button>
      <button
        v-if="secondaryLabel"
        type="button"
        class="rounded-full border border-outline-variant px-4 py-2 text-xs font-medium text-on-surface-variant transition hover:bg-surface-container active:scale-95"
        @click="emit('secondary')"
      >
        {{ secondaryLabel }}
      </button>
      <slot />
    </div>
  </div>
</template>
