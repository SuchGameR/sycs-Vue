<script setup lang="ts">
import { useAuthStore } from "../stores/auth";
import Horizontal from "../components/configurations/Horizontal.vue";
import Landing from "../components/layouts/Landing.vue";

const authStore = useAuthStore();
</script>

<template>
  <div v-if="authStore.isAuthenticated">
    <Horizontal>
      <Sidebar />
      <Main />
      <List />
    </Horizontal>
  </div>
  <div v-else>
    <Landing />
  </div>
</template>

<style scoped></style>
