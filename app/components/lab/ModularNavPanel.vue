<script setup lang="ts">
/**
 * モジュール式ナビゲーション。
 * 表示 / 非表示と順番は、実際の下部ピル (.sycs-floatnav) に即反映される。
 */
const { items, hydrate, setVisible, move, reset } = useModularNav()
const toast = useToast()

onMounted(hydrate)

function toggle(key: string, value: boolean) {
  setVisible(key, value)
  toast.info(value ? 'ナビに表示しました' : 'ナビから隠しました', { icon: 'lucide:blocks' })
}
</script>

<template>
  <div class="space-y-3">
    <p class="text-[11px] leading-relaxed text-on-surface-variant">
      項目の表示と順番を編集できます。変更は下部ナビにすぐ反映されます
      (モバイル / デスクトップのピル表示)。
    </p>

    <ul class="space-y-1.5">
      <li
        v-for="(item, index) in items"
        :key="item.key"
        class="flex items-center gap-2 rounded-xl border px-2.5 py-2 transition"
        :class="item.visible ? 'border-outline-variant bg-surface-container/30' : 'border-outline-variant/50 bg-surface-container/10 opacity-60'"
      >
        <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-container-high">
          <Icon :name="item.icon" class="h-4 w-4 text-on-surface-variant" />
        </div>
        <span class="min-w-0 flex-1 truncate text-xs font-medium text-on-surface">{{ item.label }}</span>

        <div class="flex items-center gap-0.5">
          <button
            type="button"
            class="rounded p-1 text-on-surface-variant transition hover:bg-white/10 disabled:opacity-30"
            :disabled="index === 0"
            aria-label="上へ"
            @click="move(item.key, -1)"
          >
            <Icon name="lucide:chevron-up" class="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            class="rounded p-1 text-on-surface-variant transition hover:bg-white/10 disabled:opacity-30"
            :disabled="index === items.length - 1"
            aria-label="下へ"
            @click="move(item.key, 1)"
          >
            <Icon name="lucide:chevron-down" class="h-3.5 w-3.5" />
          </button>
        </div>

        <UiSwitch
          size="sm"
          :model-value="item.visible"
          :label="`${item.label}を表示`"
          @update:model-value="toggle(item.key, $event)"
        />
      </li>
    </ul>

    <div class="flex items-center justify-between rounded-xl border border-outline-variant bg-surface-container/30 px-3 py-2">
      <p class="text-[11px] text-on-surface-variant">最低 1 項目は残してください。</p>
      <button
        type="button"
        class="flex items-center gap-1.5 rounded-lg border border-outline-variant px-2.5 py-1.5 text-[11px] text-on-surface-variant transition hover:bg-surface-container-high hover:text-on-surface"
        @click="reset"
      >
        <Icon name="lucide:rotate-ccw" class="h-3.5 w-3.5" />
        リセット
      </button>
    </div>
  </div>
</template>
