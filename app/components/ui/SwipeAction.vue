<script setup lang="ts">
/**
 * スワイプで隠れた操作を出す行。
 *
 * - 横方向に 6px 動いた時点で軸をロックし、縦スクロールとは競合しない
 * - しきい値を超えて離すと先頭のアクションを実行
 * - 下に並ぶボタンはクリック / タップでも実行できる (キーボード / デスクトップ用)
 */
export interface SwipeActionItem {
  id: string
  label: string
  icon: string
  tone?: 'primary' | 'success' | 'danger' | 'neutral'
}

const props = withDefaults(
  defineProps<{
    left?: SwipeActionItem[]
    right?: SwipeActionItem[]
    threshold?: number
    disabled?: boolean
  }>(),
  { left: () => [], right: () => [], threshold: 54, disabled: false },
)

const emit = defineEmits<{ action: [action: SwipeActionItem, direction: 'left' | 'right'] }>()
const { pulse } = useHaptics()

const dx = ref(0)
const dragging = ref(false)
const suppressClick = ref(false)
let startX = 0
let startY = 0
let axis: 'none' | 'x' | 'y' = 'none'
let pressed = false

const ACTION_WIDTH = 76

const maxLeft = computed(() => props.left.length * ACTION_WIDTH)
const maxRight = computed(() => props.right.length * ACTION_WIDTH)

const toneClass: Record<string, string> = {
  primary: 'bg-indigo-600 text-white',
  success: 'bg-emerald-600 text-white',
  danger: 'bg-red-600 text-white',
  neutral: 'bg-surface-container-highest text-on-surface',
}

function onDown(e: PointerEvent) {
  if (props.disabled || (e.pointerType === 'mouse' && e.button !== 0)) return
  startX = e.clientX
  startY = e.clientY
  dx.value = 0
  axis = 'none'
  pressed = true
  dragging.value = false
  attach()
}

function onMove(e: PointerEvent) {
  if (!pressed) return
  const deltaX = e.clientX - startX
  const deltaY = e.clientY - startY

  if (axis === 'none') {
    if (Math.abs(deltaX) < 6 && Math.abs(deltaY) < 6) return
    axis = Math.abs(deltaX) > Math.abs(deltaY) ? 'x' : 'y'
    if (axis === 'x') dragging.value = true
  }
  if (axis !== 'x') return
  if (e.cancelable) e.preventDefault()

  if (deltaX > 0) {
    dx.value = maxLeft.value ? Math.min(deltaX, maxLeft.value) : 0
  } else {
    dx.value = maxRight.value ? Math.max(deltaX, -maxRight.value) : 0
  }
}

function onUp() {
  if (!pressed) return
  pressed = false
  detach()
  const wasDragging = dragging.value
  dragging.value = false

  if (axis === 'x' && Math.abs(dx.value) >= props.threshold) {
    const direction: 'left' | 'right' = dx.value > 0 ? 'left' : 'right'
    const action = direction === 'left' ? props.left[0] : props.right[0]
    if (action) trigger(action, direction)
  }

  dx.value = 0
  axis = 'none'
  if (wasDragging) {
    suppressClick.value = true
    window.setTimeout(() => { suppressClick.value = false }, 320)
  }
}

function trigger(action: SwipeActionItem, direction: 'left' | 'right') {
  pulse(action.tone === 'danger' ? 'warning' : 'light')
  dx.value = 0
  emit('action', action, direction)
}

function onClickCapture(e: MouseEvent) {
  if (suppressClick.value) {
    e.preventDefault()
    e.stopPropagation()
  }
}

function attach() {
  window.addEventListener('pointermove', onMove, { passive: false })
  window.addEventListener('pointerup', onUp)
  window.addEventListener('pointercancel', onUp)
}

function detach() {
  window.removeEventListener('pointermove', onMove)
  window.removeEventListener('pointerup', onUp)
  window.removeEventListener('pointercancel', onUp)
}

onBeforeUnmount(detach)
</script>

<template>
  <div class="relative overflow-hidden" :class="disabled ? '' : 'select-none'">
    <div
      v-if="left.length"
      class="absolute inset-y-0 left-0 z-0 flex"
      aria-hidden="true"
    >
      <button
        v-for="action in left"
        :key="action.id"
        type="button"
        class="flex w-[76px] flex-col items-center justify-center gap-1 text-[10px] font-bold"
        :class="toneClass[action.tone || 'neutral']"
        :tabindex="dx > 0 ? 0 : -1"
        :aria-label="action.label"
        @click.stop="trigger(action, 'left')"
      >
        <Icon :name="action.icon" class="h-5 w-5" />
        {{ action.label }}
      </button>
    </div>

    <div
      v-if="right.length"
      class="absolute inset-y-0 right-0 z-0 flex"
      aria-hidden="true"
    >
      <button
        v-for="action in right"
        :key="action.id"
        type="button"
        class="flex w-[76px] flex-col items-center justify-center gap-1 text-[10px] font-bold"
        :class="toneClass[action.tone || 'neutral']"
        :tabindex="dx < 0 ? 0 : -1"
        :aria-label="action.label"
        @click.stop="trigger(action, 'right')"
      >
        <Icon :name="action.icon" class="h-5 w-5" />
        {{ action.label }}
      </button>
    </div>

    <div
      class="relative z-10 bg-surface"
      :style="{
        transform: dx ? `translate3d(${dx}px, 0, 0)` : undefined,
        transition: dragging ? 'none' : 'transform 220ms cubic-bezier(0.2, 0.8, 0.2, 1)',
        touchAction: 'pan-y',
      }"
      @pointerdown="onDown"
      @click.capture="onClickCapture"
    >
      <slot />
    </div>
  </div>
</template>
