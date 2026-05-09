<script setup>
import { ref, onMounted, onUnmounted, watch } from "vue";
import { useAuthStore } from "./stores/auth";
import { io } from "socket.io-client";
import { Bell } from "lucide-vue-next";

const authStore = useAuthStore();
const toasts = ref([]);
const socket = io("/", { path: "/socket.io" });

const addToast = (message, type = "info") => {
  // 重複チェック
  const existing = toasts.value.find(t => t.message === message);
  if (existing) {
    existing.count = (existing.count || 1) + 1;
    // タイマーのリセット（一旦削除して再度追加することでアニメーションとタイマーをリフレッシュ）
    const count = existing.count;
    toasts.value = toasts.value.filter(t => t.message !== message);
    
    setTimeout(() => {
      const id = Date.now();
      toasts.value.push({ id, message, type, count });
      setTimeout(() => {
        toasts.value = toasts.value.filter(t => t.id !== id);
      }, 5000);
    }, 10);
    return;
  }

  const id = Date.now();
  toasts.value.push({ id, message, type, count: 1 });
  setTimeout(() => {
    toasts.value = toasts.value.filter(t => t.id !== id);
  }, 5000);
};

onMounted(() => {
  if (authStore.user) {
    setupSocket();
    authStore.fetchNotificationCount();
  }
});

watch(() => authStore.user, (newUser) => {
  if (newUser) {
    setupSocket();
    authStore.fetchNotificationCount();
  } else {
    socket.off(`notification-${authStore.user?.id}`);
  }
});

const setupSocket = () => {
  const eventName = `notification-${authStore.user?.id}`;
  socket.off(eventName); // Remove existing to prevent duplicates
  
  socket.on(eventName, (note) => {
    authStore.incrementNotificationCount();
    
    let text = "";
    switch (note.type) {
      case 'like': text = `${note.actor.username}さんがいいねしました`; break;
      case 'retweet': text = `${note.actor.username}さんがリポストしました`; break;
      case 'follow': text = `${note.actor.username}さんにフォローされました`; break;
      case 'friend_request': text = `${note.actor.username}さんからフレンド申請が届きました`; break;
      case 'dm': text = `${note.actor.username}さんからメッセージが届きました`; break;
    }
    if (text) addToast(text);
  });
};

onUnmounted(() => {
  socket.disconnect();
});
</script>

<template>
  <div id="app">
    <router-view />

    <!-- Global Toast Container -->
    <div class="toast-container">
      <div v-for="toast in toasts" :key="toast.id" class="toast-item">
        <Bell :size="18" />
        <span>{{ toast.message }} <template v-if="toast.count > 1">({{ toast.count }})</template></span>
      </div>
    </div>
  </div>
</template>

<style>
/* Global styles for the app */
:root {
  --accent-rgb: 29, 155, 240;
}

.toast-container {
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  pointer-events: none;
}

.toast-item {
  background: var(--surface);
  color: var(--text-primary);
  padding: 0.75rem 1.25rem;
  border-radius: 50px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 600;
  font-size: 0.9rem;
  border: 1px solid var(--border);
  animation: toast-in 0.3s ease-out forwards;
  pointer-events: auto;
}

@keyframes toast-in {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

[data-theme="dark"] .toast-item {
  background: #15202b;
  border-color: #38444d;
}
</style>
