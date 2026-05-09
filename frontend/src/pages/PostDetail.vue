<script setup>
import { ref, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";
import { ArrowLeft } from "lucide-vue-next";
import TweetItem from "../components/commons/TweetItem.vue";
import InlinePost from "../components/commons/InlinePost.vue";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const message = ref(null);
const replies = ref([]);
const loading = ref(false);
const isPosting = ref(false);
const hasMore = ref(true);
const offset = ref(0);
const limit = 20;
const scrollContainer = ref(null);

const fetchData = async (isLoadMore = false) => {
  if (loading.value || (isLoadMore && !hasMore.value)) return;
  loading.value = true;

  if (!isLoadMore) {
    replies.value = [];
    offset.value = 0;
    hasMore.value = true;
  }

  try {
    const res = await fetch(`/api/messages/${route.params.id}?limit=${limit}&offset=${offset.value}`, {
      headers: {
        Authorization: `Bearer ${authStore.token}`,
      },
    });
    if (res.ok) {
      const data = await res.json();
      message.value = data.message;
      
      if (data.replies.length < limit) hasMore.value = false;
      
      if (isLoadMore) {
        replies.value = [...replies.value, ...data.replies];
      } else {
        replies.value = data.replies;
      }
      offset.value += data.replies.length;
    } else {
      console.error("Failed to fetch message detail");
    }
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
};

const handleScroll = () => {
  const el = scrollContainer.value;
  if (el && el.scrollHeight - el.scrollTop <= el.clientHeight + 100) {
    fetchData(true);
  }
};

const handlePost = async (content) => {
  if (isPosting.value) return;
  isPosting.value = true;
  try {
    const res = await fetch(`/api/messages/global`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authStore.token}`,
      },
      body: JSON.stringify({
        content,
        parent_id: message.value.id,
      }),
    });
    if (res.ok) {
      fetchData(); // Refresh to show the new reply at the top
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
      headers: { Authorization: `Bearer ${authStore.token}` },
    });
    if (res.ok) fetchData();
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
    if (res.ok) fetchData();
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
    if (res.ok) fetchData();
  } catch (e) {
    console.error(e);
  }
};

const handleDelete = async (messageId) => {
  const mid = typeof messageId === "object" ? messageId.id : messageId;
  try {
    const res = await fetch(`/api/messages/${mid}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${authStore.token}` },
    });
    if (res.ok) {
      if (mid === message.value.id) {
        router.back();
      } else {
        fetchData();
      }
    }
  } catch (e) {
    console.error(e);
  }
};

onMounted(fetchData);
watch(() => route.params.id, fetchData);

const goBack = () => {
  router.back();
};
</script>

<template>
  <div class="post-detail-page" ref="scrollContainer" @scroll="handleScroll">
    <div class="header">
      <button class="back-btn" @click="goBack">
        <ArrowLeft :size="20" />
      </button>
      <h2 class="title">ポスト</h2>
    </div>

    <div v-if="!message && loading" class="loading">読み込み中...</div>
    <div v-else-if="message" class="content">
      <div class="main-post">
        <TweetItem 
          :msg="message" 
          @refresh="fetchData"
          @retweet="handleRetweet"
          @like="handleReact"
          @bookmark="handleBookmark"
          @delete="handleDelete"
          @reply="() => {}"
        />
      </div>

      <div class="reply-section">
        <InlinePost :loading="isPosting" @submit="handlePost" />
      </div>

      <div class="replies-list">
        <TweetItem
          v-for="reply in replies"
          :key="reply.id"
          :msg="reply"
          @refresh="fetchData"
          @retweet="handleRetweet"
          @like="handleReact"
          @bookmark="handleBookmark"
          @delete="handleDelete"
        />
      </div>

      <div v-if="loading" class="loading-more">さらに読み込み中...</div>
      <div v-if="!hasMore && replies.length > 0" class="no-more">これ以上の返信はありません。</div>
    </div>
    <div v-else class="error">メッセージが見つかりませんでした。</div>
  </div>
</template>

<style scoped>
.post-detail-page {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: var(--background);
  overflow-y: auto;
  height: 100vh;
}

.header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(var(--surface-rgb), 0.85);
  backdrop-filter: blur(12px);
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--border);
}

.back-btn {
  background: transparent;
  border: none;
  color: var(--text-primary);
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: background 0.2s;
}

.back-btn:hover {
  background: rgba(var(--text-primary-rgb), 0.1);
}

.title {
  font-size: 1.25rem;
  font-weight: 800;
}

.loading, .error {
  padding: 40px;
  text-align: center;
  color: var(--text-secondary);
}

.main-post {
  border-bottom: 1px solid var(--border);
}

.reply-section {
  border-bottom: 1px solid var(--border);
}

.replies-list {
  display: flex;
  flex-direction: column;
}

.loading-more, .no-more {
  padding: 20px;
  text-align: center;
  color: var(--text-secondary);
  font-size: 0.9rem;
  border-top: 1px solid var(--border);
}

/* Ensure the detail view matches the main layout's theme colors */
[data-theme="dark"] .header {
  background: rgba(0, 0, 0, 0.65);
}

[data-theme="dim"] .header {
  background: rgba(21, 32, 43, 0.75);
}
</style>
