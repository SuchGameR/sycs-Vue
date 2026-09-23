<script setup lang="ts">
const { map: customEmojiMap } = useCustomEmojis()

const props = defineProps<{
  post: any
}>()

const emit = defineEmits<{ open: [] }>()

function timeAgo(date: string) {
  if (!date) return ''
  const diff = Date.now() - new Date(date).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'たった今'
  if (minutes < 60) return `${minutes}分前`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}時間前`
  return `${Math.floor(hours / 24)}日前`
}

const previewAtts = computed(() => (props.post?.attachments || []).slice(0, 4))
</script>

<template>
  <button
    v-if="post"
    type="button"
    class="w-full text-left rounded-xl border border-slate-800 bg-slate-900/40 hover:border-slate-600 transition p-3 flex flex-col gap-2 overflow-hidden"
    @click.stop="emit('open')"
  >
    <div v-if="post.deleted" class="text-sm text-slate-500 py-2 text-center">このポストは削除されました</div>
    <template v-else>
      <div class="flex items-center gap-2 min-w-0">
        <img v-if="avatarSrc(post.user?.avatarUrl)" :src="avatarSrc(post.user.avatarUrl)" loading="lazy" class="w-5 h-5 rounded-full object-cover shrink-0" />
        <div v-else class="w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-[10px] shrink-0">
          {{ (post.user?.displayName || '?').charAt(0) }}
        </div>
        <span class="font-bold text-slate-200 text-sm truncate">{{ post.user?.displayName || '不明' }}</span>
        <span class="text-slate-500 text-xs truncate">@{{ post.user?.username }} · {{ timeAgo(post.createdAt) }}</span>
      </div>

      <p v-if="post.content" class="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap break-words line-clamp-6"
        v-html="renderRichText(post.content, { custom: customEmojiMap })" />

      <div v-if="previewAtts.length" class="flex gap-1 flex-wrap">
        <img v-for="a in previewAtts.filter((x: any) => String(x.mime || '').startsWith('image/'))" :key="a.id" :src="a.url" loading="lazy" class="w-14 h-14 rounded-lg object-cover" />
        <span v-if="previewAtts.some((a: any) => !String(a.mime || '').startsWith('image/'))" class="flex items-center gap-1 text-xs text-slate-500 px-2 py-1 rounded-lg bg-slate-800/60">
          <Icon name="lucide:paperclip" class="w-3.5 h-3.5" />
          {{ previewAtts.filter((a: any) => !String(a.mime || '').startsWith('image/')).length }} ファイル
        </span>
      </div>
    </template>
  </button>
</template>