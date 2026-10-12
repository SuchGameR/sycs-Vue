import { defineNuxtConfig } from 'nuxt/config'

const isStaticPages =
  process.env.GITHUB_PAGES === 'true' || process.env.NITRO_PRESET === 'static'

const baseURL = isStaticPages ? '/sycs-Vue/' : '/'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  // DevTools adds runtime hooks + client code to every page load.
  // Opt in with NUXT_DEVTOOLS=true when needed.
  devtools: { enabled: process.env.NUXT_DEVTOOLS === 'false' },

  runtimeConfig: {
    phpApiBase: process.env.PHP_API_BASE || '',
    phpApiParam: process.env.PHP_API_PARAM || 'api',
    phpBridgeSecret: process.env.PHP_BRIDGE_SECRET || '',
    phpStaticCookie: process.env.PHP_STATIC_COOKIE || '',
    phpForwardCookie: process.env.PHP_FORWARD_COOKIE !== 'false',
  },
  // GitHub Pages（プロジェクトサイト）: リポジトリ名は sycs-Vue
  // ユーザーサイトにする場合は baseURL: '/' に戻す
  // 設定をやめるときは baseURL の条件分岐と下記 nitro / routeRules を削除すればOK
  app: {
    baseURL,
    // ページ遷移はフェードのみ (app.css の .page-* とセット)。
    // transform を使わないのは、ページ内の position:fixed 要素が新しい
    // containing block に巻き込まれないようにするため。
    pageTransition: { name: 'page', mode: 'out-in' },
    head: {
      title: 'SYCS - Ultra Modern Chat & SNS',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no, viewport-fit=cover' },
        // ホーム画面に追加したときの standalone 起動 / ステータスバー。
        // black-translucent なのでコンテンツはステータスバー下まで伸び、
        // 上端は --app-safe-top でかわす。
        { name: 'theme-color', content: '#0b0f19' },
        { name: 'mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
        { name: 'apple-mobile-web-app-title', content: 'SYCS' }
      ],
      link: [
        { rel: 'manifest', href: `${baseURL}manifest.webmanifest` },
        { rel: 'apple-touch-icon', href: `${baseURL}icons/apple-touch-icon.png` },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&family=Noto+Sans+JP:wght@300;400;500;700&display=swap' }
      ],
      script: [
        {
          // 描画前にテーマを確定させる。CSS の読み込みを待つ必要がないよう
          // データ属性だけを書く同期 script。
          // seed も必ず書き出す (M3 / Liquid Glass の CSS ブロックは
          // [data-seed] セレクタなので、欠けると変数が一つも当たらない)。
          innerHTML: `(function(){try{var s=localStorage.getItem('sycs:theme-style');var q=localStorage.getItem('sycs:theme-scheme');var d=localStorage.getItem('sycs:theme-seed');var r=/^(classic|material3|liquid-glass)$/.test(s)?s:'classic';var m=q==='light'||q==='dark'?q:(q==='system'?(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'):'dark');var u=/^(tonal-spot|vibrant|expressive|content|fruit-salad|rainbow|sky|indigo|teal)$/.test(d)?d:(r==='liquid-glass'?'sky':'tonal-spot');var e=document.documentElement;e.dataset.style=r;e.dataset.scheme=m;e.dataset.seed=u;e.dataset.theme=r+':'+m}catch(_){}})()`,
          tagPosition: 'head',
          tagPriority: 'critical',
        }
      ]
    }
  },

  vite: {
    resolve: {
      alias: {
        'opentype.js': 'opentype.js/dist/opentype.mjs'
      }
    },
    server: {
      watch: {
        usePolling: true
      }
    }
  },

  watchers: {
    chokidar: {
      usePolling: true
    }
  },

  modules: ['@nuxtjs/tailwindcss', '@nuxt/icon'],

  css: ['~/assets/css/theme.css', '~/assets/css/app.css'],

  nitro: {
    // GitHub Actions の generate 時に static プリセットを使う
    preset: process.env.NITRO_PRESET === 'static' ? 'static' : undefined,
    // gzip/brotli 圧縮で API レスポンスと静的アセットの読み込みを高速化
    compressPublicAssets: true,
  },

  // 静的生成時: API は出さない・ページのプリレンダーで API/DB に依存しない
  routeRules: {
    '/api/**': { prerender: false },
    '/**': isStaticPages ? { prerender: true } : undefined,
  },

  // SPA フォールバック寄りの静的出力（DB 無しでも generate を通しやすくする）
  ssr: isStaticPages ? false : true,

  tailwindcss: {
    exposeConfig: true,
    viewer: true
  }
})
