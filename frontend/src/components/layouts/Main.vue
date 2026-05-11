<script setup>
import { ref, onMounted, onUnmounted, nextTick, watch } from "vue";
import { useAuthStore } from "../../stores/auth";
import { useRouter } from "vue-router";
import { io } from "socket.io-client";
import { X, Menu, RefreshCw } from "lucide-vue-next";
import * as icons from "lucide-vue-next";
import Vertical from "../configurations/Vertical.vue";
import PostModal from "../popups/PostModal.vue";
import MessageItem from "../commons/MessageItem.vue";
import InlinePost from "../commons/InlinePost.vue";
import TweetItem from "../commons/TweetItem.vue";

import { useUIStore } from "../../stores/ui";

const authStore = useAuthStore();
const uiStore = useUIStore();
const router = useRouter();
const messages = ref([]);
const messageListRef = ref(null);
const loading = ref(false);
const hasMore = ref(true);
const offset = ref(0);
const limit = 20;
const activeTab = ref("recommend");
const showPostModal = ref(false);
const isPosting = ref(false);
const replyingTo = ref(null);

const socket = io("/", { path: "/socket.io" });

// Pull to Refresh State
const isPulling = ref(false);
const pullDistance = ref(0);
const startTouchY = ref(0);
const REFRESH_THRESHOLD = 80;

const handleTouchStart = (e) => {
  const el = messageListRef.value;
  if (el && el.scrollTop <= 0) {
    startTouchY.value = e.touches[0].clientY;
  } else {
    startTouchY.value = 0;
  }
};

const handleTouchMove = (e) => {
  if (startTouchY.value === 0) return;

  const currentY = e.touches[0].clientY;
  const distance = currentY - startTouchY.value;

  if (distance > 0) {
    isPulling.value = true;
    // 指の動きに対して少し重くする（抵抗感）
    pullDistance.value = Math.min(distance * 0.4, 120);
  }
};

const handleTouchEnd = async () => {
  if (!isPulling.value) return;

  if (pullDistance.value >= REFRESH_THRESHOLD) {
    await fetchMessages();
  }

  // Reset with animation
  const step = pullDistance.value / 10;
  const resetInterval = setInterval(() => {
    if (pullDistance.value <= 0) {
      clearInterval(resetInterval);
      isPulling.value = false;
      pullDistance.value = 0;
    } else {
      pullDistance.value -= step;
    }
  }, 16);

  startTouchY.value = 0;
};

const fetchMessages = async (isLoadMore = false) => {
  if (loading.value) return;
  if (isLoadMore && !hasMore.value) return;

  loading.value = true;

  if (!isLoadMore) {
    messages.value = [];
    offset.value = 0;
    hasMore.value = true;
  }

  try {
    const res = await fetch(
      `/api/messages/${activeTab.value}?limit=${limit}&offset=${offset.value}`,
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

const handlePost = async (postData) => {
  if (isPosting.value) return;
  isPosting.value = true;

  const content = typeof postData === "string" ? postData : postData.content;
  const attachment = typeof postData === "object" ? postData.attachment : [];

  try {
    const res = await fetch(`/api/messages/global`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authStore.token}`,
      },
      body: JSON.stringify({
        content,
        attachment,
        parent_id: replyingTo.value?.id,
      }),
    });
    if (res.ok) {
      const parentId = replyingTo.value?.id;
      showPostModal.value = false;
      replyingTo.value = null;
      if (parentId) {
        router.push(`/status/${parentId}`);
      } else {
        fetchMessages();
      }
    }
  } catch (e) {
    console.error(e);
  } finally {
    isPosting.value = false;
  }
};

const handleRetweet = async (msg) => {
  try {
    const res = await fetch(`/api/messages/${msg.id}/retweet`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${authStore.token}`,
      },
    });
    if (res.ok) {
      fetchMessages();
    }
  } catch (e) {
    console.error(e);
  }
};

const handleBookmark = async (msg) => {
  try {
    const res = await fetch(`/api/messages/${msg.id}/bookmark`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${authStore.token}`,
      },
    });
    if (res.ok) {
      const data = await res.json();
      const target = messages.value.find((m) => m.id === msg.id);
      if (target) {
        target.is_bookmarked = data.bookmarked;
        target.bookmark_count =
          (target.bookmark_count || 0) + (data.bookmarked ? 1 : -1);
      }
    }
  } catch (e) {
    console.error(e);
  }
};

const handleReact = async (messageId, emoji) => {
  const mid = typeof messageId === "object" ? messageId.id : messageId;
  const emojiStr = typeof emoji === "string" ? emoji : "❤️";

  try {
    const res = await fetch(`/api/messages/${mid}/reactions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authStore.token}`,
      },
      body: JSON.stringify({ emoji: emojiStr }),
    });
    if (res.ok) {
      const reactions = await res.json();
      const msg = messages.value.find((m) => m.id === mid);
      if (msg) {
        msg.reactions = reactions;
        msg.is_liked = (reactions["❤️"] || []).includes(authStore.user?.id);
      }
    }
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

  socket.on("public-message", (msg) => {
    // 1. 返信は表示しない
    if (msg.parent_id) return;

    // 2. 現在のタブに合わせて反映
    let shouldAdd = false;

    if (activeTab.value === "global" || activeTab.value === "recommend") {
      // グローバル/おすすめは全てのトップレベルメッセージを表示
      shouldAdd = true;
    } else if (activeTab.value === "follow") {
      // フォロー中の場合は著者が自分かフォロー中である必要がある
      // ここでは簡略化のため、著者が自分であるか、サーバーから何らかのフラグが欲しいが、
      // クライアント側でフォローリストを持っていないため、一旦自分のみか再取得を検討
      // ユーザーの利便性のため、自分の投稿は必ず表示する
      if (msg.user_id === authStore.user?.id) shouldAdd = true;
    } else if (activeTab.value === "local") {
      // ローカルはチャンネルIDがある（サーバー投稿）場合
      if (msg.channel_id) shouldAdd = true;
    }

    if (shouldAdd) {
      // 重複チェック
      if (!messages.value.find((m) => m.id === msg.id)) {
        messages.value.unshift(msg);
        if (authStore.timelineMode === "stream") {
          scrollToBottom();
        }
        if (messages.value.length > 100) messages.value.pop();
      }
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

watch(activeTab, () => {
  if (activeTab.value === "global") {
    authStore.resetNotificationCount();
  }
});
</script>

<template>
  <div class="main-layout">
    <Vertical class="mainContainer">
      <!-- タブ切り替えエリア -->
      <section class="tabs">
        <div
          v-for="tab in ['recommend', 'follow', 'global', 'local']"
          :key="tab"
          class="tab-item"
          :class="{ active: activeTab === tab }"
          @click="switchTab(tab)"
        >
          {{ authStore.t[tab] }}
        </div>
        <!-- Toggle button for List.vue (Small Window) -->
        <button
          v-if="uiStore.isSmallWindow"
          class="list-toggle-btn"
          @click="uiStore.toggleList"
          title="メンバーリストを表示"
        >
          <Menu :size="20" />
        </button>
      </section>

      <!-- タイムラインエリア -->
      <div
        class="timeline"
        ref="messageListRef"
        @scroll="handleScroll"
        @touchstart="handleTouchStart"
        @touchmove="handleTouchMove"
        @touchend="handleTouchEnd"
      >
        <!-- Pull to Refresh Indicator -->
        <div
          v-if="isPulling"
          class="pull-indicator"
          :style="{
            height: pullDistance + 'px',
            opacity: pullDistance / REFRESH_THRESHOLD,
          }"
        >
          <icons.RefreshCw
            :size="24"
            :class="{ rotating: pullDistance >= REFRESH_THRESHOLD || loading }"
          />
        </div>

        <!-- インライン投稿エリア (Twitter風) -->
        <InlinePost :loading="isPosting" @submit="handlePost" />

        <TweetItem
          v-for="msg in messages"
          :key="msg.id"
          :msg="msg"
          @reply="startReply"
          @retweet="handleRetweet"
          @like="handleReact"
          @bookmark="handleBookmark"
          @edit="handleEdit"
          @delete="handleDelete"
          @refresh="fetchMessages"
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
        :loading="isPosting"
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
  </div>
</template>

<style scoped>
.main-layout {
  flex: 1;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100vh;
  background-color: var(--background);
  color: var(--text-primary);
  position: relative;
  max-width: 800px;
  overflow: hidden;
}

@media (max-width: 510px) {
  .main-layout {
    max-width: 100%;
  }

  .fab {
    bottom: 8rem !important;
  }
}

.mainContainer {
  flex: 1;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
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
  background-color: rgba(0, 0, 0, 0.05);
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

.list-toggle-btn {
  background: transparent;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 0 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.list-toggle-btn:hover {
  background-color: rgba(0, 0, 0, 0.05);
  color: var(--accent);
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
  position: relative;
}

.pull-indicator {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  color: var(--accent);
  background: var(--surface);
  transition: height 0.1s ease-out;
}

.rotating {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
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
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  z-index: 500;
}

.fab:hover {
  transform: scale(1.1) rotate(90deg);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.3);
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
