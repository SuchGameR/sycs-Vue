<script setup lang="ts">
const { data: userData } = useFetch('/api/auth/me', { key: 'sidebar-right-user' })

const route = useRoute()
const isServerPage = computed(() => route.path.startsWith('/servers/') && route.params.id)

const { data: serverData } = useFetch(
  () => isServerPage.value ? `/api/servers/${route.params.id}` : null,
  { key: 'sidebar-right-server' }
)

const members = computed(() => serverData.value?.members || [])

/* ---------- Trending ---------- */
const trending = ref<any[]>([])
const trendingLoading = ref(true)

async function loadTrending() {
  try {
    const data = await $fetch('/api/posts', { params: { limit: 5, timeline: 'trending' } })
    trending.value = data.posts || []
  } catch {
    trending.value = []
  } finally {
    trendingLoading.value = false
  }
}

let trendingTimer: ReturnType<typeof setTimeout> | null = null
function startTrendingPolling() {
  stopTrendingPolling()
  trendingTimer = setTimeout(async () => {
    await loadTrending()
    startTrendingPolling()
  }, 30000)
}
function stopTrendingPolling() {
  if (trendingTimer) { clearTimeout(trendingTimer); trendingTimer = null }
}

onMounted(() => {
  loadTrending().then(startTrendingPolling)
})
onUnmounted(stopTrendingPolling)
</script>

<template>
  <aside class="p-4 overflow-y-auto h-[calc(100vh-57px)] sticky top-14 space-y-6">
    <template v-if="isServerPage && members.length">
      <h3 class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">メンバー ({{ members.length }})</h3>
      <div class="space-y-2">
        <NuxtLink v-for="m in members" :key="m.userId" :to="`/profile/@${m.user?.username || m.userId}`"
          class="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition">
          <img v-if="avatarSrc(m.user.avatarUrl)" :src="avatarSrc(m.user.avatarUrl)" class="w-6 h-6 rounded-full object-cover shrink-0" />
          <div v-else class="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold shrink-0">
            {{ m.user?.displayName?.charAt(0) || '?' }}
          </div>
          <span class="truncate">{{ m.user?.displayName || m.nickname || '不明' }}</span>
        </NuxtLink>
      </div>
    </template>

    <template v-else-if="userData?.user">
      <NuxtLink :to="`/profile/@${userData.user.username}`" class="flex items-center gap-3 p-3 bg-slate-800/30 rounded-xl hover:bg-slate-800/50 transition">
        <img v-if="avatarSrc(userData.user.avatarUrl)" :src="avatarSrc(userData.user.avatarUrl)" class="w-10 h-10 rounded-full object-cover shrink-0" />
        <div v-else class="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold shrink-0">
          {{ userData.user.displayName?.charAt(0) || '?' }}
        </div>
        <div class="min-w-0">
          <p class="text-sm font-bold text-white truncate flex items-center gap-1">{{ userData.user.displayName }}<UserBadges :badges="userData.user.badges" /></p>
          <p class="text-xs text-slate-500 truncate">@{{ userData.user.username }}</p>
        </div>
      </NuxtLink>
    </template>

    <!-- Trending -->
    <div>
      <h3 class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
        <Icon name="lucide:trending-up" class="w-3.5 h-3.5 inline -mt-0.5 mr-1 text-indigo-400" />
        急上昇
      </h3>
      <div v-if="trendingLoading" class="text-center text-slate-600 text-xs py-6">読み込み中...</div>
      <div v-else-if="!trending.length" class="text-center text-slate-600 text-xs py-6">投稿がありません</div>
      <div v-else class="space-y-1">
        <NuxtLink
          v-for="(p, i) in trending"
          :key="p.id"
          :to="`/profile/@${p.user?.username || p.userId}`"
          class="flex items-start gap-2.5 px-2 py-2 rounded-lg hover:bg-slate-800/50 transition"
        >
          <span class="w-5 shrink-0 text-center text-xs font-bold leading-6"
            :class="i === 0 ? 'text-amber-400' : i === 1 ? 'text-slate-300' : i === 2 ? 'text-orange-400' : 'text-slate-600'">
            {{ i + 1 }}
          </span>
          <img v-if="avatarSrc(p.user.avatarUrl)" :src="avatarSrc(p.user.avatarUrl)" class="w-6 h-6 rounded-full object-cover shrink-0 mt-0.5" />
          <div v-else class="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
            {{ p.user?.displayName?.charAt(0) || '?' }}
          </div>
          <div class="min-w-0 flex-1">
            <p class="text-[11px] text-slate-400 truncate flex items-center gap-1">{{ p.user?.displayName || '不明' }}<UserBadges :badges="p.user?.badges" /></p>
            <p class="text-xs text-slate-200 leading-snug line-clamp-2 break-words whitespace-pre-wrap">{{ p.content }}</p>
            <p class="text-[10px] text-slate-600 mt-0.5 flex items-center gap-1">
              <Icon name="lucide:smile-plus" class="w-3 h-3" />
              {{ (p.reactions || []).reduce((n, r) => n + (r.count || 0), 0) }}
            </p>
          </div>
        </NuxtLink>
      </div>
    </div>
  </aside>
</template>
