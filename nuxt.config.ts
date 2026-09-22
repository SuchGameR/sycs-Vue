import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  // GitHub Pages（プロジェクトサイト）用
  // ユーザーサイトにする場合は baseURL: '/' に戻す
  // 設定をやめるときは baseURL の条件分岐と下記 nitro / routeRules を削除すればOK
  app: {
    baseURL: process.env.GITHUB_PAGES === 'true' || process.env.NITRO_PRESET === 'static'
      ? '/SYCS/'
      : '/',
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

  // コンポーネントの設定を削除（デフォルトで ~/components が自動認識されるため）

  nitro: {
    // GitHub Actions の generate 時に static プリセットを使う
    preset: process.env.NITRO_PRESET === 'static' ? 'static' : undefined,
  },

  // 静的生成時、API ルートはプリレンダーしない（DB 不要でビルドを通す）
  routeRules: {
    '/api/**': { prerender: false },
  },

  tailwindcss: {
    exposeConfig: true,
    viewer: true
  }
})
