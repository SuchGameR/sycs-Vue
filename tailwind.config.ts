import type { Config } from 'tailwindcss'

/**
 * カラーパレットを CSS 変数に差し替える。
 *
 * app/ には hard-coded な Tailwind カラークラス (bg-slate-800 / text-indigo-400 …) が
 * 1500 箇所以上ある。すべてをセマンティックトークンに書き換えると差分が大きくなりすぎるため、
 * ここでは「色のパレット自体」を CSS 変数に紐付ける。
 *
 *   .bg-slate-800  ->  background-color: rgb(var(--t-slate-800) / <alpha-value>)
 *
 * こうすると themes.generated.css 側で 1 変数を書き換えるだけで
 * 1500 箇所すべてが同時にテーマ追従する。
 *
 * 変数の実体は app/assets/css/themes.generated.css (npm run theme:generate)。
 */

/** `rgb(var(--t-slate-800) / <alpha-value>)` を生成する */
const ramp = (family: string, prefix = '--t') =>
  Object.fromEntries(
    [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950].map((shade) => [
      shade,
      `rgb(var(${prefix}-${family}-${shade}) / <alpha-value>)`,
    ])
  )

const TOKEN_FAMILIES = [
  'slate',
  'zinc',
  'indigo',
  'red',
  'emerald',
  'green',
  'amber',
  'orange',
  'sky',
  'cyan',
  'purple',
  'violet',
  'fuchsia',
  'pink',
  'rose',
] as const

const color = Object.fromEntries(TOKEN_FAMILIES.map((f) => [f, ramp(f)])) as Record<
  (typeof TOKEN_FAMILIES)[number],
  Record<number, string>
>

/**
 * 枠線だけを別レンジ (--t-b-*) に差し替える。
 *
 * ライトテーマでは同じTailwind シェードでも
 *   bg-slate-800    = 白いカード
 *   border-slate-800 = 淡い仕切り
 * と役割が真逆になるため、color と borderColor を分けて定義する。
 */
const borderColor = {
  ...color,
  slate: ramp('slate', '--t-b'),
  zinc: ramp('zinc', '--t-b'),
}

export default <Partial<Config>>{
  darkMode: 'class',
  content: [
    `./components/**/*.{vue,js,ts}`,
    `./layouts/**/*.vue`,
    `./pages/**/*.vue`,
    `./plugins/**/*.{vue,js,ts}`,
    `./composables/**/*.{vue,js,ts}`,
    `./utils/**/*.{js,ts}`,
    `./App.{js,ts,vue}`,
    `./app.{js,ts,vue}`,
    `./Error.{js,ts,vue}`,
    `./error.{js,ts,vue}`,
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Noto Sans JP', 'sans-serif'],
      },
      colors: {
        ...color,
        white: 'rgb(var(--t-white) / <alpha-value>)',
        black: 'rgb(var(--t-black) / <alpha-value>)',
        brand: {
          50: '#f5f3ff',
          100: '#edd1ff',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7e22ce',
        },
        // M3 ロール名でも Tailwind クラスが使えるようにする
        // 例: bg-surface-container / text-on-surface-variant / border-outline
        surface: {
          DEFAULT: 'rgb(var(--md-sys-color-surface) / <alpha-value>)',
          dim: 'rgb(var(--md-sys-color-surface-dim) / <alpha-value>)',
          bright: 'rgb(var(--md-sys-color-surface-bright) / <alpha-value>)',
          variant: 'rgb(var(--md-sys-color-surface-variant) / <alpha-value>)',
          'container-lowest': 'rgb(var(--md-sys-color-surface-container-lowest) / <alpha-value>)',
          'container-low': 'rgb(var(--md-sys-color-surface-container-low) / <alpha-value>)',
          container: 'rgb(var(--md-sys-color-surface-container) / <alpha-value>)',
          'container-high': 'rgb(var(--md-sys-color-surface-container-high) / <alpha-value>)',
          'container-highest': 'rgb(var(--md-sys-color-surface-container-highest) / <alpha-value>)',
        },
        'on-surface': {
          DEFAULT: 'rgb(var(--md-sys-color-on-surface) / <alpha-value>)',
          variant: 'rgb(var(--md-sys-color-on-surface-variant) / <alpha-value>)',
        },
        outline: {
          DEFAULT: 'rgb(var(--md-sys-color-outline) / <alpha-value>)',
          variant: 'rgb(var(--md-sys-color-outline-variant) / <alpha-value>)',
        },
      },
      borderColor,
      borderRadius: {
        'm3-xs': 'var(--md-sys-shape-corner-extra-small)',
        'm3-sm': 'var(--md-sys-shape-corner-small)',
        'm3-md': 'var(--md-sys-shape-corner-medium)',
        'm3-lg': 'var(--md-sys-shape-corner-large)',
        'm3-xl': 'var(--md-sys-shape-corner-extra-large)',
        // Liquid Glass: 連続曲線の隅丸
        glass: '22px',
      },
      boxShadow: {
        // M3 は影ではなく主题色の重ね合わせで高さを表す
        'm3-1': '0 1px 2px 0 rgb(var(--md-sys-color-shadow) / 0.10), 0 1px 3px 1px rgb(var(--md-sys-color-shadow) / 0.08)',
        'm3-2': '0 1px 2px 0 rgb(var(--md-sys-color-shadow) / 0.12), 0 2px 6px 2px rgb(var(--md-sys-color-shadow) / 0.10)',
        'm3-3': '0 4px 8px 3px rgb(var(--md-sys-color-shadow) / 0.12), 0 1px 3px 0 rgb(var(--md-sys-color-shadow) / 0.16)',
        glass: 'var(--lg-shadow, 0 8px 24px rgb(0 0 0 / 0.16))',
      },
      backdropBlur: {
        glass: 'var(--lg-blur, 20px)',
      },
      backdropSaturate: {
        glass: 'var(--lg-sat, 180%)',
      },
    },
  },
  plugins: [],
}
