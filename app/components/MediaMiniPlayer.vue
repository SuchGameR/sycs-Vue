<script setup lang="ts">
const pane = useMediaPane()
const { selected, sourceLabel, mobileFull, kind } = pane

const attachments = computed<any[]>(() => selected.value?.attachments || [])
const firstImage = computed(() => attachments.value.find(a => String(a.mime || '').startsWith('image/')))
const firstVideo = computed(() => attachments.value.find(a => String(a.mime || '').startsWith('video/')))
const firstAudio = computed(() => attachments.value.find(a => String(a.mime || '').startsWith('audio/')))

function onPatch(postId: string, patch: any) {
  if (selected.value?.id !== postId) return
  pane.updatePost({ ...selected.value, ...patch })
}

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'たった今'
  if (minutes < 60) return `${minutes}分前`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}時間前`
  return `${Math.floor(hours / 24)}日前`
}

// Lock body scroll while fullscreen
watch(mobileFull, (v) => {
  if (import.meta.client) document.body.style.overflow = v ? 'hidden' : ''
})
onUnmounted(() => { if (import.meta.client) document.body.style.overflow = '' })
</script>

<template>
  <div class="min-[1024px]:hidden">
    <!-- Mini player -->
    <Transition name="mini">
      <div
        v-if="selected && !mobileFull"
        class="fixed left-3 right-3 bottom-[4.5rem] z-[80] bg-[#151a24] border border-slate-700 rounded-xl shadow-2xl flex items-center gap-3 p-2"
      >
        <button class="shrink-0" @click="pane.openMobileFull()">
          <img v-if="firstImage" :src="firstImage.url" class="w-11 h-11 rounded-lg object-cover" />
          <div v-else class="w-11 h-11 rounded-lg bg-slate-800 flex items-center justify-center">
            <Icon :name="kind === 'video' ? 'lucide:video' : kind === 'audio' ? 'lucide:music' : 'lucide:message-square'" class="w-5 h-5 text-indigo-400" />
          </div>
        </button>
        <button class="flex-1 min-w-0 text-left" @click="pane.openMobileFull()">
          <p class="text-sm font-bold text-white truncate">{{ selected.user?.displayName || 'メディア' }}</p>
          <p class="text-[11px] text-slate-500 truncate">{{ selected.content || sourceLabel || 'タップして開く' }}</p>
        </button>
        <button class="p-2 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition shrink-0" @click="pane.closeMobile()">
          <Icon name="lucide:x" class="w-4 h-4" />
        </button>
      </div>
    </Transition>

    <!-- Fullscreen detail -->
    <Transition name="sheet">
      <div v-if="selected && mobileFull" class="fixed inset-0 z-[120] bg-[#0b0f19] flex flex-col">
        <div class="h-12 px-2 flex items-center gap-2 border-b border-slate-800 shrink-0">
          <button class="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition" @click="pane.minimizeMobile()" title="戻る">
            <Icon name="lucide:chevron-down" class="w-5 h-5" />
          </button>
          <span class="text-sm font-bold text-white truncate flex-1">{{ selected.user?.displayName || 'メディア' }}</span>
          <button class="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition" @click="pane.closeMobile()" title="閉じる">
            <Icon name="lucide:x" class="w-5 h-5" />
          </button>
        </div>

        <div class="flex-1 overflow-y-auto min-h-0">
          <div class="px-3 pt-3">
            <video v-if="firstVideo" :src="firstVideo.url" controls autoplay playsinline class="w-full rounded-xl bg-black" />
            <div v-else-if="firstImage" class="rounded-xl overflow-hidden bg-black/40">
              <img :src="firstImage.url" class="w-full max-h-[45vh] object-contain" />
            </div>
            <div v-else-if="firstAudio" class="rounded-xl bg-gradient-to-br from-indigo-900/50 to-slate-900 p-4">
              <div class="flex items-center gap-3 mb-3">
                <div class="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center"><Icon name="lucide:music" class="w-6 h-6 text-white" /></div>
                <p class="text-sm font-bold text-white">オーディオ</p>
              </div>
              <audio :src="firstAudio.url" controls autoplay class="w-full" />
            </div>
          </div>

          <div class="px-3 py-3">
            <p v-if="selected.content" class="text-slate-200 text-sm leading-relaxed whitespace-pre-wrap break-words">{{ selected.content }}</p>
            <div class="flex items-center gap-4 mt-3 text-slate-500 text-sm">
              <span class="flex items-center gap-1.5"><Icon name="lucide:heart" class="w-4 h-4" :class="selected.liked ? 'text-indigo-400 fill-indigo-400' : ''" />{{ selected.likeCount || 0 }}</span>
              <span class="flex items-center gap-1.5"><Icon name="lucide:repeat-2" class="w-4 h-4" />{{ selected.repostCount || 0 }}</span>
              <span class="ml-auto">{{ timeAgo(selected.createdAt) }}</span>
            </div>
          </div>

          <div class="border-t border-slate-800 min-h-[40vh]">
            <PostComments :post="selected" @update="onPatch" />
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.mini-enter-active, .mini-leave-active, .sheet-enter-active, .sheet-leave-active { transition: all 0.25s ease; }
.mini-enter-from, .mini-leave-to { opacity: 0; transform: translateY(12px); }
.sheet-enter-from, .sheet-leave-to { opacity: 0; transform: translateY(20px); }
</style>
