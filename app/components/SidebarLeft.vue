<script setup lang="ts">
const route = useRoute()

const showServerList = ref(false)
const showSettings = ref(false)

/** Hovering the collapsed rail peeks the icon column out, without committing. */
const peeking = ref(false)

const { activityUnread, dmUnread, dmLatest } = useUnread()

const { desktopNav, sidebarCollapsed, hydrate, toggleDesktopNav, toggleSidebar } = useNavLayout()
onMounted(hydrate)

const { data: serversData } = useFetch('/api/servers', { key: 'sidebar-servers' })
const servers = computed(() => serversData.value?.servers || [])

const { data: userData } = useFetch('/api/auth/me', { key: 'sidebar-user' })

const { openSwitcher } = useAccounts()

async function handleSignout() {
  await $fetch('/api/auth/signout', { method: 'POST' })
  await navigateTo('/')
}

/**
 * Collapsed the rail is 14px of border. Peeking widens it just enough for the
 * icons to be recognisable while still reading as "shut", so a hover never looks
 * like a full expansion that then has to be re-collapsed.
 */
const railWidth = computed(() => {
  if (!sidebarCollapsed.value) return ''
  return peeking.value ? 'w-14' : 'w-[14px]'
})
const bodyOpacity = computed(() => (sidebarCollapsed.value ? (peeking.value ? 'opacity-80' : 'opacity-35') : 'opacity-100'))
</script>

<template>
  <!--
    peeking is tracked on a wrapper rather than on <aside> so that moving the
    pointer onto the peeking sliver itself does not toggle it back off: the
    wrapper keeps a fixed hit area that spans both the collapsed rail and the
    area the peek expands into.
  -->
  <div
    class="relative shrink-0 hidden min-[681px]:block"
    :class="[railWidth, 'transition-[width] duration-300 ease-out']"
    @mouseenter="peeking = true"
    @mouseleave="peeking = false"
  >
    <aside
      class="sidebar-shell group/sidebar relative flex flex-col border-r border-outline-variant bg-surface h-[calc(100vh-var(--app-header-h)-var(--app-footer-h)-var(--app-nav-reserve))] sticky top-[var(--app-header-h)] overflow-hidden"
      :class="['transition-opacity duration-300', bodyOpacity]"
    >
      <!-- 端の 8px 帯: カーソルを寄せると光り、押すと開閉する -->
      <button
        type="button"
        class="sidebar-grip absolute inset-y-0 left-0 z-40 w-2"
        :aria-expanded="!sidebarCollapsed"
        :aria-label="sidebarCollapsed ? 'サイドバーを開く' : 'サイドバーを閉じる'"
        :title="sidebarCollapsed ? 'サイドバーを開く' : 'サイドバーを閉じる'"
        @click="toggleSidebar"
      />

      <!-- 中身は常にフル幅。親でクリップするので、ラベルが折り返さずそのまま覗く -->
      <div class="flex min-w-[13.5rem] flex-1 flex-col overflow-y-auto px-3 py-4">
        <div class="mb-1 flex items-center justify-between gap-2">
          <span class="px-2 text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">メニュー</span>
          <button
            type="button"
            class="shrink-0 rounded-lg p-1.5 text-on-surface-variant transition hover:bg-surface-container/50 hover:text-on-surface"
            title="下部ナビ（ピル）に切り替える"
            @click="toggleDesktopNav"
          >
            <Icon name="lucide:panel-bottom" class="w-4 h-4" />
          </button>
        </div>

        <NuxtLink to="/home" class="px-2 py-2 rounded-lg flex items-center gap-3 transition"
          :class="route.path === '/home' ? 'bg-surface-container/50 text-white font-medium' : 'text-on-surface-variant hover:bg-surface-container/30'">
          <Icon name="lucide:home" class="w-5 h-5 shrink-0" />
          <span class="text-sm truncate">ホーム</span>
        </NuxtLink>
        <NuxtLink to="/social" class="relative px-2 py-2 rounded-lg flex items-center gap-3 transition text-on-surface-variant hover:bg-surface-container/30 hover:text-on-surface"
          :class="route.path.startsWith('/social') ? 'bg-surface-container/50 text-white font-medium' : ''">
          <span class="relative shrink-0">
            <img v-if="dmLatest?.avatarUrl" :src="avatarSrc(dmLatest.avatarUrl)" class="w-5 h-5 rounded-full object-cover" />
            <Icon v-else name="lucide:users-round" class="w-5 h-5" />
            <span v-if="dmUnread > 0" class="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">{{ dmUnread }}</span>
          </span>
          <span class="text-sm truncate">ソーシャル</span>
        </NuxtLink>
        <NuxtLink to="/search" class="px-2 py-2 rounded-lg flex items-center gap-3 transition text-on-surface-variant hover:bg-surface-container/30 hover:text-on-surface"
          :class="route.path === '/search' ? 'bg-surface-container/50 text-white font-medium' : ''">
          <Icon name="lucide:search" class="w-5 h-5 shrink-0" />
          <span class="text-sm truncate">検索</span>
        </NuxtLink>
        <NuxtLink to="/actions" class="relative px-2 py-2 rounded-lg flex items-center gap-3 transition text-on-surface-variant hover:bg-surface-container/30 hover:text-on-surface"
          :class="route.path.startsWith('/actions') || route.path.startsWith('/notifications') ? 'bg-surface-container/50 text-white font-medium' : ''">
          <span class="relative shrink-0">
            <Icon name="lucide:bell" class="w-5 h-5" />
            <span v-if="activityUnread > 0" class="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">{{ activityUnread }}</span>
          </span>
          <span class="text-sm truncate">アクティビティ</span>
        </NuxtLink>

        <div v-if="servers.length" class="mt-6">
          <div class="px-2 mb-2 text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">サーバー</div>
          <div class="space-y-0.5">
            <NuxtLink v-for="s in servers" :key="s.id" :to="`/servers/${s.id}`" class="w-full flex items-center gap-2 px-2 py-1.5 rounded-md transition text-sm"
              :class="route.path === `/servers/${s.id}` ? 'bg-surface-container/50 text-white' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container/50'">
              <div class="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0 overflow-hidden">
                <img v-if="s.iconUrl" :src="s.iconUrl" class="w-full h-full object-cover" />
                <template v-else>{{ s.name.charAt(0) }}</template>
              </div>
              <span class="truncate">{{ s.name }}</span>
            </NuxtLink>
          </div>
        </div>

        <button @click="showServerList = true" class="mt-4 w-full px-2 py-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container/30 rounded-lg flex items-center gap-3 text-sm transition">
          <Icon name="lucide:plus" class="w-4 h-4" />
          サーバーを探す
        </button>

        <ServerListModal v-if="showServerList" @close="showServerList = false" />

        <div v-if="userData?.user" class="group relative pt-4 border-t border-outline-variant mt-auto">
          <!-- Hover popup above -->
          <div class="absolute bottom-full left-0 right-0 mb-2 bg-surface border border-outline-variant rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 py-1 z-50">
            <button @click="openSwitcher" class="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-on-surface hover:bg-surface-container/50 transition">
              <Icon name="lucide:user-round-cog" class="w-4 h-4 shrink-0" />
              アカウント切り替え
            </button>
            <NuxtLink to="/signin" class="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-on-surface hover:bg-surface-container/50 transition">
              <Icon name="lucide:user-plus" class="w-4 h-4 shrink-0" />
              アカウントを追加
            </NuxtLink>
          </div>

          <!-- User bar -->
          <div class="flex items-center gap-1 px-2 h-11 rounded-lg group-hover:bg-surface-container/30 transition">
            <NuxtLink :to="`/profile/@${userData.user.username}`" class="flex items-center gap-2 flex-1 min-w-0">
              <div class="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0 overflow-hidden">
                <img v-if="avatarSrc(userData.user.avatarUrl)" :src="avatarSrc(userData.user.avatarUrl)" class="w-full h-full object-cover" />
                <template v-else>{{ userData.user.displayName?.charAt(0) || '?' }}</template>
              </div>
              <span class="text-sm text-on-surface-variant group-hover:text-white truncate">@{{ userData.user.username }}</span>
            </NuxtLink>

            <!-- Hover buttons -->
            <div class="hidden group-hover:flex items-center gap-0.5">
              <button @click="showSettings = true" class="p-1.5 rounded-lg text-on-surface-variant hover:text-white hover:bg-surface-container/50 transition" title="設定">
                <Icon name="lucide:settings" class="w-4 h-4" />
              </button>
              <button @click="handleSignout" class="p-1.5 rounded-lg text-on-surface-variant hover:text-red-400 hover:bg-surface-container/50 transition" title="サインアウト">
                <Icon name="lucide:log-out" class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <SettingsModal v-if="showSettings" @close="showSettings = false" />
      </div>
    </aside>
  </div>
</template>