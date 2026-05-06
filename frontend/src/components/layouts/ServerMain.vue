<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick, computed } from "vue";
import { useRoute } from "vue-router";
import { io } from "socket.io-client";
import { X, Send, Settings as SettingsIcon } from "lucide-vue-next";
import { useAuthStore } from "../../stores/auth";
import Vertical from "../configurations/Vertical.vue";
import MessageItem from "../commons/MessageItem.vue";
import ServerSettingsModal from "../popups/ServerSettingsModal.vue";

const route = useRoute();
const authStore = useAuthStore();
const currentServer = ref(null);
const channels = ref([]);
const currentChannelId = ref(null);
const messages = ref([]);
const newMessage = ref("");
const messageListRef = ref(null);
const replyingTo = ref(null);
const showSettings = ref(false);

const isOwner = computed(() => {
  return (
    currentServer.value &&
    authStore.user &&
    currentServer.value.serverowner === authStore.user.id
  );
});

const socket = io("/", { path: "/socket.io" });

const fetchData = async () => {
  const serverId = route.params.id || route.params.serverId;
  if (!serverId) return;

  try {
    const headers = {};
    if (authStore.isAuthenticated) {
      headers.Authorization = `Bearer ${authStore.token}`;
    }

    const sRes = await fetch(`/api/servers/${serverId}`, {
      headers,
    });

    if (!sRes.ok) {
      console.error("Failed to load server", await sRes.text());
      return;
    }

    currentServer.value = await sRes.json();

    const cRes = await fetch(`/api/servers/${serverId}/channels`);
    channels.value = await cRes.json();

    if (channels.value.length > 0) {
      const cid = route.params.channelId || channels.value[0].id;
      currentChannelId.value = parseInt(cid);
      fetchMessages();
      socket.emit("join-channel", currentChannelId.value);
    }
  } catch (e) {
    console.error(e);
  }
};

const fetchMessages = async () => {
  if (!currentChannelId.value) return;
  try {
    const res = await fetch(`/api/channels/${currentChannelId.value}/messages`);
    messages.value = await res.json();
    scrollToBottom();
  } catch (e) {
    console.error(e);
  }
};

const sendMessage = async () => {
  if (!newMessage.value.trim() || !currentChannelId.value) return;
  const content = newMessage.value;
  const parent_id = replyingTo.value?.id;
  newMessage.value = "";
  replyingTo.value = null;

  try {
    await fetch(`/api/channels/${currentChannelId.value}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authStore.token}`,
      },
      body: JSON.stringify({ content, parent_id }),
    });
  } catch (e) {
    console.error(e);
  }
};

const handleKeydown = (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    if (e.isComposing) return;
    e.preventDefault();
    sendMessage();
  }
};

const handleReact = async (messageId, emoji) => {
  try {
    await fetch(`/api/messages/${messageId}/reactions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authStore.token}`,
      },
      body: JSON.stringify({ emoji }),
    });
  } catch (e) {
    console.error(e);
  }
};

const handleEdit = async (messageId, content) => {
  try {
    await fetch(`/api/messages/${messageId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authStore.token}`,
      },
      body: JSON.stringify({ content }),
    });
  } catch (e) {
    console.error(e);
  }
};

const handleDelete = async (messageId) => {
  try {
    await fetch(`/api/messages/${messageId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${authStore.token}`,
      },
    });
  } catch (e) {
    console.error(e);
  }
};

const selectChannel = (id) => {
  currentChannelId.value = id;
  messages.value = [];
  socket.emit("join-channel", id);
  fetchMessages();
};

const scrollToBottom = () => {
  nextTick(() => {
    if (messageListRef.value) {
      messageListRef.value.scrollTop = messageListRef.value.scrollHeight;
    }
  });
};

const handleServerUpdated = (updatedServer) => {
  currentServer.value = { ...currentServer.value, ...updatedServer };
};

onMounted(() => {
  fetchData();

  socket.on("new-message", (msg) => {
    if (msg.channel_id === currentChannelId.value) {
      messages.value.push(msg);
      scrollToBottom();
    }
  });

  socket.on("message-reaction", ({ messageId, reactions }) => {
    const msg = messages.value.find((m) => m.id === messageId);
    if (msg) msg.reactions = reactions;
  });

  socket.on("message-updated", (updatedMsg) => {
    const index = messages.value.findIndex((m) => m.id === updatedMsg.id);
    if (index !== -1) {
      messages.value[index] = { ...messages.value[index], ...updatedMsg };
    }
  });

  socket.on("message-deleted", ({ messageId }) => {
    messages.value = messages.value.filter((m) => m.id !== messageId);
  });
});

onUnmounted(() => {
  socket.disconnect();
});

watch(
  () => route.params.id,
  (newId) => {
    if (newId) fetchData();
  },
);
</script>

<template>
  <main>
    <Vertical class="mainContainer">
      <div class="server-banner" v-if="currentServer">
        <img :src="currentServer.header || '/image.png'" class="banner-img" />
        <div class="banner-overlay">
          <div class="server-info-header">
            <div class="server-icon-mini">
              <img :src="currentServer.icon || '/default-avatar.png'" />
            </div>
            <div class="server-name-stack">
              <h1>{{ currentServer.name }}</h1>
              <span class="server-id">ID: {{ currentServer.serverid }}</span>
            </div>
            <button
              v-if="isOwner"
              class="settings-trigger"
              @click="showSettings = true"
            >
              <SettingsIcon :size="20" />
            </button>
          </div>
        </div>
      </div>
      <div class="server-header" v-else>
        <h1>Loading...</h1>
      </div>

      <section class="channel-tabs">
        <div
          v-for="channel in channels"
          :key="channel.id"
          class="channel-item"
          :class="{ active: currentChannelId === channel.id }"
          @click="selectChannel(channel.id)"
        >
          <span class="hash">#</span> {{ channel.name }}
        </div>
      </section>

      <div class="chat-area">
        <div class="message-list" ref="messageListRef">
          <MessageItem
            v-for="msg in messages"
            :key="msg.id"
            :msg="msg"
            @reply="replyingTo = $event"
            @react="handleReact"
            @edit="handleEdit"
            @delete="handleDelete"
          />
        </div>

        <div class="input-area">
          <div v-if="replyingTo" class="reply-bar">
            <span>{{ replyingTo.author_name }} への返信</span>
            <button @click="replyingTo = null"><X :size="14" /></button>
          </div>
          <div class="input-container">
            <textarea
              v-model="newMessage"
              :placeholder="
                currentChannelId
                  ? `#${channels.find((c) => c.id === currentChannelId)?.name || ''} にメッセージを送信`
                  : 'メッセージを入力...'
              "
              rows="1"
              @keydown.enter="handleKeydown"
            ></textarea>
            <button class="send-btn" @click="sendMessage">
              <Send :size="18" />
            </button>
          </div>
        </div>
      </div>
    </Vertical>

    <ServerSettingsModal
      :show="showSettings"
      :server="currentServer"
      @close="showSettings = false"
      @updated="handleServerUpdated"
    />
  </main>
</template>

<style scoped>
main {
  display: flex;
  flex-direction: column;
  width: 100%;
  background-color: var(--background);
  color: var(--text-primary);
  min-width: 350px;
}

.server-banner {
  height: 120px;
  position: relative;
  overflow: hidden;
  border-bottom: 1px solid var(--border);
}

.banner-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: brightness(0.7);
}

.banner-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  padding: 1rem 1.5rem;
  display: flex;
  align-items: flex-end;
}

.server-info-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  width: 100%;
}

.server-icon-mini {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  overflow: hidden;
  border: 2px solid white;
  background: white;
}

.server-icon-mini img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.server-name-stack {
  flex: 1;
  text-align: left;
}

.server-name-stack h1 {
  font-size: 1.4rem;
  font-weight: 800;
  color: white;
  margin: 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

.server-id {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.8);
}

.settings-trigger {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  cursor: pointer;
  transition: all 0.2s;
}

.settings-trigger:hover {
  background: rgba(255, 255, 255, 0.4);
  transform: rotate(45deg);
}

.server-header {
  padding: 1rem 1.5rem;
  background: var(--surface);
  border-bottom: 1px solid var(--border);
}

.server-header h1 {
  font-size: 1.2rem;
  font-weight: 800;
  color: var(--text-primary);
}

.mainContainer {
  width: 100%;
  height: 100vh;
}

.channel-tabs {
  height: 50px;
  width: 100%;
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding: 0 1rem;
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  align-items: center;
}

.channel-item {
  padding: 0.4rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 700;
  color: var(--text-secondary);
  transition: all 0.2s;
  white-space: nowrap;
}

.channel-item:hover {
  background: rgba(0, 0, 0, 0.05);
}

.channel-item.active {
  background: var(--accent);
  color: white;
}

.hash {
  opacity: 0.5;
  margin-right: 4px;
}

.chat-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--surface);
}

.message-list {
  flex: 1;
  overflow-y: auto;
  padding: 1rem 0;
}

.input-area {
  padding-bottom: 20px;
  margin-left: 30px;
  margin-right: 30px;
  transform: scale(1.05);
}

.reply-bar + .input-container {
  border-top-left-radius: 0;
  border-top-right-radius: 0;
  border-top: none;
}

.reply-bar {
  background: var(--surface);
  line-height: 30px;
  display: flex;
  justify-content: space-between;
  padding: 8px 12px;
  padding-right: 4px;
  z-index: +1;
  background: var(--surface);
  border-radius: 12px 12px 0 0;
  font-size: 0.85rem;
  font-weight: 700;
  height: 40px;
  color: var(--accent);
  border: 1px solid var(--border);
  border-bottom: none;
}

.reply-bar button {
  background: transparent;
  border: none;
  cursor: pointer;
  color: var(--text-secondary);
}

.input-container {
  display: flex;
  gap: 12px;
  background: var(--surface);
  padding: 8px 16px;
  padding-right: 4px;
  border-radius: 12px;
  border: 1px solid var(--border);
  align-items: center;
}

@container small (max-width: 400px) {
  .send-btn {
    display: none !important;
  }
}

.input-container textarea {
  flex: 1;
  min-height: 40px;
  max-height: 200px;
  background: transparent;
  border: none;
  outline: none;
  font-size: 1rem;
  color: var(--text-primary);
  resize: none;
  padding: 8px 0;
}

.send-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  color: var(--accent);
  display: flex;
  align-items: center;
}

.send-btn:hover {
  transform: scale(1.1);
}
</style>
