<script setup lang="ts">
const props = defineProps<{ emoji: string; size?: 'xs' | 'sm' | 'md' | 'lg' }>()

const { byName } = useCustomEmojis()

const custom = computed(() => {
  const v = props.emoji
  if (/^:[a-z0-9_+-]+:$/i.test(v)) return byName.value[v.slice(1, -1).toLowerCase()] || null
  return null
})

const SIZES: Record<string, string> = {
}
const dim = computed(() => SIZES[props.size || 'md'])
</script>

<template>
  <img
    v-if="custom"
    :src="custom.url"
    :alt="emoji"
    :title="emoji"
    class="sycs-emoji"
    :style="{ width: dim, height: dim, maxWidth: dim, maxHeight: dim }"
    draggable="false"
  />
  <span v-else class="leading-none">{{ emoji }}</span>
</template>

<style>

.sycs-emoji {
  display: inline-block;
  height: 100%;
  max-height: 1.75em !important;
  vertical-align: -0.2em;
  object-fit: contain;
  margin: 0 0.03em;
}

.sycs-emoji--lg {
  width: 1.75em;
  height: 1.75em;
  max-width: 1.75em !important;
  max-height: 1.75em !important;
  vertical-align: -0.35em;
}

/* A message that only contains emojis (1〜3) scales up slightly, Discord-style. */
.sycs-emoji-jumbo {
  font-size: 2em;
  line-height: 1.2;
}

.sycs-emoji-jumbo .sycs-emoji {
  vertical-align: -0.15em;
  margin: 0 0.05em;
}

</style>