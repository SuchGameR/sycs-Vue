<script setup lang="ts">
const emit = defineEmits<{ close: [] }>()

const { accounts, switchAccount, removeAccount } = useAccounts()
const router = useRouter()

const currentUserId = ref<string | undefined>(undefined)
const switching = ref<string | null>(null)
const removing = ref(false)
const error = ref('')

onMounted(async () => {
  try {
    const res = await $fetch<{ user: any }>('/api/auth/me')
    currentUserId.value = res.user?.id
  } catch { /* not signed in */ }
})

async function onSwitch(account: any) {
  if (account.id === currentUserId.value) return emit('close')
  switching.value = account.id
  error.value = ''
  try {
    await switchAccount(account)
  } catch (e: any) {
    error.value = e.data?.message || '切り替えに失敗しました'
    switching.value = null
  }
}

function onAdd() {
  emit('close')
  router.push('/signin')
}

function onRemove(id: string) {
  if (id === props.currentUserId) return
  removing.value = true
  removeAccount(id)
  removing.value = false
}
</script>

<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-[180] flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/60" @click="emit('close')" />
      <div class="relative bg-[#151a24] border border-slate-700 rounded-2xl w-full max-w-md overflow-hidden" @click.stop>
        <div class="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <h3 class="font-bold text-white flex items-center gap-2">
            <Icon name="lucide:user-round-cog" class="w-5 h-5 text-indigo-400" />
            アカウント切り替え
          </h3>
          <button @click="emit('close')" class="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition">
            <Icon name="lucide:x" class="w-4 h-4" />
          </button>
        </div>

        <div class="p-3 max-h-[60vh] overflow-y-auto space-y-1.5">
          <p v-if="error" class="px-3 py-2 text-sm text-red-400">{{ error }}</p>

          <button
            v-for="acc in accounts"
            :key="acc.id"
            @click="onSwitch(acc)"
            class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition text-left"
            :class="acc.id === currentUserId ? 'bg-indigo-600/15 ring-1 ring-indigo-500/50' : 'hover:bg-slate-800/50'"
          >
            <img v-if="avatarSrc(acc.avatarUrl)" :src="avatarSrc(acc.avatarUrl)" class="w-9 h-9 rounded-full object-cover shrink-0" />
            <div v-else class="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-sm font-bold text-white shrink-0">
              {{ acc.displayName?.charAt(0) || '?' }}
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-bold text-white truncate flex items-center gap-2">
                {{ acc.displayName }}
                <span v-if="acc.id === currentUserId" class="text-[10px] font-bold text-indigo-300 bg-indigo-600/20 px-1.5 py-0.5 rounded-full">現在</span>
              </p>
              <p class="text-xs text-slate-500 truncate">@{{ acc.username }}</p>
            </div>
            <Icon v-if="switching === acc.id" name="lucide:loader-2" class="w-4 h-4 text-indigo-400 animate-spin shrink-0" />
            <Icon v-else-if="acc.id !== currentUserId" name="lucide:repeat-2" class="w-4 h-4 text-slate-600 shrink-0" />
            <button
              v-if="acc.id !== currentUserId"
              @click.stop="onRemove(acc.id)"
              class="p-1.5 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition shrink-0"
              title="このアカウントを削除"
            >
              <Icon name="lucide:trash-2" class="w-3.5 h-3.5" />
            </button>
          </button>

          <button
            @click="onAdd"
            class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-300 hover:bg-slate-800/50 transition border border-dashed border-slate-700"
          >
            <div class="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center shrink-0">
              <Icon name="lucide:plus" class="w-4 h-4" />
            </div>
            <span class="text-sm font-medium">アカウントを追加</span>
          </button>
        </div>

        <div class="px-5 py-3 border-t border-slate-800 text-[11px] text-slate-600">
          保存されたアカウントはこのブラウザ内にのみ保管されます
        </div>
      </div>
    </div>
  </Teleport>
</template>