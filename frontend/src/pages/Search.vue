<script setup lang="ts">
import { ref } from "vue";
import Horizontal from "../components/configurations/Horizontal.vue";
import Sidebar from "../components/layouts/Sidebar.vue";
import Vertical from "../components/configurations/Vertical.vue";
import { useAuthStore } from "../stores/auth";
import { useUIStore } from "../stores/ui";
import { Search } from "lucide-vue-next";
import Landing from "../components/layouts/Landing.vue";

const authStore = useAuthStore();
const uiStore = useUIStore();
const searchQuery = ref("");
</script>

<template>
  <div v-if="authStore.isAuthenticated">
    <Horizontal class="search-page-layout">
      <Sidebar v-if="!uiStore.isMobile" />
      <Vertical class="main-content">
        <div class="search-header">
          <div class="search-bar">
            <Search :size="20" class="search-icon" />
            <input
              v-model="searchQuery"
              type="text"
              :placeholder="authStore.t.search + '...'"
              autofocus
            />
          </div>
        </div>
        
        <div class="search-results">
          <div class="empty-state">
            <Search :size="48" />
            <p>{{ searchQuery ? '検索結果が見つかりませんでした' : 'キーワードを入力して検索してください' }}</p>
          </div>
        </div>
      </Vertical>
    </Horizontal>
  </div>
  <div v-else>
    <Landing />
  </div>
</template>

<style scoped>
.search-page-layout {
  height: 100vh;
  width: 100%;
}

.main-content {
  flex: 1;
  background: var(--background);
  color: var(--text-primary);
  border-left: 1px solid var(--border);
  max-width: 800px;
}

.search-header {
  padding: 1rem;
  border-bottom: 1px solid var(--border);
  background: var(--surface);
  position: sticky;
  top: 0;
  z-index: 10;
}

.search-bar {
  display: flex;
  align-items: center;
  background: var(--secondary);
  border-radius: 99px;
  padding: 0.5rem 1rem;
  gap: 0.75rem;
  border: 1px solid transparent;
  transition: border-color 0.2s;
}

.search-bar:focus-within {
  border-color: var(--accent);
  background: var(--surface);
}

.search-bar input {
  flex: 1;
  background: transparent;
  border: none;
  color: var(--text-primary);
  font-size: 1rem;
  outline: none;
}

.search-icon {
  color: var(--text-secondary);
}

.search-results {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  color: var(--text-secondary);
  gap: 1rem;
}

.empty-state p {
  font-weight: 600;
}
</style>
