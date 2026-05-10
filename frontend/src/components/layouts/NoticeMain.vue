<script setup>
import { ref, onMounted } from "vue";
import { useAuthStore } from "../../stores/auth";
import { useUIStore } from "../../stores/ui";
import { useRouter } from "vue-router";
import {
  Heart,
  Repeat,
  UserPlus,
  UserCircle,
  MessageSquare,
  Menu,
} from "lucide-vue-next";
import Vertical from "../configurations/Vertical.vue";

const authStore = useAuthStore();
const uiStore = useUIStore();
const router = useRouter();
const notifications = ref([]);
const loading = ref(false);

// ... (fetch functions same) ...

const fetchNotifications = async () => {
  loading.value = true;
  try {
    const res = await fetch("/api/notifications", {
      headers: { Authorization: `Bearer ${authStore.token}` },
    });
    if (res.ok) {
      notifications.value = await res.json();
      // Mark as read after fetching
      markAsRead();
    }
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
};

const handleNotificationClick = (note) => {
  if (note.type === "friend_request") {
    router.push("/message?view=requests");
  } else if (note.type === "dm") {
    router.push("/message");
  } else if (note.message_id) {
    router.push(`/status/${note.message_id}`);
  } else if (note.actor_handle) {
    router.push(`/user/${note.actor_handle}`);
  }
};

const markAsRead = async () => {
  try {
    await fetch("/api/notifications/read", {
      method: "PUT",
      headers: { Authorization: `Bearer ${authStore.token}` },
    });
    authStore.resetNotificationCount();
  } catch (e) {
    console.error(e);
  }
};

const getIcon = (type) => {
  switch (type) {
    case "like":
      return Heart;
    case "retweet":
      return Repeat;
    case "follow":
      return UserPlus;
    case "friend_request":
      return UserPlus;
    case "dm":
      return MessageSquare;
    default:
      return UserCircle;
  }
};

const getIconColor = (type) => {
  switch (type) {
    case "like":
      return "#f4212e";
    case "retweet":
      return "#00ba7c";
    case "follow":
      return "#1d9bf0";
    case "friend_request":
      return "#f59e0b";
    case "dm":
      return "#1d9bf0";
    default:
      return "var(--text-secondary)";
  }
};

const getActionText = (type) => {
  switch (type) {
    case "like":
      return "さんがあなたのポストに「いいね」しました";
    case "retweet":
      return "さんがあなたのポストをリポストしました";
    case "follow":
      return "さんにフォローされました";
    case "friend_request":
      return "さんからフレンド申請が届きました";
    case "dm":
      return "さんからメッセージが届きました";
    default:
      return "さんがアクションを起こしました";
  }
};

onMounted(fetchNotifications);
</script>

<template>
  <div class="notice-layout">
    <div class="header">
      <h2>通知</h2>
    </div>

    <div class="notification-list">
      <div v-if="loading" class="loading">読み込み中...</div>

      <div
        v-for="note in notifications"
        :key="note.id"
        class="notification-item"
        :class="{ unread: !note.is_read }"
        @click="handleNotificationClick(note)"
      >
        <div class="icon-section">
          <component
            :is="getIcon(note.type)"
            :size="24"
            :color="getIconColor(note.type)"
            :fill="getIconColor(note.type)"
            v-if="note.type === 'like'"
          />
          <component
            :is="getIcon(note.type)"
            :size="24"
            :color="getIconColor(note.type)"
            v-else
          />
        </div>
        <div class="content-section">
          <div>
            <div class="actor-row">
              <img
                :src="note.actor_avatar || '/default-avatar.png'"
                class="avatar"
              />
            </div>
            <div class="text">
              <strong>{{ note.actor_name }}</strong
              >{{ getActionText(note.type) }}
            </div>
          </div>
          <div class="preview" v-if="note.message_preview">
            {{ note.message_preview }}
          </div>
          <div class="time">
            {{ new Date(note.created_at).toLocaleString() }}
          </div>
        </div>
      </div>

      <div v-if="notifications.length === 0 && !loading" class="empty">
        通知はまだありません
      </div>
    </div>
  </div>
</template>

<style scoped>
.notice-layout {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: var(--background);
  max-width: 800px;
  height: 100vh;
}

@media (max-width: 510px) {
  .notice-layout {
    max-width: 100%;
  }
}

.header {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--border);
  background: var(--surface);
  position: sticky;
  top: 0;
  z-index: 10;
}

.header h2 {
  font-size: 1.25rem;
  font-weight: 800;
  margin: 0;
}

.notification-list {
  flex: 1;
  overflow-y: auto;
}

.notification-item {
  display: flex;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--border);
  background: var(--surface);
  transition: background 0.2s;
  cursor: pointer;
}

.notification-item:hover {
  background: rgba(0, 0, 0, 0.02);
}

.notification-item.unread {
  background: rgba(var(--accent-rgb), 0.03);
}

.icon-section {
  width: 40px;
  margin-right: 12px;
  display: flex;
  justify-content: flex-end;
  padding-top: 4px;
}

.content-section {
  flex: 1;
}

.actor-row {
  margin-bottom: 8px;
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
}

.text {
  font-size: 0.95rem;
  line-height: 1.4;
  margin-bottom: 8px;
}

.preview {
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin-bottom: 8px;
  padding: 8px 12px;
  border-radius: 8px;
  background: var(--background);
  border: 1px solid var(--border);
}

.time {
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.loading,
.empty {
  padding: 4rem;
  text-align: center;
  color: var(--text-secondary);
}
</style>
