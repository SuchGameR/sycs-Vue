<script setup lang="ts">
/**
 * トーストの表示面。
 *
 * レイアウトに 1 つ置くだけ。キューと自動 dismiss は useToast が持つ。
 * アクション付き (元に戻す) は、押すまで長めに残る。
 */
const { items, dismiss, runAction } = useToast()

const meta = {
  default: { icon: 'lucide:bell', ring: 'border-outline-variant', tint: 'bg-surface-container-highest/95', iconClass: 'bg-white/10 text-on-surface' },
  success: { icon: 'lucide:check-circle-2', ring: 'border-emerald-500/30', tint: 'bg-emerald-950/80', iconClass: 'bg-emerald-500/15 text-emerald-300' },
  error: { icon: 'lucide:alert-circle', ring: 'border-red-500/35', tint: 'bg-red-950/85', iconClass: 'bg-red-500/15 text-red-300' },
  warning: { icon: 'lucide:alert-triangle', ring: 'border-amber-500/35', tint: 'bg-amber-950/80', iconClass: 'bg-amber-500/15 text-amber-300' },
  info: { icon: 'lucide:info', ring: 'border-sky-500/30', tint: 'bg-sky-950/80', iconClass: 'bg-sky-500/15 text-sky-300' },
} as const

function metaFor(item: { type: keyof typeof meta; icon: string }) {
  const base = meta[item.type] ?? meta.default
  return { ...base, icon: item.icon || base.icon }
}
</script>

<template>
  <Teleport to="body">
    <div
      class="pointer-events-none fixed inset-x-0 top-[calc(var(--app-safe-top)+0.65rem)] z-[420] flex flex-col items-center px-3"
      aria-live="polite"
      aria-atomic="false"
    >
      <TransitionGroup
        name="sycs-toast"
        tag="div"
        class="flex w-full max-w-md flex-col gap-2"
      >
        <div
          v-for="item in items"
          :key="item.id"
          class="pointer-events-auto relative overflow-hidden rounded-2xl border shadow-2xl backdrop-blur-xl"
          :class="[metaFor(item).ring, metaFor(item).tint]"
          role="status"
        >
          <div class="flex items-start gap-3 p-3.5">
            <div
              class="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl"
              :class="metaFor(item).iconClass"
            >
              <Icon :name="metaFor(item).icon" class="h-4 w-4" />
            </div>

            <div class="min-w-0 flex-1">
              <p v-if="item.title" class="text-sm font-bold text-on-surface">{{ item.title }}</p>
              <p class="text-sm leading-snug text-on-surface" :class="item.title ? 'mt-0.5 opacity-90' : ''">
                {{ item.message }}
              </p>
              <div v-if="item.action" class="mt-2 flex items-center gap-2">
                <button
                  type="button"
                  class="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-on-surface transition hover:bg-white/20 active:scale-95"
                  @click="runAction(item)"
                >
                  {{ item.action.label }}
                </button>
              </div>
            </div>

            <button
              type="button"
              class="-mr-1 -mt-1 shrink-0 rounded-lg p-1.5 text-on-surface-variant transition hover:bg-white/10 hover:text-on-surface"
              aria-label="通知を閉じる"
              @click="dismiss(item.id)"
            >
              <Icon name="lucide:x" class="h-4 w-4" />
            </button>
          </div>

          <div
            v-if="item.duration > 0"
            class="sycs-toast-progress h-0.5 bg-white/40"
            :style="{ animationDuration: `${item.duration}ms` }"
          />
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>
