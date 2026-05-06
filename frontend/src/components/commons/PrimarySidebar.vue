<script setup>
import { ref, onMounted, watch } from "vue";
import { useAuthStore } from "../../stores/auth";
import PrimaryButton from "../commons/PrimaryButton.vue";
import CommunityModal from "../popups/CommunityModal.vue";

const authStore = useAuthStore();
const servers = ref([]);
const isCommunityModalOpen = ref(false);

const fetchMyServers = async () => {
  if (!authStore.isAuthenticated) {
    servers.value = [];
    return;
  }
  try {
    const res = await fetch(
      `http://${window.location.hostname}:3001/api/servers/mine`,
      {
        headers: {
          Authorization: `Bearer ${authStore.token}`,
        },
      },
    );
    if (res.ok) {
      servers.value = await res.json();
    }
  } catch (e) {
    console.error("Failed to fetch my servers", e);
  }
};

onMounted(() => {
  fetchMyServers();
});

watch(() => authStore.token, () => {
  fetchMyServers();
});

const handleRefresh = () => {
  fetchMyServers();
};
</script>

<template>
  <PrimaryButton :name="authStore.t.home" ui="Armchair" url="/" />
  <PrimaryButton
    :name="authStore.t.message"
    ui="MessageCircle"
    url="/message"
  />
  <PrimaryButton :name="authStore.t.notice" ui="Bell" url="/notice" />
  <PrimaryButton :name="authStore.t.favorite" ui="Heart" url="/favorite" />
  <hr />

  <PrimaryButton
    :name="authStore.t.add_server"
    ui="Compass"
    @click="isCommunityModalOpen = true"
  />
  <div class="server-list">
    <PrimaryButton
      v-for="server in servers"
      :key="server.id"
      :name="server.name"
      ui="Server"
      :url="`/server/${server.id}`"
    />
  </div>

  <CommunityModal
    :show="isCommunityModalOpen"
    @close="isCommunityModalOpen = false"
    @joined="handleRefresh"
  />
</template>

<style scoped>
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
</style>
