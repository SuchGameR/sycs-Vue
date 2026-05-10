<script setup lang="ts">
import { ref } from "vue";
import { useAuthStore } from "../stores/auth";
import { useUIStore } from "../stores/ui";
import Horizontal from "../components/configurations/Horizontal.vue";
import Sidebar from "../components/layouts/Sidebar.vue";
import NoticeMain from "../components/layouts/NoticeMain.vue";
import List from "../components/layouts/List.vue";
import Landing from "../components/layouts/Landing.vue";

const authStore = useAuthStore();
const uiStore = useUIStore();
</script>

<template>
  <div v-if="authStore.isAuthenticated">
    <Horizontal class="notice-layout">
      <!-- Desktop Sidebar -->
      <Sidebar v-if="!uiStore.isMobile" class="main-sidebar" />
      
      <div class="center-content">
        <NoticeMain />
      </div>

      <!-- Desktop User List -->
      <List v-if="!uiStore.isMobile" class="desktop-list" />
    </Horizontal>
  </div>
  <div v-else>
    <Landing />
  </div>
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

.desktop-list {
  width: 100%;
  max-width: 250px;
  flex: 1;
}

@media (max-width: 510px) {
  .center-content {
    border-left: none;
    max-width: 100%;
  }
}
</style>
