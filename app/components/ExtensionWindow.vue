<script setup lang="ts">
import ClockWidget from './extensions/ClockWidget.vue'
import NotesWidget from './extensions/NotesWidget.vue'
import TrendingWidget from './extensions/TrendingWidget.vue'
import { EXTENSION_CATALOG } from '~/composables/useWorkbench'
import type { WorkbenchWindow } from '~/composables/useWorkbench'

const props = defineProps<{ win: WorkbenchWindow }>()
const wb = useWorkbench()

const WIDGETS: Record<string, any> = {
  clock: ClockWidget,
  notes: NotesWidget,
  trending: TrendingWidget,
}

const ACCENTS: Record<string, string> = {
  clock: 'bg-gradient-to-br from-sky-500/40 to-indigo-500/10',
  notes: 'bg-gradient-to-br from-amber-500/40 to-orange-500/10',
  trending: 'bg-gradient-to-br from-fuchsia-500/40 to-rose-500/10',
}

const def = computed(() => EXTENSION_CATALOG.find(e => e.id === props.win.extId) || null)
const widget = computed(() => WIDGETS[props.win.extId] || null)

const dragging = ref(false)
const resizing = ref(false)

let dragStart = { px: 0, py: 0, wx: 0, wy: 0 }
let resizeStart = { px: 0, py: 0, w: 0, h: 0 }

function clampPos(x: number, y: number) {
  const maxX = window.innerWidth - 80
  const maxY = window.innerHeight - 40
  return { x: Math.min(Math.max(0, x), maxX), y: Math.min(Math.max(0, y), maxY) }
}

function onDragStart(e: PointerEvent) {
  if ((e.target as HTMLElement).closest('button')) return
  dragging.value = true
  wb.focusWindow(props.win.id)
  dragStart = { px: e.clientX, py: e.clientY, wx: props.win.x, wy: props.win.y }
  window.addEventListener('pointermove', onDragMove)
  window.addEventListener('pointerup', stopDrag)
  e.preventDefault()
}

function onDragMove(e: PointerEvent) {
  if (!dragging.value) return
  const pos = clampPos(
    dragStart.wx + (e.clientX - dragStart.px),
    dragStart.wy + (e.clientY - dragStart.py),
  )
  wb.moveWindow(props.win.id, pos.x, pos.y)
}

function stopDrag() {
  if (!dragging.value) return
  dragging.value = false
  window.removeEventListener('pointermove', onDragMove)
  window.removeEventListener('pointerup', stopDrag)
  wb.commit()
}

function onResizeStart(e: PointerEvent) {
  resizing.value = true
  wb.focusWindow(props.win.id)
  resizeStart = { px: e.clientX, py: e.clientY, w: props.win.w, h: props.win.h }
  window.addEventListener('pointermove', onResizeMove)
  window.addEventListener('pointerup', stopResize)
  e.preventDefault()
  e.stopPropagation()
}

function onResizeMove(e: PointerEvent) {
  if (!resizing.value) return
  const w = Math.max(200, Math.min(resizeStart.w + (e.clientX - resizeStart.px), window.innerWidth - 16))
  const h = Math.max(120, Math.min(resizeStart.h + (e.clientY - resizeStart.py), window.innerHeight - 16))
  wb.resizeWindow(props.win.id, w, h)
}

function stopResize() {
  if (!resizing.value) return
  resizing.value = false
  window.removeEventListener('pointermove', onResizeMove)
  window.removeEventListener('pointerup', stopResize)
  wb.commit()
}

onUnmounted(() => {
  window.removeEventListener('pointermove', onDragMove)
  window.removeEventListener('pointerup', stopDrag)
  window.removeEventListener('pointermove', onResizeMove)
  window.removeEventListener('pointerup', stopResize)
})
</script>

<template>
  <div
    class="fixed flex flex-col rounded-xl border border-slate-700 bg-[#121826]/95 backdrop-blur-md shadow-2xl overflow-hidden"
    :class="(dragging || resizing) ? 'select-none' : ''"
    :style="{ left: win.x + 'px', top: win.y + 'px', width: win.w + 'px', height: win.h + 'px', zIndex: win.z }"
    @pointerdown="wb.focusWindow(win.id)"
  >
    <div
      class="h-9 px-2.5 flex items-center gap-2 border-b border-slate-800 cursor-move shrink-0 bg-slate-900/60"
      @pointerdown="onDragStart"
    >
      <div class="w-5 h-5 rounded-md flex items-center justify-center shrink-0" :class="ACCENTS[win.extId] || 'bg-slate-700'">
        <Icon :name="def?.icon || 'lucide:puzzle'" class="w-3 h-3 text-white" />
      </div>
      <span class="text-xs font-bold text-white truncate flex-1">{{ def?.name || 'ウィンドウ' }}</span>
      <button type="button" @click.stop="wb.minimizeWindow(win.id)" class="p-1 rounded-md text-slate-500 hover:text-white hover:bg-slate-700 transition" title="最小化">
        <Icon name="lucide:minus" class="w-3.5 h-3.5" />
      </button>
      <button type="button" @click.stop="wb.closeWindow(win.id)" class="p-1 rounded-md text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition" title="閉じる">
        <Icon name="lucide:x" class="w-3.5 h-3.5" />
      </button>
    </div>

    <div class="flex-1 min-h-0">
      <component :is="widget" v-if="widget" />
      <p v-else class="text-xs text-slate-500 text-center py-6">この拡張機能は利用できません</p>
    </div>

    <div
      class="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize"
      @pointerdown="onResizeStart"
    />
  </div>
</template>
