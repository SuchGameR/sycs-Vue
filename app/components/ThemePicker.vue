<script setup lang="ts">
/**
 * 外観設定 — 「スタイル × 明暗 × カラー」のマトリクス。
 *
 *   スタイル   classic / material3 / liquid-glass
 *   明暗       ライト / ダーク / システム
 *   カラー     スタイルが持つ seed (M3 公式スキーム / Liquid Glass の寒色)
 *
 * 実際に <html> の data 属性へ即時反映するので、確認のためのプレビュー画面は
 * 不要。そのまま画面全体を切り替えながら選べる。
 */
const {
  style,
  scheme,
  seed,
  resolvedScheme,
  definition,
  seeds,
  setStyle,
  setScheme,
  setSeed,
} = useTheme()

/** スタイル切替時に seed も適切な既定値へ寄せる */
function pickStyle(id: string) {
  if (id === 'classic' || id === 'material3' || id === 'liquid-glass') setStyle(id)
}
</script>

<template>
  <div class="space-y-5">
    <!-- 明暗 -->
    <div>
      <label class="block text-sm text-slate-400 mb-2">明暗</label>
      <div class="grid grid-cols-3 gap-2">
        <label
          v-for="opt in SCHEME_OPTIONS"
          :key="opt.id"
          class="flex flex-col items-center gap-1.5 p-3 rounded-lg cursor-pointer transition"
          :class="
            scheme === opt.id
              ? 'bg-indigo-600/20 ring-1 ring-indigo-500'
              : 'bg-slate-800/30 hover:bg-slate-800/60'
          "
        >
          <input
            type="radio"
            name="sycs-theme-scheme"
            class="sr-only"
            :checked="scheme === opt.id"
            @change="setScheme(opt.id)"
          />
          <Icon :name="opt.icon" class="w-5 h-5" :class="scheme === opt.id ? 'text-indigo-300' : 'text-slate-400'" />
          <span class="text-xs" :class="scheme === opt.id ? 'text-white' : 'text-slate-400'">{{
            opt.label
          }}</span>
        </label>
      </div>
      <p v-if="scheme === 'system'" class="text-xs text-slate-500 mt-2">
        現在の端末設定:
        <span class="text-slate-400">{{ resolvedScheme === 'dark' ? 'ダーク' : 'ライト' }}</span>
      </p>
    </div>

    <!-- スタイル -->
    <div>
      <label class="block text-sm text-slate-400 mb-2">スタイル</label>
      <div class="space-y-2">
        <label
          v-for="s in THEME_STYLES"
          :key="s.id"
          class="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition"
          :class="
            style === s.id
              ? 'bg-indigo-600/20 ring-1 ring-indigo-500'
              : 'bg-slate-800/30 hover:bg-slate-800/60'
          "
        >
          <input
            type="radio"
            name="sycs-theme-style"
            class="sr-only"
            :checked="style === s.id"
            @change="pickStyle(s.id)"
          />
          <div
            class="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border border-slate-700"
            :class="style === s.id ? 'bg-indigo-600/30' : 'bg-slate-800'"
          >
            <Icon :name="s.icon" class="w-5 h-5" :class="style === s.id ? 'text-indigo-300' : 'text-slate-400'" />
          </div>
          <div class="min-w-0">
            <div class="text-sm text-white">{{ s.label }}</div>
            <div class="text-xs text-slate-500 truncate">{{ s.description }}</div>
          </div>
        </label>
      </div>
    </div>

    <!-- カラー seed -->
    <div v-if="definition.seeded">
      <label class="block text-sm text-slate-400 mb-2">
        カラー
        <span class="text-xs text-slate-500">（{{ definition.label }}）</span>
      </label>
      <div class="grid grid-cols-3 gap-2">
        <label
          v-for="sd in seeds"
          :key="sd.id"
          class="flex items-center gap-2 p-2.5 rounded-lg cursor-pointer transition"
          :class="
            seed === sd.id
              ? 'bg-indigo-600/20 ring-1 ring-indigo-500'
              : 'bg-slate-800/30 hover:bg-slate-800/60'
          "
        >
          <input
            type="radio"
            name="sycs-theme-seed"
            class="sr-only"
            :checked="seed === sd.id"
            @change="setSeed(sd.id)"
          />
          <span
            class="w-5 h-5 rounded-full shrink-0 ring-1 ring-inset ring-white/20"
            :style="{ backgroundColor: sd.swatch }"
          />
          <span class="text-xs truncate" :class="seed === sd.id ? 'text-white' : 'text-slate-400'">{{
            sd.label
          }}</span>
        </label>
      </div>
    </div>

    <!-- プレビュー -->
    <div>
      <label class="block text-sm text-slate-400 mb-2">プレビュー</label>
      <div
        class="rounded-xl overflow-hidden border border-slate-700"
        :class="style === 'liquid-glass' ? 'sycs-glass-strong' : ''"
      >
        <!-- ヘッダー -->
        <div
          class="px-3 py-2 border-b border-slate-800 flex items-center gap-2"
          :class="style === 'liquid-glass' ? 'sycs-glass-thin' : 'bg-slate-800'"
        >
          <span class="w-2.5 h-2.5 rounded-full bg-red-500" />
          <span class="w-2.5 h-2.5 rounded-full bg-amber-500" />
          <span class="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span class="ml-2 h-2 w-24 rounded-full bg-slate-700" />
        </div>

        <!-- 本体 -->
        <div class="p-3 space-y-2.5 bg-slate-900" :class="style === 'material3' ? 'rounded-b-none' : ''">
          <div class="flex items-start gap-2.5">
            <span class="w-8 h-8 rounded-full bg-slate-700 shrink-0" />
            <div class="flex-1 space-y-1.5 min-w-0">
              <div class="flex items-center gap-2">
                <span class="h-2.5 w-20 rounded bg-slate-700" />
                <span class="h-2 w-10 rounded text-slate-600 text-[9px]">2h</span>
              </div>
              <div class="h-2 w-full rounded bg-slate-800" />
              <div class="h-2 w-4/5 rounded bg-slate-800" />
            </div>
          </div>

          <div class="flex items-center gap-2 pt-1">
            <span class="h-6 w-14 rounded-md bg-indigo-600 inline-flex items-center justify-center">
              <span class="text-[9px] text-white">投稿</span>
            </span>
            <span class="h-6 w-14 rounded-md bg-slate-800 border border-slate-700 inline-flex items-center justify-center">
              <span class="text-[9px] text-slate-400">返信</span>
            </span>
            <span class="h-6 w-6 rounded-full bg-sky-500 inline-flex items-center justify-center">
              <Icon name="lucide:heart" class="w-3 h-3 text-white" />
            </span>
            <span class="h-6 w-6 rounded-full bg-emerald-500 inline-flex items-center justify-center">
              <Icon name="lucide:repeat-2" class="w-3 h-3 text-white" />
            </span>
          </div>
        </div>
      </div>
      <p class="text-xs text-slate-500 mt-2">
        {{ definition.label }} / {{ SCHEME_OPTIONS.find((o) => o.id === scheme)?.label }}
        <template v-if="definition.seeded">
          / {{ seeds.find((s) => s.id === seed)?.label }}
        </template>
      </p>
    </div>

    <p class="text-xs text-slate-500">
      設定は保存ボタンでサーバーと同期されます。未保存のまま閉じるとこの端末だけが変化します。
    </p>
  </div>
</template>
