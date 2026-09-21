<script setup lang="ts">
const props = defineProps<{ emoji: string; size?: 'sm' | 'md' | 'lg' }>()

const { byName } = useCustomEmojis()

const custom = computed(() => {
  const v = props.emoji
  if (/^:[a-z0-9_+-]+:$/i.test(v)) return byName.value[v.slice(1, -1).toLowerCase()] || null
  return null
})
</script>

<template>
  <img
    v-if="custom"
    :src="custom.url"
    :alt="emoji"
    :title="emoji"
    class="sycs-emoji"
    :class="size === 'lg' ? 'sycs-emoji--lg' : ''"
    draggable="false"
  />
  <span v-else class="leading-none">{{ emoji }}</span>
</template>
