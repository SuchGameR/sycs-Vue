/**
 * ワークスペースプロファイル。
 *
 * 「テーマ + トークン + ナビ + レイアウト + 機能トグル」を 1 つの名前で保存し、
 * ワンタップで復元する。プリセット (THEME_PRESETS) は読み取り専用、
 * ユーザーが保存したものは localStorage に残る。
 */

import type { DesignTokens } from '~/composables/useThemeTokens'
import type { InteractionId } from '~/utils/interactionCatalog'
import { THEME_PRESETS, type ThemePreset } from '~/utils/workspacePresets'
import { DEFAULT_TOKENS } from '~/composables/useThemeTokens'
import { DEFAULT_INTERACTION_STATE } from '~/utils/interactionCatalog'

export interface WorkspaceProfile {
  id: string
  name: string
  icon: string
  createdAt: number
  theme: {
    style: 'classic' | 'material3' | 'liquid-glass'
    scheme: 'light' | 'dark'
    seed: string
  }
  tokens: DesignTokens
  nav: {
    desktopNav: 'pill' | 'sidebar'
    sidebarCollapsed: boolean
  }
  layout: {
    sidebar: boolean
    mediaPane: boolean
  }
  interactions: Partial<Record<InteractionId, boolean>>
}

const STORAGE_KEY = 'sycs:workspace-profiles:v1'

export function useWorkspaceProfiles() {
  const profiles = useState<WorkspaceProfile[]>('workspace:profiles', () => [])
  const lastAppliedId = useState<string>('workspace:last-applied', () => '')
  const hydrated = useState<boolean>('workspace:profiles:hydrated', () => false)

  const toast = useToast()
  const theme = useTheme()
  const tokens = useThemeTokens()
  const nav = useNavLayout()
  const workbench = useWorkbench()
  const interactions = useInteractionSettings()

  function persist() {
    if (!import.meta.client) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles.value))
    } catch {
      /* ignore */
    }
  }

  function hydrate() {
    if (hydrated.value) return
    hydrated.value = true
    if (!import.meta.client) return
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const parsed = JSON.parse(raw) as WorkspaceProfile[]
      if (Array.isArray(parsed)) {
        profiles.value = parsed.filter((p) => p && typeof p.id === 'string' && p.name)
      }
    } catch {
      /* ignore */
    }
  }

  function snapshot(name: string, icon = 'lucide:bookmark'): WorkspaceProfile {
    return {
      id: `custom-${Date.now().toString(36)}`,
      name: name.trim() || '無題のワークスペース',
      icon,
      createdAt: Date.now(),
      theme: {
        style: theme.style.value,
        scheme: theme.scheme.value,
        seed: theme.seed.value,
      },
      tokens: { ...tokens.tokens.value },
      nav: {
        desktopNav: nav.desktopNav.value,
        sidebarCollapsed: nav.sidebarCollapsed.value,
      },
      layout: { ...workbench.layout.value },
      interactions: { ...interactions.enabled.value },
    }
  }

  function apply(profile: WorkspaceProfile) {
    theme.setStyle(profile.theme.style)
    theme.setScheme(profile.theme.scheme)
    theme.setSeed(profile.theme.seed)

    tokens.patch({ ...DEFAULT_TOKENS, ...profile.tokens })

    nav.setDesktopNav(profile.nav.desktopNav)
    nav.setSidebarCollapsed(profile.nav.sidebarCollapsed)
    workbench.setLayout(profile.layout)
    interactions.setMany(profile.interactions)

    lastAppliedId.value = profile.id
    if (import.meta.client) {
      localStorage.setItem('sycs:workspace-last-applied', profile.id)
    }
    toast.success(`「${profile.name}」を適用しました`, { icon: 'lucide:check-circle' })
  }

  function applyPreset(idOrPreset: string | ThemePreset) {
    const preset =
      typeof idOrPreset === 'string'
        ? THEME_PRESETS.find((p) => p.id === idOrPreset)
        : idOrPreset
    if (!preset) return

    theme.setStyle(preset.theme.style)
    theme.setScheme(preset.theme.scheme)
    theme.setSeed(preset.theme.seed)

    tokens.patch({ ...DEFAULT_TOKENS, ...preset.tokens })

    nav.setDesktopNav(preset.nav.desktopNav)
    nav.setSidebarCollapsed(preset.nav.sidebarCollapsed)
    workbench.setLayout(preset.layout)

    // プリセットは「ワークスペース丸ごと」なので、機能トグルも既定へ戻してから適用。
    interactions.enableAll()
    if (preset.interactions) interactions.setMany(preset.interactions)

    lastAppliedId.value = `preset:${preset.id}`
    toast.success(`プリセット「${preset.name}」を適用しました`, { icon: preset.icon })
  }

  function save(name: string, icon?: string) {
    const profile = snapshot(name, icon)
    profiles.value = [...profiles.value, profile]
    persist()
    lastAppliedId.value = profile.id
    toast.success(`「${profile.name}」を保存しました`, { icon: 'lucide:briefcase' })
    return profile
  }

  function remove(id: string) {
    const target = profiles.value.find((p) => p.id === id)
    profiles.value = profiles.value.filter((p) => p.id !== id)
    persist()
    if (target) {
      toast.undo(`「${target.name}」を削除しました`, () => {
        profiles.value = [...profiles.value, target]
        persist()
      })
    }
  }

  function rename(id: string, name: string) {
    profiles.value = profiles.value.map((p) =>
      p.id === id ? { ...p, name: name.trim() || p.name } : p,
    )
    persist()
  }

  function resetAll() {
    profiles.value = []
    if (import.meta.client) localStorage.removeItem(STORAGE_KEY)
  }

  const presets = THEME_PRESETS
  const customProfiles = computed(() => profiles.value)

  return {
    profiles,
    customProfiles,
    presets,
    lastAppliedId,
    hydrate,
    save,
    apply,
    applyPreset,
    remove,
    rename,
    resetAll,
  }
}
