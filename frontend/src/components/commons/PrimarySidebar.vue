<script setup>
import { ref, onMounted, onUnmounted, watch } from "vue";
import { useAuthStore } from "../../stores/auth";
import PrimaryButton from "../commons/PrimaryButton.vue";
import CommunityModal from "../popups/CommunityModal.vue";
import { io } from "socket.io-client";

const props = defineProps({
  mode: {
    type: String,
    default: "vertical", // 'vertical' or 'horizontal'
  },
});

const authStore = useAuthStore();
const servers = ref([]);
const isCommunityModalOpen = ref(false);
const socket = io("/", { path: "/socket.io" });

const fetchMyServers = async () => {
  if (!authStore.isAuthenticated) {
    servers.value = [];
    return;
  }
  try {
    const res = await fetch(`/api/servers/mine`, {
      headers: {
        Authorization: `Bearer ${authStore.token}`,
      },
    });
    if (res.ok) {
      servers.value = await res.json();
    }
  } catch (e) {
    console.error("Failed to fetch my servers", e);
  }
};

onMounted(() => {
  fetchMyServers();

  socket.on("server-updated", (updatedServer) => {
    const index = servers.value.findIndex((s) => s.id === updatedServer.id);
    if (index !== -1) {
      servers.value[index] = { ...servers.value[index], ...updatedServer };
    }
  });
});

onUnmounted(() => {
  socket.disconnect();
});

watch(
  () => authStore.token,
  () => {
    fetchMyServers();
  },
);

const handleRefresh = () => {
  fetchMyServers();
};
</script>

<template>
  <div :class="['primary-sidebar-container', mode]">
    <div class="nav-section">
      <PrimaryButton :name="authStore.t.home" ui="Armchair" url="/" />
      <PrimaryButton
        :name="authStore.t.message"
        ui="MessageCircle"
        url="/message"
      />
      <PrimaryButton
        :name="authStore.t.notice"
        ui="Bell"
        url="/notice"
        :badge="authStore.notificationCount > 0 ? authStore.notificationCount : null"
      />
      <PrimaryButton :name="authStore.t.favorite" ui="Heart" url="/favorite" />
      <PrimaryButton :name="authStore.t.search" ui="Search" url="/search" />
    </div>

    <div v-if="mode === 'vertical'" class="server-section">
      <hr />

      <PrimaryButton
        :name="authStore.t.add_server"
        ui="Compass"
        @click="isCommunityModalOpen = true"
      />
      <div class="sidebar-section-title">参加済み</div>
      <div class="server-list">
        <PrimaryButton
          v-for="server in servers"
          :key="server.id"
          :name="server.name"
          ui="Server"
          :url="`/server/${server.id}`"
        />
        <div v-if="servers.length === 0" class="server-empty">参加なし</div>
      </div>
    </div>

    <CommunityModal
      v-if="mode === 'vertical'"
      :show="isCommunityModalOpen"
      @close="isCommunityModalOpen = false"
      @joined="handleRefresh"
    />
  </div>
</template>

<style scoped>
.primary-sidebar-container {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.primary-sidebar-container.horizontal {
  flex-direction: row;
  justify-content: space-around;
  align-items: center;
  padding: 8px 0;
  height: 60px;
}

.primary-sidebar-container.horizontal .nav-section {
  display: flex;
  flex-direction: row;
  width: 100%;
  justify-content: space-around;
}

.primary-sidebar-container.horizontal :deep(.link) {
  width: auto;
}

.primary-sidebar-container.horizontal :deep(.menu-text) {
  display: none;
}

.primary-sidebar-container.horizontal :deep(.button) {
  width: auto;
  padding: 8px 12px;
  margin: 0;
}

hr {
  width: calc(100% - var(--sidebar-paddingSize) * 2);
  border: none;
  border-top: solid 3px var(--text-primary);
  opacity: 0.1;
  border-radius: 3px;
  margin: var(--sidebar-paddingSize);
  margin-top: calc(var(--sidebar-paddingSize) * 2);
  margin-bottom: calc(var(--sidebar-paddingSize) * 2);
}

.server-list {
  width: 100%;
  display: flex;
  flex-direction: column;
}
.server-list * {
  width: 100%;
  flex: 1;
}

.sidebar-section-title {
  font-size: 0.75rem;
  color: var(--text-secondary);
  margin: 16px 0 8px;
  padding-left: 8px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.server-empty {
  padding: 12px 8px;
  color: var(--text-secondary);
  font-size: 0.85rem;
}
</style>
