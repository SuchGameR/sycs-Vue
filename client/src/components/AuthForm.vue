<script setup lang="ts">
import { ref } from 'vue'

// 入力された文字を「覚える」ための変数 (ref)
const username = ref('')
const password = ref('')

// サーバーに送る関数
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
        alert(result); // 成功！などのメッセージを出す
    } catch (error) {
        alert('エラーが発生しました');
    }
}
</script>

<template>
  <div class="auth-box">
    <h2>SYCS ログイン / 新規登録</h2>
    <input v-model="username" placeholder="ユーザー名" type="text" />
    <input v-model="password" placeholder="パスワード" type="password" />
    <button @click="handleSignup">新規登録</button>
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