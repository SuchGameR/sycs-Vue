<script setup lang="ts">
/**
 * FAB + スピードダイヤル。
 *
 * 主要アクションを 1 つ浮かせ、押すと関連アクションが縦に開く。
 * inline にするとデモ用に親要素の中で absolute 配置になる。
 */
export interface FabAction {
  id: string
  label: string
  icon: string
  tone?: 'primary' | 'success' | 'danger' | 'neutral'
}

const props = withDefaults(
  defineProps<{
    actions: FabAction[]
    icon?: string
    label?: string
    inline?: boolean
    disabled?: boolean
    /** inline のときの bottom / right */
    offset?: string
  }>(),
  {
    icon: 'lucide:plus',
    label: 'メニューを開く',
    inline: false,
    disabled: false,
    offset: '1rem',
  },
)

const emit = defineEmits<{ action: [action: FabAction] }>()
const { pulse } = useHaptics()
const open = ref(false)

const toneClass: Record<string, string> = {
  primary: 'bg-indigo-600 text-white',
  success: 'bg-emerald-600 text-white',
  danger: 'bg-red-600 text-white',
  neutral: 'bg-surface-container-highest text-on-surface',
}

function toggle() {
  if (props.disabled) return
  open.value = !open.value
  pulse('light')
}

function run(action: FabAction) {
  pulse('medium')
  open.value = false
  emit('action', action)
}
</script>

<template>
  <div
    class="flex flex-col items-end"
    :class="inline ? 'absolute z-30' : 'fixed bottom-[calc(var(--app-bottom-inset)+1rem)] right-4 z-[95]'"
    :style="inline ? { bottom: offset, right: offset } : undefined"
  >
    <TransitionGroup name="sycs-fab" tag="div" class="mb-2 flex flex-col items-end gap-2">
      <div v-for="action in (open ? actions : [])" :key="action.id" class="flex items-center gap-2">
        <span class="max-w-[10rem] truncate rounded-full border border-outline-variant bg-surface-container-highest/95 px-2.5 py-1 text-[11px] font-medium text-on-surface shadow">
          {{ action.label }}
        </span>
        <button
          type="button"
          class="flex h-11 w-11 items-center justify-center rounded-full shadow-lg transition hover:scale-105 active:scale-90"
          :class="toneClass[action.tone || 'neutral']"
          :aria-label="action.label"
          @click="run(action)"
        >
          <Icon :name="action.icon" class="h-5 w-5" />
        </button>
      </div>
    </TransitionGroup>

    <button
      type="button"
      class="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600 text-white shadow-xl shadow-indigo-950/40 transition hover:bg-indigo-500 active:scale-95 disabled:opacity-50"
      :aria-label="open ? 'メニューを閉じる' : label"
      :aria-expanded="open"
      :disabled="disabled"
      @click="toggle"
    >
      <Icon
        :name="open ? 'lucide:x' : icon"
        class="h-6 w-6 transition-transform duration-300"
        :class="open ? 'rotate-90' : ''"
      />
    </button>
  </div>
</template>
