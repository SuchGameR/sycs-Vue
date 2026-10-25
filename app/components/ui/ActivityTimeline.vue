<script setup lang="ts">
/**
 * アクティビティタイムライン。
 *
 * 出来事を時系列に並べ、何がいつ起きたかを追えるようにする。
 */
export interface TimelineItem {
  id: string
  title: string
  description?: string
  time: string
  icon?: string
  tone?: 'default' | 'success' | 'warning' | 'danger' | 'info'
}

withDefaults(defineProps<{ items: TimelineItem[]; dense?: boolean }>(), {
  dense: false,
})

const toneClass: Record<string, string> = {
  default: 'bg-indigo-500/15 text-indigo-300 ring-indigo-500/25',
  success: 'bg-emerald-500/15 text-emerald-300 ring-emerald-500/25',
  warning: 'bg-amber-500/15 text-amber-300 ring-amber-500/25',
  danger: 'bg-red-500/15 text-red-300 ring-red-500/25',
  info: 'bg-sky-500/15 text-sky-300 ring-sky-500/25',
}
</script>

<template>
  <ol class="relative">
    <li
      v-for="(item, index) in items"
      :key="item.id"
      class="relative flex gap-3"
      :class="dense ? 'pb-3 last:pb-0' : 'pb-5 last:pb-0'"
    >
      <span
        v-if="index !== items.length - 1"
        class="absolute left-[15px] top-8 bottom-0 w-px bg-outline-variant"
        aria-hidden="true"
      />
      <span
        class="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ring-1"
        :class="toneClass[item.tone || 'default']"
      >
        <Icon :name="item.icon || 'lucide:dot'" class="h-4 w-4" />
      </span>

      <div class="min-w-0 flex-1 pt-0.5">
        <div class="flex items-baseline justify-between gap-2">
          <p class="truncate text-sm font-semibold text-on-surface">{{ item.title }}</p>
          <time class="shrink-0 text-[10px] text-on-surface-variant/80">{{ item.time }}</time>
        </div>
        <p v-if="item.description" class="mt-0.5 text-xs leading-relaxed text-on-surface-variant">
          {{ item.description }}
        </p>
      </div>
    </li>
  </ol>
</template>
