<script setup>
import { ref, onMounted, onUnmounted, nextTick, watch } from "vue";
import { useAuthStore } from "../../stores/auth";
import { io } from "socket.io-client";
import { X } from "lucide-vue-next";
import Vertical from "../configurations/Vertical.vue";
import PostModal from "../popups/PostModal.vue";
import MessageItem from "../commons/MessageItem.vue";

const authStore = useAuthStore();
const messages = ref([]);
const messageListRef = ref(null);
const loading = ref(false);
const hasMore = ref(true);
const offset = ref(0);
const limit = 20;
const activeTab = ref("global");
const showPostModal = ref(false);
const replyingTo = ref(null);

const socket = io(`http://${window.location.hostname}:3001`);

const fetchMessages = async (isLoadMore = false) => {
  if (
    loading.value ||
    (!isLoadMore && !hasMore.value && messages.value.length > 0)
  )
    return;
  loading.value = true;

  if (!isLoadMore) {
    messages.value = [];
    offset.value = 0;
    hasMore.value = true;
  }

  try {
    const res = await fetch(
      `http://${window.location.hostname}:3001/api/messages/${activeTab.value}?limit=${limit}&offset=${offset.value}`,
      {
        headers: authStore.token
          ? { Authorization: `Bearer ${authStore.token}` }
          : {},
      },
    );
    if (res.ok) {
      const data = await res.json();
      if (data.length < limit) hasMore.value = false;

      if (isLoadMore) {
        messages.value = [...messages.value, ...data];
      } else {
        messages.value = data;
      }
      offset.value += data.length;
    }
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
};

const handlePost = async (content) => {
  try {
    const res = await fetch(
      `http://${window.location.hostname}:3001/api/messages/global`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authStore.token}`,
        },
        body: JSON.stringify({
          content,
          parent_id: replyingTo.value?.id,
        }),
      },
    );
    if (res.ok) {
      showPostModal.value = false;
      replyingTo.value = null;
      if (activeTab.value === "global") {
        fetchMessages();
      }
    }
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

const startReply = (msg) => {
  replyingTo.value = msg;
  showPostModal.value = true;
};

const handleScroll = () => {
  if (authStore.timelineMode !== "scroll") return;
  const el = messageListRef.value;
  if (el && el.scrollHeight - el.scrollTop <= el.clientHeight + 50) {
    fetchMessages(true);
  }
};

const scrollToBottom = () => {
  nextTick(() => {
    if (messageListRef.value && authStore.timelineMode === "stream") {
      messageListRef.value.scrollTop = messageListRef.value.scrollHeight;
    }
  });
};

const switchTab = (tab) => {
  activeTab.value = tab;
  fetchMessages();
};

onMounted(() => {
  fetchMessages();

  socket.on("new-global-message", (msg) => {
    if (activeTab.value === "global") {
      messages.value.unshift(msg);
      if (authStore.timelineMode === "stream") {
        scrollToBottom();
      }
      if (messages.value.length > 100) messages.value.pop();
    }
    if (msg.user_id !== authStore.user?.id) {
      authStore.incrementNotificationCount();
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

watch(activeTab, () => {
  if (activeTab.value === "global") {
    authStore.resetNotificationCount();
  }
});
</script>

<template>
  <main>
    <Vertical class="mainContainer">
      <!-- タブ切り替えエリア -->
      <section class="tabs">
        <div
          v-for="tab in ['global', 'local', 'follow', 'recommend']"
          :key="tab"
          class="tab-item"
          :class="{ active: activeTab === tab }"
          @click="switchTab(tab)"
        >
          {{ authStore.t[tab] }}
          <span
            v-if="tab === 'global' && authStore.notificationCount > 0"
            class="badge"
          >
            {{ authStore.notificationCount }}
          </span>
        </div>
      </section>

      <!-- タイムラインエリア -->
      <div class="timeline" ref="messageListRef" @scroll="handleScroll">
        <MessageItem
          v-for="msg in messages"
          :key="msg.id"
          :msg="msg"
          @reply="startReply"
          @react="handleReact"
        />
        <div v-if="loading" class="loading">{{ authStore.t.now_loading }}</div>
        <div v-if="!hasMore && messages.length > 0" class="no-more">
          {{ authStore.t.no_more }}
        </div>
        <div v-if="!loading && messages.length === 0" class="empty">
          {{ authStore.t.empty }}
        </div>
      </div>

      <!-- フローティング投稿ボタン -->
      <button class="fab" @click="showPostModal = true">
        <span class="plus">+</span>
      </button>

      <!-- 投稿モーダル -->
      <PostModal
        :show="showPostModal"
        :placeholder="
          replyingTo
            ? `${replyingTo.author_name} への返信...`
            : authStore.t.whats_happening
        "
        :btn-text="replyingTo ? '返信する' : authStore.t.post_btn"
        :title="replyingTo ? '返信' : authStore.t.new_post"
        @close="
          showPostModal = false;
          replyingTo = null;
        "
        @submit="handlePost"
      >
        <template #header-extra v-if="replyingTo">
          <div class="replying-preview">
            <span class="replying-to"
              >返信先: {{ replyingTo.author_name }}</span
            >
            <button class="clear-reply" @click="replyingTo = null">
              <X :size="14" />
            </button>
          </div>
        </template>
      </PostModal>
    </Vertical>
  </main>
</template>

<style scoped>
main {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100vh;
  background-color: var(--background);
  color: var(--text-primary);
  position: relative;
  max-width: 800px;
}

.mainContainer {
  width: 100%;
  height: 100%;
}

.tabs {
  width: 100%;
  display: flex;
  white-space: nowrap;
  border-bottom: 1px solid var(--border);
  background: var(--surface);
  position: sticky;
  top: 0;
  z-index: 100;
}

.tab-item {
  flex: 1;
  padding: 1rem 0.5rem;
  text-align: center;
  cursor: pointer;
  font-weight: 800;
  color: var(--text-secondary);
  position: relative;
  transition: all 0.2s;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.tab-item:hover {
  background-color: rgba(0, 0, 0, 0.03);
}

.tab-item.active {
  color: var(--accent);
}

.tab-item.active::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 20%;
  right: 20%;
  height: 4px;
  background: var(--accent);
  border-radius: 4px 4px 0 0;
}

.badge {
  position: absolute;
  top: 6px;
  right: 10%;
  background: #ff4757;
  color: white;
  font-size: 0.65rem;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 18px;
  font-weight: 900;
}

.timeline {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.fab {
  position: absolute;
  bottom: 2rem;
  right: 2rem;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: var(--accent);
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  z-index: 500;
}

.fab:hover {
  background-color: var(--light-accent);
}

.plus {
  font-size: 2.5rem;
  line-height: 1;
}

.loading,
.no-more,
.empty {
  padding: 4rem;
  text-align: center;
  color: var(--text-secondary);
  font-size: 0.95rem;
  font-weight: 600;
}

.replying-preview {
  padding: 10px 16px;
  background: var(--secondary);
  border-radius: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  border: 1px solid var(--border);
}

.replying-to {
  font-size: 0.9rem;
  font-weight: 800;
  color: var(--accent);
}

.clear-reply {
  background: transparent;
  border: none;
  cursor: pointer;
  color: var(--text-secondary);
  padding: 4px;
  border-radius: 50%;
  display: flex;
  align-items: center;
}

.clear-reply:hover {
  background: rgba(0, 0, 0, 0.1);
  color: #ff4757;
}
</style>
