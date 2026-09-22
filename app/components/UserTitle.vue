<script setup lang="ts">
defineProps<{ title?: string | null }>()
</script>

<template>
  <span v-if="title"
    class="px-1.5 py-0.5 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-[10px] font-bold text-indigo-300 shrink-0 align-middle">
    {{ title }}
  </span>
</template>
