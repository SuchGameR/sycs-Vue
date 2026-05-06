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
  LayoutGrid
} from "lucide-vue-next";
import CreateServerModal from "./CreateServerModal.vue";

const props = defineProps<{
  show: boolean;
}>();

const emit = defineEmits(["close", "joined"]);

const authStore = useAuthStore();
const searchQuery = ref("");
const publicServers = ref<any[]>([]);
const isCreatingServer = ref(false);
const isLoading = ref(false);

const fetchPublicServers = async () => {
  isLoading.value = true;
  try {
    const url = new URL(`/api/servers`);
    if (searchQuery.value) url.searchParams.append("search", searchQuery.value);
    
    const res = await fetch(url.toString());
    if (res.ok) {
      publicServers.value = await res.json();
    }
  } catch (e) {
    console.error("Failed to fetch public servers", e);
  } finally {
    isLoading.value = false;
  }
};

const joinServer = async (serverId: number) => {
  if (!authStore.isAuthenticated) {
    alert("参加するにはログインが必要です");
    return;
  }
  try {
    const res = await fetch(`/api/servers/${serverId}/join`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${authStore.token}`,
      },
    });
    if (res.ok) {
      alert("サーバーに参加しました！");
      emit("joined");
      emit("close");
    } else {
      const data = await res.json();
      alert(data.error || "参加に失敗しました");
    }
  } catch (e) {
    console.error(e);
  }
};

onMounted(() => {
  fetchPublicServers();
});

watch(searchQuery, () => {
  const timeout = setTimeout(fetchPublicServers, 300);
  return () => clearTimeout(timeout);
});

const handleServerCreated = (newServer: any) => {
  isCreatingServer.value = false;
  emit("joined"); // Trigger sidebar refresh
  emit("close");
};
</script>

<template>
  <div v-if="show" class="modal-overlay" @click.self="emit('close')">
    <div class="community-window">
      <!-- Sidebar -->
      <div class="community-sidebar">
        <div class="sidebar-header">
          <Compass :size="20" />
          <h3>コミュニティ</h3>
        </div>
        
        <button class="btn-create-server" @click="isCreatingServer = true">
          <Plus :size="18" /> サーバーを作成
        </button>

        <div class="menu-items">
          <div class="menu-item active">
            <LayoutGrid :size="18" /> ホーム
          </div>
          <!-- 将来的にカテゴリなどを追加可能 -->
        </div>

        <button class="btn-close-bottom" @click="emit('close')">
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
              placeholder="サーバーを検索..." 
              @keyup.enter="fetchPublicServers"
            />
          </div>
          <button class="filter-btn">
            <Filter :size="18" />
            <span>フィルター</span>
          </button>
        </header>

        <div class="discovery-area">
          <div v-if="isLoading" class="loading">読み込み中...</div>
          <div v-else-if="publicServers.length === 0" class="empty">
            サーバーが見つかりませんでした
          </div>
          <div v-else class="server-grid">
            <div 
              v-for="server in publicServers" 
              :key="server.id" 
              class="server-card"
            >
              <div class="card-header">
                <img :src="server.header || '/image.png'" class="header-img" />
              </div>
              <div class="card-body">
                <div class="server-icon">
                  <img :src="server.icon || '/default-avatar.png'" />
                </div>
                <div class="server-info">
                  <h4 class="server-name">{{ server.name }}</h4>
                  <p class="server-desc">
                    {{ server.serversettings?.description || 'このサーバーに説明はありません。' }}
                  </p>
                  <div class="server-meta">
                    <span class="members">
                      <Users :size="14" /> 
                      {{ (server.serverjoins?.length || 0) + 1 }} メンバー
                    </span>
                  </div>
                </div>
                <button class="join-btn" @click="joinServer(server.id)">
                  参加する
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Sub-modal for server creation -->
    <CreateServerModal 
      v-if="isCreatingServer" 
      @close="isCreatingServer = false" 
      @created="handleServerCreated"
    />
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
  backdrop-filter: blur(8px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
}

.community-window {
  background: var(--surface);
  width: 90%;
  max-width: 1200px;
  height: 85vh;
  border-radius: 16px;
  display: flex;
  overflow: hidden;
  box-shadow: 0 40px 100px rgba(0, 0, 0, 0.5);
  border: 1px solid var(--border);
}

/* Sidebar */
.community-sidebar {
  width: 260px;
  background: var(--surface);
  border-right: 1px solid var(--border);
  padding: 24px 16px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.sidebar-header {
  display: flex;
  align-items: center;
  gap: 12px;
  color: var(--text-primary);
}

.sidebar-header h3 {
  font-size: 1.2rem;
  font-weight: 800;
}

.btn-create-server {
  width: 100%;
  padding: 12px;
  background: var(--accent);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  transition: transform 0.2s;
}

.btn-create-server:hover {
  transform: translateY(-2px);
  background: var(--accent-hover, #4752c4);
}

.menu-items {
  flex: 1;
}

.menu-item {
  padding: 10px 12px;
  border-radius: 8px;
  color: var(--text-secondary);
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.menu-item:hover {
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-primary);
}

.menu-item.active {
  background: rgba(var(--accent-rgb, 88, 101, 242), 0.1);
  color: var(--accent);
}

.btn-close-bottom {
  padding: 10px;
  background: transparent;
  border: 1px solid var(--border);
  color: var(--text-secondary);
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

/* Main Content */
.community-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: var(--background);
}

.content-header {
  padding: 20px 32px;
  display: flex;
  gap: 16px;
  border-bottom: 1px solid var(--border);
  background: var(--surface);
}

.search-bar {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 12px;
  color: var(--text-secondary);
}

.search-bar input {
  width: 100%;
  padding: 10px 10px 10px 40px;
  background: var(--background);
  border: 1px solid var(--border);
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 1rem;
  outline: none;
}

.search-bar input:focus {
  border-color: var(--accent);
}

.filter-btn {
  padding: 0 16px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 8px;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.discovery-area {
  flex: 1;
  padding: 32px;
  overflow-y: auto;
}

.server-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
}

.server-card {
  background: var(--surface);
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid var(--border);
  transition: all 0.3s;
  display: flex;
  flex-direction: column;
}

.server-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  border-color: var(--accent);
}

.card-header {
  height: 100px;
  background: #333;
}

.header-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.card-body {
  padding: 16px;
  padding-top: 0;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.server-icon {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  background: var(--surface);
  border: 4px solid var(--surface);
  margin-top: -32px;
  overflow: hidden;
  margin-bottom: 12px;
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
  font-size: 1.1rem;
  font-weight: 800;
  margin-bottom: 4px;
}

.server-desc {
  font-size: 0.85rem;
  color: var(--text-secondary);
  line-height: 1.4;
  margin-bottom: 12px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.server-meta {
  font-size: 0.75rem;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.members {
  display: flex;
  align-items: center;
  gap: 4px;
}

.join-btn {
  width: 100%;
  padding: 10px;
  background: var(--secondary);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s;
}

.join-btn:hover {
  background: var(--accent);
}

.loading, .empty {
  text-align: center;
  padding: 40px;
  color: var(--text-secondary);
  font-size: 1.1rem;
}
</style>