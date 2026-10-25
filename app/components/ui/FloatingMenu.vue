<script setup lang="ts">
/**
 * コンテキストメニュー。
 *
 * 右クリック / 長押しした座標に表示し、画面外へはみ出さないよう
 * ビューポート内へクランプする。Esc / 外側タップで閉じる。
 */
export interface MenuItem {
  id: string
  label: string
  icon?: string
  shortcut?: string
  danger?: boolean
  separatorBefore?: boolean
}

const props = withDefaults(
  defineProps<{
    open: boolean
    x: number
    y: number
    items: MenuItem[]
    minWidth?: number
  }>(),
  { minWidth: 208 },
)

const emit = defineEmits<{ close: []; select: [item: MenuItem] }>()

const viewport = ref({ w: 0, h: 0 })

function measure() {
  if (!import.meta.client) return
  viewport.value = { w: window.innerWidth, h: window.innerHeight }
}

watch(
  () => props.open,
  (open) => {
    if (!open) return
    measure()
    window.addEventListener('resize', measure)
    window.addEventListener('keydown', onKey)
  },
)

watch(
  () => props.open,
  (open) => {
    if (open) return
    window.removeEventListener('resize', measure)
    window.removeEventListener('keydown', onKey)
  },
)

function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') emit('close')
}

onBeforeUnmount(() => {
  window.removeEventListener('resize', measure)
  window.removeEventListener('keydown', onKey)
})

const position = computed(() => {
  const vw = viewport.value.w || 1024
  const vh = viewport.value.h || 768
  const height = Math.min(360, props.items.length * 38 + 16)
  return {
    left: `${Math.min(Math.max(8, props.x), Math.max(8, vw - props.minWidth - 8))}px`,
    top: `${Math.min(Math.max(8, props.y), Math.max(8, vh - height - 8))}px`,
    width: `${props.minWidth}px`,
  }
})

function choose(item: MenuItem) {
  emit('select', item)
  emit('close')
}
</script>

<template>
  <Teleport to="body">
    <Transition name="sycs-pop">
      <div
        v-if="open"
        class="fixed inset-0 z-[340]"
        @pointerdown.self="emit('close')"
        @contextmenu.prevent
      >
        <div
          class="absolute overflow-hidden rounded-xl border border-outline-variant bg-surface-container-high/95 p-1 shadow-2xl backdrop-blur-xl"
          :style="position"
          role="menu"
        >
          <template v-for="item in items" :key="item.id">
            <div v-if="item.separatorBefore" class="my-1 h-px bg-outline-variant/70" />
            <button
              type="button"
              role="menuitem"
              class="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs font-medium transition"
              :class="item.danger ? 'text-red-300 hover:bg-red-500/15' : 'text-on-surface-variant hover:bg-white/10 hover:text-on-surface'"
              @click="choose(item)"
            >
              <Icon v-if="item.icon" :name="item.icon" class="h-4 w-4 shrink-0" />
              <span class="flex-1 truncate">{{ item.label }}</span>
              <kbd v-if="item.shortcut" class="text-[10px] opacity-60">{{ item.shortcut }}</kbd>
            </button>
          </template>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
