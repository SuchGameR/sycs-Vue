<script setup lang="ts">
import { ref } from 'vue'

// 入力された文字を「覚える」ための変数 (ref)
const username = ref('')
const password = ref('')

// ログイン状態を管理する変数
const isLoggedIn = ref(false)
const loggedInUser = ref('')

// 新規登録
const handleSignup = async () => {
    try {
        const response = await fetch('http://localhost:3000/api/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: username.value,
                password: password.value
            })
        });
        const result = await response.text();
        alert(result);
    } catch (error) {
        alert('登録エラーが発生しました');
    }
}

// ログイン
const handleLogin = async () => {
    try {
        const response = await fetch('http://localhost:3000/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: username.value,
                password: password.value
            })
        });
        
        if (response.ok) {
            isLoggedIn.value = true;
            loggedInUser.value = username.value;
            alert('ログインしました！');
        } else {
            const errorText = await response.text();
            alert('ログイン失敗: ' + errorText);
        }
    } catch (error) {
        alert('通信エラーが発生しました');
    }
}

// ログアウト
const handleLogout = () => {
    isLoggedIn.value = false;
    loggedInUser.value = '';
    username.value = '';
    password.value = '';
    alert('ログアウトしました');
}
</script>

<template>
  <div class="auth-box">
    <!-- ログインしていない時 -->
    <div v-if="!isLoggedIn">
      <h2>SYCS ログイン / 新規登録</h2>
      <input v-model="username" placeholder="ユーザー名" type="text" />
      <input v-model="password" placeholder="パスワード" type="password" />
      <div class="button-group">
        <button @click="handleLogin">ログイン</button>
        <button @click="handleSignup" class="secondary">新規登録</button>
      </div>
    </div>

    <!-- ログインしている時 -->
    <div v-else>
      <h2>ようこそ、{{ loggedInUser }} さん！</h2>
      <p>現在ログイン中です。</p>
      <button @click="handleLogout">ログアウト</button>
    </div>
  </div>
</template>

<style scoped>
.auth-box {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-width: 300px;
  margin: auto;
}
</style>