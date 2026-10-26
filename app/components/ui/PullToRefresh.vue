<script setup lang="ts">
/**
 * 引っ張って更新。
 *
 * 先頭 (scrollTop <= 0) から下へ引いたときだけ反応する。
 * 横方向のジェスチャーや、途中からのスクロールは邪魔しない。
 * デスクトップでは右端の更新ボタンでも同じ処理を実行できる。
 */
const props = withDefaults(
  defineProps<{
    /** 実際の再読み込み処理。渡さない場合は refresh イベントだけ emit する */
    onRefresh?: () => Promise<unknown>
    /** スクロールコンテナのセレクタ。既定はこのコンポーネント自身 */
    scrollSelector?: string
    disabled?: boolean
    threshold?: number
    /** デスクトップ用の小さな更新ボタンを出す */
    showDesktopButton?: boolean
  }>(),
  {
    disabled: false,
    threshold: 64,
    scrollSelector: '',
    showDesktopButton: true,
  },
)

const emit = defineEmits<{ refresh: [] }>()

const root = ref<HTMLElement | null>(null)
const pull = ref(0)
const refreshing = ref(false)
const tracking = ref(false)
const armed = ref(false)
let startX = 0
let startY = 0
let axis: 'none' | 'x' | 'y' = 'none'

function scroller(): HTMLElement | null {
  if (!import.meta.client) return null
  if (props.scrollSelector) {
    try {
      return document.querySelector<HTMLElement>(props.scrollSelector)
    } catch {
      return null
    }
  }
  return root.value
}

function atTop() {
  const el = scroller()
  return !el || el.scrollTop <= 0
}

function onTouchStart(e: TouchEvent) {
  if (props.disabled || refreshing.value) return
  if (!atTop()) return
  const touch = e.touches[0]
  if (!touch) return
  startX = touch.clientX
  startY = touch.clientY
  axis = 'none'
  tracking.value = true
  armed.value = false
}

function onTouchMove(e: TouchEvent) {
  if (!tracking.value) return
  const touch = e.touches[0]
  if (!touch) return
  const dy = touch.clientY - startY
  const dx = touch.clientX - startX

  if (axis === 'none') {
    if (Math.abs(dy) < 6 && Math.abs(dx) < 6) return
    axis = Math.abs(dy) > Math.abs(dx) ? 'y' : 'x'
    if (axis === 'x') {
      tracking.value = false
      pull.value = 0
      return
    }
  }
  if (axis !== 'y') return

  if (!atTop() || dy <= 0) {
    pull.value = 0
    armed.value = false
    return
  }

  // ネイティブのバウンスと競合しないよう、引いている間だけ抑止する。
  if (e.cancelable) e.preventDefault()
  pull.value = Math.min(110, dy * 0.5)
  armed.value = pull.value >= props.threshold
}

async function runRefresh() {
  if (refreshing.value || props.disabled) return
  refreshing.value = true
  pull.value = 46
  try {
    if (props.onRefresh) await props.onRefresh()
    emit('refresh')
  } finally {
    refreshing.value = false
    pull.value = 0
  }
}

async function finish() {
  if (!tracking.value) return
  tracking.value = false
  if (!armed.value) {
    pull.value = 0
    return
  }
  await runRefresh()
}

function onTouchCancel() {
  tracking.value = false
  armed.value = false
  if (!refreshing.value) pull.value = 0
}

let node: HTMLElement | null = null
onMounted(() => {
  node = root.value
  if (!node) return
  node.addEventListener('touchstart', onTouchStart, { passive: true })
  node.addEventListener('touchmove', onTouchMove, { passive: false })
  node.addEventListener('touchend', finish)
  node.addEventListener('touchcancel', onTouchCancel)
})

onBeforeUnmount(() => {
  if (!node) return
  node.removeEventListener('touchstart', onTouchStart)
  node.removeEventListener('touchmove', onTouchMove)
  node.removeEventListener('touchend', finish)
  node.removeEventListener('touchcancel', onTouchCancel)
})

defineExpose({ refresh: runRefresh })
</script>

<template>
  <div ref="root" class="relative">
    <!-- 引っ張り量に追従するインジケータ -->
    <div
      class="pointer-events-none absolute inset-x-0 top-0 z-20 flex justify-center"
      :style="{
        transform: `translateY(${Math.max(-44, pull - 44)}px)`,
        opacity: pull > 4 || refreshing ? 1 : 0,
        transition: tracking ? 'none' : 'transform 220ms ease, opacity 180ms ease',
      }"
      aria-hidden="true"
    >
      <div
        class="flex h-9 w-9 items-center justify-center rounded-full border border-outline-variant bg-surface-container-high shadow-lg"
        :class="armed || refreshing ? 'text-indigo-300' : 'text-on-surface-variant'"
      >
        <Icon
          :name="refreshing ? 'lucide:loader-2' : armed ? 'lucide:arrow-down' : 'lucide:arrow-down'"
          class="h-4 w-4"
          :class="refreshing ? 'animate-spin' : ''"
          :style="{ transform: armed ? 'rotate(180deg)' : 'none', transition: 'transform 160ms ease' }"
        />
      </div>
    </div>

    <div
      :style="{
        transform: pull ? `translateY(${Math.min(pull * 0.5, 48)}px)` : undefined,
        transition: tracking ? 'none' : 'transform 220ms ease',
      }"
    >
      <slot />
    </div>

    <button
      v-if="showDesktopButton"
      type="button"
      class="absolute right-2 top-2 z-10 hidden h-8 items-center gap-1.5 rounded-full border border-outline-variant bg-surface-container-high/90 px-3 text-[11px] font-medium text-on-surface-variant shadow transition hover:text-on-surface active:scale-95 min-[681px]:flex"
      :disabled="refreshing || disabled"
      @click="runRefresh"
    >
      <Icon name="lucide:refresh-ccw" class="h-3.5 w-3.5" :class="refreshing ? 'animate-spin' : ''" />
      更新
    </button>
  </div>
</template>
