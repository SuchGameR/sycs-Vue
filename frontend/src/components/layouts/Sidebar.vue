<script setup lang="ts">
import { ref } from 'vue';
import PrimarySidebar from "../commons/PrimarySidebar.vue";
import PrimaryProfile from "../commons/PrimaryProfile.vue";
import Settings from "../popups/Settings.vue";

const isSettingsOpen = ref(false);
</script>

<template>
  <aside>
    <div class="sidebar-inner">
      <!-- Logo -->
      <div class="logo-icon">
        <img src="/svgLogoOutline.svg" alt="SYCS" />
        <span class="version">1.2.4</span>
      </div>
      <!-- <p>Sidebar Component</p> -->
      <PrimarySidebar />
      <!-- Accounts -->
      <PrimaryProfile
        username="KiwiBird"
        class="profileUtils"
        @click="isSettingsOpen = true"
      />
      <div class="settings">
        <Settings v-if="isSettingsOpen" @close="isSettingsOpen = false" />
      </div>
    </div>
  </aside>
</template>

<style scoped>

@container small (max-width: 100px) {
  .version {
    display: none;
  }
  
  .sidebar-inner {
    overflow: visible !important;
    width: 80px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .profileUtils {
    width: 100%;
    max-width: 80px;
    display: flex;
    justify-content: center;
  }
}

.sidebar-inner {
  height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
}

aside::-webkit-scrollbar {
  display: none;
}

aside {
  scrollbar-width: none;
  container-type: inline-size;
  container-name: small;

  overflow: visible;
  min-width: 80px;

  width: 100%;
  max-width: 200px;
  /* width: 60px; */
  display: flex;
  flex-direction: column ;
  /* height: calc(100vh - var(--tiny-gap) * 2); */
  height: 100vh;
  background-color: var(--background);
  color: var(--text-primary);
  padding: var(--sidebar-paddingSize);
  /* add */
  margin: var(--tiny-gap);
  border-radius: calc(var(--tiny-gap) * 2);
  position: relative;
  border-right: var(--resize-size) solid var(--resize-color);
}

/* Logo-icon */
.logo-icon {
  display: flex;
  align-items: end;
  justify-content: space-between;
  margin: var(--sidebar-paddingSize);
  margin-top: calc(var(--sidebar-paddingSize) * 2);
  margin-bottom: calc(var(--sidebar-paddingSize) * 2);
}

.logo-icon img {
  width: 40px;
}

.logo-icon .version {
  font-size: 0.6rem;
  background: #333;
  color: white;
  padding: 2px 8px;
  border-radius: 0.6rem;
  margin: 2.5px;
  user-select: none;
}

.profileUtils {
  display: flex;
  justify-content: center;
  margin: 0 auto;
  margin-top: auto;
  width: 100%;
  max-width: 200px;
  height: 80px;

  background-color: var(--background);
  /* border-right: var(--resize-size) solid var(--resize-color); */
}
</style>