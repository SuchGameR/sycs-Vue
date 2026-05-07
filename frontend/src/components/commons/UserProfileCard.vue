<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../../stores/auth";
import { Calendar, Users } from "lucide-vue-next";

const props = defineProps<{
  user: any;
  show: boolean;
  position: { top: number; left: number };
}>();

const router = useRouter();
const authStore = useAuthStore();

const isFollowing = ref(false);
const followersCount = ref(0);
const loading = ref(true);
const fullUser = ref<any>(null);

async function fetchFullUser() {
  const handle = props.user.author_handle || props.user.handle || props.user.email?.split('@')[0];
  if (!handle) return;
  
  loading.value = true;
  try {
    const res = await fetch(`/api/users/${handle}`, {
      headers: authStore.token ? { Authorization: `Bearer ${authStore.token}` } : {}
    });
    if (res.ok) {
      const data = await res.json();
      fullUser.value = data;
      isFollowing.value = data.is_following;
      followersCount.value = data.followers_count;
    }
  } catch (e) {
    console.error("Failed to fetch user in card", e);
  } finally {
    loading.value = false;
  }
}

watch(() => props.show, (newVal) => {
  if (newVal) {
    fetchFullUser();
  }
});

function goToProfile() {
  const handle = fullUser.value?.userid || props.user?.author_handle || props.user?.email?.split('@')[0];
  if (handle) {
    router.push(`/user/${handle}`);
  }
}

async function toggleFollow(e: Event) {
  e.stopPropagation();
  if (!authStore.isAuthenticated) {
    router.push('/signin');
    return;
  }
  
  try {
    const method = isFollowing.value ? 'DELETE' : 'POST';
    const res = await fetch(`/api/users/${props.user.user_id || props.user.id}/follow`, {
      method,
      headers: { Authorization: `Bearer ${authStore.token}` }
    });
    
    if (res.ok) {
      isFollowing.value = !isFollowing.value;
      followersCount.value += isFollowing.value ? 1 : -1;
    }
  } catch (e) {
    console.error("Follow failed", e);
  }
}

const joinedDate = computed(() => {
  const date = props.user?.created_at ? new Date(props.user.created_at) : new Date();
  return date.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long' });
});

const handle = computed(() => props.user.author_handle || props.user.handle || props.user.email?.split('@')[0]);
const name = computed(() => props.user.username || props.user.author_name);
</script>

<template>
  <Teleport to="body">
    <Transition name="discord-fade">
      <div 
        v-if="show" 
        class="discord-profile-card" 
        :style="{ top: position.top + 'px', left: position.left + 'px' }"
        @click.stop="goToProfile"
      >
        <div class="card-inner">
          <!-- Banner -->
          <div class="card-banner" :style="{ backgroundColor: 'var(--accent)', backgroundImage: `url(${user.header_url || '/image.png'})` }"></div>
          
          <div class="card-body">
            <!-- Avatar & Follow -->
            <div class="avatar-row">
              <div class="avatar-container">
                <img :src="user.avatar_url || '/default-avatar.png'" class="card-avatar" />
                <div class="status-dot"></div>
              </div>
              <button 
                v-if="authStore.user?.id !== (user.user_id || user.id)" 
                :class="['card-follow-btn', { 'is-following': isFollowing }]"
                @click="toggleFollow"
              >
                {{ isFollowing ? 'フォロー中' : 'フォロー' }}
              </button>
            </div>

            <!-- User Info -->
            <div class="user-info-section">
              <div class="name-container">
                <span class="display-name">{{ name }}</span>
                <span class="user-handle">{{ handle }}</span>
              </div>
            </div>

            <div class="divider"></div>

            <!-- Bio -->
            <div class="section bio-section" v-if="user.bio">
              <h4 class="section-title">自己紹介</h4>
              <p class="bio-text">{{ user.bio }}</p>
            </div>

            <!-- Stats/Meta -->
            <div class="section meta-section">
              <div class="meta-item">
                <Calendar :size="14" />
                <span>{{ joinedDate }}に登録</span>
              </div>
              <div class="meta-item">
                <Users :size="14" />
                <span><strong>{{ followersCount }}</strong> フォロワー</span>
              </div>
            </div>

            <div class="card-footer">
              <span class="footer-hint">クリックしてプロフィールを表示</span>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.discord-profile-card {
  position: fixed;
  width: 320px;
  z-index: 10000;
  pointer-events: auto;
  cursor: pointer;
  filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.24));
}

.card-inner {
  background: #111214; /* Discord dark theme */
  border-radius: 8px;
  overflow: hidden;
  color: #dbdee1;
  font-family: sans-serif;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.card-banner {
  height: 60px;
  background-size: cover;
  background-position: center;
}

.card-body {
  padding: 12px 16px 16px;
  background: linear-gradient(to bottom, #111214, #18191c);
}

.avatar-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-top: -45px;
  margin-bottom: 12px;
}

.avatar-container {
  position: relative;
  padding: 4px;
  background: #111214;
  border-radius: 50%;
}

.card-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  display: block;
}

.status-dot {
  position: absolute;
  bottom: 8px;
  right: 8px;
  width: 16px;
  height: 16px;
  background: #23a559; /* Online green */
  border-radius: 50%;
  border: 3px solid #111214;
}

.card-follow-btn {
  padding: 6px 14px;
  border-radius: 3px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  border: none;
  background: #5865f2; /* Discord Blurple */
  color: white;
  transition: background 0.2s;
}
.card-follow-btn:hover {
  background: #4752c4;
}
.card-follow-btn.is-following {
  background: transparent;
  border: 1px solid #4e5058;
  color: #dbdee1;
}
.card-follow-btn.is-following:hover {
  background: rgba(255, 255, 255, 0.05);
}

.user-info-section {
  margin-bottom: 12px;
}
.display-name {
  display: block;
  font-size: 1.25rem;
  font-weight: 700;
  color: #ffffff;
  line-height: 1.2;
}
.user-handle {
  font-size: 0.9rem;
  color: #b5bac1;
}

.divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.08);
  margin: 12px 0;
}

.section {
  margin-bottom: 12px;
}
.section-title {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  color: #ffffff;
  margin-bottom: 6px;
}
.bio-text {
  font-size: 0.85rem;
  line-height: 1.3;
  color: #dbdee1;
  white-space: pre-wrap;
}

.meta-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.meta-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.8rem;
  color: #b5bac1;
}
.meta-item strong {
  color: #ffffff;
}

.card-footer {
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  text-align: center;
}
.footer-hint {
  font-size: 0.7rem;
  color: #949ba4;
  font-style: italic;
}

/* Transition */
.discord-fade-enter-active,
.discord-fade-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.discord-fade-enter-from,
.discord-fade-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(10px);
}
</style>
