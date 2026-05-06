<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../../stores/auth";
import PrimarySidebar from "../commons/PrimarySidebar.vue";
import PrimaryProfile from "../commons/PrimaryProfile.vue";
import SettingsModal from "../popups/SettingsModal.vue";

const authStore = useAuthStore();
const router = useRouter();
const isSettingsOpen = ref(false);

function handleProfileClick() {
  if (authStore.isAuthenticated) {
    isSettingsOpen.value = true;
  } else {
    router.push("/signin");
  }
}
</script>

<template>
  <aside>
    <div class="sidebar-inner">
      <!-- Logo -->
      <div class="logo-icon">
        <img src="/svgLogoOutline.svg" alt="SYCS" />
        <span class="version">1.2.20</span>
      </div>

      <PrimarySidebar />

      <!-- Accounts -->
      <div class="account-section">
        <PrimaryProfile
          v-if="authStore.user"
          :username="authStore.user.username"
          :avatar-url="authStore.user.avatar_url"
          class="profileUtils"
          @click="handleProfileClick"
        />
        <div v-else class="signin-link" @click="handleProfileClick">
          サインイン
        </div>
      </div>
    </div>

    <!-- Settings Modal -->
    <SettingsModal :show="isSettingsOpen" @close="isSettingsOpen = false" />
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
  overflow-y: scroll;
  min-width: 80px;

  width: 100%;
  max-width: 200px;
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: var(--surface);
  color: var(--text-primary);
  padding: var(--sidebar-paddingSize);
  margin: var(--tiny-gap);
  border-radius: calc(var(--tiny-gap) * 2);
  position: relative;
  border-right: solid 1px var(--border);
}

.logo-icon {
  display: flex;
  align-items: end;
  justify-content: space-between;
  margin: var(--sidebar-paddingSize);
  margin-top: calc(var(--sidebar-paddingSize) * 2);
  margin-bottom: calc(var(--sidebar-paddingSize) * 3);
}

.logo-icon img {
  width: 40px;
}

.logo-icon .version {
  font-size: 0.6rem;
  background: var(--secondary);
  color: white;
  padding: 2px 8px;
  border-radius: 0.6rem;
  margin: 2.5px;
  user-select: none;
}

.account-section {
  margin-top: auto;
  width: 100%;
}

.profileUtils {
  display: flex;
  justify-content: center;
  margin: 0 auto;
  width: 100%;
  max-width: 200px;
  height: 80px;
  background-color: transparent;
}

.signin-link {
  margin-top: auto;
  padding: 1rem;
  text-align: center;
  cursor: pointer;
  background: var(--primary);
  color: white;
  border-radius: 8px;
  font-weight: bold;
}

.signin-link:hover {
  background: var(--accent);
}
</style>
