<script setup lang="ts">
const props = defineProps<{
  open: boolean
  kind: 'followers' | 'following'
  userId: string
}>()

const emit = defineEmits<{ close: [] }>()

const users = ref<any[]>([])
const loading = ref(false)
const loaded = ref(false)

const title = computed(() => (props.kind === 'followers' ? 'フォロワー' : 'フォロー中'))

watch(() => [props.open, props.kind, props.userId] as const, async ([open]) => {
  if (!open) return
  users.value = []
  loaded.value = false
  loading.value = true
  try {
    const data = await $fetch<any>(`/api/users/${props.userId}/${props.kind}`)
    users.value = props.kind === 'followers' ? data.followers : data.following
    loaded.value = true
  } catch {
    users.value = []
    loaded.value = true
  } finally {
    loading.value = false
  }
}, { immediate: true })
</script>

<template>
  <BottomSheet :open="open" height="min(80dvh, 36rem)" :dismiss-on-backdrop="true" @close="emit('close')">
    <div class="flex items-center justify-between px-5 py-4 border-b border-outline-variant shrink-0">
      <h3 class="font-bold text-on-surface">{{ title }}</h3>
      <button
        class="p-1.5 -mr-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition"
        aria-label="閉じる"
        @click="emit('close')"
      >
        <Icon name="lucide:x" class="w-5 h-5" />
      </button>
    </div>

    <div class="p-3">
      <p v-if="loading" class="text-center text-sm text-on-surface-variant py-8">読み込み中...</p>
      <p v-else-if="!users.length" class="text-center text-sm text-on-surface-variant py-8">
        {{ kind === 'followers' ? 'フォロワーはまだいません' : 'フォロー中のユーザーはまだいません' }}
      </p>
      <ul v-else class="space-y-0.5">
        <li v-for="u in users" :key="u.id">
          <NuxtLink
            :to="`/profile/${u.username}`"
            class="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-surface-container/60 transition"
            @click="emit('close')"
          >
            <img
              v-if="avatarSrc(u.avatarUrl)"
              :src="avatarSrc(u.avatarUrl)"
              class="h-10 w-10 rounded-full object-cover shrink-0"
              alt=""
            />
            <div v-else class="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold shrink-0">
              {{ u.displayName?.charAt(0) || '?' }}
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-bold text-on-surface truncate flex items-center gap-1.5">
                <span class="truncate">{{ u.displayName || u.username }}</span>
                <UserBadges :badges="u.badges" />
              </p>
              <p class="text-xs text-on-surface-variant truncate">@{{ u.username }}</p>
            </div>
            <Icon name="lucide:chevron-right" class="w-4 h-4 text-on-surface-variant shrink-0" />
          </NuxtLink>
        </li>
      </ul>
    </div>
  </BottomSheet>
</template>