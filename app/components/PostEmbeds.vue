<script setup lang="ts">
/**
 * 投稿本文に含まれる URL を最大 N 件までカードにする。
 *
 * 本文のリンク化 (richText) とは独立しているので、URL を消さずに
 * 下へプレビューを足すだけ。同じ URL は 1 回だけ表示する。
 */
import { extractUrls } from '~/utils/embeds'
import UrlEmbed from './media/UrlEmbed.vue'

const props = withDefaults(
  defineProps<{
    content?: string
    max?: number
    compact?: boolean
  }>(),
  { content: '', max: 2, compact: false },
)

const urls = computed(() => extractUrls(props.content || '', props.max))
</script>

<template>
  <div v-if="urls.length" class="space-y-2">
    <UrlEmbed v-for="url in urls" :key="url" :url="url" :compact="compact" />
  </div>
</template>
