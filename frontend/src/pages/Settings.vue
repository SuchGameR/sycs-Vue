<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useRouter } from 'vue-router';
import Horizontal from "../components/configurations/Horizontal.vue";

const authStore = useAuthStore();
const router = useRouter();

const username = ref('');
const avatar_url = ref('');
const error = ref('');
const message = ref('');

onMounted(async () => {
  if (!authStore.isAuthenticated) {
    router.push('/signin');
    return;
  }
  await authStore.fetchUser();
  if (authStore.user) {
    username.value = authStore.user.username;
    avatar_url.value = authStore.user.avatar_url || '';
  }
});

async function handleUpdate() {
  try {
    await authStore.updateSettings({
      username: username.value,
      avatar_url: avatar_url.value
    });
    message.value = '設定を更新しました';
    error.value = '';
  } catch (err: any) {
    error.value = err.message;
    message.value = '';
  }
}

function handleLogout() {
  authStore.logout();
  router.push('/signin');
}
</script>

<template>
  <Horizontal>
    <div class="settings-page">
      <div class="settings-card">
        <h1>ユーザー設定</h1>
        <form @submit.prevent="handleUpdate">
          <div class="form-group">
            <label>ユーザー名</label>
            <input v-model="username" type="text" />
          </div>
          <div class="form-group">
            <label>アバターURL</label>
            <input v-model="avatar_url" type="text" />
          </div>
          <p v-if="error" class="error">{{ error }}</p>
          <p v-if="message" class="success">{{ message }}</p>
          <div class="actions">
            <button type="submit">保存</button>
            <button type="button" @click="handleLogout" class="logout-btn">サインアウト</button>
          </div>
        </form>
        <div class="footer">
          <router-link to="/">ホームに戻る</router-link>
        </div>
      </div>
    </div>
  </Horizontal>
</template>

<style scoped>
.settings-page {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: var(--background);
  padding: 2rem;
}
.settings-card {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
h1 {
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
  font-weight: bold;
}
input {
  width: 100%;
  padding: 0.75rem;
  border-radius: 4px;
  border: 1px solid #ddd;
}
.actions {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
}
button {
  flex: 1;
}
.logout-btn {
  background-color: #ff4757;
}
.logout-btn:hover {
  background-color: #ff6b81;
}
.error {
  color: #ff4757;
  margin-bottom: 1rem;
}
.success {
  color: #2ed573;
  margin-bottom: 1rem;
}
.footer {
  margin-top: 1.5rem;
  text-align: center;
}
</style>
