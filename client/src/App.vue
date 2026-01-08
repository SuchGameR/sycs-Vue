<script setup lang="ts">
import { ref, onMounted } from 'vue'
import AuthForm from './components/AuthForm.vue'
import MainLayout from './components/MainLayout.vue'

// グローバルなログイン状態管理
const isLoggedIn = ref(false)
const currentUser = ref<{ id: number, uuid: string, username: string, avatar_url?: string } | null>(null)

// 起動時に保存されたセッションを確認
onMounted(() => {
  const savedUser = localStorage.getItem('sycs_user')
  if (savedUser) {
    try {
      currentUser.value = JSON.parse(savedUser)
      isLoggedIn.value = true
    } catch (e) {
      localStorage.removeItem('sycs_user')
    }
  }
})

// ログイン成功時の処理
const handleLoginSuccess = (user: { id: number, uuid: string, username: string, avatar_url?: string }) => {
  isLoggedIn.value = true
  currentUser.value = user
  localStorage.setItem('sycs_user', JSON.stringify(user)) // 保存
}

// ユーザー情報の更新ハンドラ
const handleUserUpdate = (updatedUser: any) => {
  currentUser.value = updatedUser
  localStorage.setItem('sycs_user', JSON.stringify(updatedUser))
}

// ログアウト処理
const handleLogout = () => {
  isLoggedIn.value = false
  currentUser.value = null
  localStorage.removeItem('sycs_user') // 削除
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