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
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(10px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 3000;
  padding: 20px;
}

.modal-content {
  background: var(--surface);
  width: 100%;
  max-width: 450px;
  max-height: 80vh;
  border-radius: 24px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 30px 80px rgba(0,0,0,0.4);
  border: 1px solid var(--border);
  animation: modal-pop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes modal-pop {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

.modal-header {
  padding: 20px 24px;
  border-bottom: 1px solid var(--border);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(var(--surface-rgb), 0.5);
  backdrop-filter: blur(5px);
}

.modal-header h3 {
  margin: 0;
  font-size: 1.4rem;
  font-weight: 900;
  letter-spacing: -0.5px;
}

.close-btn {
  background: rgba(var(--text-primary-rgb), 0.05);
  border: none;
  color: var(--text-primary);
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  transition: all 0.2s;
}
.close-btn:hover {
  background: rgba(var(--text-primary-rgb), 0.1);
  transform: rotate(90deg);
}

.user-list {
  flex: 1;
  overflow-y: auto;
  scrollbar-width: thin;
}

.user-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 24px;
  cursor: pointer;
  transition: all 0.2s;
  border-bottom: 1px solid rgba(var(--border-rgb), 0.3);
}
.user-item:hover {
  background: rgba(var(--accent-rgb), 0.05);
}

.avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
}

.info {
  flex: 1;
  min-width: 0;
}

.name {
  font-weight: 800;
  font-size: 1.1rem;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.handle {
  color: var(--text-secondary);
  font-size: 0.9rem;
  font-weight: 600;
}

.bio {
  font-size: 0.85rem;
  margin-top: 4px;
  color: var(--text-secondary);
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.follow-btn-mini {
  padding: 8px 16px;
  border-radius: 50px;
  background: var(--text-primary);
  color: var(--surface);
  border: none;
  font-weight: 800;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;
}

.follow-btn-mini:hover {
  transform: scale(1.05);
  filter: brightness(1.2);
}

.loading, .empty {
  padding: 60px 20px;
  text-align: center;
  color: var(--text-secondary);
  font-weight: 700;
  font-size: 1.1rem;
}

@media (max-width: 500px) {
  .modal-overlay { padding: 0; }
  .modal-content {
    max-width: none;
    height: 100vh;
    max-height: none;
    border-radius: 0;
  }
}
</style>
