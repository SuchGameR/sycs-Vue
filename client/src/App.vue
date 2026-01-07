<script setup lang="ts">
import AuthForm from './components/AuthForm.vue' // これをインポート！
</script>

<template>
  <div class="container">
    <header>
      <h1>SYCS - Communication System</h1>
    </header>

    <main>
      <!-- 作ったコンポーネントを表示します -->
      <AuthForm />
    </main>
  </div>
</template>

<style scoped>
.container {
  text-align: center;
  padding: 20px;
}
header {
  margin-bottom: 40px;
}
</style>