<script setup lang="ts">
/**
 * 複数選択モードのツールバー。
 *
 * 選択中だけ下部に出る。fixed=false ならデモ枠の中に absolute で収まる。
 */
import type { SelectionAction } from '~/utils/uiTypes'

const props = withDefaults(
  defineProps<{
    count: number
    actions?: SelectionAction[]
    fixed?: boolean
  }>(),
  { actions: () => [], fixed: true },
)

const emit = defineEmits<{
  action: [action: SelectionAction]
  clear: []
  exit: []
}>()

const toneClass: Record<string, string> = {
  primary: 'text-indigo-300 hover:bg-indigo-500/15',
  danger: 'text-red-300 hover:bg-red-500/15',
  neutral: 'text-on-surface-variant hover:bg-white/10',
}
</script>

<template>
  <Teleport to="body" :disabled="!fixed">
    <Transition name="sycs-slide-up">
      <div
        v-if="count > 0"
        class="z-[160]"
        :class="fixed ? 'fixed inset-x-3 bottom-[calc(var(--app-bottom-inset)+0.75rem)] mx-auto max-w-md' : 'absolute inset-x-2 bottom-2'"
      >
        <div class="flex items-center gap-2 rounded-2xl border border-outline-variant bg-surface-container-highest/95 p-2 shadow-2xl backdrop-blur-xl">
          <span class="flex h-8 min-w-8 items-center justify-center rounded-full bg-indigo-600 px-2 text-xs font-bold text-white tabular-nums">
            {{ count }}
          </span>
          <span class="hidden text-xs font-medium text-on-surface-variant min-[420px]:block">件選択中</span>

          <button
            type="button"
            class="rounded-lg px-2 py-1 text-[11px] text-on-surface-variant transition hover:bg-white/10"
            @click="emit('clear')"
          >
            全解除
          </button>

          <div class="ml-auto flex items-center gap-0.5">
            <button
              v-for="action in actions"
              :key="action.id"
              type="button"
              class="flex items-center gap-1 rounded-lg px-2 py-1.5 text-[11px] font-medium transition active:scale-95"
              :class="toneClass[action.tone || 'neutral']"
              :aria-label="action.label"
              @click="emit('action', action)"
            >
              <Icon :name="action.icon" class="h-4 w-4" />
              <span class="hidden min-[420px]:inline">{{ action.label }}</span>
            </button>

            <button
              type="button"
              class="ml-0.5 rounded-lg p-1.5 text-on-surface-variant transition hover:bg-white/10"
              aria-label="選択モードを終了"
              @click="emit('exit')"
            >
              <Icon name="lucide:x" class="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
