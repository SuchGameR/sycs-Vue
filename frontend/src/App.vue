<script setup lang="ts"></script>

<template>
  <div id="app">
    <router-view />
  </div>
</template>

<style scoped>
:root {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  --theme-color: #121212;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

body, html{
  margin: 0;
  background-color: var(--theme-color);
}


</style>
