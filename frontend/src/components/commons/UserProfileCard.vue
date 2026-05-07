<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../../stores/auth";

const props = defineProps<{
  user: any;
  show: boolean;
  position: { top: number; left: number };
}>();

const router = useRouter();
const authStore = useAuthStore();

function goToProfile() {
  const handle = props.user?.author_handle || props.user?.email?.split('@')[0];
  if (handle) {
    router.push(`/user/${handle}`);
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div 
        v-if="show" 
        class="user-profile-card" 
        :style="{ top: position.top + 'px', left: position.left + 'px' }"
        @click.stop="goToProfile"
      >
        <div class="card-inner">
          <div class="card-header-banner" :style="{ backgroundImage: `url(${user.header_url || '/image.png'})` }"></div>
          
          <div class="card-content">
            <div class="card-avatar-row">
              <div class="card-avatar-wrapper">
                <img :src="user.avatar_url || '/default-avatar.png'" class="card-avatar" />
                <div class="card-status-indicator"></div>
              </div>
              <button v-if="authStore.user?.id !== user.id" class="card-follow-btn">フォロー</button>
            </div>

            <div class="card-user-info">
              <h3 class="card-username">{{ user.username || user.author_name }}</h3>
              <span class="card-handle">@{{ user.author_handle || user.email?.split('@')[0] }}</span>
            </div>

            <div class="card-bio" v-if="user.bio">
              {{ user.bio }}
            </div>

            <div class="card-footer">
              <div class="card-note">
                <strong>備考:</strong> ポストをクリックしてプロフィールを表示
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.user-profile-card {
  position: fixed;
  width: 300px;
  z-index: 10000;
  pointer-events: auto;
  cursor: pointer;
}

.card-inner {
  background: var(--surface);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4);
  border: 1px solid var(--border);
}

.card-header-banner {
  height: 60px;
  background-size: cover;
  background-position: center;
  background-color: var(--accent);
}

.card-content {
  padding: 16px;
  padding-top: 0;
  background: var(--surface);
}

.card-avatar-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-top: -30px;
  margin-bottom: 12px;
}

.card-avatar-wrapper {
  position: relative;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: 6px solid var(--surface);
  background: var(--surface);
}

.card-avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

.card-status-indicator {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 18px;
  height: 18px;
  background: #23a559;
  border-radius: 50%;
  border: 4px solid var(--surface);
}

.card-follow-btn {
  margin-top: 38px;
  padding: 6px 16px;
  border-radius: 20px;
  background: var(--text-primary);
  color: var(--surface);
  border: none;
  font-weight: 700;
  font-size: 0.85rem;
  cursor: pointer;
}

.card-user-info {
  margin-bottom: 12px;
}

.card-username {
  font-size: 1.15rem;
  font-weight: 800;
  margin: 0;
  color: var(--text-primary);
}

.card-handle {
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.card-bio {
  font-size: 0.9rem;
  margin-bottom: 12px;
  line-height: 1.4;
  color: var(--text-primary);
}

.card-footer {
  border-top: 1px solid var(--border);
  padding-top: 12px;
  margin-top: 12px;
}

.card-note {
  font-size: 0.75rem;
  color: var(--text-secondary);
  font-style: italic;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s, transform 0.2s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>
