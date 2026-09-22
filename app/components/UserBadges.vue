<script setup lang="ts">
defineProps<{
  badges?: Array<{ kind: string; value: string; label?: string | null }>
  size?: 'sm' | 'md'
}>()
</script>

<template>
  <span v-if="badges?.length" class="inline-flex items-center gap-1 align-middle shrink-0">
    <span v-for="(b, i) in badges" :key="i" :title="b.label || ''" class="inline-flex">
      <img v-if="b.kind === 'image'" :src="b.value" :alt="b.label || 'badge'"
        class="rounded object-contain" :class="size === 'md' ? 'w-5 h-5' : 'w-4 h-4'" />
      <Icon v-else :name="b.value" :class="['text-amber-400', size === 'md' ? 'w-5 h-5' : 'w-4 h-4']" />
    </span>
  </span>
</template>
