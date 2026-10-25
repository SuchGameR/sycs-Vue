<script setup lang="ts">
/**
 * ワークスペースプロファイル。
 * 現在の見た目・ナビ・機能トグルを丸ごと保存し、あとで復元する。
 */
const {
  customProfiles,
  lastAppliedId,
  hydrate,
  save,
  apply,
  remove,
  resetAll,
} = useWorkspaceProfiles()

const theme = useTheme()
const tokens = useThemeTokens()
const nav = useNavLayout()
const interactions = useInteractionSettings()
const workbench = useWorkbench()

const name = ref('')
const toast = useToast()

onMounted(() => {
  hydrate()
  tokens.hydrate()
  interactions.hydrate()
})

function saveCurrent() {
  if (!name.value.trim()) {
    toast.warning('プロファイル名を入力してください')
    return
  }
  save(name.value)
  name.value = ''
}

const summary = computed(() => [
  THEME_STYLES.find((s) => s.id === theme.style.value)?.label ?? theme.style.value,
  theme.resolvedScheme.value === 'dark' ? 'ダーク' : 'ライト',
  nav.desktopNav.value === 'sidebar' ? 'サイドバー' : '下部ピル',
  `角丸 ${tokens.tokens.value.radius}px`,
  `${interactions.enabledCount.value}/${interactions.total} 機能`,
  workbench.layout.value.mediaPane ? 'メディアペイン' : 'メディアなし',
])
</script>

<template>
  <div class="space-y-4">
    <div class="rounded-xl border border-outline-variant bg-surface-container/30 p-3">
      <p class="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant/70">現在のワークスペース</p>
      <div class="mt-2 flex flex-wrap gap-1.5">
        <span
          v-for="item in summary"
          :key="item"
          class="rounded-full border border-outline-variant bg-surface-container-high/60 px-2 py-0.5 text-[10px] text-on-surface-variant"
        >
          {{ item }}
        </span>
      </div>
    </div>

    <div class="flex items-center gap-2">
      <input
        v-model="name"
        type="text"
        placeholder="名前を付けて保存 (例: 執筆用)"
        class="min-w-0 flex-1 rounded-lg border border-outline-variant bg-surface-container/40 px-3 py-2 text-xs text-on-surface outline-none transition focus:border-indigo-500"
        @keydown.enter.prevent="saveCurrent"
      />
      <button
        type="button"
        class="flex shrink-0 items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-indigo-500 active:scale-95"
        @click="saveCurrent"
      >
        <Icon name="lucide:save" class="h-3.5 w-3.5" />
        保存
      </button>
    </div>

    <div v-if="!customProfiles.length" class="rounded-xl border border-dashed border-outline-variant px-4 py-6 text-center">
      <p class="text-xs text-on-surface-variant">
        まだ保存されたプロファイルはありません。<br />
        上の入力欄から、今の組み合わせを保存できます。
      </p>
    </div>

    <ul v-else class="space-y-1.5">
      <li
        v-for="profile in customProfiles"
        :key="profile.id"
        class="flex items-center gap-2 rounded-xl border px-3 py-2.5 transition"
        :class="lastAppliedId === profile.id ? 'border-indigo-500/50 bg-indigo-600/10' : 'border-outline-variant bg-surface-container/30'"
      >
        <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-container-high">
          <Icon :name="profile.icon" class="h-4 w-4 text-on-surface-variant" />
        </div>
        <div class="min-w-0 flex-1">
          <p class="truncate text-xs font-bold text-on-surface">{{ profile.name }}</p>
          <p class="text-[10px] text-on-surface-variant">
            {{ profile.theme.style }} · {{ profile.nav.desktopNav === 'sidebar' ? 'サイドバー' : 'ピル' }}
          </p>
        </div>
        <button
          type="button"
          class="rounded-lg bg-indigo-600/20 px-2.5 py-1 text-[10px] font-bold text-indigo-200 transition hover:bg-indigo-600/30"
          @click="apply(profile)"
        >
          適用
        </button>
        <button
          type="button"
          class="rounded-lg p-1.5 text-on-surface-variant transition hover:bg-red-500/15 hover:text-red-300"
          aria-label="プロファイルを削除"
          @click="remove(profile.id)"
        >
          <Icon name="lucide:trash-2" class="h-3.5 w-3.5" />
        </button>
      </li>
    </ul>

    <button
      v-if="customProfiles.length"
      type="button"
      class="flex w-full items-center justify-center gap-1.5 rounded-lg border border-outline-variant py-1.5 text-[11px] text-on-surface-variant transition hover:bg-surface-container-high"
      @click="resetAll"
    >
      <Icon name="lucide:trash" class="h-3.5 w-3.5" />
      保存したプロファイルをすべて削除
    </button>
  </div>
</template>
