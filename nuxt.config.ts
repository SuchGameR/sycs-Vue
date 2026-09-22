import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  runtimeConfig: {
    phpApiBase: process.env.PHP_API_BASE || '',
    phpApiParam: process.env.PHP_API_PARAM || 'api',
    phpBridgeSecret: process.env.PHP_BRIDGE_SECRET || '',
    phpStaticCookie: process.env.PHP_STATIC_COOKIE || '',
    phpForwardCookie: process.env.PHP_FORWARD_COOKIE !== 'false',
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

  app: {
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

  // コンポーネントの設定を削除（デフォルトで ~/components が自動認識されるため）
  
  tailwindcss: {
    exposeConfig: true,
    viewer: true
  }
})