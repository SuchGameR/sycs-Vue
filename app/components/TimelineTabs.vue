<script setup lang="ts">
const timelines = useCustomTimelines()
const { fixedTabs, pinnedTabs, unpinnedTabs, activeId } = timelines

const showBuilder = ref(false)
const showMore = ref(false)

const moreBtn = ref<HTMLElement | null>(null)
const menuPos = ref({ top: 0, left: 0 })

const scroller = ref<HTMLElement | null>(null)

const visibleTabs = computed(() => [...fixedTabs, ...pinnedTabs.value])

function select(id: string) {
  timelines.setActive(id)
  showMore.value = false
}

function remove(id: string, e?: Event) {
  e?.stopPropagation()
  timelines.removeTab(id)
}

function toggleMore() {
  if (showMore.value) { showMore.value = false; return }
  const rect = moreBtn.value?.getBoundingClientRect()
  if (rect) menuPos.value = { top: rect.bottom + 6, left: Math.max(8, rect.left) }
  showMore.value = true
}

let dragging = false
let dragStartX = 0
let dragStartScroll = 0
let dragMoved = false

function onPointerDown(e: PointerEvent) {
  if (e.pointerType !== 'mouse') return
  const el = scroller.value
  if (!el) return
  dragging = true
  dragStartX = e.clientX
  dragStartScroll = el.scrollLeft
  dragMoved = false
}

function onPointerMove(e: PointerEvent) {
  const el = scroller.value
  if (!dragging || !el) return
  const dx = e.clientX - dragStartX
  if (Math.abs(dx) > 4) dragMoved = true
  el.scrollLeft = dragStartScroll - dx
}

function onPointerUp() {
  if (!dragging) return
  dragging = false
  if (dragMoved) setTimeout(() => { dragMoved = false }, 0)
}

function onTabClick(id: string) {
  if (dragMoved) return
  select(id)
}

onUnmounted(() => { dragging = false })
</script>

<template>
  <div class="flex items-center gap-1 min-w-0 max-w-full">
    <div
      ref="scroller"
      class="flex items-center gap-1 overflow-x-auto min-w-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden cursor-grab active:cursor-grabbing"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @pointerleave="onPointerUp"
    >
      <div
        v-for="tab in visibleTabs"
        :key="tab.id"
        class="group flex items-center rounded-full transition whitespace-nowrap shrink-0"
        :class="activeId === tab.id ? 'bg-slate-100 text-slate-900' : 'text-slate-400 hover:text-slate-200 bg-slate-800/40 hover:bg-slate-800/70'"
      >
        <button
          @click="onTabClick(tab.id)"
          class="pl-3 text-sm font-medium truncate max-w-[9rem]"
          :class="tab.fixed ? 'pr-3 py-1.5' : 'pr-1 py-1.5'"
        >
          {{ tab.label }}
        </button>
        <button
          v-if="!tab.fixed"
          @click="remove(tab.id, $event)"
          class="mr-1 p-0.5 rounded-full transition shrink-0"
          :class="activeId === tab.id ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-300' : 'text-slate-500 hover:text-white hover:bg-slate-700'"
          title="タブを閉じる"
        >
          <Icon name="lucide:x" class="w-3.5 h-3.5" />
        </button>
      </div>
    </div>

    <div v-if="unpinnedTabs.length" class="shrink-0">
      <button
        ref="moreBtn"
        @click="toggleMore"
        class="px-2.5 py-1.5 rounded-full text-sm font-medium transition flex items-center gap-1"
        :class="showMore ? 'text-slate-200 bg-slate-800/50' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'"
      >
        その他
        <Icon name="lucide:chevron-down" class="w-3.5 h-3.5 transition-transform" :class="showMore ? 'rotate-180' : ''" />
      </button>
    </div>

    <button
      @click="showBuilder = true"
      class="p-1.5 rounded-full text-slate-400 hover:text-indigo-400 hover:bg-slate-800/50 transition shrink-0"
      title="カスタムタイムラインを作成"
    >
      <Icon name="lucide:plus" class="w-4 h-4" />
    </button>

    <Teleport to="body">
      <div v-if="showMore" class="fixed inset-0 z-[299]" @click="showMore = false" />
      <Transition name="tabs-pop">
        <div
          v-if="showMore"
          class="fixed z-[300] bg-slate-900 border border-slate-800 rounded-xl py-1.5 shadow-xl min-w-52 max-h-[60vh] overflow-y-auto"
          :style="{ top: menuPos.top + 'px', left: menuPos.left + 'px' }"
        >
          <div v-for="tab in unpinnedTabs" :key="tab.id" class="flex items-center group">
            <button @click="select(tab.id)" class="flex-1 text-left px-3 py-2 text-sm transition truncate"
              :class="activeId === tab.id ? 'text-indigo-400' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'">
              {{ tab.label }}
            </button>
            <button @click.stop="timelines.togglePin(tab.id)" class="p-1.5 text-slate-600 hover:text-indigo-400 transition" title="ピン留め">
              <Icon name="lucide:pin" class="w-3.5 h-3.5" />
            </button>
            <button @click.stop="remove(tab.id)" class="p-1.5 mr-1 text-slate-600 hover:text-red-400 transition" title="削除">
              <Icon name="lucide:trash-2" class="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </Transition>
    </Teleport>

    <CustomTimelineModal v-if="showBuilder" @close="showBuilder = false" />
  </div>
</template>

<style scoped>
.tabs-pop-enter-active { transition: opacity 0.15s ease, transform 0.15s ease; }
.tabs-pop-leave-active { transition: opacity 0.1s ease, transform 0.1s ease; }
.tabs-pop-enter-from, .tabs-pop-leave-to { opacity: 0; transform: translateY(-4px); }
</style>
