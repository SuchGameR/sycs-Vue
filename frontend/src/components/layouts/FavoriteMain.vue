<script setup>
import { ref, onMounted, onUnmounted, nextTick, watch } from "vue";
import { useAuthStore } from "../../stores/auth";
import { useUIStore } from "../../stores/ui";
import { useRouter } from "vue-router";
import { io } from "socket.io-client";
import { Menu } from "lucide-vue-next";
import Vertical from "../configurations/Vertical.vue";
import TweetItem from "../commons/TweetItem.vue";

const authStore = useAuthStore();
const uiStore = useUIStore();
const router = useRouter();
const messages = ref([]);
const messageListRef = ref(null);
const loading = ref(false);
const hasMore = ref(true);
const offset = ref(0);
const limit = 20;
const activeTab = ref("likes"); // likes, bookmarks, retweets

const socket = io("/", { path: "/socket.io" });

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
        headers: { Authorization: `Bearer ${authStore.token}` },
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

const handleRetweet = async (msg) => {
  try {
    const res = await fetch(`/api/messages/${msg.id}/retweet`, {
      method: "POST",
      headers: { Authorization: `Bearer ${authStore.token}` },
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
      headers: { Authorization: `Bearer ${authStore.token}` },
    });
    if (res.ok) {
      // Re-fetch to update list (especially in bookmarks tab)
      fetchMessages();
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
      fetchMessages();
    }
  } catch (e) {
    console.error(e);
  }
};

const handleScroll = () => {
  const el = messageListRef.value;
  if (el && el.scrollHeight - el.scrollTop <= el.clientHeight + 50) {
    fetchMessages(true);
  }
};

const switchTab = (tab) => {
  activeTab.value = tab;
  fetchMessages();
};

onMounted(() => {
  fetchMessages();
});

onUnmounted(() => {
  socket.disconnect();
});
</script>

<template>
  <div class="favorite-main-layout">
    <Vertical class="mainContainer">
      <section class="tabs">
        <div
          v-for="tab in ['likes', 'bookmarks', 'retweets']"
          :key="tab"
          class="tab-item"
          :class="{ active: activeTab === tab }"
          @click="switchTab(tab)"
        >
          {{ authStore.t[tab] }}
        </div>
        <button
          v-if="uiStore.isSmallWindow"
          class="list-toggle-btn"
          @click="uiStore.toggleList"
          title="メンバーリストを表示"
        >
          <Menu :size="20" />
        </button>
      </section>

      <div class="timeline" ref="messageListRef" @scroll="handleScroll">
        <TweetItem
          v-for="msg in messages"
          :key="msg.id"
          :msg="msg"
          @retweet="handleRetweet"
          @like="handleReact"
          @bookmark="handleBookmark"
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
    </Vertical>
  </div>
</template>

<style scoped>
.favorite-main-layout {
  flex: 1;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  background-color: var(--background);
  color: var(--text-primary);
  position: relative;
  max-width: 800px;
  overflow: hidden;
}

@media (max-width: 510px) {
  .favorite-main-layout {
    max-width: 100%;
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
  height: 60px;
  top: 0;
  z-index: 100;
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.tabs::-webkit-scrollbar {
  display: none;
}

.tab-item {
  flex: 1;
  min-width: 100px;
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

.timeline {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
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
</style>
