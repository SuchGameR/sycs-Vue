<script setup>
import { ref, onMounted, onUnmounted, nextTick, watch } from "vue";
import { useRoute } from "vue-router";
import { useAuthStore } from "../../stores/auth";
import { io } from "socket.io-client";
import { Send, UserPlus, Check, X, UserMinus, MessageSquare } from "lucide-vue-next";
import Vertical from "../configurations/Vertical.vue";
import MessageItem from "../commons/MessageItem.vue";

const route = useRoute();
const authStore = useAuthStore();
const friends = ref([]);
const pendingRequests = ref([]);
const selectedFriend = ref(null);
const messages = ref([]);
const newMessage = ref("");
const messageListRef = ref(null);
const loading = ref(false);
const activeView = ref("chat"); // 'chat' or 'requests'
const replyingTo = ref(null);

const socket = io("/", { path: "/socket.io" });

// ... (previous functions same) ...

const fetchFriends = async () => {
  try {
    const res = await fetch("/api/friends", {
      headers: { Authorization: `Bearer ${authStore.token}` },
    });
    if (res.ok) {
      friends.value = await res.json();
    }
  } catch (e) {
    console.error(e);
  }
};

const fetchPendingRequests = async () => {
  try {
    const res = await fetch("/api/friends/requests/pending", {
      headers: { Authorization: `Bearer ${authStore.token}` },
    });
    if (res.ok) {
      pendingRequests.value = await res.json();
    }
  } catch (e) {
    console.error(e);
  }
};

const fetchDMs = async (friendUid) => {
  loading.value = true;
  try {
    const res = await fetch(`/api/messages/dm/${friendUid}`, {
      headers: { Authorization: `Bearer ${authStore.token}` },
    });
    if (res.ok) {
      messages.value = await res.json();
      scrollToBottom();
    }
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
};

const sendDM = async () => {
  if (!newMessage.value.trim() || !selectedFriend.value) return;

  const content = newMessage.value;
  const parent_id = replyingTo.value?.id;
  newMessage.value = "";
  replyingTo.value = null;

  try {
    const res = await fetch(`/api/messages/dm/${selectedFriend.value.uid}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authStore.token}`,
      },
      body: JSON.stringify({ content, parent_id }),
    });
    if (!res.ok) {
      console.error("Failed to send message");
    }
  } catch (e) {
    console.error(e);
  }
};

const handleKeydown = (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    if (e.isComposing) return;
    e.preventDefault();
    sendDM();
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

const acceptRequest = async (requestId) => {
  try {
    const res = await fetch(`/api/friends/requests/${requestId}/accept`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${authStore.token}` },
    });
    if (res.ok) {
      fetchFriends();
      fetchPendingRequests();
    }
  } catch (e) {
    console.error(e);
  }
};

const rejectRequest = async (requestId) => {
  try {
    const res = await fetch(`/api/friends/requests/${requestId}/reject`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${authStore.token}` },
    });
    if (res.ok) {
      fetchPendingRequests();
    }
  } catch (e) {
    console.error(e);
  }
};

const removeFriend = async (friendId) => {
  if (!confirm("フレンドを削除しますか？")) return;
  try {
    const res = await fetch(`/api/friends/${friendId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${authStore.token}` },
    });
    if (res.ok) {
      if (selectedFriend.value?.id === friendId) {
        selectedFriend.value = null;
        messages.value = [];
      }
      fetchFriends();
    }
  } catch (e) {
    console.error(e);
  }
};

const selectFriend = (friend) => {
  selectedFriend.value = friend;
  activeView.value = "chat";
  messages.value = [];
  fetchDMs(friend.uid);
};

const scrollToBottom = () => {
  nextTick(() => {
    if (messageListRef.value) {
      messageListRef.value.scrollTop = messageListRef.value.scrollHeight;
    }
  });
};

onMounted(() => {
  fetchFriends();
  fetchPendingRequests();

  // URLクエリパラメータから初期ビューを設定
  if (route.query.view === "requests") {
    activeView.value = "requests";
  }

  socket.on(`friend-request-${authStore.user?.id}`, () => {
    fetchPendingRequests();
    if (authStore.incrementNotificationCount) authStore.incrementNotificationCount();
  });

  socket.on(`dm-receive-${authStore.user?.uid}`, (msg) => {
    if (selectedFriend.value && 
        (msg.user_id === selectedFriend.value.id || 
        (msg.user_id === authStore.user?.id && msg.poston === selectedFriend.value.uid))) {
      messages.value.push(msg);
      scrollToBottom();
    } else if (msg.user_id !== authStore.user?.id) {
      if (authStore.incrementNotificationCount) authStore.incrementNotificationCount();
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
</script>

<template>
  <div class="message-layout">
    <!-- フレンドリスト (左側) -->
    <div class="friend-sidebar">
      <div class="sidebar-header">
        <h2>メッセージ</h2>
        <button 
          class="request-badge-btn" 
          :class="{ active: activeView === 'requests' }"
          @click="activeView = 'requests'"
        >
          <UserPlus :size="20" />
          <span v-if="pendingRequests.length > 0" class="badge">
            {{ pendingRequests.length }}
          </span>
        </button>
      </div>

      <div class="friend-list">
        <div 
          v-for="friend in friends" 
          :key="friend.id"
          class="friend-item"
          :class="{ active: selectedFriend?.id === friend.id }"
          @click="selectFriend(friend)"
        >
          <img :src="friend.avatar_url || '/default-avatar.png'" class="avatar" />
          <div class="friend-info">
            <span class="name">{{ friend.username }}</span>
            <span class="handle">@{{ friend.handle }}</span>
          </div>
        </div>
        <div v-if="friends.length === 0" class="empty-list">
          フレンドがいません
        </div>
      </div>
    </div>

    <!-- メインコンテンツ (右側) -->
    <div class="message-main">
      <!-- フレンド申請一覧 -->
      <div v-if="activeView === 'requests'" class="requests-view">
        <div class="view-header">
          <h3>フレンド申請</h3>
          <button @click="activeView = 'chat'" class="close-btn"><X /></button>
        </div>
        <div class="request-list">
          <div v-for="req in pendingRequests" :key="req.request_id" class="request-item">
            <img :src="req.avatar_url || '/default-avatar.png'" class="avatar" />
            <div class="request-info">
              <span class="name">{{ req.username }}</span>
              <span class="handle">@{{ req.handle }}</span>
            </div>
            <div class="actions">
              <button @click="acceptRequest(req.request_id)" class="accept-btn">
                <Check :size="18" /> 承認
              </button>
              <button @click="rejectRequest(req.request_id)" class="reject-btn">
                <X :size="18" /> 拒否
              </button>
            </div>
          </div>
          <div v-if="pendingRequests.length === 0" class="empty-state">
            新しい申請はありません
          </div>
        </div>
      </div>

      <!-- チャット画面 -->
      <div v-else-if="selectedFriend" class="chat-view">
        <div class="chat-header">
          <div class="user-info">
            <img :src="selectedFriend.avatar_url || '/default-avatar.png'" class="avatar" />
            <div>
              <div class="name">{{ selectedFriend.username }}</div>
              <div class="handle">@{{ selectedFriend.handle }}</div>
            </div>
          </div>
          <button @click="removeFriend(selectedFriend.id)" class="delete-friend-btn" title="フレンド解除">
            <UserMinus :size="18" />
          </button>
        </div>

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
          <div v-if="loading" class="loading">読み込み中...</div>
          <div v-if="messages.length === 0 && !loading" class="empty-chat">
            メッセージを送ってみましょう！
          </div>
        </div>

        <div class="chat-input-area">
          <div v-if="replyingTo" class="reply-bar">
            <span>{{ replyingTo.author_name }} への返信</span>
            <button @click="replyingTo = null"><X :size="14" /></button>
          </div>
          <div class="input-container">
            <textarea 
              v-model="newMessage" 
              placeholder="メッセージを入力..." 
              @keydown="handleKeydown"
              rows="1"
            ></textarea>
            <button @click="sendDM" :disabled="!newMessage.trim()" class="send-btn">
              <Send :size="20" />
            </button>
          </div>
        </div>
      </div>

      <!-- 未選択状態 -->
      <div v-else class="no-selection">
        <MessageSquare :size="64" />
        <p>フレンドを選択してチャットを開始してください</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.message-layout {
  display: flex;
  width: 100%;
  height: 100vh;
  background: var(--background);
}

.friend-sidebar {
  width: 320px;
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  background: var(--surface);
}

.sidebar-header {
  padding: 1.5rem;
  border-bottom: 1px solid var(--border);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sidebar-header h2 {
  font-size: 1.25rem;
  font-weight: 800;
  margin: 0;
}

.request-badge-btn {
  position: relative;
  background: transparent;
  border: none;
  cursor: pointer;
  color: var(--text-secondary);
  padding: 8px;
  border-radius: 50%;
  transition: all 0.2s;
}

.request-badge-btn:hover, .request-badge-btn.active {
  background: rgba(var(--accent-rgb), 0.1);
  color: var(--accent);
}

.badge {
  position: absolute;
  top: 0;
  right: 0;
  background: #ff4757;
  color: white;
  font-size: 0.7rem;
  padding: 2px 5px;
  border-radius: 10px;
  min-width: 16px;
  border: 2px solid var(--surface);
}

.friend-list {
  flex: 1;
  overflow-y: auto;
}

.friend-item {
  display: flex;
  align-items: center;
  padding: 1rem 1.5rem;
  cursor: pointer;
  transition: background 0.2s;
}

.friend-item:hover {
  background: rgba(0, 0, 0, 0.03);
}

.friend-item.active {
  background: rgba(var(--accent-rgb), 0.05);
  border-right: 3px solid var(--accent);
}

.avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 12px;
}

.friend-info {
  display: flex;
  flex-direction: column;
}

.friend-info .name {
  font-weight: 700;
  color: var(--text-primary);
}

.friend-info .handle {
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.empty-list {
  padding: 2rem;
  text-align: center;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.message-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: var(--background);
  overflow: hidden;
}

.view-header {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--border);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--surface);
}

.requests-view {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.request-list {
  padding: 1rem;
}

.request-item {
  display: flex;
  align-items: center;
  padding: 1rem;
  background: var(--surface);
  border-radius: 12px;
  margin-bottom: 0.75rem;
  border: 1px solid var(--border);
}

.request-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  margin: 0 1rem;
}

.actions {
  display: flex;
  gap: 0.5rem;
}

.accept-btn, .reject-btn {
  padding: 6px 12px;
  border-radius: 20px;
  border: none;
  font-weight: 700;
  font-size: 0.85rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
}

.accept-btn {
  background: var(--accent);
  color: white;
}

.reject-btn {
  background: var(--secondary);
  color: var(--text-primary);
}

.chat-view {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.chat-header {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--border);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--surface);
}

.chat-header .user-info {
  display: flex;
  align-items: center;
}

.chat-header .name {
  font-weight: 800;
  font-size: 1.1rem;
}

.chat-header .handle {
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.delete-friend-btn {
  background: transparent;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
}

.delete-friend-btn:hover {
  background: rgba(255, 71, 87, 0.1);
  color: #ff4757;
}

.message-list {
  flex: 1;
  overflow-y: auto;
  padding: 1rem 0;
  display: flex;
  flex-direction: column;
}

.chat-input-area {
  padding: 1.5rem;
  background: var(--surface);
  border-top: 1px solid var(--border);
  display: flex;
  flex-direction: column;
}

.reply-bar {
  background: var(--background);
  display: flex;
  justify-content: space-between;
  padding: 8px 12px;
  border-radius: 12px 12px 0 0;
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

.send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.no-selection {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: var(--text-secondary);
  text-align: center;
}

.no-selection p {
  margin-top: 1.5rem;
  font-size: 1.1rem;
  font-weight: 600;
}

.loading {
  text-align: center;
  padding: 1rem;
  color: var(--text-secondary);
}

.empty-chat {
  text-align: center;
  padding: 4rem;
  color: var(--text-secondary);
  font-style: italic;
}

@media (max-width: 768px) {
  .friend-sidebar {
    width: 80px;
  }
  .sidebar-header h2, .friend-info {
    display: none;
  }
  .sidebar-header {
    justify-content: center;
  }
  .friend-item {
    justify-content: center;
    padding: 1rem 0;
  }
  .avatar {
    margin-right: 0;
  }
}
</style>
