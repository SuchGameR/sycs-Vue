<script setup lang="ts">
import { useUIStore } from "../stores/ui";
import { useAuthStore } from "../stores/auth";
import Horizontal from "../components/configurations/Horizontal.vue";
import Sidebar from "../components/layouts/Sidebar.vue";
import MessageMain from "../components/layouts/MessageMain.vue";
import Landing from "../components/layouts/Landing.vue";

const uiStore = useUIStore();
const authStore = useAuthStore();
</script>

<template>
  <div v-if="authStore.isAuthenticated">
    <Horizontal class="message-page-layout">
      <Sidebar v-if="!uiStore.isMobile" />
      <MessageMain />
    </Horizontal>
  </div>
  <div v-else>
    <Landing />
  </div>
</template>

<style scoped>
.message-page-layout {
  height: 100vh;
  width: 100%;
}
</style>
