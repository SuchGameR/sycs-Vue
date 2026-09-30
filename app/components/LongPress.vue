<script setup lang="ts">
/**
 * 長押しジェスチャ。
 *
 * 指を 500ms 押し続けたときに発火し、指が動itters poke したら中止する。
 * 画像/動画の「詳細を見る」のように、タップだと誤爆する操作に使う。
 * ネイティブの contextmenu / text selection も抑止する。
 */
import { onLongPress } from '~/utils/useLongPress'

const props = withDefaults(
  defineProps<{
    /** 長押し.ms */
    delay?: number
    /** 発火前に許容する移動量 (px)。これを超えるとキャンセル */
    moveTolerance?: number
  }>(),
  { delay: 500, moveTolerance: 10 },
)

const emit = defineEmits<{ longpress: [event: PointerEvent] }>()

const pressing = ref(false)

const handlers = onLongPress(
  () => {
    pressing.value = false
    emit('longpress', handlers.event)
  },
  {
    delay: props.delay,
    moveTolerance: props.moveTolerance,
    onStart: () => {
      pressing.value = true
    },
    onCancel: () => {
      pressing.value = false
    },
  },
)

/** data-pressing で CSS 側のスケール変化を出す */
watchEffect(() => {
  const el = handlers.el.value
  if (!el) return
  if (pressing.value) el.dataset.pressing = ''
  else delete el.dataset.pressing
})
</script>

<template>
  <div
    ref="handlers.ref"
    @pointerdown="handlers.onPointerDown"
    @pointermove="handlers.onPointerMove"
    @pointerup="handlers.onPointerUp"
    @pointercancel="handlers.onPointerCancel"
    @pointerleave="handlers.onPointerCancel"
    @contextmenu.prevent
  >
    <slot />
  </div>
</template>
