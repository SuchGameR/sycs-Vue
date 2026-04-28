<script setup lang="ts">
import PrimarySidebar from "../commons/PrimarySidebar.vue";
import PrimaryProfile from "../commons/PrimaryProfile.vue";
</script>

<template>
  <aside>
    <!-- Logo -->
    <div class="logo-icon">
      <img src="../../../public/svgLogoOutline.svg" alt="SYCS" />
      <span class="version">1.2.4</span>
    </div>
    <!-- <p>Sidebar Component</p> -->
    <PrimarySidebar />
    <!-- Accounts -->
    <PrimaryProfile username="KiwiBird" class="profileUtils" />
  </aside>
</template>

<style scoped>
aside {
  width: 100%;
  max-width: 180px;
  /* width: 60px; */
  display: flex;
  flex-direction: column;
  height: calc(100vh - var(--tiny-gap) * 2);
  background-color: var(--background);
  color: var(--text-primary);
  padding: var(--sidebar-paddingSize);
  /* add */
  margin: var(--tiny-gap);
  border-radius: calc(var(--tiny-gap) * 2);
  position: relative;
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
  position: absolute;
  bottom: 0px;
  left: 0;
}
</style>
