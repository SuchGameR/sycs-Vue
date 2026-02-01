<script setup lang="ts">
import { ref, onMounted } from 'vue'
import AuthForm from './components/AuthForm.vue'
import MainLayout from './components/MainLayout.vue'

import { authFetch } from './utils/api'

// グローバルなログイン状態管理
const isLoggedIn = ref(false)
const currentUser = ref<{ id: number, uuid: string, username: string, avatar_url?: string } | null>(null)

// 起動時に保存されたセッションを確認
onMounted(async () => {
  try {
    const response = await authFetch('http://localhost:3000/api/me')
    if (response.ok) {
      const user = await response.json()
      currentUser.value = user
      isLoggedIn.value = true
    }
  } catch (e) {
    console.error('Failed to auto-login', e)
  }
})

// ログイン成功時の処理
const handleLoginSuccess = (data: { user: { id: number, uuid: string, username: string, avatar_url?: string } }) => {
  isLoggedIn.value = true
  currentUser.value = data.user
}

// ユーザー情報の更新ハンドラ
const handleUserUpdate = (updatedUser: any) => {
  currentUser.value = updatedUser
}

// ログアウト処理
const handleLogout = async () => {
  try {
    await authFetch('http://localhost:3000/api/logout', { method: 'POST' })
  } catch (e) {
    console.error('Logout failed on server', e)
  }
  isLoggedIn.value = false
  currentUser.value = null
}
</script>

<template>
  <!-- ログイン前後のレイアウトを分離 -->
  <div v-if="!isLoggedIn" class="auth-container">
    <!-- <header>
      <h1>SYCS - Communication System</h1>
    </header> -->
    <main>
      <AuthForm @login-success="handleLoginSuccess" />
    </main>
  </div>

  <template v-else>
    <!-- ログイン済みなら全画面の MainLayout を表示 -->
    <MainLayout :user="currentUser!" @logout="handleLogout" @update-user="handleUserUpdate" />
  </template>
</template>

<style scoped>
body {
  margin: 0;
  padding: 0;
  background-color: #1a1a1a;
}

.auth-container {
  text-align: center;
  padding: 40px 20px;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background-color: #1a1a1a;
}
header {
  margin-bottom: 40px;
}
h1 {
  color: #646cff;
}
</style>