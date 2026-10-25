<script setup lang="ts">
/**
 * 適応型ナビゲーションのプレビュー。
 *
 * スライダーで幅を変えると 680px を境に
 * 下部ピル ↔ サイドバーが切り替わる。
 */
const width = ref(460)
const isWide = computed(() => width.value >= 680)

const items = [
  { icon: 'lucide:house', label: 'ホーム' },
  { icon: 'lucide:users-round', label: 'ソーシャル' },
  { icon: 'lucide:search', label: '検索' },
  { icon: 'lucide:heart', label: 'アクティビティ' },
  { icon: 'lucide:user-round', label: 'プロフィール' },
]
</script>

<template>
  <div>
    <div class="flex items-center gap-2">
      <Icon name="lucide:monitor-smartphone" class="h-4 w-4 shrink-0 text-on-surface-variant" />
      <input
        v-model.number="width"
        type="range"
        min="320"
        max="920"
        step="10"
        class="h-1 w-full accent-indigo-500"
        aria-label="プレビュー幅"
      />
      <span class="w-16 shrink-0 text-right text-[11px] tabular-nums text-on-surface-variant">
        {{ width }}px
      </span>
    </div>

    <div class="mt-3 flex justify-center overflow-hidden rounded-xl border border-outline-variant bg-surface-container/30 p-3">
      <div
        class="relative h-[250px] max-w-full overflow-hidden rounded-xl border border-outline-variant bg-surface shadow-inner transition-[width] duration-300"
        :style="{ width: `${width}px` }"
      >
        <div v-if="isWide" class="flex h-full">
          <aside class="flex w-14 shrink-0 flex-col items-center gap-1.5 border-r border-outline-variant bg-surface-container/40 py-2">
            <div class="mb-1 h-7 w-7 rounded-lg bg-indigo-500/30" />
            <button
              v-for="(item, index) in items"
              :key="item.label"
              type="button"
              class="flex h-8 w-8 items-center justify-center rounded-lg transition"
              :class="index === 0 ? 'bg-indigo-600 text-white' : 'text-on-surface-variant hover:bg-white/10'"
              :aria-label="item.label"
            >
              <Icon :name="item.icon" class="h-4 w-4" />
            </button>
          </aside>
          <div class="flex-1 space-y-2 p-3">
            <div class="h-4 w-24 rounded bg-white/10" />
            <div class="h-16 rounded-lg bg-white/5" />
            <div class="h-16 rounded-lg bg-white/5" />
            <div class="h-16 rounded-lg bg-white/5" />
          </div>
        </div>

        <div v-else class="h-full p-3 pb-16">
          <div class="mb-2 h-4 w-20 rounded bg-white/10" />
          <div class="space-y-2">
            <div class="h-14 rounded-lg bg-white/5" />
            <div class="h-14 rounded-lg bg-white/5" />
            <div class="h-14 rounded-lg bg-white/5" />
          </div>
          <div class="absolute bottom-2 left-1/2 flex -translate-x-1/2 items-center gap-0.5 rounded-full border border-outline-variant bg-surface-container-highest/95 p-1 shadow-lg backdrop-blur">
            <button
              v-for="(item, index) in items"
              :key="item.label"
              type="button"
              class="flex h-8 w-8 items-center justify-center rounded-full transition"
              :class="index === 0 ? 'bg-indigo-600 text-white' : 'text-on-surface-variant'"
              :aria-label="item.label"
            >
              <Icon :name="item.icon" class="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <p class="mt-2 text-center text-[11px] text-on-surface-variant">
      {{ isWide ? 'サイドバー（デスクトップ）' : '下部ピル（モバイル）' }}
      <span class="opacity-60">— 680px で切り替わります</span>
    </p>
  </div>
</template>
