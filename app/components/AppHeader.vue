<script setup lang="ts">
const props = defineProps<{
  isServerPage?: boolean
  server?: any
}>()

const route = useRoute()
const router = useRouter()
const isHomePage = computed(() => route.path === '/home')
const isProfilePage = computed(() => route.path.startsWith('/profile/'))
const profileHeader = useState<{displayName: string; username: string; avatarUrl: string | null; bannerUrl: string | null; badges?: any[]; title?: string | null} | null>('profile-header-state', () => null)

function onKey(e: KeyboardEvent) {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault()
    router.push('/search')
  }
}
onMounted(() => window.addEventListener('keydown', onKey))
onUnmounted(() => window.removeEventListener('keydown', onKey))
</script>

<template>
  <div>
    <div class="h-14 flex overflow-hidden relative">
      <!-- Server banner as header background -->
      <template v-if="isServerPage && server?.bannerUrl">
        <img :src="server.bannerUrl" class="absolute inset-0 w-full h-full object-cover" />
        <div class="absolute inset-0 bg-[#0b0f19]/70"></div>
      </template>
      <!-- Left section: matches left sidebar width -->
      <div class="hidden min-[681px]:flex items-center px-4 w-48 min-[1024px]:w-60 shrink-0 z-40" :class="isServerPage ? '' : 'shadow-[0px_0px_43px_50px_#0b0f19]'">
        <NuxtLink v-if="!isServerPage" to="/" class="text-lg font-extrabold tracking-tighter shrink-0">
          SYCS<span class="text-indigo-500">.</span>
        </NuxtLink>
      </div>

      <!-- Center section: matches main content width -->
      <div class="flex-1 flex items-center gap-4 px-4 min-w-0 justify-center relative overflow-hidden">
        <Transition name="fade">
          <div v-if="isProfilePage && profileHeader" key="overlay" class="absolute inset-0">
            <div v-if="profileHeader?.bannerUrl" class="absolute inset-0 bg-cover bg-center" :style="`background-image: url(${profileHeader.bannerUrl})`"></div>
            <div class="absolute inset-0 backdrop-blur-[10px] bg-[#0b0f19]/40"></div>
          </div>
        </Transition>
        <div class="relative flex items-center gap-4 flex-1 min-w-0 justify-center">
          <!-- SYCS logo on mobile / Profile info on mobile -->
          <Transition name="pop" mode="out-in">
            <NuxtLink v-if="!isServerPage && !isHomePage && !(isProfilePage && profileHeader)" key="logo" to="/" class="text-lg font-extrabold tracking-tighter shrink-0 min-[681px]:hidden">
              SYCS<span class="text-indigo-500">.</span>
            </NuxtLink>
            <div v-else-if="isProfilePage && profileHeader" key="profile" class="flex items-center gap-3 shrink-0 mx-auto pr-4">
              <img v-if="profileHeader.avatarUrl" :src="profileHeader.avatarUrl" class="w-8 h-8 rounded-full object-cover shrink-0" />
              <div v-else class="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shrink-0">{{ profileHeader.displayName?.charAt(0) || '?' }}</div>
              <div class="min-w-0">
                <p class="text-sm font-bold text-white truncate leading-tight flex items-center gap-1">{{ profileHeader.displayName }}<UserBadges :badges="profileHeader.badges" /></p>
                <p class="text-[10px] text-slate-500 leading-tight">@{{ profileHeader.username }}</p>
              </div>
            </div>
          </Transition>

          <!-- Server info on server pages -->
          <template v-if="isServerPage && server">
            <div class="flex items-center gap-3 shrink-0">
              <div class="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shrink-0 overflow-hidden">
                <img v-if="server.iconUrl" :src="server.iconUrl" class="w-full h-full object-cover" />
                <template v-else>{{ server.name?.charAt(0) || '?' }}</template>
              </div>
              <div class="min-w-0">
                <p class="text-sm font-bold text-white truncate leading-tight">{{ server.name }}</p>
                <p class="text-[10px] text-slate-500 leading-tight">サーバー</p>
              </div>
            </div>
          </template>

          <!-- Timeline tabs on home -->
          <TimelineTabs v-if="isHomePage" class="mx-auto max-w-[560px]" />

          <div v-if="!isHomePage" class="flex items-center gap-2 ml-auto" :class="isProfilePage ? 'hidden' : ''">
          </div>
        </div>
      </div>

      <!-- Right section: fixed width on desktop, home of the global search box -->
      <div class="hidden min-[1024px]:flex items-center px-4 w-[280px] shrink-0 z-40" :class="isServerPage ? '' : 'shadow-[0px_0px_43px_50px_#0b0f19]'">
        <button
          class="flex-1 flex items-center gap-2 bg-slate-900/70 border border-slate-800 rounded-full px-3 py-1.5 text-sm text-slate-500 hover:border-slate-600 focus-within:border-indigo-500 transition min-w-0"
          @click="router.push('/search')"
          title="検索"
        >
          <Icon name="lucide:search" class="w-3.5 h-3.5 shrink-0" />
          <span class="truncate">検索</span>
          <span class="ml-auto text-[10px] text-slate-700 border border-slate-800 rounded px-1 shrink-0">Ctrl+K</span>
        </button>
      </div>
    </div>

    <!-- Mobile search shortcut -->
    <button
      class="min-[1024px]:hidden absolute right-3 top-3 z-40 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800/60 transition"
      @click="router.push('/search')"
      title="検索"
    >
      <Icon name="lucide:search" class="w-5 h-5" />
    </button>
  </div>
</template>

<style scoped>
.pop-enter-active {
  transition: all 0.25s ease-out;
}
.pop-leave-active {
  transition: all 0.15s ease-in;
}
.pop-enter-from {
  opacity: 0;
  transform: scale(0.85);
}
.pop-leave-to {
  opacity: 0;
  transform: scale(0.85);
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>