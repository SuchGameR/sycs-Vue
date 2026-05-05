<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from "vue";
import { useRoute } from "vue-router";
import { io } from "socket.io-client";
import { useAuthStore } from "../../stores/auth";
import Vertical from "../configurations/Vertical.vue";

const route = useRoute();
const authStore = useAuthStore();
const currentServer = ref(null);
const channels = ref([]);
const currentChannelId = ref(null);
const messages = ref([]);
const newMessage = ref("");
const messageListRef = ref(null);

const socket = io(`http://${window.location.hostname}:3001`);

const fetchServerInfo = async () => {
  const serverId = route.params.id || route.params.serverId;
  if (!serverId) return;

  try {
    const res = await fetch(
      `http://${window.location.hostname}:3001/api/servers`,
    );
    if (res.ok) {
      const servers = await res.json();
      currentServer.value =
        servers.find((s) => String(s.id) === String(serverId)) || null;
    }
  } catch (e) {
    console.error(e);
  }
};

const fetchChannels = async () => {
  const serverId = route.params.id || route.params.serverId;
  if (!serverId) return;

  try {
    const res = await fetch(
      `http://${window.location.hostname}:3001/api/servers/${serverId}/channels`,
    );
    if (res.ok) {
      channels.value = await res.json();
      if (channels.value.length > 0) {
        const cid = route.params.channelId || channels.value[0].id;
        currentChannelId.value = parseInt(cid);
        fetchMessages();
        socket.emit("join-channel", currentChannelId.value);
      }
    }
  } catch (e) {
    console.log(e);
  }
};

const fetchData = async () => {
  await fetchServerInfo();
  await fetchChannels();
};

const fetchMessages = async () => {
  if (!currentChannelId.value) return;
  try {
    const res = await fetch(
      `http://${window.location.hostname}:3001/api/channels/${currentChannelId.value}/messages`,
    );
    if (res.ok) {
      messages.value = await res.json();
      scrollToBottom();
    }
  } catch (e) {
    console.log(e);
  }
};

const sendMessage = async () => {
  if (!newMessage.value.trim() || !currentChannelId.value) return;
  const content = newMessage.value;
  newMessage.value = "";

  const authorName = authStore.user ? authStore.user.username : "Guest";
  const userId = authStore.user ? authStore.user.id : null;

  try {
    const res = await fetch(
      `http://${window.location.hostname}:3001/api/channels/${currentChannelId.value}/messages`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          author_name: authorName,
          content: content,
          user_id: userId
        }),
      },
    );
    // リアルタイム通信（socket.emitの受信）でメッセージが追加されるため、ここでは追加しない
  } catch (e) {
    console.error(e);
  }
};

const selectChannel = (id) => {
  if (currentChannelId.value) {
    // 以前のチャンネルから抜ける処理（バックエンドで実装が必要な場合は追加）
  }
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
});

onUnmounted(() => {
  socket.disconnect();
});

watch(
  () => route.params.id,
  (newId) => {
    if (newId) {
      currentChannelId.value = null;
      fetchData();
    }
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
      <section class="optionUtilTabs">
        <div
          v-for="channel in channels"
          :key="channel.id"
          class="tab-item"
          :class="{ active: currentChannelId === channel.id }"
          @click="selectChannel(channel.id)"
        >
          <span class="hash">#</span> {{ channel.name }}
        </div>
      </section>
      <div class="chatArea">
        <div class="messageList" ref="messageListRef">
          <div v-if="messages.length === 0" class="empty-chat">
            Messages will appear here...
          </div>
          <div v-for="msg in messages" :key="msg.id" class="message">
            <div class="avatar-stub"></div>
            <div class="msg-content">
              <div class="msg-header">
                <span class="author">{{ msg.author_name }}</span>
                <span class="time">{{
                  new Date(msg.created_at).toLocaleTimeString()
                }}</span>
              </div>
              <div class="text">{{ msg.content }}</div>
            </div>
          </div>
        </div>

        <div class="inputArea">
          <div class="input-wrapper">
            <input
              v-model="newMessage"
              placeholder="Type a message..."
              @keyup.enter="sendMessage"
            />
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
  padding: 10px 20px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.server-header h1 {
  font-size: 1.2rem;
  margin: 0;
}

.mainContainer {
  width: 100%;
  height: 100vh;
}

.optionUtilTabs {
  height: 45px;
  width: 100%;
  display: flex;
  gap: 4px;
  overflow-x: auto;
  padding: 8 2px 0 20px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.tab-item {
  padding: 0 12px;
  height: 30px;
  display: flex;
  align-items: center;
  background-color: transparent;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  color: var(--text-secondary);
  transition: all 0.2s;
  user-select: none;
  white-space: nowrap;
}

.tab-item:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.active {
  background-color: var(--primary);
  color: var(--background);
}

.hash {
  opacity: 0.5;
  margin-right: 4px;
}

.chatArea {
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}

.messageList {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.empty-chat {
  color: var(--text-secondary);
  text-align: center;
  margin-top: 40px;
  font-style: italic;
}

.message {
  display: flex;
  gap: 12px;
}

.avatar-stub {
  width: 40px;
  height: 40px;
  background-color: #ddd;
  border-radius: 50%;
  flex-shrink: 0;
}

.msg-header {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 4px;
}

.author {
  font-weight: bold;
  font-size: 1rem;
}

.time {
  font-size: 0.75rem;
  color: #888;
}

.text {
  line-height: 1.5;
  word-break: break-word;
}

.inputArea {
  padding-bottom: 20px;
  margin: 0 auto;
  width: calc(100% - 40px);
  transform: scale(1.02);
}

.input-wrapper {
  background-color: rgba(0, 0, 0, 0.05);
  border-radius: 8px;
  padding: 2px 16px;
}

.inputArea input {
  width: 100%;
  height: 44px;
  background: transparent;
  border: none;
  outline: none;
  font-size: 1rem;
  color: var(--text-primary);
}
</style>
