<script setup lang="ts">
const route = useRoute()
const { activityUnread, dmUnread, dmLatest } = useUnread()

const items = [
  { to: '/home', label: 'ホーム', icon: 'lucide:home' },
  { to: '/dm', label: 'DM', icon: 'lucide:message-square' },
  { to: '/actions', label: 'アクティビティ', icon: 'lucide:bell' },
]

function isActive(to: string) {
  if (to === '/home') return route.path === '/home'
  return route.path.startsWith(to)
}

const showServers = ref(false)
</script>

<template>
  <nav class="fixed bottom-0 left-0 right-0 h-16 bg-[#0b0f19]/95 backdrop-blur-md border-t border-slate-800 flex items-center justify-around px-2 z-[70]">
    <NuxtLink
      v-for="item in items"
      :key="item.to"
      :to="item.to"
      class="relative flex flex-col items-center gap-1 transition px-2"
      :class="isActive(item.to) ? 'text-indigo-400' : 'text-slate-500'"
    >
      <span class="relative">
        <Icon v-if="item.to !== '/dm'" :name="item.icon" class="w-6 h-6" />
        <img
          v-else-if="dmLatest?.avatarUrl"
          :src="avatarSrc(dmLatest.avatarUrl)"
          class="w-6 h-6 rounded-full object-cover"
        />
        <Icon v-else :name="item.icon" class="w-6 h-6" />

        <span
          v-if="item.to === '/actions' && activityUnread > 0"
          class="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center"
        >{{ activityUnread }}</span>
        <span
          v-if="item.to === '/dm' && dmUnread > 0"
          class="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center"
        >{{ dmUnread }}</span>
      </span>
      <span class="text-[10px] font-bold">{{ item.label }}</span>
    </NuxtLink>

    <NuxtLink to="/search" class="flex flex-col items-center gap-1 text-slate-500 px-2"
      :class="route.path === '/search' ? 'text-indigo-400' : ''">
      <Icon name="lucide:search" class="w-6 h-6" />
      <span class="text-[10px] font-bold">検索</span>
    </NuxtLink>

    <button @click="showServers = true" class="flex flex-col items-center gap-1 text-slate-500 px-2">
      <Icon name="lucide:server" class="w-6 h-6" />
      <span class="text-[10px] font-bold">サーバー</span>
    </button>

    <ServerListModal v-if="showServers" @close="showServers = false" />
  </nav>
</template>
