<script setup lang="ts">
const posts = ref<any[]>([])
const loading = ref(true)
const error = ref(false)

async function load() {
  loading.value = true
  error.value = false
  try {
    const data = await $fetch<{ posts: any[] }>('/api/posts', {
      params: { scope: 'global', sort: 'popular', limit: 12 },
    })
    posts.value = data.posts || []
  } catch {
    error.value = true
    posts.value = []
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>

<template>
  <div class="h-full flex flex-col">
    <div class="px-3 py-2 border-b border-slate-800/70 flex items-center gap-2 shrink-0">
      <span class="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex-1">いま人気</span>
      <button @click="load" class="p-1 rounded-md text-slate-500 hover:text-white hover:bg-slate-800 transition" title="更新">
        <Icon name="lucide:refresh-ccw" class="w-3.5 h-3.5" :class="{ 'animate-spin': loading }" />
      </button>
    </div>

    <div class="flex-1 overflow-y-auto min-h-0 p-2 space-y-1">
      <div v-if="loading" class="space-y-2 p-1">
        <div v-for="i in 5" :key="i" class="h-9 rounded-lg bg-slate-800/50 animate-pulse" />
      </div>
      <p v-else-if="error" class="text-xs text-slate-500 text-center py-6">読み込めませんでした</p>
      <p v-else-if="!posts.length" class="text-xs text-slate-500 text-center py-6">投稿がありません</p>
      <div v-else v-for="(p, i) in posts" :key="p.id" class="flex items-start gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-800/50 transition">
        <span class="text-xs font-bold text-slate-600 w-4 shrink-0 text-right mt-0.5">{{ i + 1 }}</span>
        <div class="min-w-0 flex-1">
          <p class="text-xs text-slate-200 line-clamp-2 break-words">{{ p.content || '（メディア投稿）' }}</p>
          <p class="text-[10px] text-slate-500 truncate mt-0.5">
            {{ p.user?.displayName }} · ♥ {{ p.likeCount || 0 }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
