<script setup lang="ts">
/**
 * テーマ & レイアウトプリセット。
 * カードを押すと、テーマ・トークン・ナビ・レイアウト・機能トグルが一括で変わる。
 */
const { applyPreset, lastAppliedId } = useWorkspaceProfiles()
const presets = THEME_PRESETS
</script>

<template>
  <div class="grid gap-2 min-[560px]:grid-cols-2">
    <button
      v-for="preset in presets"
      :key="preset.id"
      type="button"
      class="group relative overflow-hidden rounded-xl border p-0 text-left transition hover:scale-[1.01] active:scale-[0.99]"
      :class="lastAppliedId === `preset:${preset.id}` ? 'border-indigo-500/60 ring-1 ring-indigo-500/30' : 'border-outline-variant'"
      @click="applyPreset(preset)"
    >
      <div class="flex items-center gap-3 p-3">
        <div
          class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-inner"
          :class="preset.gradient"
        >
          <Icon :name="preset.icon" class="h-5 w-5" />
        </div>
        <div class="min-w-0 flex-1">
          <p class="flex items-center gap-1.5 text-sm font-bold text-on-surface">
            {{ preset.name }}
            <Icon
              v-if="lastAppliedId === `preset:${preset.id}`"
              name="lucide:check-circle-2"
              class="h-3.5 w-3.5 text-indigo-400"
            />
          </p>
          <p class="mt-0.5 line-clamp-2 text-[11px] leading-snug text-on-surface-variant">
            {{ preset.description }}
          </p>
        </div>
      </div>
      <div class="flex items-center gap-1 border-t border-outline-variant/60 px-3 py-1.5 text-[9px] uppercase tracking-wide text-on-surface-variant/70">
        <span>{{ preset.theme.style }}</span>
        <span>·</span>
        <span>{{ preset.theme.scheme }}</span>
        <span>·</span>
        <span>{{ preset.nav.desktopNav === 'sidebar' ? 'サイドバー' : 'ピル' }}</span>
        <span class="ml-auto text-indigo-300 opacity-0 transition group-hover:opacity-100">適用 →</span>
      </div>
    </button>
  </div>
</template>
