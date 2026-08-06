<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const route = useRoute()
const code = computed(() => route.params.code as string)

const data = ref<any>(null)
const error = ref<string | null>(null)
const loading = ref(true)
const joining = ref(false)

async function load() {
  loading.value = true
  error.value = null
  try {
    data.value = await $fetch(`/api/invites/${code.value}`)
  } catch (e: any) {
    error.value = e?.data?.message || '招待コードが見つかりません'
  } finally {
    loading.value = false
  }
}

async function join() {
  joining.value = true
  error.value = null
  let res: any
  try {
    res = await $fetch(`/api/servers/join/${code.value}`, { method: 'POST' })
    await navigateTo(`/servers/${res.serverId}`)
  } catch (e: any) {
    error.value = e?.data?.message || '参加に失敗しました'
    if (e?.statusCode === 409) {
      const id = data.value?.server?.id || res?.serverId
      if (id) await navigateTo(`/servers/${id}`)
    }
  } finally {
    joining.value = false
  }
}

onMounted(load)
</script>

<template>
  <div class="min-h-full flex items-center justify-center p-4">
    <div v-if="loading" class="text-slate-500">読み込み中...</div>

    <div v-else-if="error && !data" class="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-8 text-center">
      <Icon name="lucide:link-off" class="w-10 h-10 text-slate-600 mx-auto mb-3" />
      <h1 class="text-lg font-bold text-white">招待が無効です</h1>
      <p class="text-sm text-slate-500 mt-1">{{ error }}</p>
      <NuxtLink to="/servers" class="mt-6 inline-block px-5 py-2 rounded-lg bg-indigo-600 text-sm font-bold text-white hover:bg-indigo-700 transition">
        サーバー一覧へ
      </NuxtLink>
    </div>

    <div v-else-if="data" class="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-8 text-center">
      <div class="w-20 h-20 rounded-2xl bg-indigo-600 flex items-center justify-center text-3xl font-bold text-white mx-auto overflow-hidden">
        <img v-if="data.server.iconUrl" :src="data.server.iconUrl" class="w-full h-full object-cover" />
        <template v-else>{{ data.server.name?.charAt(0) }}</template>
      </div>
      <h1 class="text-xl font-bold text-white mt-4">{{ data.server.name }}</h1>
      <p class="text-sm text-slate-500 mt-1">{{ data.server.description || 'このサーバーに参加しませんか？' }}</p>
      <p class="text-xs text-slate-600 mt-2 flex items-center justify-center gap-1">
        <Icon name="lucide:users" class="w-3.5 h-3.5" />
        {{ data.server.memberCount }} 人のメンバーがいます
      </p>

      <p v-if="error" class="text-xs text-red-400 mt-3">{{ error }}</p>

      <button
        @click="join"
        :disabled="joining"
        class="mt-6 w-full py-3 rounded-xl bg-indigo-600 text-sm font-bold text-white hover:bg-indigo-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
      >
        <Icon v-if="joining" name="lucide:loader-2" class="w-4 h-4 animate-spin" />
        <Icon v-else name="lucide:log-in" class="w-4 h-4" />
        このサーバーに参加
      </button>
    </div>
  </div>
</template>
