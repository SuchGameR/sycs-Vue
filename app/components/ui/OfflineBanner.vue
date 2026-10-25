<script setup lang="ts">
/**
 * オフライン / 同期状態のバナー。
 *
 * レイアウトに 1 つ置く。通常は完全に非表示で、通信断・同期待ち・
 * 同期中のときだけ現れる。復帰すると自動で flush する。
 */
const net = useNetworkStatus()

onMounted(() => net.init())

const visible = computed(
  () => !net.isOnline.value || net.pending.value > 0 || net.syncing.value || !!net.lastError.value,
)

const title = computed(() => {
  if (!net.isOnline.value) return 'オフラインです'
  if (net.syncing.value) return '同期しています'
  if (net.lastError.value) return '同期に失敗しました'
  return `${net.pending.value}件の変更を同期待ち`
})

const subtitle = computed(() => {
  if (!net.isOnline.value) {
    return net.pending.value
      ? `${net.pending.value}件の変更は、オンラインに戻ると自動で送信されます。`
      : '閲覧はできます。変更は復帰時に送信されます。'
  }
  if (net.syncing.value) return 'サーバーへ送信中…'
  if (net.lastError.value) return net.lastError.value
  return '接続が戻り次第、自動で送信します。'
})

const lastSynced = computed(() => {
  if (!net.lastSyncedAt.value) return ''
  const diff = Date.now() - net.lastSyncedAt.value
  if (diff < 60_000) return 'たった今同期'
  const min = Math.floor(diff / 60_000)
  if (min < 60) return `${min}分前に同期`
  return `${Math.floor(min / 60)}時間前に同期`
})
</script>

<template>
  <Teleport to="body">
    <Transition name="sycs-slide-down">
      <div
        v-if="visible"
        class="fixed inset-x-3 top-[calc(var(--app-safe-top)+0.55rem)] z-[410] mx-auto flex max-w-lg items-start gap-3 rounded-2xl border px-3.5 py-3 shadow-2xl backdrop-blur-xl"
        :class="
          net.isOnline.value
            ? 'border-amber-500/35 bg-amber-950/85 text-amber-100'
            : 'border-slate-500/40 bg-slate-900/90 text-slate-100'
        "
        role="status"
      >
        <div
          class="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl"
          :class="net.isOnline.value ? 'bg-amber-500/15 text-amber-300' : 'bg-white/10 text-slate-300'"
        >
          <Icon
            :name="!net.isOnline.value ? 'lucide:wifi-off' : net.syncing.value ? 'lucide:refresh-cw' : net.lastError.value ? 'lucide:alert-triangle' : 'lucide:cloud-upload'"
            class="h-4 w-4"
            :class="net.syncing.value ? 'animate-spin' : ''"
          />
        </div>

        <div class="min-w-0 flex-1">
          <p class="text-sm font-bold">{{ title }}</p>
          <p class="mt-0.5 text-xs leading-snug opacity-80">{{ subtitle }}</p>
          <p v-if="lastSynced" class="mt-1 text-[10px] uppercase tracking-wide opacity-60">
            {{ lastSynced }}
          </p>
        </div>

        <button
          v-if="net.isOnline.value && net.pending.value && !net.syncing.value"
          type="button"
          class="shrink-0 rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold transition hover:bg-white/20 active:scale-95"
          @click="net.flush()"
        >
          今すぐ同期
        </button>
        <button
          v-else-if="!net.isOnline.value"
          type="button"
          class="shrink-0 rounded-full bg-white/10 p-2 transition hover:bg-white/20"
          aria-label="状態を閉じる"
          @click="net.simulateOffline(false)"
        >
          <Icon name="lucide:rotate-ccw" class="h-4 w-4" />
        </button>
      </div>
    </Transition>
  </Teleport>
</template>
