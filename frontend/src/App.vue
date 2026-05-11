<script setup>
import { ref, onMounted, onUnmounted, watch } from "vue";
import { useAuthStore } from "./stores/auth";
import { io } from "socket.io-client";
import { Bell } from "lucide-vue-next";
import PrimarySidebar from "./components/commons/PrimarySidebar.vue";
import MobileNavBar from "./components/commons/MobileNavBar.vue";
import List from "./components/layouts/List.vue";
import Sidebar from "./components/layouts/Sidebar.vue";
import SettingsModal from "./components/popups/SettingsModal.vue";
import CreateServerModal from "./components/popups/CreateServerModal.vue";
import { ChevronLeft, X } from "lucide-vue-next";

import { useUIStore } from "./stores/ui";
import { useRouter } from "vue-router";
import { useSidebarSwipe } from "./utils/useSidebarSwipe";

const authStore = useAuthStore();
const uiStore = useUIStore();
const router = useRouter();

// Enable Swipe Gestures
useSidebarSwipe();
const toasts = ref([]);
const socket = io("/", { path: "/socket.io" });

// Close sidebar on route change - removing this as sidebar is always visible
/* watch(
  () => router.currentRoute.value.path,
  () => {
    uiStore.setSidebarOpen(false);
  },
); */

const addToast = (message, type = "info") => {
  // 重複チェック
  const existing = toasts.value.find((t) => t.message === message);
  if (existing) {
    existing.count = (existing.count || 1) + 1;
    // タイマーのリセット（一旦削除して再度追加することでアニメーションとタイマーをリフレッシュ）
    const count = existing.count;
    toasts.value = toasts.value.filter((t) => t.message !== message);

    setTimeout(() => {
      const id = Date.now();
      toasts.value.push({ id, message, type, count });
      setTimeout(() => {
        toasts.value = toasts.value.filter((t) => t.id !== id);
      }, 5000);
    }, 10);
    return;
  }

  const id = Date.now();
  toasts.value.push({ id, message, type, count: 1 });
  setTimeout(() => {
    toasts.value = toasts.value.filter((t) => t.id !== id);
  }, 5000);
};

onMounted(() => {
  if (authStore.user) {
    setupSocket();
    setupPush();
    authStore.fetchNotificationCount();
  }
});

watch(
  () => authStore.user,
  (newUser) => {
    if (newUser) {
      setupSocket();
      setupPush();
      authStore.fetchNotificationCount();
    } else {
      socket.off(`notification-${authStore.user?.id}`);
    }
  },
);

const setupSocket = () => {
  const eventName = `notification-${authStore.user?.id}`;
  socket.off(eventName); // Remove existing to prevent duplicates

  socket.on(eventName, (note) => {
    authStore.incrementNotificationCount();

    let text = "";
    switch (note.type) {
      case "like":
        text = `${note.actor.username}さんがいいねしました`;
        break;
      case "retweet":
        text = `${note.actor.username}さんがリポストしました`;
        break;
      case "follow":
        text = `${note.actor.username}さんにフォローされました`;
        break;
      case "friend_request":
        text = `${note.actor.username}さんからフレンド申請が届きました`;
        break;
      case "dm":
        text = `${note.actor.username}さんからメッセージが届きました`;
        break;
    }
    if (text) addToast(text);
  });
};

const setupPush = async () => {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;

  try {
    const registration = await navigator.serviceWorker.register("/sw.js");
    console.log("Service Worker registered");

    // Request permission
    const permission = await Notification.requestPermission();
    if (permission !== "granted") return;

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(
        "BOlu8bhoO2He4swaOFcU80hTZgU9phJr9O0-dpWa5vv6fUEa0AkE5arBgCq_U12QOMaT-yeA6BgMJNH1GWRU4sA",
      ),
    });

    await fetch("/api/notifications/subscribe", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authStore.token}`,
      },
      body: JSON.stringify({ subscription }),
    });
    console.log("Push subscription successful");
  } catch (err) {
    console.error("Push setup failed:", err);
  }
};

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

onUnmounted(() => {
  socket.disconnect();
});
</script>

<template>
  <div id="app">
    <!-- Mobile/Small Window Drawers -->
    <div
      v-if="uiStore.isMobile || uiStore.isSmallWindow"
      class="mobile-drawers-container"
    >
      <!-- Left Drawer: Servers (Mobile Only) -->
      <Transition name="slide-left">
        <div
          v-if="uiStore.isMobile && uiStore.isSidebarOpen"
          class="mobile-drawer left"
        >
          <Sidebar />
        </div>
      </Transition>

      <!-- Right Drawer: User List (Mobile and Small Window) -->
      <Transition name="slide-right">
        <div v-if="uiStore.isListOpen" class="mobile-drawer right">
          <div class="drawer-header">
            <span>メンバーリスト</span>
            <button class="close-btn" @click="uiStore.setListOpen(false)">
              <X :size="20" />
            </button>
          </div>
          <List />
        </div>
      </Transition>

      <!-- Overlay for Drawers -->
      <Transition name="fade">
        <div
          v-if="
            (uiStore.isMobile && uiStore.isSidebarOpen) || uiStore.isListOpen
          "
          class="drawer-overlay"
          @click="
            uiStore.setSidebarOpen(false);
            uiStore.setListOpen(false);
          "
        ></div>
      </Transition>
    </div>

    <router-view />

    <!-- Global Modals -->
    <SettingsModal
      :show="uiStore.isSettingsOpen"
      @close="uiStore.setSettingsOpen(false)"
    />
    <CreateServerModal
      :show="uiStore.isCreateServerModalOpen"
      @close="uiStore.setCreateServerOpen(false)"
      @created="uiStore.setCreateServerOpen(false)"
    />

    <!-- Bottom Navigation Bar (Mobile) -->
    <nav
      v-if="authStore.isAuthenticated && uiStore.isMobile"
      class="bottom-nav"
    >
      <MobileNavBar />
    </nav>

    <!-- Global Toast Container -->
    <div class="toast-container">
      <div v-for="toast in toasts" :key="toast.id" class="toast-item">
        <Bell :size="18" />
        <span
          >{{ toast.message }}
          <template v-if="toast.count > 1">({{ toast.count }})</template></span
        >
      </div>
    </div>
  </div>
</template>

<style>
/* Global styles for the app */
:root {
  --accent-rgb: 29, 155, 240;
}

#app {
  /* Global styles for the app */
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.bottom-nav {
  transition: 0.3s ease;
  display: none;
  animation: fadeIn 0.3s ease forwards;
}

@media (max-width: 510px) {
  .bottom-nav {
    display: block;
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    background: var(--surface);
    border-top: 1px solid var(--border);
    z-index: 2000;
    padding-bottom: env(safe-area-inset-bottom);
  }

  #app {
    padding-bottom: 0px; /* Space for bottom nav */
  }
}

/* Mobile Drawers Styles */
.mobile-drawers-container {
  position: relative;
  z-index: 3000;
}

.mobile-drawer {
  position: fixed;
  top: 0;
  height: 100vh;
  width: 280px;
  background: var(--surface);
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.2);
  z-index: 3100;
  display: flex;
  flex-direction: column;
}

.mobile-drawer.left {
  left: 0;
}

.mobile-drawer.right {
  right: 0;
}

.drawer-header {
  padding: 16px;
  border-bottom: 1px solid var(--border);
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 800;
}

.drawer-header .close-btn {
  background: transparent;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
}

.drawer-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: 3050;
}

/* Transitions */
.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
  transition: transform 0.6s cubic-bezier(0.2, 1, 0.3, 1);
}

.slide-left-enter-from,
.slide-left-leave-to {
  transform: translateX(-100%);
}

.slide-right-enter-from,
.slide-right-leave-to {
  transform: translateX(100%);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
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
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

[data-theme="dark"] .toast-item {
  background: #15202b;
  border-color: #38444d;
}
</style>
