<script setup lang="ts">
const emit = defineEmits<{ close: [] }>()

/**
 * この Modal は v-if で mount / unmount される。
 * BottomSheet の :open を“真に開いているか”として扱うため、
 * mount 時点を true にしてから unmount で閉じる。
 */
const open = ref(true)
onUnmounted(() => { open.value = false })

const servers = ref<any[]>([])
const loading = ref(true)
const showCreateForm = ref(false)
const showJoinForm = ref(false)
const createForm = ref({ name: '', description: '' })
const joinCode = ref('')

async function loadServers() {
  loading.value = true
  try {
    const data = await $fetch('/api/servers')
    servers.value = data.servers
  } finally {
    loading.value = false
  }
}

onMounted(() => { loadServers() })

async function createServer() {
  const data = await $fetch('/api/servers', {
    method: 'POST',
    body: createForm.value,
  })
  showCreateForm.value = false
  createForm.value = { name: '', description: '' }
  await loadServers()
  navigateTo(`/servers/${data.server.id}`)
  emit('close')
}

async function joinServer() {
  if (!joinCode.value.trim()) return
  const data = await $fetch(`/api/servers/join/${joinCode.value}`, { method: 'POST' })
  showJoinForm.value = false
  joinCode.value = ''
  await loadServers()
  navigateTo(`/servers/${data.serverId}`)
  emit('close')
}
</script>

<template>
  <BottomSheet :open="open" :height="showCreateForm || showJoinForm ? 'min(88dvh, 40rem)' : 'min(78dvh, 34rem)'" @close="emit('close')">
    <div class="p-6 pt-3 space-y-4">
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-bold">サーバー一覧</h2>
          <button @click="emit('close')" class="p-1 -mr-1 rounded-lg text-on-surface-variant hover:bg-surface-container-high transition">
            <Icon name="lucide:x" class="w-5 h-5" />
          </button>
        </div>

        <!-- 一覧 (フォーム表示中は入れ替える) -->
        <template v-if="!showCreateForm && !showJoinForm">
        <div class="flex gap-2">
          <button @click="showJoinForm = true" class="flex-1 py-2.5 rounded-lg border border-outline text-sm text-on-surface hover:bg-surface-container transition flex items-center justify-center gap-1.5">
            <Icon name="lucide:log-in" class="w-4 h-4" />
            参加
          </button>
          <button @click="showCreateForm = true" class="flex-1 py-2.5 rounded-lg bg-indigo-600 text-sm font-bold text-white hover:bg-indigo-700 transition flex items-center justify-center gap-1.5">
            <Icon name="lucide:plus" class="w-4 h-4" />
            作成
          </button>
        </div>

        <div v-if="loading" class="text-center text-on-surface-variant py-6 text-sm">読み込み中...</div>
        <div v-else-if="!servers.length" class="text-center text-on-surface-variant py-6 text-sm">参加しているサーバーはありません</div>
        <div v-else class="space-y-2">
          <button
            v-for="server in servers"
            :key="server.id"
            @click="navigateTo(`/servers/${server.id}`); emit('close')"
            class="w-full text-left bg-surface-container/30 border border-outline-variant rounded-xl p-3 hover:bg-surface-container/50 hover:border-outline transition flex items-center gap-3"
          >
            <div class="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold shrink-0">
              {{ server.name?.charAt(0) }}
            </div>
            <div class="flex-1 min-w-0">
              <h3 class="font-bold text-sm text-on-surface truncate">{{ server.name }}</h3>
              <p class="text-xs text-on-surface-variant truncate">{{ server.description || '説明なし' }}</p>
            </div>
          </button>
        </div>
        </template>

        <!-- Create form (シート内で入れ替える) -->
        <div v-if="showCreateForm" class="space-y-4">
          <h3 class="text-lg font-bold">サーバーを作成</h3>
          <div class="space-y-3">
            <div>
              <label class="text-xs text-on-surface-variant font-medium block mb-1">サーバー名</label>
              <input v-model="createForm.name" class="w-full bg-surface border border-outline rounded-lg px-3 py-2 text-on-surface text-sm focus:ring-1 focus:ring-indigo-500" placeholder="サーバー名" />
            </div>
            <div>
              <label class="text-xs text-on-surface-variant font-medium block mb-1">説明 (任意)</label>
              <textarea v-model="createForm.description" rows="3" class="w-full bg-surface border border-outline rounded-lg px-3 py-2 text-on-surface text-sm focus:ring-1 focus:ring-indigo-500 resize-none" placeholder="説明" />
            </div>
          </div>
          <div class="flex justify-end gap-2">
            <button @click="showCreateForm = false" class="px-4 py-2 text-sm text-on-surface-variant hover:text-on-surface transition">戻る</button>
            <button @click="createServer" :disabled="!createForm.name.trim()" class="px-5 py-2 rounded-lg bg-indigo-600 text-sm font-bold text-white hover:bg-indigo-700 transition disabled:opacity-50">作成</button>
          </div>
        </div>

        <!-- Join form (シート内で入れ替える) -->
        <div v-else-if="showJoinForm" class="space-y-4">
          <h3 class="text-lg font-bold">招待コードで参加</h3>
          <div>
            <label class="text-xs text-on-surface-variant font-medium block mb-1">招待コード</label>
            <input v-model="joinCode" class="w-full bg-surface border border-outline rounded-lg px-3 py-2 text-on-surface text-sm focus:ring-1 focus:ring-indigo-500" placeholder="コードを入力" />
          </div>
          <div class="flex justify-end gap-2">
            <button @click="showJoinForm = false" class="px-4 py-2 text-sm text-on-surface-variant hover:text-on-surface transition">戻る</button>
            <button @click="joinServer" :disabled="!joinCode.trim()" class="px-5 py-2 rounded-lg bg-indigo-600 text-sm font-bold text-white hover:bg-indigo-700 transition disabled:opacity-50">参加</button>
          </div>
        </div>
    </div>
  </BottomSheet>
</template>
