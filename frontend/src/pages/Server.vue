<script setup lang="ts">
import Horizontal from "../components/configurations/Horizontal.vue";
import Sidebar from "../components/layouts/Sidebar.vue";
import ServerMain from "../components/layouts/ServerMain.vue";
import List from "../components/layouts/List.vue";
</script>

<template>
  <Horizontal>
    <Sidebar />
    <ServerMain />
    <List />
  </Horizontal>
</template>

<style scoped></style>
