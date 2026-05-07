<script setup lang="ts">
import { ref, onMounted } from "vue";
import { X } from "lucide-vue-next";
import { useRouter } from "vue-router";
import { useAuthStore } from "../../stores/auth";

const props = defineProps<{
  show: boolean;
  title: string;
  userId: number;
  type: 'followers' | 'following';
}>();

const emit = defineEmits(["close"]);

const authStore = useAuthStore();
const router = useRouter();
const users = ref<any[]>([]);
const loading = ref(true);

const fetchUsers = async () => {
  loading.value = true;
  try {
    const res = await fetch(`/api/users/${props.userId}/${props.type}`);
    if (res.ok) {
      users.value = await res.json();
    }
  } catch (e) {
    console.error(`Failed to fetch ${props.type}`, e);
  } finally {
    loading.value = false;
  }
};

const goToProfile = (handle: string) => {
  emit("close");
  router.push(`/user/${handle}`);
};

onMounted(fetchUsers);
</script>

<template>
  <div v-if="show" class="modal-overlay" @click.self="emit('close')">
    <div class="modal-content">
      <header class="modal-header">
        <h3>{{ title }}</h3>
        <button class="close-btn" @click="emit('close')">
          <X :size="20" />
        </button>
      </header>
      
      <div class="user-list">
        <div v-if="loading" class="loading">読み込み中...</div>
        <div v-else-if="users.length === 0" class="empty">
          {{ type === 'followers' ? 'フォロワーはいません' : 'フォロー中のユーザーはいません' }}
        </div>
        <div v-else v-for="user in users" :key="user.id" class="user-item" @click="goToProfile(user.handle || user.email.split('@')[0])">
          <img :src="user.avatar_url || '/default-avatar.png'" class="avatar" />
          <div class="info">
            <div class="name">{{ user.username }}</div>
            <div class="handle">@{{ user.handle || user.email.split('@')[0] }}</div>
            <div class="bio" v-if="user.bio">{{ user.bio }}</div>
          </div>
          <button v-if="authStore.user?.id !== user.id" class="follow-btn-mini">フォロー</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 3000;
}

.modal-content {
  background: var(--surface);
  width: 100%;
  max-width: 400px;
  max-height: 600px;
  border-radius: 16px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  padding: 16px;
  border-bottom: 1px solid var(--border);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 800;
}

.close-btn {
  background: transparent;
  border: none;
  color: var(--text-primary);
  cursor: pointer;
  padding: 4px;
  border-radius: 50%;
}
.close-btn:hover {
  background: rgba(0, 0, 0, 0.05);
}

.user-list {
  flex: 1;
  overflow-y: auto;
}

.user-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 16px;
  cursor: pointer;
  transition: background 0.2s;
}
.user-item:hover {
  background: rgba(0, 0, 0, 0.03);
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.info {
  flex: 1;
}

.name {
  font-weight: 800;
  color: var(--text-primary);
}

.handle {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.bio {
  font-size: 0.85rem;
  margin-top: 4px;
  color: var(--text-primary);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.follow-btn-mini {
  padding: 6px 12px;
  border-radius: 20px;
  background: var(--text-primary);
  color: var(--surface);
  border: none;
  font-weight: 700;
  font-size: 0.8rem;
  cursor: pointer;
}

.loading, .empty {
  padding: 40px;
  text-align: center;
  color: var(--text-secondary);
}
</style>
