import { defineNuxtConfig } from 'nuxt/config'

const isStaticPages =
  process.env.GITHUB_PAGES === 'true' || process.env.NITRO_PRESET === 'static'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

<<<<<<< HEAD
  // GitHub Pages（プロジェクトサイト）: リポジトリ名は sycs-Vue
  // ローカル dev では baseURL は '/' のまま
=======
  runtimeConfig: {
    phpApiBase: process.env.PHP_API_BASE || '',
    phpApiParam: process.env.PHP_API_PARAM || 'api',
    phpBridgeSecret: process.env.PHP_BRIDGE_SECRET || '',
    phpStaticCookie: process.env.PHP_STATIC_COOKIE || '',
    phpForwardCookie: process.env.PHP_FORWARD_COOKIE !== 'false',
  },

  // GitHub Pages（プロジェクトサイト）用
  // ユーザーサイトにする場合は baseURL: '/' に戻す
  // 設定をやめるときは baseURL の条件分岐と下記 nitro / routeRules を削除すればOK
>>>>>>> 8870eae (hmm)
  app: {
    baseURL: isStaticPages ? '/sycs-Vue/' : '/',
    head: {
      title: 'SYCS - Ultra Modern Chat & SNS',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' }
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&family=Noto+Sans+JP:wght@300;400;500;700&display=swap' }
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

  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxt/icon',
    '@nuxtjs/color-mode'
  ],

  css: ['~/assets/css/app.css'],

  nitro: {
    preset: isStaticPages ? 'static' : undefined,
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
