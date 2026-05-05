<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from "vue";
import { useRoute } from "vue-router";
import { io } from "socket.io-client";
import { X, Send } from "lucide-vue-next";
import { useAuthStore } from "../../stores/auth";
import Vertical from "../configurations/Vertical.vue";
import MessageItem from "../commons/MessageItem.vue";

const route = useRoute();
const authStore = useAuthStore();
const currentServer = ref(null);
const channels = ref([]);
const currentChannelId = ref(null);
const messages = ref([]);
const newMessage = ref("");
const messageListRef = ref(null);
const replyingTo = ref(null);

const socket = io(`http://${window.location.hostname}:3001`);

const fetchData = async () => {
  const serverId = route.params.id || route.params.serverId;
  if (!serverId) return;

  try {
    const sRes = await fetch(
      `http://${window.location.hostname}:3001/api/servers`,
    );
    const servers = await sRes.json();
    currentServer.value = servers.find(
      (s) => String(s.id) === String(serverId),
    );

    const cRes = await fetch(
      `http://${window.location.hostname}:3001/api/servers/${serverId}/channels`,
    );
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
    const res = await fetch(
      `http://${window.location.hostname}:3001/api/channels/${currentChannelId.value}/messages`,
    );
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
    await fetch(
      `http://${window.location.hostname}:3001/api/channels/${currentChannelId.value}/messages`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authStore.token}`,
        },
        body: JSON.stringify({ content, parent_id }),
      },
    );
  } catch (e) {
    console.error(e);
  }
};

const handleReact = async (messageId, emoji) => {
  try {
    await fetch(
      `http://${window.location.hostname}:3001/api/messages/${messageId}/reactions`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authStore.token}`,
        },
        body: JSON.stringify({ emoji }),
      },
    );
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
      <div class="server-header">
        <h1 v-if="currentServer">{{ currentServer.name }}</h1>
        <h1 v-else>Loading...</h1>
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
          />
        </div>

        <div class="input-area">
          <div v-if="replyingTo" class="reply-bar">
            <span>{{ replyingTo.author_name }} への返信</span>
            <button @click="replyingTo = null"><X :size="14" /></button>
          </div>
          <div class="input-container">
            <input
              v-model="newMessage"
              :placeholder="
                currentChannelId
                  ? `#${channels.find((c) => c.id === currentChannelId)?.name || ''} にメッセージを送信`
                  : 'メッセージを入力...'
              "
              @keyup.enter="sendMessage"
            />
            <button class="send-btn" @click="sendMessage">
              <Send :size="18" />
            </button>
          </div>
        </div>
      </div>
    </Vertical>
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

.server-header {
  padding: 1rem 1.5rem;
  background: var(--surface);
  border-bottom: 1px solid var(--border);
}

.server-header h1 {
  font-size: 1.2rem;
  font-weight: 800;
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
  padding: 1.5rem;
  background: var(--surface);
}

.reply-bar {
  display: flex;
  justify-content: space-between;
  padding: 8px 12px;
  background: var(--surface);
  border-radius: 8px 8px 0 0;
  font-size: 0.85rem;
  font-weight: 700;
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
  border-radius: 12px;
  border: 1px solid var(--border);
  align-items: center;
}

.input-container input {
  flex: 1;
  height: 40px;
  background: transparent;
  border: none;
  outline: none;
  font-size: 1rem;
  color: var(--text-primary);
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
