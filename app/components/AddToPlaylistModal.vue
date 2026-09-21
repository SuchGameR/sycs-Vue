<script setup lang="ts">
const { playlists, addTarget, fetchList, create, addItem, removeItem, closeAdd } = usePlaylists()

const newName = ref('')
const busyId = ref('')
const creating = ref(false)
const error = ref('')

watch(addTarget, async (post) => {
  if (!post) return
  newName.value = ''
  error.value = ''
  await fetchList(true, post.id)
})

async function toggle(list: any) {
  if (!addTarget.value) return
  busyId.value = list.id
  error.value = ''
  try {
    if (list.contains) await removeItem(list.id, addTarget.value.id)
    else await addItem(list.id, addTarget.value.id)
  } catch (e: any) {
    error.value = e?.data?.message || '更新に失敗しました'
  } finally {
    busyId.value = ''
  }
}

async function createAndAdd() {
  const name = newName.value.trim()
  if (!name || !addTarget.value) return
  creating.value = true
  error.value = ''
  try {
    const list = await create(name)
    await addItem(list.id, addTarget.value.id)
    newName.value = ''
  } catch (e: any) {
    error.value = e?.data?.message || '作成に失敗しました'
  } finally {
    creating.value = false
  }
}
</script>

<template>
  <Teleport to="body">
    <div v-if="addTarget" class="fixed inset-0 z-[300] flex items-end min-[681px]:items-center justify-center bg-black/60 p-0 min-[681px]:p-4" @click.self="closeAdd">
      <div class="w-full min-[681px]:max-w-sm bg-slate-900 border border-slate-800 rounded-t-2xl min-[681px]:rounded-2xl shadow-2xl max-h-[80vh] flex flex-col">
        <div class="flex items-center justify-between px-4 py-3 border-b border-slate-800">
          <h3 class="font-bold text-white">プレイリストに追加</h3>
          <button @click="closeAdd" class="p-1 rounded-full text-slate-500 hover:text-white hover:bg-slate-800 transition">
            <Icon name="lucide:x" class="w-5 h-5" />
          </button>
        </div>

        <div class="flex-1 overflow-y-auto p-2">
          <p v-if="!playlists.length" class="text-center text-slate-500 text-sm py-6">プレイリストがありません</p>
          <button
            v-for="list in playlists"
            :key="list.id"
            @click="toggle(list)"
            :disabled="busyId === list.id"
            class="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-800/50 transition text-left disabled:opacity-50"
          >
            <span class="w-10 h-10 rounded-lg bg-slate-800 overflow-hidden shrink-0 flex items-center justify-center">
              <img v-if="list.coverUrl" :src="list.coverUrl" class="w-full h-full object-cover" />
              <Icon v-else name="lucide:list-video" class="w-5 h-5 text-slate-500" />
            </span>
            <span class="flex-1 min-w-0">
              <span class="block text-sm text-white truncate">{{ list.name }}</span>
              <span class="block text-xs text-slate-500">{{ list.count }} 件</span>
            </span>
            <span
              class="w-5 h-5 rounded-md border flex items-center justify-center shrink-0"
              :class="list.contains ? 'bg-indigo-600 border-indigo-500' : 'border-slate-600'"
            >
              <Icon v-if="list.contains" name="lucide:check" class="w-3.5 h-3.5 text-white" />
            </span>
          </button>
        </div>

        <div class="border-t border-slate-800 p-3 space-y-2">
          <div class="flex items-center gap-2">
            <input
              v-model="newName"
              placeholder="新しいプレイリスト"
              maxlength="60"
              class="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 min-w-0"
              @keydown.enter.prevent="createAndAdd"
            />
            <button
              @click="createAndAdd"
              :disabled="creating || !newName.trim()"
              class="px-3 py-2 rounded-lg bg-indigo-600 text-sm font-bold text-white hover:bg-indigo-700 transition disabled:opacity-50 shrink-0"
            >{{ creating ? '...' : '作成' }}</button>
          </div>
          <p v-if="error" class="text-xs text-red-400">{{ error }}</p>
        </div>
      </div>
    </div>
  </Teleport>
</template>
