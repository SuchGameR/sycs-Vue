/**
 * テーマ (スタイル × 明暗) の状態管理。
 *
 * 3 つのスタイルはそれぞれ独立したデザインシステム表現:
 *   - classic        … 従来の SYCS ダーク/ライト
 *   - material3      … Material 3 (HCT トーン + ロール)
 *   - liquid-glass   … Apple Liquid Glass (透過 + スペキュラ)
 *
 * 2 つの軸で <html> に data 属性を付けることで CSS 側が切り替わる:
 *   data-style / data-scheme / data-seed
 *
 * 優先順位:
 *   1. localStorage (即時・FOUC なし)
 *   2. サーバ settings (ログイン済み・別デバイスとの同期)
 *   3. 既定値
 */

export type ThemeStyle = 'classic' | 'material3' | 'liquid-glass'
export type ThemeScheme = 'light' | 'dark' | 'system'
export type ThemeSeed = string

export interface ThemeDefinition {
  id: ThemeStyle
  label: string
  description: string
  icon: string
  /** seed を選ぶ必要がないか */
  seeded: boolean
}

export interface SeedDefinition {
  id: ThemeSeed
  label: string
  /** 設定画面のスウォッチに使う色 */
  swatch: string
}

export const THEME_STYLES: ThemeDefinition[] = [
  {
    id: 'classic',
    label: 'Classic',
    description: '従来の SYCS デザイン',
    icon: 'lucide:palette',
    seeded: false,
  },
  {
    id: 'material3',
    label: 'Material 3',
    description: '本家の HCT トーンとロール',
    icon: 'lucide:shapes',
    seeded: true,
  },
  {
    id: 'liquid-glass',
    label: 'Liquid Glass',
    description: '透過とスペキュラのガラス表現',
    icon: 'lucide:droplets',
    seeded: true,
  },
]

/** Material 3 の公式スキーム (本家 material-web と同じクラス) */
export const M3_SEEDS: SeedDefinition[] = [
  { id: 'tonal-spot', label: 'Baseline', swatch: '#6750A4' },
  { id: 'vibrant', label: 'Vibrant', swatch: '#7D5260' },
  { id: 'expressive', label: 'Expressive', swatch: '#635BFF' },
  { id: 'content', label: 'Content', swatch: '#B465F9' },
  { id: 'fruit-salad', label: 'Fruit Salad', swatch: '#B4E549' },
  { id: 'rainbow', label: 'Rainbow', swatch: '#A4C9F0' },
]

/** Liquid Glass の seed (寒色 3 色) */
export const LIQUID_GLASS_SEEDS: SeedDefinition[] = [
  { id: 'sky', label: 'Sky', swatch: '#0A84FF' },
  { id: 'indigo', label: 'Indigo', swatch: '#5E5CE6' },
  { id: 'teal', label: 'Teal', swatch: '#30B0C7' },
]

export const SCHEME_OPTIONS: { id: ThemeScheme; label: string; icon: string }[] = [
  { id: 'light', label: 'ライト', icon: 'lucide:sun' },
  { id: 'dark', label: 'ダーク', icon: 'lucide:moon' },
  { id: 'system', label: 'システム', icon: 'lucide:monitor' },
]

const STYLE_IDS = THEME_STYLES.map((s) => s.id)
const ALL_SEED_IDS = [...M3_SEEDS, ...LIQUID_GLASS_SEEDS].map((s) => s.id)

const KEY_STYLE = 'sycs:theme-style'
const KEY_SCHEME = 'sycs:theme-scheme'
const KEY_SEED = 'sycs:theme-seed'

const DEFAULT_STYLE: ThemeStyle = 'classic'
const DEFAULT_SCHEME: ThemeScheme = 'dark'
const DEFAULT_SEED: ThemeSeed = 'tonal-spot'

/** seed がスタイルに合わない場合はスタイル側の既定値に戻す */
function defaultSeedFor(style: ThemeStyle): ThemeSeed {
  if (style === 'liquid-glass') return LIQUID_GLASS_SEEDS[0]!.id
  return M3_SEEDS[0]!.id
}

export function isThemeStyle(v: unknown): v is ThemeStyle {
  return typeof v === 'string' && (STYLE_IDS as string[]).includes(v)
}
export function isThemeScheme(v: unknown): v is ThemeScheme {
  return v === 'light' || v === 'dark' || v === 'system'
}

/**
 * ローカルストレージの生値を読む。壊れた値は既定値に落とす。
 * サーバから来た値 (旧形式の theme: "dark" | "light") もここで吸収する。
 */
function readStored(): { style: ThemeStyle; scheme: ThemeScheme; seed: ThemeSeed } {
  if (!import.meta.client) {
    return { style: DEFAULT_STYLE, scheme: DEFAULT_SCHEME, seed: DEFAULT_SEED }
  }
  let style = DEFAULT_STYLE
  let scheme = DEFAULT_SCHEME
  let seed = ''

  const rawStyle = localStorage.getItem(KEY_STYLE)
  if (isThemeStyle(rawStyle)) style = rawStyle

  const rawScheme = localStorage.getItem(KEY_SCHEME)
  if (isThemeScheme(rawScheme)) scheme = rawScheme
  // 旧形式からの移行: theme = 'dark' | 'light'
  else if (localStorage.getItem('sycs:theme') === 'light') scheme = 'light'

  const rawSeed = localStorage.getItem(KEY_SEED)
  if (rawSeed && ALL_SEED_IDS.includes(rawSeed)) seed = rawSeed

  return { style, scheme, seed: seed || defaultSeedFor(style) }
}

export function useTheme() {
  const style = useState<ThemeStyle>('theme:style', () => readStored().style)
  const scheme = useState<ThemeScheme>('theme:scheme', () => readStored().scheme)
  const seed = useState<ThemeSeed>('theme:seed', () => readStored().seed)

  const prefersDark = useState<boolean>('theme:prefers-dark', () =>
    import.meta.client
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
      : true,
  )

  /** system を実際に light / dark へ解決した結果 */
  const resolvedScheme = computed<'light' | 'dark'>(() =>
    scheme.value === 'system' ? (prefersDark.value ? 'dark' : 'light') : scheme.value,
  )

  const definition = computed(
    () => THEME_STYLES.find((s) => s.id === style.value) ?? THEME_STYLES[0]!,
  )

  const seeds = computed<SeedDefinition[]>(() =>
    style.value === 'liquid-glass' ? LIQUID_GLASS_SEEDS : M3_SEEDS,
  )

  function apply() {
    if (!import.meta.client) return
    const el = document.documentElement
    el.dataset.style = style.value
    el.dataset.scheme = resolvedScheme.value
    el.dataset.seed = seed.value || defaultSeedFor(style.value)
    el.dataset.theme = `${style.value}:${resolvedScheme.value}`
  }

  function persist() {
    if (!import.meta.client) return
    localStorage.setItem(KEY_STYLE, style.value)
    localStorage.setItem(KEY_SCHEME, scheme.value)
    localStorage.setItem(KEY_SEED, seed.value)
  }

  /** 切替時に色を滑らかに遷移させる（ Reduced motion では無効） */
  function withTransition(fn: () => void) {
    if (!import.meta.client) {
      fn()
      return
    }
    const el = document.documentElement
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) {
      fn()
      return
    }
    el.dataset.themeAnimating = ''
    fn()
    apply()
    window.setTimeout(() => {
      delete el.dataset.themeAnimating
    }, 240)
  }

  function setStyle(next: ThemeStyle) {
    withTransition(() => {
      style.value = next
      seed.value = defaultSeedFor(next)
    })
    persist()
  }

  function setScheme(next: ThemeScheme) {
    withTransition(() => {
      scheme.value = next
    })
    persist()
  }

  function setSeed(next: ThemeSeed) {
    withTransition(() => {
      seed.value = next
    })
    persist()
  }

  /**
   * サーバの settings と同期する。
   * この端末で明示的に選ばれている (localStorage がある) ものは尊重し、
   * 初めてログインした端末など localStorage が空のときだけサーバを採用する。
   */
  function hydrateFromServer(settings: Record<string, unknown> | null | undefined) {
    if (!settings || !import.meta.client) return

    let changed = false

    if (!hasLocal(KEY_STYLE)) {
      if (isThemeStyle(settings.themeStyle)) {
        style.value = settings.themeStyle
        changed = true
      }
      if (typeof settings.themeSeed === 'string' && ALL_SEED_IDS.includes(settings.themeSeed)) {
        seed.value = settings.themeSeed
      } else if (changed) {
        seed.value = defaultSeedFor(style.value)
      }
    }

    if (!hasLocal(KEY_SCHEME)) {
      if (isThemeScheme(settings.themeScheme)) {
        scheme.value = settings.themeScheme
        changed = true
      } else if (settings.theme === 'light' || settings.theme === 'dark') {
        // 旧形式 (theme: 'dark' | 'light') からの移行
        scheme.value = settings.theme
        changed = true
      }
    }

    apply()
    if (changed) persist()
  }

  function hasLocal(key: string) {
    return !!localStorage.getItem(key)
  }

  function init() {
    if (!import.meta.client) return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    mq.addEventListener('change', (e: MediaQueryListEvent) => {
      prefersDark.value = e.matches
      if (scheme.value === 'system') apply()
    })
    apply()
  }

  return {
    style,
    scheme,
    seed,
    resolvedScheme,
    prefersDark,
    definition,
    seeds,
    setStyle,
    setScheme,
    setSeed,
    apply,
    persist,
    init,
    hydrateFromServer,
  }
}
