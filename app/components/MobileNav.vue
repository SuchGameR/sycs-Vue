<script setup lang="ts">
const route = useRoute()
const { activityUnread, dmUnread, dmLatest } = useUnread()
const { data: me } = useFetch('/api/auth/me', { key: 'mobilenav-me' })

type Item = { key: string; to: string; icon: string; match: (p: string) => boolean }

const items = computed<Item[]>(() => {
  const uid = me.value?.user?.id
  return [
    { key: 'home', to: '/home', icon: 'lucide:house', match: p => p === '/home' },
    { key: 'search', to: '/search', icon: 'lucide:search', match: p => p.startsWith('/search') },
    { key: 'dm', to: '/dm', icon: 'lucide:send', match: p => p.startsWith('/dm') },
    { key: 'actions', to: '/actions', icon: 'lucide:heart', match: p => p.startsWith('/actions') },
    uid
      ? { key: 'me', to: `/profile/${me.value?.user?.username || uid}`, icon: 'lucide:user-round', match: p => p.startsWith('/profile/') && p.endsWith(uid) }
      : { key: 'signin', to: '/signin', icon: 'lucide:log-in', match: p => p.startsWith('/signin') },
  ]
})

const activeIndex = computed(() => {
  const p = route.path
  const i = items.value.findIndex(it => it.match(p))
  return i === -1 ? -1 : i
})

/** アクティブプレートの位置。nth-child で CSS 側にも残す。 */
const plateStyle = computed(() => {
  const i = activeIndex.value
  if (i < 0) return { opacity: '0', transform: 'translateX(-9999px)' }
  return { transform: `translateX(${i * 100}%)` }
})

function badgeFor(key: string) {
  if (key === 'dm') return dmUnread.value
  if (key === 'actions') return activityUnread.value
  return 0
}


</script>

<template>
  <div class="min-[681px]:hidden">
    <nav
      class="sycs-floatnav fixed inset-x-0 bottom-0 z-[70] flex justify-center px-4 pb-[max(env(safe-area-inset-bottom),0.75rem)]"
      aria-label="メインナビゲーション"
    >
      <div class="relative flex items-center gap-1 rounded-[9999px] px-2 py-1.5">
        <!-- 選択中の位置をなぞるプレート -->
        <span
          class="sycs-floatnav-plate pointer-events-none absolute left-2 top-1.5 h-[calc(100%-0.75rem)] w-[calc((100%-1rem)/5)] rounded-[9999px] transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]"
          :style="plateStyle"
          aria-hidden="true"
        />

        <NuxtLink
          v-for="it in items"
          :key="it.key"
          :to="it.to"
          class="group relative flex h-11 w-11 shrink-0 items-center justify-center rounded-[9999px] transition-colors duration-200 active:scale-90"
          :class="activeIndex === items.indexOf(it) ? 'text-on-surface' : 'text-on-surface-variant'"
          :aria-current="activeIndex === items.indexOf(it) ? 'page' : undefined"
          :aria-label="it.key"
        >
          <img
            v-if="it.key === 'dm' && dmLatest?.avatarUrl"
            :src="avatarSrc(dmLatest.avatarUrl)"
            alt=""
            class="h-6 w-6 rounded-full object-cover"
          />
          <img
            v-else-if="it.key === 'me' && me?.user?.avatarUrl"
            :src="avatarSrc(me.user.avatarUrl)"
            alt=""
            class="h-6 w-6 rounded-full object-cover ring-1 ring-current/30"
          />
          <Icon v-else :name="it.icon" class="h-[22px] w-[22px]" />

          <span
            v-if="badgeFor(it.key) > 0"
            class="absolute right-1 top-1 flex h-[15px] min-w-[15px] items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold leading-none text-white ring-2 ring-[var(--sycs-floatnav-ring)]"
          >{{ badgeFor(it.key) > 99 ? '99+' : badgeFor(it.key) }}</span>
        </NuxtLink>
      </div>
    </nav>
  </div>
</template>