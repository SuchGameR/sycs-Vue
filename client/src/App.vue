<script setup lang="ts">
import { onMounted } from 'vue' // これを追加
import HelloWorld from './components/HelloWorld.vue'

// コンポーネントが読み込まれた時に実行される処理
onMounted(async () => {
  try {
    const response = await fetch('http://localhost:3000/')
    const data = await response.text()
    console.log('★サーバーからの応答:', data) // コンソールに表示
  } catch (error) {
    console.error('通信エラー:', error)
  }
})
</script>

<template>
  <div>
    <a href="https://vite.dev" target="_blank">
      <img src="/vite.svg" class="logo" alt="Vite logo" />
    </a>
    <a href="https://vuejs.org/" target="_blank">
      <img src="./assets/vue.svg" class="logo vue" alt="Vue logo" />
    </a>
  </div>
  <HelloWorld msg="Hello User! Welcome to SYCS!" />
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
