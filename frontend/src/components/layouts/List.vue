<script setup lang="ts">
import { computed } from "vue";
import { useAuthStore } from "../../stores/auth";
import { useUIStore } from "../../stores/ui";

const authStore = useAuthStore();
const uiStore = useUIStore();

// サンプルデータ（実際はAPIから取得する想定）
const allUsers = [
  { id: 1, name: "KiwiBird", status: "online", userid: "kiwi" },
  { id: 2, name: "Antigravity", status: "online", userid: "anti" },
  { id: 3, name: "User123", status: "offline", userid: "user123" },
  // ログインユーザー自身も含めておく
  {
    id: authStore.user?.id || 0,
    name: authStore.user?.username || "",
    status: "online",
    userid: authStore.user?.userid || "",
  },
];

// モバイルの場合は自分を非表示にする
const displayUsers = computed(() => {
  if (uiStore.isMobile) {
    return allUsers.filter((user) => user.userid !== authStore.user?.userid);
  }
  return allUsers;
});

const HambugerMenu = () => {
  uiStore.toggleList();
};
</script>

<template>
  <aside class="user-list-sidebar">
    <h3>ユーザー — {{ displayUsers.length }}</h3>
    <div class="user-group">
      <div v-for="user in displayUsers" :key="user.id" class="user-item">
        <div :class="['avatar', user.status]"></div>
        <span>{{ user.name }}</span>
      </div>
    </div>
  </aside>
</template>

<style scoped>
@keyframes entry {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
@keyframes close {
  0% {
    opacity: 1;
    transform: translateX(0);
  }
  99% {
    opacity: 0;
    transform: translateX(100%);
    display: block;
  }
  100% {
    opacity: 0;
    transform: translateX(100%);
  }
}

.user-list-sidebar {
  width: 100%;
  max-width: 100%;
  flex: 1;
  background-color: var(--surface);
  color: var(--text-primary);
  padding: 20px;
  height: 100%;
  overflow-y: auto;
  border-left: 1px solid var(--border);
  transition: transform 0.3s ease;
  animation: entry 0.3s ease;
}

@media (max-width: 510px) {
  .user-list-sidebar {
    border-left: none;
  }
}

@media screen and (max-width: 800px) {
  .user-list-sidebar {
    animation: close 0.3s ease forwards;
    position: absolute;
    right: 0;
  }
}

h3 {
  font-size: 0.75rem;
  text-transform: uppercase;
  color: var(--text-secondary);
  margin-bottom: 16px;
  letter-spacing: 0.5px;
}

.user-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.user-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 6px 8px;
  border-radius: 4px;
  cursor: pointer;
}

.user-item:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.avatar {
  width: 32px;
  height: 32px;
  background-color: #ccc;
  border-radius: 50%;
  position: relative;
}

.avatar.online::after {
  content: "";
  position: absolute;
  bottom: 0;
  right: 0;
  width: 10px;
  height: 10px;
  background-color: #3ba55c;
  border-radius: 50%;
  border: 2px solid var(--background);
}

.avatar.offline::after {
  content: "";
  position: absolute;
  bottom: 0;
  right: 0;
  width: 10px;
  height: 10px;
  background-color: #747f8d;
  border-radius: 50%;
  border: 2px solid var(--background);
}
</style>
