<script setup lang="ts">
/**
 * iOS 風ボトムシート。
 *
 * - モバイル: 下からせり上がるシート (角丸は上端のみ / ドラッグで閉じられる)
 * - 681px 以上: 中央ダイアログに自動で切り替わる (CSS 側の media query)
 *
 * 背面のタップで閉じる(desktop のみ)。モバイルは明示的なクローズボタンか
 * ドラッグを使う。スクロールを土台へ逃がさないよう body は固定する。
 */
const props = withDefaults(
  defineProps<{
    open: boolean
    /** 事业的高さ。'auto' なら内容どおり、'full' ほぼ全面 */
    height?: string
    /** 背面のタップで閉じるか (モバイルは既定 false) */
    dismissOnBackdrop?: boolean
  }>(),
  { height: 'auto', dismissOnBackdrop: false },
)

const emit = defineEmits<{ close: [] }>()

const panel = ref<HTMLElement | null>(null)
const dragging = ref(false)

/** ドラッグはモバイルだけ */
const canDrag = ref(false)

const panelStyle = computed(() => {
  if (props.height === 'auto') return {}
  if (props.height === 'full') return { height: 'calc(100dvh - 3.5rem)' }
  return { height: props.height }
})

function close() {
  emit('close')
}

/** --- 背景スクロールのロック ------------------------------------------ */
let savedBodyOverflow = ''
let savedBodyPaddingRight = ''

watch(
  () => props.open,
  (v) => {
    if (!import.meta.client) return
    if (v) {
      const scrollbar = window.innerWidth - document.documentElement.clientWidth
      savedBodyOverflow = document.body.style.overflow
      savedBodyPaddingRight = document.body.style.paddingRight
      document.body.style.overflow = 'hidden'
      if (scrollbar > 0) document.body.style.paddingRight = `${scrollbar}px`
    } else {
      document.body.style.overflow = savedBodyOverflow
      document.body.style.paddingRight = savedBodyPaddingRight
    }
  },
)

onUnmounted(() => {
  if (!import.meta.client) return
  document.body.style.overflow = savedBodyOverflow
  document.body.style.paddingRight = savedBodyPaddingRight
})

/** Esc で閉じる */
function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape' && props.open) close()
}

onMounted(() => {
  canDrag.value = window.matchMedia('(max-width: 680px)').matches
  window.addEventListener('keydown', onKey)
})

onUnmounted(() => {
  if (!import.meta.client) return
  window.removeEventListener('keydown', onKey)
})

/** --- ドラッグで閉じる ------------------------------------------------ */
let startY = 0
let dy = 0
let pressed = false

function onDown(e: PointerEvent) {
  if (!canDrag.value) return
  // シート本文がスクロール済みの場合は掴んでも動かさない
  const body = panel.value?.querySelector('.sycs-sheet-body') as HTMLElement | null
  if (body && body.scrollTop > 0 && e.clientY > grabberRect().bottom) return

  // まだドラッグではない。pointer capture は動かし始めたときにだけ取る。
  // 開始時点で capture すると iOS Safari で tap の click が飛ばず、
  // シート内の ✕ ボタンなどが反応しなくなる。
  dragging.value = false
  pressed = true
  startY = e.clientY
  dy = 0
  attachWindow()
}

const DRAG_START = 6

function capture(e: PointerEvent) {
  if (dragging.value) return
  dragging.value = true
  ;(panel.value as HTMLElement | null)?.setPointerCapture?.(e.pointerId)
}

function detachWindow() {
  if (!import.meta.client) return
  window.removeEventListener('pointermove', onMove)
  window.removeEventListener('pointerup', onUp)
  window.removeEventListener('pointercancel', onUp)
}

function attachWindow() {
  if (!import.meta.client) return
  window.addEventListener('pointermove', onMove)
  window.addEventListener('pointerup', onUp)
  window.addEventListener('pointercancel', onUp)
}

function grabberRect() {
  const el = panel.value
  const g = el?.querySelector('.sycs-sheet-grabber') as HTMLElement | null
  if (g) return g.getBoundingClientRect()
  return el?.getBoundingClientRect() ?? new DOMRect(0, 0, 0, 0)
}

function onMove(e: PointerEvent) {
  if (!canDrag.value || !pressed) return
  dy = e.clientY - startY
  if (dy < 0) dy = 0
  if (dy < DRAG_START) return
  capture(e)
  if (!dragging.value) return
  if (panel.value) {
    panel.value.dataset.dragging = ''
    panel.value.style.transform = `translateY(${dy}px)`
  }
}

function onUp() {
  pressed = false
  detachWindow()
  if (!dragging.value) { dy = 0; return }
  dragging.value = false
  const el = panel.value
  if (el) {
    delete el.dataset.dragging
    el.style.transform = ''
  }
  const h = el?.offsetHeight ?? 0
  // 半分以上、あるいは有一定速さで飛べば閉じる
  if (dy > h * 0.4 || dy > 120) close()
  dy = 0
}

onUnmounted(detachWindow)
</script>

<template>
  <Teleport to="body">
    <Transition name="sycs-sheet">
      <div v-if="open" class="fixed inset-0" role="dialog" aria-modal="true">
        <div
          class="sycs-sheet-backdrop"
          @click="dismissOnBackdrop && close()"
        />
        <div
          ref="panel"
          class="sycs-sheet-panel"
          :style="panelStyle"
          @pointerdown="onDown"
        >
          <div
            class="sycs-sheet-grabber"
            :class="canDrag ? 'cursor-grab' : ''"
          />
          <div class="sycs-sheet-body">
            <slot />
          </div>
          <div class="sycs-sheet-safe shrink-0" />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
