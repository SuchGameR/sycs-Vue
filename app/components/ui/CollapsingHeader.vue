<script setup lang="ts">
/**
 * 追従 / 折りたたみヘッダー。
 *
 * 内部スクロールに合わせてヘッダーの高さを縮め、タイトルだけを残す。
 * スクロール位置は内部で完結するので、ページ全体のスクロールを奪わない。
 */
const props = withDefaults(
  defineProps<{
    title: string
    subtitle?: string
    /** 展開時のヘッダー高さ */
    height?: number
    /** 折りたたみ後の高さ */
    collapsedHeight?: number
    /** デモ用のスクロール領域の高さ */
    bodyHeight?: string
  }>(),
  {
    subtitle: '',
    height: 168,
    collapsedHeight: 58,
    bodyHeight: '22rem',
  },
)

const scroller = ref<HTMLElement | null>(null)
const progress = ref(0)

const currentHeight = computed(
  () => props.height - (props.height - props.collapsedHeight) * progress.value,
)

function onScroll() {
  const el = scroller.value
  if (!el) return
  const travel = Math.max(1, props.height - props.collapsedHeight)
  progress.value = Math.min(1, Math.max(0, el.scrollTop / travel))
}
</script>

<template>
  <div class="overflow-hidden rounded-2xl border border-outline-variant bg-surface-container/30">
    <div
      ref="scroller"
      class="sycs-no-scrollbar overflow-y-auto"
      :style="{ height: bodyHeight }"
      @scroll.passive="onScroll"
    >
      <div
        class="sticky top-0 z-10 overflow-hidden border-b border-outline-variant bg-surface-container-high/95 backdrop-blur-xl"
        :style="{ height: `${currentHeight}px` }"
      >
        <div class="absolute inset-x-0 bottom-0 flex items-end gap-3 px-4 pb-3">
          <div class="min-w-0 flex-1">
            <p
              class="truncate font-extrabold text-on-surface"
              :style="{ fontSize: `${1.45 - 0.35 * progress}rem`, lineHeight: 1.15 }"
            >
              {{ title }}
            </p>
            <p
              v-if="subtitle"
              class="mt-1 truncate text-xs text-on-surface-variant"
              :style="{ opacity: 1 - progress * 1.4 }"
            >
              {{ subtitle }}
            </p>
          </div>
          <slot name="actions" />
        </div>
      </div>

      <div class="space-y-2 p-4">
        <slot />
      </div>
    </div>
  </div>
</template>
