<script setup lang="ts">
const props = defineProps<{ badges?: any[]; size?: 'sm' | 'md' }>()

const box = computed(() => (props.size === 'md' ? 'h-6 w-6' : 'h-4 w-4'))

const shown = computed(() => (props.badges || []).slice(0, 4))
const overflow = computed(() => Math.max(0, (props.badges || []).length - shown.value.length))
</script>

<template>
  <span class="inline-flex items-center gap-1 shrink-0">
    <span
      v-for="(b, i) in shown"
      :key="i"
      class="group/badge relative inline-flex shrink-0"
      :aria-label="b.label || undefined"
    >
      <img
        v-if="b.image"
        :src="b.image"
        :alt="b.label || ''"
        class="rounded object-contain"
        :class="box"
      />
      <Icon
        v-else
        :name="b.icon"
        class="shrink-0 text-indigo-500 [&_svg]:fill-current"
        :class="box"
      />

      <!-- ホバー / タップでラベルを出す -->
      <span
        class="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1.5 -translate-x-1/2 whitespace-nowrap rounded-md border border-outline-variant bg-surface-container px-1.5 py-0.5 text-[10px] font-medium leading-none text-on-surface opacity-0 shadow-lg transition-opacity duration-150 group-hover/badge:opacity-100 group-focus-within/badge:opacity-100"
        aria-hidden="true"
      >{{ b.label }}</span>
    </span>

    <span
      v-if="overflow"
      class="inline-flex shrink-0 items-center justify-center rounded-full bg-surface-container px-1 text-[9px] font-bold leading-none text-on-surface-variant"
    >+{{ overflow }}</span>
  </span>
</template>