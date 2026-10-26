<script setup lang="ts">
import { twemojiAssetUrl } from '~/utils/emoji'

const props = defineProps<{ emoji: string; size?: 'xs' | 'sm' | 'md' | 'lg' }>()

const { byName } = useCustomEmojis()

const custom = computed(() => {
  const v = props.emoji
  if (/^:[a-z0-9_+-]+:$/i.test(v)) return byName.value[v.slice(1, -1).toLowerCase()] || null
  return null
})

// A bare unicode emoji (a reaction, or anything typed without a :shortcode:)
// goes through Twemoji so it matches the artwork used inside post bodies.
const twemoji = computed(() => (custom.value ? null : twemojiAssetUrl(props.emoji)))

const SIZES: Record<string, string> = {
  xs: '1rem',
  sm: '1.25rem',
  md: '1.5rem',
  lg: '2rem',
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
    :style="{ height: dim, maxHeight: dim }"
    draggable="false"
  />
  <img
    v-else-if="twemoji"
    :src="twemoji"
    :alt="emoji"
    class="sycs-emoji"
    :style="{ height: dim, maxHeight: dim }"
    draggable="false"
  />
  <span v-else class="leading-none">{{ emoji }}</span>
</template>

