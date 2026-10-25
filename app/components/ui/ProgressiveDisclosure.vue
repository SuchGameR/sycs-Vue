<script setup lang="ts">
/**
 * 段階的開示。
 *
 * 要点だけを見せ、詳細はユーザーが開いたときだけ表示する。
 * grid-template-rows の 0fr / 1fr で高さをアニメーションする。
 */
const props = withDefaults(
  defineProps<{
    title: string
    summary?: string
    icon?: string
    defaultOpen?: boolean
    tone?: 'default' | 'warning'
  }>(),
  { summary: '', icon: '', defaultOpen: false, tone: 'default' },
)

const open = ref(props.defaultOpen)
</script>

<template>
  <div
    class="overflow-hidden rounded-xl border bg-surface-container/30"
    :class="tone === 'warning' ? 'border-amber-500/30' : 'border-outline-variant'"
  >
    <button
      type="button"
      class="flex w-full items-center gap-3 px-3.5 py-3 text-left transition hover:bg-surface-container/60"
      :aria-expanded="open"
      @click="open = !open"
    >
      <span
        v-if="icon"
        class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
        :class="tone === 'warning' ? 'bg-amber-500/15 text-amber-300' : 'bg-indigo-500/15 text-indigo-300'"
      >
        <Icon :name="icon" class="h-4 w-4" />
      </span>
      <span class="min-w-0 flex-1">
        <span class="block text-sm font-semibold text-on-surface">{{ title }}</span>
        <span v-if="summary" class="mt-0.5 block text-[11px] text-on-surface-variant">{{ summary }}</span>
      </span>
      <Icon
        name="lucide:chevron-down"
        class="h-4 w-4 shrink-0 text-on-surface-variant transition-transform duration-300"
        :class="open ? 'rotate-180' : ''"
      />
    </button>

    <div
      class="grid transition-[grid-template-rows] duration-300 ease-out"
      :style="{ gridTemplateRows: open ? '1fr' : '0fr' }"
    >
      <div class="overflow-hidden">
        <div class="border-t border-outline-variant/70 px-3.5 py-3">
          <slot />
        </div>
      </div>
    </div>
  </div>
</template>
