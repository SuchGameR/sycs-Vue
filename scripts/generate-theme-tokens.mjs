/**
 * テーマトークン生成スクリプト
 *
 *   npm run theme:generate
 *
 * @material/material-color-utilities (HCT / M3 スキーム) を使って
 * app/assets/css/themes.generated.css を生成する。
 *
 *  - Material 3   … 本家 material-web と同じ SchemeTonalSpot / Vibrant /
 *                  Expressive / Content / FruitSalad / Rainbow でロールを生成
 *  - LiquidGlass  … 寒色 seed + 透過/スペキュラ表現
 *  - Classic      … 現行 SYCS の実値をそのまま使う（ダークは見た目を完全維持）
 *
 * 出力は 100% 生成物。手で編集しないこと。
 */

import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import {
  Hct,
  argbFromHex,
  hexFromArgb,
  TonalPalette,
  CorePalette,
  SchemeTonalSpot,
  SchemeVibrant,
  SchemeExpressive,
  SchemeFruitSalad,
  SchemeContent,
  SchemeRainbow,
} from '@material/material-color-utilities'

const __dirname = dirname(fileURLToPath(import.meta.url))
// esbuild でバンドルすると import.meta.url がキャッシュ先を指すため、
// npm script (cwd = プロジェクト直下) からの実行を優先する。
const projectRoot = process.cwd()
const OUT = process.env.SYCS_THEME_OUT
  ? resolve(process.env.SYCS_THEME_OUT)
  : resolve(projectRoot, 'app/assets/css/themes.generated.css')

const SHADES = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950]

/* ------------------------------------------------------------------ */
/* ユーティリティ                                                       */
/* ------------------------------------------------------------------ */

const hexToTriple = (hexStr) => {
  const h = hexStr.replace('#', '')
  const f = h.length === 3 ? h.split('').map((c) => c + c).join('') : h
  return [parseInt(f.slice(0, 2), 16), parseInt(f.slice(2, 4), 16), parseInt(f.slice(4, 6), 16)]
}
/** ARGB int -> "R G B"（rgb(var(--x) / <alpha-value>) 前提） */
const rgb = (argb) => hexToTriple(hexFromArgb(argb)).join(' ')
const fromHex = (s) => rgb(argbFromHex(s))

/* ------------------------------------------------------------------ */
/* トーン対応表                                                        */
/* ------------------------------------------------------------------ */

/**
 * Tailwind の数値スケール (50=明 〜 950=暗) は全スキームで共通。
 * ライトテーマでは「明/暗」の極を反転させることで、
 *   text-slate-100 → 常に「明色の文字」
 *   bg-slate-900   → 常に「アプリの最背面」
 * を保ったまま、背景と前景のコントラストを成立させる。
 */
const NEUTRAL_TONE = {
  dark: { 50: 100, 100: 98, 200: 95, 300: 90, 400: 78, 500: 68, 600: 58, 700: 42, 800: 22, 900: 12, 950: 6 },
  light: { 50: 4, 100: 9, 200: 15, 300: 21, 400: 40, 500: 49, 600: 75, 700: 88, 800: 94, 900: 98, 950: 100 },
}

/**
 * アクセントは「塗りボタン bg-indigo-600 + 白文字」という既存パターン
 * (94 箇所) を成立させるため、白文字が読めるトーンに寄せる。
 * 本家 M3 ダークの primary は tone 80 (淡紫) だが、それだと白文字が通らない。
 */
const ACCENT_TONE = {
  dark: { 50: 100, 100: 92, 200: 85, 300: 78, 400: 68, 500: 55, 600: 48, 700: 38, 800: 28, 900: 20, 950: 12 },
  light: { 50: 10, 100: 20, 200: 28, 300: 34, 400: 40, 500: 46, 600: 52, 700: 66, 800: 82, 900: 92, 950: 98 },
}

/**
 * 枠線は面 (−t-) と別レンジを持たせる。
 * 例: ライトでは bg-slate-800 = 白 (カード) だが、
 *     border-slate-800 = 淡いグレー (仕切り) でなければ見えない。
 *
 * 単調ではないのは意図的な差別化:
 *   border-slate-700 … フォームの枠 (入力欄) なのではっきり見える色
 *   border-slate-800 … 仕切りだけなので控えめ
 */
const BORDER_TONE = {
  dark: { 50: 100, 100: 98, 200: 95, 300: 90, 400: 60, 500: 50, 600: 42, 700: 34, 800: 26, 900: 20, 950: 12 },
  light: { 50: 96, 100: 94, 200: 92, 300: 90, 400: 80, 500: 64, 600: 56, 700: 48, 800: 88, 900: 92, 950: 96 },
}

/* ------------------------------------------------------------------ */
/* Classic: Tailwind 公式値（ダークは現状と完全に同一）                 */
/* ------------------------------------------------------------------ */

const TAILWIND = {
  slate: { 50: '#f8fafc', 100: '#f1f5f9', 200: '#e2e8f0', 300: '#cbd5e1', 400: '#94a3b8', 500: '#64748b', 600: '#475569', 700: '#334155', 800: '#1e293b', 900: '#0f172a', 950: '#020617' },
  zinc: { 50: '#fafafa', 100: '#f4f4f5', 200: '#e4e4e7', 300: '#d4d4d8', 400: '#a1a1aa', 500: '#71717a', 600: '#52525b', 700: '#3f3f46', 800: '#27272a', 900: '#18181b', 950: '#09090b' },
  indigo: { 50: '#eef2ff', 100: '#e0e7ff', 200: '#c7d2fe', 300: '#a5b4fc', 400: '#818cf8', 500: '#6366f1', 600: '#4f46e5', 700: '#4338ca', 800: '#3730a3', 900: '#312e81', 950: '#1e1b4b' },
  red: { 50: '#fef2f2', 100: '#fee2e2', 200: '#fecaca', 300: '#fca5a5', 400: '#f87171', 500: '#ef4444', 600: '#dc2626', 700: '#b91c1c', 800: '#991b1b', 900: '#7f1d1d', 950: '#450a0a' },
  emerald: { 50: '#ecfdf5', 100: '#d1fae5', 200: '#a7f3d0', 300: '#6ee7b7', 400: '#34d399', 500: '#10b981', 600: '#059669', 700: '#047857', 800: '#065f46', 900: '#064e3b', 950: '#022c22' },
  green: { 50: '#f0fdf4', 100: '#dcfce7', 200: '#bbf7d0', 300: '#86efac', 400: '#4ade80', 500: '#22c55e', 600: '#16a34a', 700: '#15803d', 800: '#166534', 900: '#14532d', 950: '#052e16' },
  amber: { 50: '#fffbeb', 100: '#fef3c7', 200: '#fde68a', 300: '#fcd34d', 400: '#fbbf24', 500: '#f59e0b', 600: '#d97706', 700: '#b45309', 800: '#92400e', 900: '#78350f', 950: '#451a03' },
  orange: { 50: '#fff7ed', 100: '#ffedd5', 200: '#fed7aa', 300: '#fdba74', 400: '#fb923c', 500: '#f97316', 600: '#ea580c', 700: '#c2410c', 800: '#9a3412', 900: '#7c2d12', 950: '#431407' },
  sky: { 50: '#f0f9ff', 100: '#e0f2fe', 200: '#bae6fd', 300: '#7dd3fc', 400: '#38bdf8', 500: '#0ea5e9', 600: '#0284c7', 700: '#0369a1', 800: '#075985', 900: '#0c4a6e', 950: '#082f49' },
  cyan: { 50: '#ecfeff', 100: '#cffafe', 200: '#a5f3fc', 300: '#67e8f9', 400: '#22d3ee', 500: '#06b6d4', 600: '#0891b2', 700: '#0e7490', 800: '#155e75', 900: '#164e63', 950: '#083344' },
  purple: { 50: '#faf5ff', 100: '#f3e8ff', 200: '#e9d5ff', 300: '#d8b4fe', 400: '#c084fc', 500: '#a855f7', 600: '#9333ea', 700: '#7e22ce', 800: '#6b21a8', 900: '#581c87', 950: '#3b0764' },
  violet: { 50: '#f5f3ff', 100: '#ede9fe', 200: '#ddd6fe', 300: '#c4b5fd', 400: '#a78bfa', 500: '#8b5cf6', 600: '#7c3aed', 700: '#6d28d9', 800: '#5b21b6', 900: '#4c1d95', 950: '#2e1065' },
  fuchsia: { 50: '#fdf4ff', 100: '#fae8ff', 200: '#f5d0fe', 300: '#f0abfc', 400: '#e879f9', 500: '#d946ef', 600: '#c026d3', 700: '#a21caf', 800: '#86198f', 900: '#701a75', 950: '#4a044e' },
  pink: { 50: '#fdf2f8', 100: '#fce7f3', 200: '#fbcfe8', 300: '#f9a8d4', 400: '#f472b6', 500: '#ec4899', 600: '#db2777', 700: '#be185d', 800: '#9d174d', 900: '#831843', 950: '#500724' },
  rose: { 50: '#fff1f2', 100: '#ffe4e6', 200: '#fecdd3', 300: '#fda4af', 400: '#fb7185', 500: '#f43f5e', 600: '#e11d48', 700: '#be123c', 800: '#9f1239', 900: '#881337', 950: '#4c0519' },
  white: '#ffffff',
  black: '#000000',
}

/**
 * Classic の shade ランプは一切 invert しない。
 * shade 番号を反転させない理由:
 *   反転すると「bg-slate-200 がライトで暗面」になり、
 *   クラス名から前景/背景の明暗が判定できなくなる。
 * ライトへの切替は --md-sys-color-* ロール側だけで表現する。
 */

/** Classic のアプリ最背面。従来ハードコードされていた値をそのまま引き継ぐ。 */
const CLASSIC_APP_BG = { dark: '#0b0f19', light: '#f1f5f9' }

/** Classic ライトの境界線。Tailwind の淡い neutral を使う。 */
const CLASSIC_LIGHT_BORDER = {
  slate: { 50: '#e2e8f0', 100: '#e2e8f0', 200: '#e8edf4', 300: '#e2e8f0', 400: '#cbd5e1', 500: '#94a3b8', 600: '#cbd5e1', 700: '#cbd5e1', 800: '#e2e8f0', 900: '#e8edf4', 950: '#dbe2ec' },
  zinc: { 50: '#e4e4e7', 100: '#e4e4e7', 200: '#ececee', 300: '#e4e4e7', 400: '#d4d4d8', 500: '#a1a1aa', 600: '#d4d4d8', 700: '#d4d4d8', 800: '#e4e4e7', 900: '#ececee', 950: '#d9d9dd' },
}

const ACCENT_FAMILIES = ['indigo', 'red', 'emerald', 'green', 'amber', 'orange', 'sky', 'cyan', 'purple', 'violet', 'fuchsia', 'pink', 'rose']
const NEUTRAL_FAMILIES = ['slate', 'zinc']
const ALL_FAMILIES = [...NEUTRAL_FAMILIES, ...ACCENT_FAMILIES]

/* ------------------------------------------------------------------ */
/* M3 スキーム定義                                                      */
/* ------------------------------------------------------------------ */

const M3_SCHEMES = [
  { id: 'tonal-spot', label: 'Baseline', cls: SchemeTonalSpot, seed: '#6750A4' },
  { id: 'vibrant', label: 'Vibrant', cls: SchemeVibrant, seed: '#7D5260' },
  { id: 'expressive', label: 'Expressive', cls: SchemeExpressive, seed: '#635BFF' },
  { id: 'content', label: 'Content', cls: SchemeContent, seed: '#B465F9' },
  { id: 'fruit-salad', label: 'Fruit Salad', cls: SchemeFruitSalad, seed: '#B4E549' },
  { id: 'rainbow', label: 'Rainbow', cls: SchemeRainbow, seed: '#A4C9F0' },
]

const LIQUID_GLASS_SEEDS = [
  { id: 'sky', label: 'Sky', seed: '#0A84FF' },
  { id: 'indigo', label: 'Indigo', seed: '#5E5CE6' },
  { id: 'teal', label: 'Teal', seed: '#30B0C7' },
]

/** M3 公式ロールに無い accent（SYCS のオンライン表示・警告などに使用） */
const EXTRA_SEEDS = { success: '#2E7D57', warning: '#B2651A', info: '#1E6FA8' }

/**
 * v0.4 の DynamicScheme API:
 *   new SchemeTonalSpot(sourceColorHct, isDark, contrastLevel, specVersion?, platform?)
 * ロール色は number、パレットは TonalPalette として公開される。
 */
function makeM3(SchemeCls, seedHex) {
  const hct = Hct.fromInt(argbFromHex(seedHex))
  const sHue = Hct.fromInt(argbFromHex(EXTRA_SEEDS.success)).hue
  const wHue = Hct.fromInt(argbFromHex(EXTRA_SEEDS.warning)).hue
  const iHue = Hct.fromInt(argbFromHex(EXTRA_SEEDS.info)).hue
  return {
    make: (isDark) => new SchemeCls(hct, isDark, 0),
    success: TonalPalette.fromHueAndChroma(sHue, 40),
    success2: TonalPalette.fromHueAndChroma(sHue, 26),
    warning: TonalPalette.fromHueAndChroma(wHue, 48),
    warning2: TonalPalette.fromHueAndChroma(wHue, 32),
    info: TonalPalette.fromHueAndChroma(iHue, 44),
    info2: TonalPalette.fromHueAndChroma(iHue, 28),
  }
}

/* ------------------------------------------------------------------ */
/* トークン組み立て                                                    */
/* ------------------------------------------------------------------ */

function buildClassic(scheme) {
  const t = {}
  const isDark = scheme === 'dark'
  const put = (k, v) => { t[k] = v }

  // shade 番号の意味を保つため、ランプは一切 invert しない。
  for (const family of ALL_FAMILIES) {
    for (const s of SHADES) put(`--t-${family}-${s}`, fromHex(TAILWIND[family][s]))
  }
  put('--t-white', fromHex(TAILWIND.white))
  put('--t-black', fromHex(TAILWIND.black))

  // 枠線だけはライトで淡い仕切りにする（Tailwind 本来の slate-800 は濃すぎる）
  for (const family of NEUTRAL_FAMILIES) {
    for (const s of SHADES) {
      put(`--t-b-${family}-${s}`, isDark ? fromHex(TAILWIND[family][s]) : fromHex(CLASSIC_LIGHT_BORDER[family][s]))
    }
  }
  applySystemRoles(t, 'classic', isDark, null, null)
  return t
}

function buildM3(style, scheme, m3) {
  const t = {}
  const isDark = scheme === 'dark'
  const nTone = isDark ? NEUTRAL_TONE.dark : NEUTRAL_TONE.light
  const aTone = isDark ? ACCENT_TONE.dark : ACCENT_TONE.light
  const bTone = isDark ? BORDER_TONE.dark : BORDER_TONE.light
  const role = m3.make(isDark)

  const familyPalette = {
    slate: role.neutralPalette,
    zinc: role.neutralVariantPalette,
    indigo: role.primaryPalette,
    red: role.errorPalette,
    emerald: m3.success,
    green: m3.success2,
    amber: m3.warning,
    orange: m3.warning2,
    sky: m3.info,
    cyan: m3.info2,
    purple: role.tertiaryPalette,
    violet: role.tertiaryPalette,
    fuchsia: role.tertiaryPalette,
    pink: role.tertiaryPalette,
    rose: role.tertiaryPalette,
  }

  for (const family of ALL_FAMILIES) {
    const tone = NEUTRAL_FAMILIES.includes(family) ? nTone : aTone
    for (const s of SHADES) t[`--t-${family}-${s}`] = rgb(familyPalette[family].tone(tone[s]))
  }
  t['--t-white'] = fromHex('#ffffff')
  t['--t-black'] = fromHex('#000000')

  // 枠線は neutralVariant の outline-variant を基準にする
  for (const family of NEUTRAL_FAMILIES) {
    for (const s of SHADES) t[`--t-b-${family}-${s}`] = rgb(role.neutralVariantPalette.tone(bTone[s]))
  }

  applySystemRoles(t, style, isDark, role, m3)
  return t
}

/** M3 公式ロール（--md-sys-color-*） */
function applySystemRoles(t, style, isDark, role, m3) {
  const R = (k, v) => { t[`--md-sys-color-${k}`] = v }
  /** 既存のランプ値をそのままロールに割り当てる（Classic 用） */
  const T = (token) => t[token]

  if (role) {
    R('primary', rgb(role.primary))
    R('on-primary', rgb(role.onPrimary))
    R('primary-container', rgb(role.primaryContainer))
    R('on-primary-container', rgb(role.onPrimaryContainer))
    R('secondary', rgb(role.secondary))
    R('on-secondary', rgb(role.onSecondary))
    R('secondary-container', rgb(role.secondaryContainer))
    R('on-secondary-container', rgb(role.onSecondaryContainer))
    R('tertiary', rgb(role.tertiary))
    R('on-tertiary', rgb(role.onTertiary))
    R('tertiary-container', rgb(role.tertiaryContainer))
    R('on-tertiary-container', rgb(role.onTertiaryContainer))
    R('error', rgb(role.error))
    R('on-error', rgb(role.onError))
    R('error-container', rgb(role.errorContainer))
    R('on-error-container', rgb(role.onErrorContainer))
    R('surface', rgb(role.surface))
    R('on-surface', rgb(role.onSurface))
    R('surface-variant', rgb(role.surfaceVariant))
    R('on-surface-variant', rgb(role.onSurfaceVariant))
    R('surface-dim', rgb(role.surfaceDim))
    R('surface-bright', rgb(role.surfaceBright))
    R('surface-container-lowest', rgb(role.surfaceContainerLowest))
    R('surface-container-low', rgb(role.surfaceContainerLow))
    R('surface-container', rgb(role.surfaceContainer))
    R('surface-container-high', rgb(role.surfaceContainerHigh))
    R('surface-container-highest', rgb(role.surfaceContainerHighest))
    R('outline', rgb(role.outline))
    R('outline-variant', rgb(role.outlineVariant))
    R('inverse-surface', rgb(role.inverseSurface))
    R('inverse-on-surface', rgb(role.inverseOnSurface))
    R('inverse-primary', rgb(role.inversePrimary))
    R('scrim', rgb(role.scrim))
    R('shadow', rgb(role.shadow))
    R('surface-tint', rgb(role.surfaceTint))
    R('primary-dim', rgb(role.primaryDim))
    R('primary-fixed', rgb(role.primaryFixed))
    R('on-primary-fixed', rgb(role.onPrimaryFixed))
    R('primary-fixed-dim', rgb(role.primaryFixedDim))
    R('on-primary-fixed-variant', rgb(role.onPrimaryFixedVariant))
    R('secondary-fixed', rgb(role.secondaryFixed))
    R('on-secondary-fixed', rgb(role.onSecondaryFixed))
    R('on-secondary-fixed-variant', rgb(role.onSecondaryFixedVariant))
    R('tertiary-fixed', rgb(role.tertiaryFixed))
    R('on-tertiary-fixed', rgb(role.onTertiaryFixed))
    R('on-tertiary-fixed-variant', rgb(role.onTertiaryFixedVariant))
    R('background', rgb(role.background))
    R('on-background', rgb(role.onBackground))

    // SYCS 拡張ロール（M3 公式に無い success / warning / info）
    R('success', rgb(m3.success.tone(isDark ? 80 : 40)))
    R('on-success', rgb(m3.success.tone(isDark ? 20 : 100)))
    R('success-container', rgb(m3.success.tone(isDark ? 30 : 90)))
    R('on-success-container', rgb(m3.success.tone(isDark ? 90 : 10)))
    R('warning', rgb(m3.warning.tone(isDark ? 80 : 40)))
    R('on-warning', rgb(m3.warning.tone(isDark ? 20 : 100)))
    R('warning-container', rgb(m3.warning.tone(isDark ? 30 : 90)))
    R('on-warning-container', rgb(m3.warning.tone(isDark ? 90 : 10)))
    R('info', rgb(m3.info.tone(isDark ? 80 : 40)))
    R('on-info', rgb(m3.info.tone(isDark ? 20 : 100)))
    R('info-container', rgb(m3.info.tone(isDark ? 30 : 90)))
    R('on-info-container', rgb(m3.info.tone(isDark ? 90 : 10)))
  } else {
    // Classic: 既存ランプを M3 のロール名に対応させる
    R('primary', T('--t-indigo-600'))
    R('on-primary', T('--t-white'))
    R('primary-container', T(isDark ? '--t-indigo-900' : '--t-indigo-100'))
    R('on-primary-container', T(isDark ? '--t-indigo-200' : '--t-indigo-800'))
    R('secondary', T('--t-zinc-600'))
    R('on-secondary', T('--t-white'))
    R('secondary-container', T('--t-zinc-800'))
    R('on-secondary-container', T('--t-zinc-200'))
    R('tertiary', T('--t-sky-500'))
    R('on-tertiary', T('--t-white'))
    R('tertiary-container', T('--t-sky-900'))
    R('on-tertiary-container', T('--t-sky-200'))
    R('error', T('--t-red-500'))
    R('on-error', T('--t-white'))
    R('error-container', T('--t-red-900'))
    R('on-error-container', T('--t-red-200'))

    // Classic の面。ダークは Tailwind の slate をそのまま、ライトは淡い面に差し替える。
    const S = isDark
      ? { dim: '#020617', lowest: '#020617', low: '#0f172a', surface: '#0b0f19', container: '#1e293b', high: '#334155', highest: '#334155', bright: '#1e293b', on: '#e2e8f0', onVariant: '#94a3b8', outline: '#64748b', outlineVariant: '#1e293b' }
      : { dim: '#e2e8f0', lowest: '#ffffff', low: '#f8fafc', surface: '#f1f5f9', container: '#ffffff', high: '#e2e8f0', highest: '#cbd5e1', bright: '#ffffff', on: '#1e293b', onVariant: '#475569', outline: '#94a3b8', outlineVariant: '#e2e8f0' }

    R('surface', fromHex(CLASSIC_APP_BG[isDark ? 'dark' : 'light']))
    R('on-surface', fromHex(S.on))
    R('surface-variant', fromHex(S.container))
    R('on-surface-variant', fromHex(S.onVariant))
    R('surface-dim', fromHex(S.dim))
    R('surface-bright', fromHex(S.bright))
    R('surface-container-lowest', fromHex(S.lowest))
    R('surface-container-low', fromHex(S.low))
    R('surface-container', fromHex(S.container))
    R('surface-container-high', fromHex(S.high))
    R('surface-container-highest', fromHex(S.highest))
    R('outline', fromHex(S.outline))
    R('outline-variant', fromHex(S.outlineVariant))
    R('inverse-surface', fromHex(isDark ? '#e2e8f0' : '#0b0f19'))
    R('inverse-on-surface', fromHex(isDark ? '#0b0f19' : '#e2e8f0'))
    R('inverse-primary', fromHex(isDark ? '#a5b4fc' : '#312e81'))
    R('scrim', fromHex('#000000'))
    R('shadow', fromHex('#000000'))
    R('surface-tint', T('--t-indigo-600'))
    R('primary-dim', fromHex(isDark ? '#3730a3' : '#312e81'))
    R('background', fromHex(CLASSIC_APP_BG[isDark ? 'dark' : 'light']))
    R('on-background', fromHex(S.on))

    R('success', T('--t-emerald-500'))
    R('on-success', T('--t-white'))
    R('success-container', T('--t-emerald-900'))
    R('on-success-container', T('--t-emerald-200'))
    R('warning', T('--t-amber-500'))
    R('on-warning', T('--t-white'))
    R('warning-container', T('--t-amber-900'))
    R('on-warning-container', T('--t-amber-200'))
    R('info', T('--t-sky-500'))
    R('on-info', T('--t-white'))
    R('info-container', T('--t-sky-900'))
    R('on-info-container', T('--t-sky-200'))
  }

  // State layer opacities（M3 公式値）
  t['--md-sys-state-hover'] = '0.08'
  t['--md-sys-state-focus'] = '0.10'
  t['--md-sys-state-pressed'] = '0.10'
  t['--md-sys-state-drag'] = '0.16'

  // Shape scale
  const shape = {
    'corner-none': '0px',
    'corner-extra-small': '4px',
    'corner-small': '8px',
    'corner-medium': style === 'material3' ? '12px' : '10px',
    'corner-large': style === 'material3' ? '16px' : '12px',
    'corner-extra-large': style === 'material3' ? '28px' : '16px',
    'corner-full': '9999px',
  }
  for (const [k, v] of Object.entries(shape)) t[`--md-sys-shape-${k}`] = v

  if (style === 'material3') {
    // M3 elevation: 影ではなく主题色の重ね合わせで高さを表す
    R('elevation-0', 'rgb(0 0 0 / 0)')
    R('elevation-1', 'rgb(0 0 0 / 0.05)')
    R('elevation-2', 'rgb(0 0 0 / 0.08)')
    R('elevation-3', 'rgb(0 0 0 / 0.11)')
    R('elevation-4', 'rgb(0 0 0 / 0.12)')
    R('elevation-5', 'rgb(0 0 0 / 0.14)')
  }

  if (style === 'liquid-glass') {
    t['--lg-blur'] = isDark ? '24px' : '20px'
    t['--lg-sat'] = isDark ? '190%' : '180%'
    t['--lg-tint'] = isDark ? 'rgba(26, 32, 50, 0.55)' : 'rgba(255, 255, 255, 0.55)'
    t['--lg-tint-strong'] = isDark ? 'rgba(16, 21, 36, 0.74)' : 'rgba(255, 255, 255, 0.78)'
    t['--lg-tint-thin'] = isDark ? 'rgba(44, 52, 76, 0.38)' : 'rgba(255, 255, 255, 0.38)'
    t['--lg-specular'] = isDark
      ? 'inset 0 1px 0 0 rgb(255 255 255 / 0.16), inset 0 0 0 0.5px rgb(255 255 255 / 0.10), inset 0 -1px 0 0 rgb(0 0 0 / 0.28)'
      : 'inset 0 1px 0 0 rgb(255 255 255 / 0.90), inset 0 0 0 0.5px rgb(255 255 255 / 0.60), inset 0 -1px 0 0 rgb(0 0 0 / 0.05)'
    t['--lg-specular-strong'] = isDark
      ? 'inset 0 1px 0 0 rgb(255 255 255 / 0.28), inset 0 0 0 0.75px rgb(255 255 255 / 0.18), inset 0 -1px 0 0 rgb(0 0 0 / 0.32)'
      : 'inset 0 1px 0 0 rgb(255 255 255 / 0.98), inset 0 0 0 0.75px rgb(255 255 255 / 0.82), inset 0 -1px 0 0 rgb(0 0 0 / 0.06)'
    t['--lg-shadow'] = isDark
      ? '0 1px 2px rgb(0 0 0 / 0.30), 0 8px 24px rgb(0 0 0 / 0.38)'
      : '0 1px 2px rgb(15 23 42 / 0.06), 0 8px 24px rgb(15 23 42 / 0.10)'
  }
}

/* ------------------------------------------------------------------ */
/* 出力                                                                */
/* ------------------------------------------------------------------ */

function build() {
  const blocks = []
  const add = (selector, tokens) => blocks.push({ selector, tokens })

  for (const scheme of ['light', 'dark']) {
    add(`html[data-style="classic"][data-scheme="${scheme}"]`, buildClassic(scheme))
  }

  for (const def of M3_SCHEMES) {
    const m3 = makeM3(def.cls, def.seed)
    for (const scheme of ['light', 'dark']) {
      add(`html[data-style="material3"][data-scheme="${scheme}"][data-seed="${def.id}"]`, buildM3('material3', scheme, m3))
    }
  }
  {
    const m3 = makeM3(M3_SCHEMES[0].cls, M3_SCHEMES[0].seed)
    for (const scheme of ['light', 'dark']) {
      add(`html[data-style="material3"][data-scheme="${scheme}"]:not([data-seed])`, buildM3('material3', scheme, m3))
    }
  }

  for (const def of LIQUID_GLASS_SEEDS) {
    const m3 = makeM3(SchemeTonalSpot, def.seed)
    for (const scheme of ['light', 'dark']) {
      add(`html[data-style="liquid-glass"][data-scheme="${scheme}"][data-seed="${def.id}"]`, buildM3('liquid-glass', scheme, m3))
    }
  }
  {
    const m3 = makeM3(SchemeTonalSpot, LIQUID_GLASS_SEEDS[0].seed)
    for (const scheme of ['light', 'dark']) {
      add(`html[data-style="liquid-glass"][data-scheme="${scheme}"]:not([data-seed])`, buildM3('liquid-glass', scheme, m3))
    }
  }

  const body = blocks
    .map(({ selector, tokens }) =>
      `${selector} {\n${Object.entries(tokens).map(([k, v]) => `  ${k}: ${v};`).join('\n')}\n}\n`
    )
    .join('\n')

  const header = `/* eslint-disable */
/* prettier-ignore */
/**
 * AUTO-GENERATED — DO NOT EDIT BY HAND
 * scripts/generate-theme-tokens.mjs  (@material/material-color-utilities)
 *   npm run theme:generate
 */

`

  writeFileSync(OUT, header + body, 'utf8')
  const vars = Object.keys(blocks[0].tokens).length
  process.stdout.write(`themes.generated.css を生成: ${blocks.length} ブロック x ${vars} 変数\n`)
}

build()
