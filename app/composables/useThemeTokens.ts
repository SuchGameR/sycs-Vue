/**
 * デザイントークンのライブ調整。
 *
 * テーマ (classic / material3 / liquid-glass) の上に、アクセント色・角丸・
 * 密度・モーション・文字サイズ・ガラス強度を重ねる。すべて <html> の
 * inline CSS 変数として書き込むので、既存の Tailwind クラスがそのまま追従する。
 */

export type Density = 'compact' | 'cozy' | 'comfortable'
export type MotionLevel = 'reduced' | 'normal' | 'expressive'

export interface DesignTokens {
  /** hex (#rrggbb) */
  accent: string
  /** medium 角丸の px */
  radius: number
  density: Density
  motion: MotionLevel
  /** 0.9 - 1.2 */
  fontScale: number
  /** Liquid Glass の blur px */
  glass: number
}

export const ACCENT_PRESETS = [
  { id: 'indigo', label: 'Indigo', color: '#6366f1' },
  { id: 'sky', label: 'Sky', color: '#0ea5e9' },
  { id: 'teal', label: 'Teal', color: '#14b8a6' },
  { id: 'emerald', label: 'Emerald', color: '#10b981' },
  { id: 'amber', label: 'Amber', color: '#f59e0b' },
  { id: 'rose', label: 'Rose', color: '#f43f5e' },
  { id: 'violet', label: 'Violet', color: '#8b5cf6' },
  { id: 'slate', label: 'Slate', color: '#64748b' },
] as const

export const DEFAULT_TOKENS: DesignTokens = {
  accent: '#6366f1',
  radius: 12,
  density: 'cozy',
  motion: 'normal',
  fontScale: 1,
  glass: 20,
}

const STORAGE_KEY = 'sycs:design-tokens:v1'

/** 実際に <html> へ書き込んだプロパティ。reset 時にだけ取り除く。 */
const appliedProps = new Set<string>()

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n))
}

function normalizeHex(hex: string): string {
  const v = hex.trim()
  if (/^#[0-9a-f]{6}$/i.test(v)) return v.toLowerCase()
  if (/^#[0-9a-f]{3}$/i.test(v)) {
    return `#${v[1]}${v[1]}${v[2]}${v[2]}${v[3]}${v[3]}`.toLowerCase()
  }
  return DEFAULT_TOKENS.accent
}

function hexToRgb(hex: string): [number, number, number] {
  const h = normalizeHex(hex).slice(1)
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ]
}

/** Tailwind のトークンは "r g b" の 3 つ組で定義されている。 */
function rgbTriple(hex: string): string {
  return hexToRgb(hex).join(' ')
}

function mix(hex: string, target: [number, number, number], weight: number): string {
  const [r, g, b] = hexToRgb(hex)
  const t = clamp(weight, 0, 1)
  const to = (a: number, b2: number) => Math.round(a + (b2 - a) * t)
  const rr = to(r, target[0]).toString(16).padStart(2, '0')
  const gg = to(g, target[1]).toString(16).padStart(2, '0')
  const bb = to(b, target[2]).toString(16).padStart(2, '0')
  return `${rr}${gg}${bb}`
}

const WHITE: [number, number, number] = [255, 255, 255]
const BLACK: [number, number, number] = [0, 0, 0]

function setVar(el: HTMLElement, name: string, value: string) {
  el.style.setProperty(name, value)
  appliedProps.add(name)
}

function motionDurations(level: MotionLevel) {
  if (level === 'reduced') return { fast: '80ms', base: '120ms', slow: '180ms' }
  if (level === 'expressive') return { fast: '200ms', base: '320ms', slow: '460ms' }
  return { fast: '140ms', base: '220ms', slow: '320ms' }
}

function readStored(): DesignTokens {
  if (!import.meta.client) return { ...DEFAULT_TOKENS }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...DEFAULT_TOKENS }
    const parsed = JSON.parse(raw) as Partial<DesignTokens>
    return {
      accent: typeof parsed.accent === 'string' ? normalizeHex(parsed.accent) : DEFAULT_TOKENS.accent,
      radius:
        typeof parsed.radius === 'number'
          ? clamp(parsed.radius, 0, 28)
          : DEFAULT_TOKENS.radius,
      density:
        parsed.density === 'compact' ||
        parsed.density === 'cozy' ||
        parsed.density === 'comfortable'
          ? parsed.density
          : DEFAULT_TOKENS.density,
      motion:
        parsed.motion === 'reduced' ||
        parsed.motion === 'normal' ||
        parsed.motion === 'expressive'
          ? parsed.motion
          : DEFAULT_TOKENS.motion,
      fontScale:
        typeof parsed.fontScale === 'number'
          ? clamp(parsed.fontScale, 0.9, 1.2)
          : DEFAULT_TOKENS.fontScale,
      glass:
        typeof parsed.glass === 'number' ? clamp(parsed.glass, 0, 40) : DEFAULT_TOKENS.glass,
    }
  } catch {
    return { ...DEFAULT_TOKENS }
  }
}

export function useThemeTokens() {
  const tokens = useState<DesignTokens>('design:tokens', () => readStored())
  const hydrated = useState<boolean>('design:tokens:hydrated', () => false)

  function apply() {
    if (!import.meta.client) return
    const el = document.documentElement
    const t = tokens.value

    // アクセント: 既存の indigo パレットへ流し込み、全体の強調色を変える。
    const accent = normalizeHex(t.accent)
    const shades: Record<string, string> = {
      300: mix(accent, WHITE, 0.5),
      400: mix(accent, WHITE, 0.24),
      500: accent.slice(1),
      600: mix(accent, BLACK, 0.16),
      700: mix(accent, BLACK, 0.32),
      800: mix(accent, BLACK, 0.48),
    }
    for (const [shade, hex] of Object.entries(shades)) {
      setVar(el, `--t-indigo-${shade}`, rgbTriple(`#${hex}`))
    }
    setVar(el, '--sycs-accent', accent)
    setVar(el, '--sycs-accent-rgb', rgbTriple(accent))

    // 角丸: Material 3 の shape トークンを一括で作り直す。
    const r = clamp(t.radius, 0, 28)
    setVar(el, '--md-sys-shape-corner-extra-small', `${(r * 0.45).toFixed(1)}px`)
    setVar(el, '--md-sys-shape-corner-small', `${(r * 0.65).toFixed(1)}px`)
    setVar(el, '--md-sys-shape-corner-medium', `${r.toFixed(1)}px`)
    setVar(el, '--md-sys-shape-corner-large', `${(r * 1.55).toFixed(1)}px`)
    setVar(el, '--md-sys-shape-corner-extra-large', `${(r * 2.2).toFixed(1)}px`)
    setVar(el, '--sycs-radius', `${r.toFixed(1)}px`)

    // 密度: デモとキット内の余白が揃って変わる。
    const pad = t.density === 'compact' ? '6px' : t.density === 'comfortable' ? '14px' : '10px'
    setVar(el, '--sycs-pad', pad)
    el.dataset.density = t.density

    // モーション
    const d = motionDurations(t.motion)
    setVar(el, '--sycs-duration-fast', d.fast)
    setVar(el, '--sycs-duration', d.base)
    setVar(el, '--sycs-duration-slow', d.slow)
    setVar(el, '--sycs-ease', t.motion === 'expressive'
      ? 'cubic-bezier(0.34, 1.56, 0.64, 1)'
      : 'cubic-bezier(0.4, 0, 0.2, 1)')
    el.dataset.motion = t.motion

    // 文字サイズ: rem ベースなので Tailwind 全体が追従する。
    setVar(el, '--sycs-font-scale', String(t.fontScale))
    el.style.fontSize = `${(16 * t.fontScale).toFixed(2)}px`

    // Liquid Glass
    setVar(el, '--lg-blur', `${clamp(t.glass, 0, 40)}px`)
    setVar(el, '--lg-sat', `${t.glass > 0 ? 160 + Math.min(40, t.glass) : 100}%`)
  }

  function persist() {
    if (!import.meta.client) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tokens.value))
    } catch {
      /* ignore */
    }
  }

  function hydrate() {
    if (hydrated.value) return
    hydrated.value = true
    if (!import.meta.client) return
    tokens.value = readStored()
    apply()
  }

  function patch(next: Partial<DesignTokens>) {
    tokens.value = {
      ...tokens.value,
      ...next,
      accent: next.accent ? normalizeHex(next.accent) : tokens.value.accent,
      radius: typeof next.radius === 'number' ? clamp(next.radius, 0, 28) : tokens.value.radius,
      fontScale:
        typeof next.fontScale === 'number'
          ? clamp(next.fontScale, 0.9, 1.2)
          : tokens.value.fontScale,
      glass: typeof next.glass === 'number' ? clamp(next.glass, 0, 40) : tokens.value.glass,
    }
    apply()
    persist()
  }

  function setAccent(hex: string) {
    patch({ accent: normalizeHex(hex) })
  }

  function reset() {
    if (import.meta.client) {
      const el = document.documentElement
      for (const prop of appliedProps) el.style.removeProperty(prop)
      appliedProps.clear()
      el.style.removeProperty('font-size')
      delete el.dataset.density
      delete el.dataset.motion
      localStorage.removeItem(STORAGE_KEY)
    }
    tokens.value = { ...DEFAULT_TOKENS }
  }

  return {
    tokens,
    hydrated,
    hydrate,
    apply,
    patch,
    setAccent,
    reset,
  }
}
