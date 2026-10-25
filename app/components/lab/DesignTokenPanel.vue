<script setup lang="ts">
/**
 * デザイントークン調整パネル。
 *
 * 変更は即座に <html> の CSS 変数へ反映されるので、
 * アプリ全体 (このスタジオの外も) がその場で変わる。
 */
const { tokens, patch, setAccent, reset } = useThemeTokens()

const accentInput = ref(tokens.value.accent)
watch(
  () => tokens.value.accent,
  (value) => {
    accentInput.value = value
  },
)

const densities = [
  { id: 'compact', label: 'コンパクト', icon: 'lucide:rows-3' },
  { id: 'cozy', label: '標準', icon: 'lucide:rows-2' },
  { id: 'comfortable', label: 'ゆったり', icon: 'lucide:rows-1' },
] as const

const motions = [
  { id: 'reduced', label: '控えめ', icon: 'lucide:rabbit' },
  { id: 'normal', label: '標準', icon: 'lucide:footprints' },
  { id: 'expressive', label: '表現的', icon: 'lucide:sparkles' },
] as const

function onAccentPick(color: string) {
  accentInput.value = color
  setAccent(color)
}

const accentPresets = ACCENT_PRESETS
</script>

<template>
  <div class="space-y-5">
    <div class="rounded-2xl border border-outline-variant bg-surface-container/30 p-4">
      <p class="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant/70">プレビュー</p>
      <div class="mt-3 rounded-xl border border-outline-variant bg-surface p-3">
        <div class="flex items-center gap-2">
          <div class="h-8 w-8 rounded-full bg-indigo-500/30" />
          <div class="min-w-0 flex-1">
            <p class="truncate text-sm font-bold text-on-surface">SYCS デザイン</p>
            <p class="text-[11px] text-on-surface-variant">角丸 {{ tokens.radius }}px ・ 文字 {{ Math.round(tokens.fontScale * 100) }}%</p>
          </div>
          <button type="button" class="rounded-full bg-indigo-600 px-3 py-1.5 text-[11px] font-bold text-white">フォロー</button>
        </div>
        <p class="mt-2 text-xs leading-relaxed text-on-surface-variant">
          アクセント色・角丸・密度・動き・文字サイズが、このカードとアプリ全体に同時に反映されます。
        </p>
        <div class="mt-2 flex gap-1.5">
          <span class="rounded-full border border-outline-variant px-2 py-0.5 text-[10px] text-on-surface-variant">タグ</span>
          <span class="rounded-full bg-indigo-500/15 px-2 py-0.5 text-[10px] text-indigo-200">アクセント</span>
        </div>
      </div>
    </div>

    <div>
      <div class="mb-2 flex items-center justify-between">
        <label class="text-xs font-bold text-on-surface">アクセントカラー</label>
        <span class="font-mono text-[10px] text-on-surface-variant">{{ tokens.accent }}</span>
      </div>
      <div class="flex flex-wrap items-center gap-1.5">
        <button
          v-for="preset in accentPresets"
          :key="preset.id"
          type="button"
          class="h-8 w-8 rounded-full border-2 transition hover:scale-110 active:scale-95"
          :class="tokens.accent.toLowerCase() === preset.color.toLowerCase() ? 'border-white' : 'border-transparent'"
          :style="{ background: preset.color }"
          :aria-label="preset.label"
          :title="preset.label"
          @click="onAccentPick(preset.color)"
        />
        <label class="relative flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-outline-variant bg-surface-container-high">
          <Icon name="lucide:pipette" class="h-3.5 w-3.5 text-on-surface-variant" />
          <input
            v-model="accentInput"
            type="color"
            class="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            aria-label="自由な色を選ぶ"
            @input="onAccentPick(accentInput)"
          />
        </label>
      </div>
    </div>

    <div class="grid gap-4 min-[520px]:grid-cols-2">
      <label class="block">
        <span class="mb-1.5 flex items-center justify-between text-xs font-bold text-on-surface">
          角丸
          <span class="font-mono text-[10px] font-normal text-on-surface-variant">{{ tokens.radius }}px</span>
        </span>
        <input
          :value="tokens.radius"
          type="range"
          min="0"
          max="28"
          step="1"
          class="h-1 w-full accent-indigo-500"
          @input="patch({ radius: Number(($event.target as HTMLInputElement).value) })"
        />
      </label>

      <label class="block">
        <span class="mb-1.5 flex items-center justify-between text-xs font-bold text-on-surface">
          文字サイズ
          <span class="font-mono text-[10px] font-normal text-on-surface-variant">{{ Math.round(tokens.fontScale * 100) }}%</span>
        </span>
        <input
          :value="tokens.fontScale"
          type="range"
          min="0.9"
          max="1.2"
          step="0.01"
          class="h-1 w-full accent-indigo-500"
          @input="patch({ fontScale: Number(($event.target as HTMLInputElement).value) })"
        />
      </label>

      <label class="block min-[520px]:col-span-2">
        <span class="mb-1.5 flex items-center justify-between text-xs font-bold text-on-surface">
          ガラス感 (Liquid Glass)
          <span class="font-mono text-[10px] font-normal text-on-surface-variant">blur {{ tokens.glass }}px</span>
        </span>
        <input
          :value="tokens.glass"
          type="range"
          min="0"
          max="40"
          step="1"
          class="h-1 w-full accent-indigo-500"
          @input="patch({ glass: Number(($event.target as HTMLInputElement).value) })"
        />
      </label>
    </div>

    <div class="grid gap-4 min-[520px]:grid-cols-2">
      <div>
        <p class="mb-1.5 text-xs font-bold text-on-surface">密度</p>
        <div class="grid grid-cols-3 gap-1">
          <button
            v-for="option in densities"
            :key="option.id"
            type="button"
            class="flex flex-col items-center gap-1 rounded-lg border px-1 py-2 text-[10px] font-medium transition"
            :class="tokens.density === option.id ? 'border-indigo-500/50 bg-indigo-600/15 text-indigo-200' : 'border-outline-variant bg-surface-container/40 text-on-surface-variant hover:bg-surface-container-high'"
            @click="patch({ density: option.id })"
          >
            <Icon :name="option.icon" class="h-4 w-4" />
            {{ option.label }}
          </button>
        </div>
      </div>

      <div>
        <p class="mb-1.5 text-xs font-bold text-on-surface">動き</p>
        <div class="grid grid-cols-3 gap-1">
          <button
            v-for="option in motions"
            :key="option.id"
            type="button"
            class="flex flex-col items-center gap-1 rounded-lg border px-1 py-2 text-[10px] font-medium transition"
            :class="tokens.motion === option.id ? 'border-indigo-500/50 bg-indigo-600/15 text-indigo-200' : 'border-outline-variant bg-surface-container/40 text-on-surface-variant hover:bg-surface-container-high'"
            @click="patch({ motion: option.id })"
          >
            <Icon :name="option.icon" class="h-4 w-4" />
            {{ option.label }}
          </button>
        </div>
      </div>
    </div>

    <div class="flex items-center justify-between rounded-xl border border-outline-variant bg-surface-container/30 px-3 py-2">
      <p class="text-[11px] text-on-surface-variant">
        設定はこの端末に保存されます。
      </p>
      <button
        type="button"
        class="flex items-center gap-1.5 rounded-lg border border-outline-variant px-2.5 py-1.5 text-[11px] font-medium text-on-surface-variant transition hover:bg-surface-container-high hover:text-on-surface"
        @click="reset"
      >
        <Icon name="lucide:rotate-ccw" class="h-3.5 w-3.5" />
        リセット
      </button>
    </div>
  </div>
</template>
