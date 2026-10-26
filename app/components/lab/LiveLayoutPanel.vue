<script setup lang="ts">
/**
 * ライブレイアウトエディタ。
 * ブロックをドラッグ (または ↑↓) で並べ替え、幅と表示をその場で変える。
 */
import type { LiveBlock } from '~/composables/useLiveLayout'

const {
  blocks,
  visibleBlocks,
  hydrate,
  setSpan,
  setVisible,
  reset,
  persist,
} = useLiveLayout()

const {
  containerRef,
  draggingKey,
  onHandleDown,
  moveBy,
} = useDragSort(blocks, (block: LiveBlock) => block.id)

onMounted(hydrate)

watch(blocks, () => persist(), { deep: true })
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <p class="text-[11px] text-on-surface-variant">
        ハンドルをドラッグ、または ↑↓ で並べ替え。変更は自動保存されます。
      </p>
      <button
        type="button"
        class="flex shrink-0 items-center gap-1 rounded-lg border border-outline-variant px-2 py-1 text-[10px] text-on-surface-variant transition hover:bg-surface-container-high"
        @click="reset"
      >
        <Icon name="lucide:rotate-ccw" class="h-3 w-3" />
        初期化
      </button>
    </div>

    <ul ref="containerRef" class="space-y-1.5">
      <li
        v-for="(block, index) in blocks"
        :key="block.id"
        :data-sort-key="block.id"
        class="flex items-center gap-2 rounded-xl border px-2 py-2 transition"
        :class="[
          draggingKey === block.id ? 'border-indigo-500/60 bg-indigo-600/10 opacity-80' : 'border-outline-variant bg-surface-container/30',
          !block.visible ? 'opacity-50' : '',
        ]"
      >
        <button
          type="button"
          class="touch-none cursor-grab rounded p-1.5 text-on-surface-variant transition hover:bg-white/10 active:cursor-grabbing"
          aria-label="ドラッグして並べ替え"
          @pointerdown="onHandleDown($event, block.id)"
        >
          <Icon name="lucide:grip-vertical" class="h-4 w-4" />
        </button>

        <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-container-high">
          <Icon :name="block.icon" class="h-4 w-4 text-on-surface-variant" />
        </div>

        <div class="min-w-0 flex-1">
          <p class="truncate text-xs font-bold text-on-surface">{{ block.title }}</p>
          <p class="truncate text-[10px] text-on-surface-variant">{{ block.description }}</p>
        </div>

        <button
          type="button"
          class="shrink-0 rounded-md border border-outline-variant px-1.5 py-1 text-[10px] text-on-surface-variant transition hover:bg-surface-container-high"
          @click="setSpan(block.id, block.span === 2 ? 1 : 2)"
        >
          {{ block.span === 2 ? '全幅' : '半分' }}
        </button>

        <div class="flex flex-col">
          <button
            type="button"
            class="rounded p-0.5 text-on-surface-variant transition hover:bg-white/10 disabled:opacity-25"
            :disabled="index === 0"
            aria-label="上へ"
            @click="moveBy(block.id, -1)"
          >
            <Icon name="lucide:chevron-up" class="h-3 w-3" />
          </button>
          <button
            type="button"
            class="rounded p-0.5 text-on-surface-variant transition hover:bg-white/10 disabled:opacity-25"
            :disabled="index === blocks.length - 1"
            aria-label="下へ"
            @click="moveBy(block.id, 1)"
          >
            <Icon name="lucide:chevron-down" class="h-3 w-3" />
          </button>
        </div>

        <UiSwitch
          size="sm"
          :model-value="block.visible"
          :label="`${block.title}を表示`"
          @update:model-value="setVisible(block.id, $event)"
        />
      </li>
    </ul>

    <div>
      <p class="mb-2 text-[11px] font-bold uppercase tracking-widest text-on-surface-variant/70">プレビュー</p>
      <div class="grid grid-cols-2 gap-2 rounded-xl border border-outline-variant bg-surface-container/20 p-2">
        <div
          v-for="block in visibleBlocks"
          :key="block.id"
          class="flex min-h-[4.5rem] flex-col justify-between rounded-lg border border-outline-variant bg-surface-container/50 p-2.5"
          :class="block.span === 2 ? 'col-span-2' : 'col-span-1'"
        >
          <div class="flex items-center gap-1.5">
            <Icon :name="block.icon" class="h-3.5 w-3.5 text-indigo-300" />
            <span class="text-[11px] font-bold text-on-surface">{{ block.title }}</span>
          </div>
          <div class="mt-2 space-y-1">
            <div class="h-1.5 w-3/4 rounded-full bg-white/10" />
            <div class="h-1.5 w-1/2 rounded-full bg-white/10" />
          </div>
        </div>
        <p v-if="!visibleBlocks.length" class="col-span-2 py-6 text-center text-[11px] text-on-surface-variant">
          表示するブロックがありません
        </p>
      </div>
    </div>
  </div>
</template>
