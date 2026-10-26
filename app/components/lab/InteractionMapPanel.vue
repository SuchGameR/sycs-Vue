<script setup lang="ts">
/**
 * ジェスチャー割り当てパネル。
 * ここで決めた内容は、ホームの投稿スワイプなど実画面の動作にも使われる。
 */
const { map, hydrate, setMapping, reset } = useInteractionMap()
const toast = useToast()

onMounted(hydrate)

function update(gesture: GestureId, event: Event) {
  const value = (event.target as HTMLSelectElement).value as GestureActionId
  setMapping(gesture, value)
  toast.info('ジェスチャーの動作を更新しました', { icon: 'lucide:git-fork' })
}
</script>

<template>
  <div class="space-y-3">
    <p class="text-[11px] leading-relaxed text-on-surface-variant">
      スワイプ・長押しなどのジェスチャーに、実行する動作を割り当てます。
      設定はホームの投稿カードにも反映されます。
    </p>

    <ul class="space-y-1.5">
      <li
        v-for="gesture in GESTURES"
        :key="gesture.id"
        class="flex items-center gap-2.5 rounded-xl border border-outline-variant bg-surface-container/30 px-3 py-2.5"
      >
        <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-container-high">
          <Icon :name="gesture.icon" class="h-4 w-4 text-on-surface-variant" />
        </div>
        <div class="min-w-0 flex-1">
          <p class="text-xs font-bold text-on-surface">{{ gesture.label }}</p>
          <p class="text-[10px] text-on-surface-variant">{{ gesture.description }}</p>
        </div>
        <select
          :value="map[gesture.id]"
          class="max-w-[9.5rem] rounded-lg border border-outline-variant bg-surface-container px-2 py-1.5 text-[11px] text-on-surface outline-none focus:border-indigo-500"
          :aria-label="`${gesture.label}の動作`"
          @change="update(gesture.id, $event)"
        >
          <option v-for="action in GESTURE_ACTIONS" :key="action.id" :value="action.id">
            {{ action.label }}
          </option>
        </select>
      </li>
    </ul>

    <div class="flex items-center justify-between rounded-xl border border-outline-variant bg-surface-container/30 px-3 py-2">
      <p class="text-[11px] text-on-surface-variant">迷ったら初期設定に戻せます。</p>
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
