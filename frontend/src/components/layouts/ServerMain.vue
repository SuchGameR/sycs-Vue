<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick, computed } from "vue";
import { useRoute } from "vue-router";
import { io } from "socket.io-client";
import {
  X,
  Send,
  Settings as SettingsIcon,
  Music,
  File as FileIcon,
  Download,
  EyeOff,
  Plus,
} from "lucide-vue-next";
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
const isUploading = ref(false);

const selectedFiles = ref([]);
const previews = ref([]);
const fileInput = ref(null);

const handleFileSelect = (e) => {
  const files = Array.from(e.target.files);
  files.forEach((file) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      previews.value.push({
        url: event.target.result,
        type: file.type,
        name: file.name,
      });
      selectedFiles.value.push({
        file,
        options: {
          blur: false,
          downloadable: true,
        },
      });
    };
    reader.readAsDataURL(file);
  });
};

const removeFile = (idx) => {
  previews.value.splice(idx, 1);
  selectedFiles.value.splice(idx, 1);
};

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
  if (
    (!newMessage.value.trim() && selectedFiles.value.length === 0) ||
    !currentChannelId.value ||
    isUploading.value
  )
    return;

  const content = newMessage.value;
  const parent_id = replyingTo.value?.id;
  const currentFiles = [...selectedFiles.value];

  isUploading.value = true;
  newMessage.value = "";
  replyingTo.value = null;
  selectedFiles.value = [];
  previews.value = [];

  try {
    let attachment = [];
    if (currentFiles.length > 0) {
      const formData = new FormData();
      currentFiles.forEach(({ file }) => formData.append("files", file));
      formData.append(
        "options",
        JSON.stringify(currentFiles.map((f) => f.options)),
      );

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${authStore.token}` },
        body: formData,
      });
      if (uploadRes.ok) attachment = await uploadRes.json();
    }

    const res = await fetch(
      `/api/channels/${currentChannelId.value}/messages`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authStore.token}`,
        },
        body: JSON.stringify({ content, parent_id, attachment }),
      },
    );
    if (!res.ok) {
      alert("メッセージの送信に失敗しました");
    }
  } catch (e) {
    console.error(e);
    alert("通信エラーが発生しました");
  } finally {
    isUploading.value = false;
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

  socket.on("server-updated", (updatedServer) => {
    if (currentServer.value && currentServer.value.id === updatedServer.id) {
      currentServer.value = { ...currentServer.value, ...updatedServer };
    }
  });

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

          <!-- File Previews -->
          <div v-if="previews.length > 0" class="previews-container">
            <div
              v-for="(file, idx) in previews"
              :key="idx"
              class="preview-item"
            >
              <button class="remove-file" @click="removeFile(idx)">
                <X :size="12" />
              </button>
              <img
                v-if="file.type.startsWith('image/')"
                :src="file.url"
                class="preview-media"
                :class="{ 'preview-blur': selectedFiles[idx].options.blur }"
              />
              <video
                v-else-if="file.type.startsWith('video/')"
                :src="file.url"
                class="preview-media"
                muted
                :class="{ 'preview-blur': selectedFiles[idx].options.blur }"
              ></video>
              <div
                v-else-if="file.type.startsWith('audio/')"
                class="preview-file-icon audio"
              >
                <Music :size="20" />
                <span class="file-name">{{ file.name }}</span>
              </div>
              <div v-else class="preview-file-icon">
                <FileIcon :size="20" />
                <span class="file-name">{{ file.name }}</span>
              </div>

              <!-- Options Overlay -->
              <div class="preview-options">
                <button
                  class="opt-btn"
                  :class="{ active: selectedFiles[idx].options.downloadable }"
                  @click="
                    selectedFiles[idx].options.downloadable =
                      !selectedFiles[idx].options.downloadable
                  "
                  title="ダウンロード許可"
                >
                  <Download :size="12" />
                </button>
                <button
                  class="opt-btn"
                  :class="{ active: selectedFiles[idx].options.blur }"
                  @click="
                    selectedFiles[idx].options.blur =
                      !selectedFiles[idx].options.blur
                  "
                  title="ぼかし"
                >
                  <EyeOff :size="12" />
                </button>
              </div>
            </div>
          </div>

          <div class="input-container">
            <input
              type="file"
              ref="fileInput"
              multiple
              hidden
              @change="handleFileSelect"
              accept=".jpeg,.jpg,.png,.gif,.svg,.webm,.mp3,.wav,.ogg,.mp4,.mov,.md"
            />
            <button
              class="attach-btn"
              @click="fileInput.click()"
              title="ファイルを添付"
            >
              <Plus :size="20" />
            </button>
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
            <button
              @click="sendMessage"
              :disabled="
                (!newMessage.trim() && selectedFiles.length === 0) ||
                isUploading
              "
              class="send-btn"
            >
              <Send v-if="!isUploading" :size="20" />
              <div v-else class="upload-spinner"></div>
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
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: var(--background);
  color: var(--text-primary);
  min-width: 350px;
  width: 100%;
  max-width: 800px;
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
  /* transform: scale(1.05); */
}

.previews-container {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding: 8px 0;
  margin-bottom: 8px;
  scrollbar-width: thin;
}

.preview-item {
  position: relative;
  flex-shrink: 0;
  width: 80px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid var(--border);
  background: var(--background);
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-media {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.preview-media.preview-blur {
  filter: blur(8px);
}

.preview-options {
  position: absolute;
  bottom: 2px;
  left: 2px;
  right: 2px;
  display: flex;
  gap: 2px;
  justify-content: center;
  z-index: 5;
}

.opt-btn {
  background: rgba(0, 0, 0, 0.6);
  color: white;
  border: none;
  border-radius: 4px;
  padding: 2px;
  cursor: pointer;
  display: flex;
  align-items: center;
  opacity: 0.8;
  transition: all 0.2s;
}

.opt-btn:hover {
  opacity: 1;
  background: rgba(0, 0, 0, 0.9);
}

.opt-btn.active {
  background: var(--accent);
  opacity: 1;
}

.preview-file-icon {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  color: var(--text-secondary);
  padding: 4px;
  text-align: center;
}

.preview-file-icon .file-name {
  font-size: 0.5rem;
  word-break: break-all;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.remove-file {
  position: absolute;
  top: 2px;
  right: 2px;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  border: none;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
}

.reply-bar + .previews-container {
  margin-top: -12px;
  border-left: 1px solid var(--border);
  border-right: 1px solid var(--border);
  padding-left: 8px;
  padding-right: 8px;
  background: var(--surface);
}

.reply-bar {
  background: var(--surface);
  line-height: 30px;
  display: flex;
  justify-content: space-between;
  padding: 8px 12px;
  padding-right: 4px;
  z-index: +1;
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
  align-items: flex-end;
}

.attach-btn {
  background: transparent;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 8px 0;
  display: flex;
  align-items: center;
  transition: all 0.2s;
}

.attach-btn:hover {
  color: var(--accent);
}

.upload-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(var(--accent-rgb), 0.3);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
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
  padding: 10px 0;
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
