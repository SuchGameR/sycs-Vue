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
  <BottomSheet :open="!!addTarget" height="min(80dvh, 26rem)" :dismiss-on-backdrop="true" @close="closeAdd">
      <div class="flex flex-col h-full min-[681px]:max-w-sm min-[681px]:mx-auto">
        <div class="flex items-center justify-between px-4 py-3 border-b border-outline-variant">
          <h3 class="font-bold text-white">プレイリストに追加</h3>
          <button @click="closeAdd" class="p-1 rounded-full text-on-surface-variant hover:text-white hover:bg-surface-container transition">
            <Icon name="lucide:x" class="w-5 h-5" />
          </button>
        </div>

        <div class="flex-1 overflow-y-auto p-2 min-h-0">
          <p v-if="!playlists.length" class="text-center text-on-surface-variant text-sm py-6">プレイリストがありません</p>
          <button
            v-for="list in playlists"
            :key="list.id"
            @click="toggle(list)"
            :disabled="busyId === list.id"
            class="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-surface-container/50 transition text-left disabled:opacity-50"
          >
            <span class="w-10 h-10 rounded-lg bg-surface-container overflow-hidden shrink-0 flex items-center justify-center">
              <img v-if="list.coverUrl" :src="list.coverUrl" class="w-full h-full object-cover" />
              <Icon v-else name="lucide:list-video" class="w-5 h-5 text-on-surface-variant" />
            </span>
            <span class="flex-1 min-w-0">
              <span class="block text-sm text-white truncate">{{ list.name }}</span>
              <span class="block text-xs text-on-surface-variant">{{ list.count }} 件</span>
            </span>
            <span
              class="w-5 h-5 rounded-md border flex items-center justify-center shrink-0"
              :class="list.contains ? 'bg-indigo-600 border-indigo-500' : 'border-slate-600'"
            >
              <Icon v-if="list.contains" name="lucide:check" class="w-3.5 h-3.5 text-white" />
            </span>
          </button>
        </div>

        <div class="border-t border-outline-variant p-3 space-y-2">
          <div class="flex items-center gap-2">
            <input
              v-model="newName"
              placeholder="新しいプレイリスト"
              maxlength="60"
              class="flex-1 bg-surface-container border border-outline rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 min-w-0"
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
  </BottomSheet>
</template>
