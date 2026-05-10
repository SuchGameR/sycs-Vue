<script setup lang="ts">
import { ref } from "vue";
import { useUIStore } from "../stores/ui";
import Horizontal from "../components/configurations/Horizontal.vue";
import Sidebar from "../components/layouts/Sidebar.vue";
import NoticeMain from "../components/layouts/NoticeMain.vue";
import { Menu, X } from "lucide-vue-next";

const uiStore = useUIStore();
</script>

<template>
  <Horizontal class="notice-layout">
    <Sidebar class="main-sidebar" />
    <div class="center-content">
      <NoticeMain />

      <!-- Mobile Toggle Button -->
      <button class="mobile-list-toggle" @click="uiStore.toggleList">
        <Menu :size="24" />
      </button>
    </div>

    <!-- User List (Desktop: Sidebar, Mobile: Drawer) -->
    <div :class="['list-wrapper', { 'is-open': uiStore.isListOpen }]">
      <div class="drawer-header" v-if="uiStore.isListOpen">
        <span>メンバーリスト</span>
        <button class="close-drawer" @click="uiStore.setListOpen(false)">
          <X :size="24" />
        </button>
      </div>
      <List />
    </div>

    <!-- Drawer Overlay -->
    <Transition name="fade">
      <div
        v-if="uiStore.isListOpen"
        class="drawer-overlay"
        @click="uiStore.setListOpen(false)"
      ></div>
    </Transition>
  </Horizontal>
</template>

<style scoped>
.notice-layout {
  height: 100vh;
  width: 100%;
  overflow: hidden;
}

.center-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  border-left: 1px solid var(--border);
  height: 100vh;
  position: relative;
  max-width: 800px;
}

.mobile-list-toggle {
  display: none;
}

/* List Wrapper Styles */
.list-wrapper {
  display: flex;
  flex-direction: column;
}

@media (max-width: 730px) {
  .mobile-list-toggle {
    display: flex;
    position: fixed;
    top: 10px;
    right: 16px;
    z-index: 1001;
    background: var(--surface);
    border: 1px solid var(--border);
    padding: 8px;
    border-radius: 8px;
    color: var(--text-primary);
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .list-wrapper {
    position: fixed;
    top: 0;
    right: -280px;
    width: 280px;
    height: 100vh;
    z-index: 2000;
    background: var(--surface);
    transition: right 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: -4px 0 20px rgba(0, 0, 0, 0.2);
  }

  .list-wrapper.is-open {
    right: 0;
  }

  .drawer-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    border-bottom: 1px solid var(--border);
    font-weight: 800;
  }

  .close-drawer {
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
    backdrop-filter: blur(2px);
    z-index: 1999;
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
