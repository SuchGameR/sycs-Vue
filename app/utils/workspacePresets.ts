/**
 * テーマ & レイアウトのプリセット。
 *
 * 1 つのプリセット = テーマ / トークン / ナビ / ワークベンチ / 機能トグルの
 * 組み合わせ。ユーザーはこれを丸ごと適用できる。
 */

import type { DesignTokens } from '~/composables/useThemeTokens'
import type { InteractionId } from './interactionCatalog'

export interface NavigationPreset {
  desktopNav: 'pill' | 'sidebar'
  sidebarCollapsed: boolean
}

export interface WorkspaceLayoutPreset {
  sidebar: boolean
  mediaPane: boolean
}

export interface ThemePreset {
  id: string
  name: string
  description: string
  icon: string
  /** カードのプレビュー用グラデーション */
  gradient: string
  theme: {
    style: 'classic' | 'material3' | 'liquid-glass'
    scheme: 'light' | 'dark'
    seed: string
  }
  tokens: Partial<DesignTokens>
  nav: NavigationPreset
  layout: WorkspaceLayoutPreset
  interactions?: Partial<Record<InteractionId, boolean>>
}

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: 'focus',
    name: '集中',
    description: '情報密度を上げ、動きを抑えた作業向け。',
    icon: 'lucide:target',
    gradient: 'from-slate-700 via-slate-800 to-slate-950',
    theme: { style: 'classic', scheme: 'dark', seed: 'tonal-spot' },
    tokens: {
      accent: '#818cf8',
      radius: 8,
      density: 'compact',
      motion: 'reduced',
      fontScale: 0.98,
      glass: 10,
    },
    nav: { desktopNav: 'sidebar', sidebarCollapsed: true },
    layout: { sidebar: true, mediaPane: false },
    interactions: {
      'mini-player': false,
      'haptic-feedback': false,
      'shared-element': false,
      'activity-timeline': false,
    },
  },
  {
    id: 'social',
    name: 'ソーシャル',
    description: 'ガラス感と軽い動きで、SNS らしい華やかさ。',
    icon: 'lucide:users-round',
    gradient: 'from-sky-400 via-blue-500 to-indigo-600',
    theme: { style: 'liquid-glass', scheme: 'dark', seed: 'sky' },
    tokens: {
      accent: '#0a84ff',
      radius: 18,
      density: 'comfortable',
      motion: 'expressive',
      fontScale: 1.01,
      glass: 28,
    },
    nav: { desktopNav: 'pill', sidebarCollapsed: false },
    layout: { sidebar: false, mediaPane: true },
  },
  {
    id: 'creator',
    name: 'クリエイター',
    description: 'Material 3 の表現力と、広いメディアペイン。',
    icon: 'lucide:palette',
    gradient: 'from-violet-500 via-fuchsia-500 to-rose-500',
    theme: { style: 'material3', scheme: 'dark', seed: 'expressive' },
    tokens: {
      accent: '#635bff',
      radius: 14,
      density: 'cozy',
      motion: 'normal',
      fontScale: 1,
      glass: 20,
    },
    nav: { desktopNav: 'sidebar', sidebarCollapsed: false },
    layout: { sidebar: true, mediaPane: true },
  },
  {
    id: 'calm',
    name: 'アクセシブル',
    description: '明るく大きな文字。動きと振動を最小限に。',
    icon: 'lucide:accessibility',
    gradient: 'from-emerald-300 via-teal-400 to-cyan-500',
    theme: { style: 'classic', scheme: 'light', seed: 'tonal-spot' },
    tokens: {
      accent: '#0f766e',
      radius: 16,
      density: 'comfortable',
      motion: 'reduced',
      fontScale: 1.12,
      glass: 0,
    },
    nav: { desktopNav: 'sidebar', sidebarCollapsed: false },
    layout: { sidebar: true, mediaPane: false },
    interactions: {
      'haptic-feedback': false,
      'shared-element': false,
      'pull-to-refresh': false,
    },
  },
  {
    id: 'midnight',
    name: 'ミッドナイト',
    description: '暗い場所向けの低コントラスト・コンパクト表示。',
    icon: 'lucide:moon-star',
    gradient: 'from-indigo-950 via-slate-900 to-black',
    theme: { style: 'liquid-glass', scheme: 'dark', seed: 'indigo' },
    tokens: {
      accent: '#5e5ce6',
      radius: 12,
      density: 'compact',
      motion: 'reduced',
      fontScale: 0.96,
      glass: 16,
    },
    nav: { desktopNav: 'pill', sidebarCollapsed: false },
    layout: { sidebar: true, mediaPane: false },
  },
  {
    id: 'paper',
    name: 'ペーパー',
    description: '角丸を抑えた、紙のようなフラット表示。',
    icon: 'lucide:file-text',
    gradient: 'from-stone-200 via-stone-300 to-stone-400',
    theme: { style: 'classic', scheme: 'light', seed: 'tonal-spot' },
    tokens: {
      accent: '#2563eb',
      radius: 4,
      density: 'cozy',
      motion: 'normal',
      fontScale: 1,
      glass: 0,
    },
    nav: { desktopNav: 'sidebar', sidebarCollapsed: true },
    layout: { sidebar: true, mediaPane: false },
  },
]

export function findThemePreset(id: string): ThemePreset | undefined {
  return THEME_PRESETS.find((p) => p.id === id)
}
