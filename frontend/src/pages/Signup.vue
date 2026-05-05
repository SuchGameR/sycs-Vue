<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useRouter } from 'vue-router';

const username = ref('');
const email = ref('');
const password = ref('');
const error = ref('');
const authStore = useAuthStore();
const router = useRouter();

async function handleSignup() {
  try {
    await authStore.signup(username.value, email.value, password.value);
    router.push('/');
  } catch (err: any) {
    error.value = err.message;
  }
}
</script>

<template>
  <div class="auth-page">
    <div class="auth-card">
      <h1>サインアップ</h1>
      <form @submit.prevent="handleSignup">
        <div class="form-group">
          <label>ユーザー名</label>
          <input v-model="username" type="text" required />
        </div>
        <div class="form-group">
          <label>メールアドレス</label>
          <input v-model="email" type="email" required />
        </div>
        <div class="form-group">
          <label>パスワード</label>
          <input v-model="password" type="password" required />
        </div>
        <p v-if="error" class="error">{{ error }}</p>
        <button type="submit">サインアップ</button>
      </form>
      <p class="auth-footer">
        すでにアカウントをお持ちですか？ <router-link to="/signin">サインイン</router-link>
      </p>
    </div>
  </div>
</template>

<style scoped>
.auth-page {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: var(--primary);
}
.auth-card {
  background: var(--secondary);
  padding: 2rem;
  border-radius: 8px;
  width: 100%;
  max-width: 400px;
  color: white;
}
h1 {
  color: white;
  margin-bottom: 1.5rem;
  text-align: center;
}
.form-group {
  margin-bottom: 1rem;
  text-align: left;
}
label {
  display: block;
  margin-bottom: 0.5rem;
}
input {
  width: 100%;
  padding: 0.5rem;
  border-radius: 4px;
  border: 1px solid #444;
  background: #333;
  color: white;
}
button {
  width: 100%;
  margin-top: 1rem;
  background-color: var(--accent);
}
.error {
  color: #ff6b6b;
  margin-bottom: 1rem;
}
.auth-footer {
  margin-top: 1rem;
  text-align: center;
  font-size: 0.9rem;
}
.auth-footer a {
  color: var(--accent);
}
</style>
