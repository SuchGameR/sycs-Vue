<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { useAuthStore } from "../../stores/auth";
import {
  Search,
  Filter,
  Plus,
  Users,
  ChevronRight,
  X,
  Compass,
  LayoutGrid,
} from "lucide-vue-next";

import { useUIStore } from "../../stores/ui";

const props = defineProps<{
  show: boolean;
}>();

const emit = defineEmits(["close", "joined"]);

const authStore = useAuthStore();
const uiStore = useUIStore();
const servers = ref<any[]>([]);
const searchQuery = ref("");
const loading = ref(false);

const fetchServers = async () => {
  loading.value = true;
  try {
    const res = await fetch("/api/servers/discover");
    if (res.ok) {
      servers.value = await res.json();
    }
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
};

const handleJoin = async (serverId: number) => {
  try {
    const res = await fetch(`/api/servers/${serverId}/join`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${authStore.token}`,
      },
    });
    if (res.ok) {
      alert("参加しました！");
      fetchServers();
    }
  } catch (e) {
    console.error(e);
  }
};

onMounted(() => {
  fetchServers();
});

watch(
  () => props.show,
  (newVal) => {
    if (newVal) fetchServers();
  },
);
</script>

<template>
  <div v-if="show" class="modal-overlay" @click.self="emit('close')">
    <div class="community-window">
      <!-- Top Header for Mobile -->
      <header class="mobile-only-header">
        <h3>コミュニティ</h3>
        <button class="header-close-btn" @click="emit('close')">
          <X :size="20" />
          <span>閉じる</span>
        </button>
      </header>

      <!-- Sidebar -->
      <div class="community-sidebar">
        <div class="sidebar-header desktop-only">
          <Compass :size="20" />
          <h3>コミュニティ</h3>
        </div>

        <button class="btn-create-server" @click="uiStore.setCreateServerOpen(true)">
          <Plus :size="20" /> サーバーを作成
        </button>

        <div class="menu-items">
          <div class="menu-item active">
            <Compass :size="18" /> サーバーを探す
          </div>
          <div class="menu-item">
            <Users :size="18" /> 参加中のサーバー
          </div>
        </div>

        <button class="btn-close-bottom desktop-only" @click="emit('close')">
          <X :size="18" /> 閉じる
        </button>
      </div>

      <!-- Main Content -->
      <div class="community-content">
        <header class="content-header">
          <div class="search-bar">
            <Search :size="18" class="search-icon" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="新しいコミュニティを見つけよう..."
            />
          </div>
          <button class="filter-btn">
            <Filter :size="18" /> <span>フィルター</span>
          </button>
          <!-- Desktop Close Button -->
          <button class="desktop-close-btn" @click="emit('close')">
            <X :size="22" />
            <span>閉じる</span>
          </button>
        </header>

        <div class="discovery-area">
          <div v-if="loading" class="loading">読み込み中...</div>
          <div v-else-if="servers.length === 0" class="empty">
            現在公開されているサーバーはありません。
          </div>
          <div v-else class="server-grid">
            <div
              v-for="server in servers"
              :key="server.id"
              class="server-card"
            >
              <div class="card-header">
                <img
                  :src="server.header_url || '/image.png'"
                  class="header-img"
                />
              </div>
              <div class="card-body">
                <div class="server-icon">
                  <img
                    :src="server.icon_url || '/kiwibird-discord.png'"
                  />
                </div>
                <div class="server-info">
                  <h4 class="server-name">{{ server.name }}</h4>
                  <p class="server-desc">
                    {{ server.settings?.description || "説明はありません" }}
                  </p>
                  <div class="server-meta">
                    <span class="members">
                      <Users :size="14" /> {{ server.member_count || 0 }}
                    </span>
                  </div>
                </div>
                <button
                  class="join-btn"
                  @click="handleJoin(server.id)"
                  :disabled="server.is_member"
                >
                  {{ server.is_member ? "参加済み" : "参加する" }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(15px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
  padding: 20px;
}

.community-window {
  background: var(--surface);
  width: 100%;
  max-width: 1200px;
  height: 90vh;
  border-radius: 24px;
  display: flex;
  overflow: hidden;
  box-shadow: 0 50px 100px rgba(0, 0, 0, 0.5);
  border: 1px solid var(--border);
  position: relative;
}

.mobile-only-header {
  display: none;
}

/* Sidebar */
.community-sidebar {
  width: 280px;
  background: rgba(var(--surface-rgb), 0.5);
  border-right: 1px solid var(--border);
  padding: 40px 20px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  flex-shrink: 0;
}

.sidebar-header {
  display: flex;
  align-items: center;
  gap: 12px;
  color: var(--text-primary);
  padding: 0 10px;
}

.sidebar-header h3 {
  font-size: 1.4rem;
  font-weight: 900;
  letter-spacing: -0.5px;
}

.btn-create-server {
  width: 100%;
  padding: 16px;
  background: var(--accent);
  color: white;
  border: none;
  border-radius: 16px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  box-shadow: 0 8px 20px rgba(var(--accent-rgb), 0.3);
}

.btn-create-server:hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow: 0 12px 30px rgba(var(--accent-rgb), 0.4);
}

.menu-items {
  flex: 1;
}

.menu-item {
  padding: 14px 20px;
  border-radius: 14px;
  color: var(--text-secondary);
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 14px;
  cursor: pointer;
  transition: all 0.3s;
}

.menu-item:hover {
  background: rgba(var(--accent-rgb), 0.1);
  color: var(--accent);
  transform: translateX(4px);
}

.menu-item.active {
  background: rgba(var(--accent-rgb), 0.1);
  color: var(--accent);
}

.btn-close-bottom {
  padding: 12px;
  background: transparent;
  border: 1px solid var(--border);
  color: var(--text-secondary);
  border-radius: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  font-weight: 700;
  transition: all 0.2s;
}

.btn-close-bottom:hover {
  background: var(--secondary);
  color: var(--text-primary);
}

/* Main Content */
.community-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: rgba(var(--background-rgb), 0.3);
  position: relative;
}

.content-header {
  padding: 30px 40px;
  display: flex;
  gap: 20px;
  border-bottom: 1px solid var(--border);
  background: rgba(var(--surface-rgb), 0.5);
  backdrop-filter: blur(10px);
  z-index: 10;
}

.desktop-close-btn {
  height: 48px;
  padding: 0 20px;
  background: var(--accent);
  border: none;
  border-radius: 50px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: white;
  box-shadow: 0 8px 25px rgba(var(--accent-rgb), 0.4);
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.desktop-close-btn:hover {
  transform: translateY(-4px) scale(1.05);
}

.search-bar {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 18px;
  color: var(--text-secondary);
}

.search-bar input {
  width: 100%;
  padding: 14px 14px 14px 50px;
  background: var(--surface);
  border: 2px solid var(--border);
  border-radius: 16px;
  color: var(--text-primary);
  font-size: 1.1rem;
  outline: none;
  transition: all 0.2s;
}

.search-bar input:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 4px rgba(var(--accent-rgb), 0.1);
}

.filter-btn {
  padding: 0 24px;
  background: var(--surface);
  border: 2px solid var(--border);
  border-radius: 16px;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.discovery-area {
  flex: 1;
  padding: 40px;
  overflow-y: auto;
  scrollbar-width: thin;
}

.server-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 30px;
  animation: fade-in 0.4s ease-out;
}

@keyframes fade-in {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.server-card {
  background: var(--surface);
  border-radius: 24px;
  overflow: hidden;
  border: 1px solid var(--border);
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 30px rgba(0,0,0,0.05);
}

.server-card:hover {
  transform: translateY(-12px);
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.2);
  border-color: var(--accent);
}

.card-header {
  height: 120px;
  background: var(--border);
}

.header-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.card-body {
  padding: 24px;
  padding-top: 0;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.server-icon {
  width: 80px;
  height: 80px;
  border-radius: 22px;
  background: var(--surface);
  border: 6px solid var(--surface);
  margin-top: -40px;
  overflow: hidden;
  margin-bottom: 16px;
  box-shadow: 0 8px 20px rgba(0,0,0,0.1);
}

.server-icon img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.server-info {
  flex: 1;
  text-align: left;
}

.server-name {
  font-size: 1.3rem;
  font-weight: 900;
  margin-bottom: 8px;
  color: var(--text-primary);
}

.server-desc {
  font-size: 0.95rem;
  color: var(--text-secondary);
  line-height: 1.5;
  margin-bottom: 20px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.server-meta {
  font-size: 0.85rem;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
  font-weight: 700;
}

.members {
  display: flex;
  align-items: center;
  gap: 6px;
}

.join-btn {
  width: 100%;
  padding: 14px;
  background: var(--accent);
  color: white;
  border: none;
  border-radius: 14px;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 15px rgba(var(--accent-rgb), 0.2);
}

.join-btn:disabled {
  background: var(--border);
  color: var(--text-secondary);
  cursor: default;
  box-shadow: none;
}

.join-btn:hover:not(:disabled) {
  transform: scale(1.02);
  filter: brightness(1.1);
}

.loading,
.empty {
  text-align: center;
  padding: 80px;
  color: var(--text-secondary);
  font-size: 1.2rem;
  font-weight: 700;
}

@media (max-width: 900px) {
  .modal-overlay {
    padding: 0;
  }
  .community-window {
    flex-direction: column;
    height: 100vh;
    border-radius: 0;
  }

  .mobile-only-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 15px 20px;
    background: var(--surface);
    border-bottom: 1px solid var(--border);
    position: sticky;
    top: 0;
    z-index: 1000;
    padding-top: calc(15px + env(safe-area-inset-top));
  }
  .mobile-only-header h3 { font-size: 1.2rem; font-weight: 900; }
  .header-close-btn {
    background: var(--accent);
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 50px;
    font-weight: 800;
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.9rem;
  }

  .community-sidebar {
    width: 100%;
    flex-direction: row;
    overflow-x: auto;
    padding: 10px 15px;
    height: auto;
    border-right: none;
    border-bottom: 1px solid var(--border);
    scrollbar-width: none;
    gap: 10px;
  }
  .community-sidebar::-webkit-scrollbar { display: none; }
  .desktop-only { display: none; }
  .btn-create-server {
    width: auto;
    padding: 10px 20px;
    font-size: 0.9rem;
    white-space: nowrap;
    border-radius: 12px;
  }
  .menu-items { display: flex; gap: 8px; }
  .menu-item { white-space: nowrap; padding: 10px 16px; border-radius: 12px; }
  .content-header { padding: 20px 15px; flex-direction: column; gap: 10px; }
  .discovery-area { padding: 20px 15px; }
  .server-grid { grid-template-columns: 1fr; gap: 20px; }
  .desktop-close-btn { display: none; }
}
</style>
