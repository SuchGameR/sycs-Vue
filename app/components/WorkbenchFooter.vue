<script setup lang="ts">
import { EXTENSION_CATALOG } from '~/composables/useWorkbench'

const wb = useWorkbench()
const { windows, layout, isInstalled } = wb
const pane = useMediaPane()
const { width: paneWidth, setWidth } = pane

const open = ref(false)

const ACCENTS: Record<string, string> = {
  clock: 'bg-gradient-to-br from-sky-500/40 to-indigo-500/10',
  notes: 'bg-gradient-to-br from-amber-500/40 to-orange-500/10',
  trending: 'bg-gradient-to-br from-fuchsia-500/40 to-rose-500/10',
}

const installedCount = computed(() => wb.installed.value.length)
const openCount = computed(() => windows.value.filter(w => !w.minimized).length)

const dockItems = computed(() =>
  wb.installed.value
    .map(id => EXTENSION_CATALOG.find(e => e.id === id))
    .filter(Boolean) as typeof EXTENSION_CATALOG
)

function windowOf(extId: string) {
  return windows.value.find(w => w.extId === extId)
}

function isActive(extId: string) {
  return !!windowOf(extId) && !windowOf(extId)!.minimized
}

function toggleExt(extId: string) {
  const win = windowOf(extId)
  if (!win) { wb.openWindow(extId); return }
  if (win.minimized) wb.openWindow(extId)
  else wb.minimizeWindow(win.id)
}

function toggleMenu() { open.value = !open.value }

function setPaneWidth(e: Event) {
  setWidth(Number((e.target as HTMLInputElement).value))
}

function openExt(id: string) {
  wb.install(id)
}
</script>

<template>
  <div class="hidden min-[681px]:block">
    <!-- Footer bar -->
    <div class="fixed bottom-0 left-0 right-0 h-[30px] bg-[#0b0f19]/95 backdrop-blur-md border-t border-slate-800 z-[60] flex items-center px-3">
      <div class="w-48 min-[1024px]:w-60 shrink-0 flex items-center gap-2 text-[10px] text-slate-600">
        <Icon name="lucide:layout-grid" class="w-3 h-3" />
        <span>ワークベンチ</span>
      </div>

      <div class="flex-1 flex items-center justify-center gap-1.5 min-w-0">
        <!-- Deck: installed extensions -->
        <TransitionGroup name="deck" tag="div" class="flex items-center gap-1.5 min-w-0 overflow-x-auto">
          <button
            v-for="ext in dockItems"
            :key="ext.id"
            @click.stop="toggleExt(ext.id)"
            class="group relative h-[24px] w-[30px] rounded-md flex items-center justify-center transition shrink-0"
            :class="isActive(ext.id) ? 'bg-indigo-600/40 ring-1 ring-indigo-400/60' : 'bg-slate-800/70 hover:bg-slate-700'"
            :title="`${ext.name}${isActive(ext.id) ? '（表示中）' : ''}`"
          >
            <Icon :name="ext.icon" class="w-3.5 h-3.5" :class="isActive(ext.id) ? 'text-white' : 'text-slate-400 group-hover:text-white'" />
            <span
              class="absolute -bottom-px left-1/2 -translate-x-1/2 h-[2px] rounded-full transition-all"
              :class="windowOf(ext.id) ? (isActive(ext.id) ? 'w-4 bg-indigo-400' : 'w-2 bg-slate-500') : 'w-0'"
            />
          </button>
        </TransitionGroup>

        <button
          @click.stop="toggleMenu"
          class="group relative h-[30px] w-[54px] flex items-center justify-center wb-hex shrink-0"
          :title="open ? 'メニューを閉じる' : '拡張機能・ウィンドウ'"
        >
          <span class="wb-hex-inner absolute inset-0 flex items-center justify-center">
            <Icon
              name="lucide:plus"
              class="w-4 h-4 text-slate-400 group-hover:text-white transition-transform duration-300"
              :class="open ? 'rotate-45 text-indigo-400' : 'group-hover:scale-110'"
            />
          </span>
        </button>
      </div>

      <div class="w-48 min-[1024px]:w-60 shrink-0 flex items-center justify-end gap-3 text-[10px] text-slate-600">
        <span v-if="installedCount">拡張 {{ installedCount }}</span>
        <span v-if="openCount">ウィンドウ {{ openCount }}</span>
      </div>
    </div>

    <!-- Backdrop -->
    <Transition name="wb-fade">
      <div v-if="open" class="fixed inset-0 z-[199]" @click="open = false" />
    </Transition>

    <!-- Menu -->
    <Transition name="wb-pop">
      <div
        v-if="open"
        class="fixed bottom-[38px] left-1/2 -translate-x-1/2 w-[440px] max-w-[92vw] max-h-[70vh] overflow-y-auto bg-[#151a24] border border-slate-700 rounded-2xl shadow-2xl z-[200]"
      >
        <div class="px-4 py-3 border-b border-slate-800 flex items-center gap-2">
          <Icon name="lucide:blocks" class="w-4 h-4 text-indigo-400" />
          <h3 class="text-sm font-bold text-white flex-1">ワークベンチ</h3>
          <button @click="open = false" class="p-1 rounded-md text-slate-500 hover:text-white hover:bg-slate-800 transition">
            <Icon name="lucide:x" class="w-4 h-4" />
          </button>
        </div>

        <!-- Window customization -->
        <div class="p-4 border-b border-slate-800">
          <p class="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3">ウィンドウのカスタマイズ</p>

          <div class="space-y-1.5">
            <button
              @click="wb.setLayout({ sidebar: !layout.sidebar })"
              class="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-800/50 transition text-left"
            >
              <Icon name="lucide:panel-left" class="w-4 h-4 text-slate-400 shrink-0" />
              <span class="text-sm text-slate-200 flex-1">左サイドバー</span>
              <span
                class="w-9 h-5 rounded-full transition relative shrink-0"
                :class="layout.sidebar ? 'bg-indigo-600' : 'bg-slate-700'"
              >
                <span class="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all" :class="layout.sidebar ? 'left-[18px]' : 'left-0.5'" />
              </span>
            </button>

            <button
              @click="wb.setLayout({ mediaPane: !layout.mediaPane })"
              class="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-800/50 transition text-left"
            >
              <Icon name="lucide:panel-right" class="w-4 h-4 text-slate-400 shrink-0" />
              <span class="text-sm text-slate-200 flex-1">メディアパネル</span>
              <span
                class="w-9 h-5 rounded-full transition relative shrink-0"
                :class="layout.mediaPane ? 'bg-indigo-600' : 'bg-slate-700'"
              >
                <span class="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all" :class="layout.mediaPane ? 'left-[18px]' : 'left-0.5'" />
              </span>
            </button>

            <div class="px-3 py-2" :class="layout.mediaPane ? '' : 'opacity-40 pointer-events-none'">
              <div class="flex items-center justify-between mb-1.5">
                <span class="text-xs text-slate-400">メディアパネルの幅</span>
                <span class="text-xs text-slate-500 tabular-nums">{{ paneWidth }}px</span>
              </div>
              <input
                type="range"
                min="320"
                max="900"
                step="10"
                :value="paneWidth"
                @input="setPaneWidth"
                class="w-full accent-indigo-500"
              />
            </div>

            <button @click="wb.resetAll()" class="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-800/50 transition text-left">
              <Icon name="lucide:rotate-ccw" class="w-4 h-4 text-slate-400 shrink-0" />
              <span class="text-sm text-slate-400 flex-1">すべて既定に戻す</span>
            </button>
          </div>
        </div>

        <!-- Extensions -->
        <div class="p-4">
          <p class="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3">拡張機能</p>
          <div class="space-y-1">
            <div
              v-for="ext in EXTENSION_CATALOG"
              :key="ext.id"
              class="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-slate-800/40 transition"
            >
              <div class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" :class="ACCENTS[ext.id] || 'bg-slate-700'">
                <Icon :name="ext.icon" class="w-4 h-4 text-white" />
              </div>
              <div class="min-w-0 flex-1">
                <p class="text-sm text-white font-medium truncate">{{ ext.name }}</p>
                <p class="text-[11px] text-slate-500 truncate">{{ ext.description }}</p>
              </div>
              <button
                v-if="isInstalled(ext.id)"
                @click="wb.uninstall(ext.id)"
                class="text-[11px] text-slate-500 hover:text-red-400 transition shrink-0"
              >
                削除
              </button>
              <button
                @click="openExt(ext.id)"
                class="px-3 py-1.5 rounded-lg text-xs font-bold transition shrink-0"
                :class="isInstalled(ext.id) ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-indigo-600 text-white hover:bg-indigo-700'"
              >
                {{ isInstalled(ext.id) ? '開く' : '追加' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Extension windows -->
    <ExtensionWindow
      v-for="w in windows"
      v-show="!w.minimized"
      :key="w.id"
      :win="w"
    />
  </div>
</template>

<style scoped>
.wb-hex {
  clip-path: polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%);
  background: linear-gradient(180deg, #46557a 0%, #2a3550 45%, #1a2133 100%);
  transition: background 0.25s ease;
  border-radius: 12px;
}
.wb-hex:hover {
  background: linear-gradient(180deg, #586a95 0%, #35426a 45%, #222c45 100%);
}
.wb-hex-inner {
  clip-path: polygon(22% 2%, 78% 2%, 98% 98%, 2% 98%);
  background: linear-gradient(180deg, #131a28 0%, #0c111b 100%);
  transition: background 0.25s ease;
}
.wb-hex:hover .wb-hex-inner {
  background: linear-gradient(180deg, #1a2333 0%, #0f1622 100%);
}

.wb-fade-enter-active, .wb-fade-leave-active { transition: opacity 0.2s ease; }
.wb-fade-enter-from, .wb-fade-leave-to { opacity: 0; }

.deck-enter-active, .deck-leave-active { transition: all 0.2s ease; }
.deck-enter-from, .deck-leave-to { opacity: 0; transform: scale(0.6); }
.deck-move { transition: transform 0.2s ease; }

.wb-pop-enter-active { transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1); }
.wb-pop-leave-active { transition: all 0.15s ease-in; }
.wb-pop-enter-from, .wb-pop-leave-to { opacity: 0; transform: translate(-50%, 12px) scale(0.97); }
.wb-pop-enter-from + .wb-hex-inner { background: linear-gradient(180deg, #586a95 0%, #35426a 45%, #222c45 100%);}

</style>