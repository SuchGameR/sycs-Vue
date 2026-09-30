<script setup lang="ts">
/**
 * 外観設定 — テーマ（3 種）× 明暗 × カラー。
 *
 *   1. 従来のテーマ   … 今の SYCS のデザイン（ダーク / ライト）
 *   2. Liquid Glass   … Apple 風の透明ガラス
 *   3. Material 3     … Google 風の配色 + 波紋アニメーション
 *
 * 選ぶと <html> の data 属性へ即時反映するので、別にプレビュー画面は不要。
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

function pickStyle(id: string) {
  if (id === 'classic' || id === 'material3' || id === 'liquid-glass') setStyle(id)
}
</script>

<template>
  <div class="space-y-6">
    <!-- テーマ -->
    <div>
      <label class="block text-sm text-on-surface-variant mb-2">テーマ</label>
      <div class="space-y-2">
        <label
          v-for="s in THEME_STYLES"
          :key="s.id"
          class="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition"
          :class="
            style === s.id
              ? 'bg-indigo-600/20 ring-1 ring-indigo-500'
              : 'bg-surface-container/30 hover:bg-surface-container/60'
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
            class="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border border-outline-variant"
            :class="style === s.id ? 'bg-indigo-600/30' : 'bg-surface-container'"
          >
            <Icon
              :name="s.icon"
              class="w-5 h-5"
              :class="style === s.id ? 'text-indigo-300' : 'text-on-surface-variant'"
            />
          </div>
          <div class="min-w-0 flex-1">
            <div class="text-sm text-on-surface">{{ s.label }}</div>
            <div class="text-xs text-on-surface-variant truncate">{{ s.description }}</div>
          </div>
          <Icon
            v-if="style === s.id"
            name="lucide:check"
            class="w-4 h-4 text-indigo-300 shrink-0"
          />
        </label>
      </div>
    </div>

    <!-- 明暗 -->
    <div>
      <label class="block text-sm text-on-surface-variant mb-2">明るさ</label>
      <div class="grid grid-cols-3 gap-2">
        <label
          v-for="opt in SCHEME_OPTIONS"
          :key="opt.id"
          class="flex flex-col items-center gap-1.5 p-3 rounded-lg cursor-pointer transition"
          :class="
            scheme === opt.id
              ? 'bg-indigo-600/20 ring-1 ring-indigo-500'
              : 'bg-surface-container/30 hover:bg-surface-container/60'
          "
        >
          <input
            type="radio"
            name="sycs-theme-scheme"
            class="sr-only"
            :checked="scheme === opt.id"
            @change="setScheme(opt.id)"
          />
          <Icon
            :name="opt.icon"
            class="w-5 h-5"
            :class="scheme === opt.id ? 'text-indigo-300' : 'text-on-surface-variant'"
          />
          <span
            class="text-xs"
            :class="scheme === opt.id ? 'text-on-surface' : 'text-on-surface-variant'"
          >
            {{ opt.label }}
          </span>
        </label>
      </div>
      <p v-if="scheme === 'system'" class="text-xs text-on-surface-variant mt-2">
        現在の端末設定:
        <span class="text-on-surface-variant">{{ resolvedScheme === 'dark' ? 'ダーク' : 'ライト' }}</span>
      </p>
    </div>

    <!-- カラー seed -->
    <div v-if="definition.seeded">
      <label class="block text-sm text-on-surface-variant mb-2">
        カラー
        <span class="text-xs">（{{ definition.label }}）</span>
      </label>
      <div class="grid grid-cols-3 gap-2">
        <label
          v-for="sd in seeds"
          :key="sd.id"
          class="flex items-center gap-2 p-2.5 rounded-lg cursor-pointer transition"
          :class="
            seed === sd.id
              ? 'bg-indigo-600/20 ring-1 ring-indigo-500'
              : 'bg-surface-container/30 hover:bg-surface-container/60'
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
          <span
            class="text-xs truncate"
            :class="seed === sd.id ? 'text-on-surface' : 'text-on-surface-variant'"
          >
            {{ sd.label }}
          </span>
        </label>
      </div>
    </div>

    <!-- プレビュー -->
    <div>
      <label class="block text-sm text-on-surface-variant mb-2">プレビュー</label>
      <div
        class="rounded-xl overflow-hidden border border-outline-variant"
        :class="style === 'liquid-glass' ? 'sycs-glass-strong' : ''"
      >
        <!-- ヘッダー -->
        <div
          class="px-3 py-2 border-b border-outline-variant flex items-center gap-2"
          :class="style === 'liquid-glass' ? 'sycs-glass-thin' : 'bg-surface-container'"
        >
          <span class="w-2.5 h-2.5 rounded-full bg-red-500" />
          <span class="w-2.5 h-2.5 rounded-full bg-amber-500" />
          <span class="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span class="ml-2 h-2 w-24 rounded-full bg-surface-container-high" />
        </div>

        <!-- 本体 -->
        <div class="p-3 space-y-2.5 bg-surface">
          <div class="flex items-start gap-2.5">
            <span class="w-8 h-8 rounded-full bg-surface-container-high shrink-0" />
            <div class="flex-1 space-y-1.5 min-w-0">
              <div class="flex items-center gap-2">
                <span class="h-2.5 w-20 rounded bg-surface-container-high" />
                <span class="h-2 w-10 rounded text-on-surface-variant text-[9px]">2h</span>
              </div>
              <div class="h-2 w-full rounded bg-surface-container" />
              <div class="h-2 w-4/5 rounded bg-surface-container" />
            </div>
          </div>

          <div class="flex items-center gap-2 pt-1">
            <span class="h-6 w-14 rounded-md bg-indigo-600 inline-flex items-center justify-center">
              <span class="text-[9px] text-white">投稿</span>
            </span>
            <span
              class="h-6 w-14 rounded-md bg-surface-container border border-outline inline-flex items-center justify-center"
            >
              <span class="text-[9px] text-on-surface-variant">返信</span>
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
      <p class="text-xs text-on-surface-variant mt-2">
        {{ definition.label }} / {{ SCHEME_OPTIONS.find((o) => o.id === scheme)?.label }}
        <template v-if="definition.seeded">
          / {{ seeds.find((s) => s.id === seed)?.label }}
        </template>
      </p>
    </div>

    <p class="text-xs text-on-surface-variant">
      設定は保存ボタンでサーバーと同期されます。未保存のまま閉じるとこの端末だけが変化します。
    </p>
  </div>
</template>
