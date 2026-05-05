<script setup>
import { ref, onMounted } from "vue";
import PrimaryButton from "../commons/PrimaryButton.vue";
import CreateServerModal from "../popups/CreateServerModal.vue";

const servers = ref([]);
const isCreateModalOpen = ref(false);

const fetchServers = async () => {
  try {
    const res = await fetch(
      `http://${window.location.hostname}:3001/api/servers`,
    );
    if (res.ok) {
      servers.value = await res.json();
    }
  } catch (e) {
    console.error("Failed to fetch servers", e);
  }
};

onMounted(() => {
  fetchServers();
});

const handleServerCreated = (newServer) => {
  servers.value.push(newServer);
  isCreateModalOpen.value = false;
};
</script>

<template>
  <PrimaryButton name="ホーム" ui="Armchair" url="/" />
  <PrimaryButton name="メッセージ" ui="MessageCircle" url="message" />
  <PrimaryButton name="通知" ui="Bell" url="notice" />
  <PrimaryButton name="お気に入り" ui="Heart" url="favorite" />
  <hr />

  <PrimaryButton
    name="サーバーを追加"
    ui="HousePlus"
    @click="isCreateModalOpen = true"
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

  <CreateServerModal
    v-if="isCreateModalOpen"
    @close="isCreateModalOpen = false"
    @created="handleServerCreated"
  />
</template>

<style scoped>
hr {
  width: calc(100% - var(--sidebar-paddingSize) * 2);
  border: none;
  border-top: solid 3px var(--primary);
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
