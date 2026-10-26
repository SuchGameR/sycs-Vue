<script setup lang="ts">
const props = defineProps<{
  user: {
    id?: string
    username?: string
    displayName?: string
    avatarUrl?: string | null
    bio?: string | null
    statusMessage?: string | null
    badges?: any[]
    title?: string | null
  }
}>()

const visible = ref(false)
const position = ref({ x: 0, y: 0 })
let showTimer: ReturnType<typeof setTimeout> | undefined
let hideTimer: ReturnType<typeof setTimeout> | undefined

const cardStyle = computed(() => ({
  left: `${Math.max(12, Math.min(position.value.x, (import.meta.client ? window.innerWidth : 1200) - 300))}px`,
  top: `${Math.max(12, Math.min(position.value.y, (import.meta.client ? window.innerHeight : 800) - 220))}px`,
}))

function clearTimers() {
  if (showTimer) clearTimeout(showTimer)
  if (hideTimer) clearTimeout(hideTimer)
}

function show(event: MouseEvent | FocusEvent) {
  clearTimers()
  if (event instanceof MouseEvent) {
    position.value = { x: event.clientX + 14, y: event.clientY + 14 }
  } else {
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
    position.value = { x: rect.right + 10, y: rect.top }
  }
  showTimer = setTimeout(() => { visible.value = true }, 350)
}

function hide() {
  if (showTimer) clearTimeout(showTimer)
  hideTimer = setTimeout(() => { visible.value = false }, 120)
}

onUnmounted(clearTimers)
</script>

<template>
  <span class="user-hover-trigger" @mouseenter="show" @mouseleave="hide" @focusin="show" @focusout="hide">
    <slot />
  </span>
  <Teleport to="body">
    <Transition name="user-card">
      <section
        v-if="visible"
        class="user-hover-card fixed z-[500] w-[min(18rem,calc(100vw-1.5rem))] overflow-hidden rounded-2xl border border-white/10 bg-[#202127] shadow-[0_18px_55px_rgba(0,0,0,.48)]"
        :style="cardStyle"
        @mouseenter="clearTimers"
        @mouseleave="hide"
        @focusin="clearTimers"
        @focusout="hide"
        aria-label="ユーザープレビュー"
      >
        <div class="h-16 bg-[radial-gradient(ellipse_at_15%_10%,rgba(99,102,241,.55),transparent_62%),linear-gradient(120deg,#292a34,#191a20)]" />
        <div class="px-4 pb-4">
          <div class="-mt-7 mb-2 flex items-end justify-between">
            <div class="grid h-14 w-14 place-items-center overflow-hidden rounded-full border-[3px] border-[#202127] bg-indigo-600 text-lg font-bold text-white">
              <img v-if="avatarSrc(user.avatarUrl)" :src="avatarSrc(user.avatarUrl)" :alt="user.displayName || ''" class="h-full w-full object-cover" />
              <span v-else>{{ user.displayName?.charAt(0) || '?' }}</span>
            </div>
            <NuxtLink
              v-if="user.username"
              :to="`/profile/@${user.username}`"
              class="rounded-lg bg-indigo-500 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-indigo-400"
            >
              プロフィール
            </NuxtLink>
          </div>
          <div class="flex flex-wrap items-center gap-1.5">
            <span class="max-w-full truncate text-sm font-bold text-white">{{ user.displayName || 'ユーザー' }}</span>
            <UserBadges :badges="user.badges" />
            <UserTitle :title="user.title" />
          </div>
          <p v-if="user.username" class="mt-0.5 text-xs text-white/50">@{{ user.username }}</p>
          <p v-if="user.statusMessage" class="mt-3 flex items-center gap-1.5 text-xs text-emerald-300">
            <span class="h-1.5 w-1.5 rounded-full bg-emerald-400" />{{ user.statusMessage }}
          </p>
          <p v-if="user.bio" class="mt-3 line-clamp-3 whitespace-pre-line break-words text-xs leading-relaxed text-white/75">{{ user.bio }}</p>
        </div>
      </section>
    </Transition>
  </Teleport>
</template>

<style scoped>
.user-hover-trigger {
  display: inline-flex;
}

.user-card-enter-active,
.user-card-leave-active {
  transition: opacity 140ms ease, transform 140ms ease;
}

.user-card-enter-from,
.user-card-leave-to {
  opacity: 0;
  transform: translateY(5px) scale(0.98);
}
</style>
