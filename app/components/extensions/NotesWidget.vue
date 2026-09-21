<script setup lang="ts">
const NOTES_KEY = 'sycs:quick-notes'
const text = ref('')
const saved = ref(false)
let savedTimer: ReturnType<typeof setTimeout> | null = null

onMounted(() => {
  text.value = localStorage.getItem(NOTES_KEY) || ''
})

watch(text, (value) => {
  localStorage.setItem(NOTES_KEY, value)
  saved.value = true
  if (savedTimer) clearTimeout(savedTimer)
  savedTimer = setTimeout(() => { saved.value = false }, 1200)
})

onUnmounted(() => { if (savedTimer) clearTimeout(savedTimer) })
</script>

<template>
  <div class="h-full flex flex-col">
    <textarea
      v-model="text"
      placeholder="メモを入力..."
      class="flex-1 min-h-0 w-full bg-transparent resize-none border-none focus:ring-0 text-sm text-slate-200 placeholder-slate-600 p-3 leading-relaxed"
    />
    <div class="px-3 py-1.5 border-t border-slate-800/70 flex items-center justify-between shrink-0">
      <span class="text-[10px] text-slate-500">{{ text.length }} 文字</span>
      <span class="text-[10px] text-emerald-400 flex items-center gap-1 transition" :class="saved ? 'opacity-100' : 'opacity-0'">
        <Icon name="lucide:check" class="w-3 h-3" /> 保存しました
      </span>
    </div>
  </div>
</template>
