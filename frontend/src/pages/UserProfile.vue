<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";
import TweetItem from "../components/commons/TweetItem.vue";
import { ArrowLeft, Calendar, MapPin, Link as LinkIcon } from "lucide-vue-next";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const user = ref<any>(null);
const posts = ref<any[]>([]);
const loading = ref(true);
const error = ref("");

async function fetchUserData() {
  const handle = route.params.handle as string;
  loading.value = true;
  error.value = "";
  try {
    // ユーザー情報の取得 (バックエンドの実装に合わせる必要があるが、一旦モックまたは/auth/meの拡張を想定)
    // ここではデモ用にauthStoreのユーザー情報を利用するか、APIを叩く
    const response = await fetch(`/api/users/${handle}`);
    if (!response.ok) throw new Error("User not found");
    user.value = await response.json();
    
    // ユーザーの投稿取得
    const postsRes = await fetch(`/api/users/${handle}/messages`);
    posts.value = await postsRes.json();
  } catch (err: any) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
}

onMounted(fetchUserData);
watch(() => route.params.handle, fetchUserData);

function goBack() {
  router.back();
}
</script>

<template>
  <div class="profile-page">
    <header class="profile-header-nav">
      <button class="back-btn" @click="goBack">
        <ArrowLeft :size="20" />
      </button>
      <div class="header-info">
        <h2 class="header-name">{{ user?.username || "プロフィール" }}</h2>
        <span class="post-count">{{ posts.length }} ポスト</span>
      </div>
    </header>

    <div v-if="loading" class="loading-state">読み込み中...</div>
    <div v-else-if="error" class="error-state">{{ error }}</div>
    <div v-else class="profile-content">
      <!-- Header Image -->
      <div class="header-banner">
        <img :src="user?.header_url || '/image.png'" alt="header" />
      </div>

      <!-- Profile Info -->
      <div class="profile-main-info">
        <div class="avatar-row">
          <img :src="user?.avatar_url || '/default-avatar.png'" class="profile-avatar" />
          <button v-if="authStore.user?.id === user?.id" class="edit-profile-btn" @click="router.push('/settings')">
            プロフィールを編集
          </button>
          <button v-else class="follow-btn">フォロー</button>
        </div>

        <div class="user-meta">
          <h1 class="display-name">{{ user?.username }}</h1>
          <span class="user-handle">@{{ user?.email.split('@')[0] }}</span>
        </div>

        <div class="bio" v-if="user?.bio">
          {{ user.bio }}
        </div>

        <div class="stats-row">
          <div class="stat-item" v-if="user?.location">
            <MapPin :size="16" /> {{ user.location }}
          </div>
          <div class="stat-item" v-if="user?.website">
            <LinkIcon :size="16" /> 
            <a :href="user.website" target="_blank">{{ user.website.replace(/^https?:\/\//, '') }}</a>
          </div>
          <div class="stat-item">
            <Calendar :size="16" /> {{ new Date(user?.created_at).toLocaleDateString() }}に登録
          </div>
        </div>

        <div class="follow-stats">
          <span class="stat"><strong>0</strong> フォロー中</span>
          <span class="stat"><strong>0</strong> フォロワー</span>
        </div>
      </div>

      <!-- Tabs -->
      <div class="profile-tabs">
        <div class="tab active">ポスト</div>
        <div class="tab">返信</div>
        <div class="tab">メディア</div>
        <div class="tab">いいね</div>
      </div>

      <!-- Timeline -->
      <div class="timeline">
        <TweetItem v-for="post in posts" :key="post.id" :msg="post" />
        <div v-if="posts.length === 0" class="empty-timeline">
          まだポストがありません
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.profile-page {
  background: var(--surface);
  min-height: 100vh;
}

.profile-header-nav {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(var(--surface-rgb), 0.85);
  backdrop-filter: blur(12px);
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 8px 16px;
  border-bottom: 1px solid var(--border);
}

.back-btn {
  background: transparent;
  border: none;
  color: var(--text-primary);
  padding: 8px;
  border-radius: 50%;
  cursor: pointer;
  transition: background 0.2s;
}
.back-btn:hover {
  background: rgba(0, 0, 0, 0.05);
}

.header-info {
  display: flex;
  flex-direction: column;
}
.header-name {
  font-size: 1.25rem;
  font-weight: 800;
  margin: 0;
}
.post-count {
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.header-banner {
  height: 200px;
  background: var(--border);
}
.header-banner img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.profile-main-info {
  padding: 12px 16px;
  position: relative;
}

.avatar-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-top: -60px;
  margin-bottom: 16px;
}

.profile-avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  border: 4px solid var(--surface);
  background: var(--surface);
  object-fit: cover;
}

.edit-profile-btn, .follow-btn {
  padding: 8px 16px;
  border-radius: 50px;
  font-weight: 800;
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text-primary);
  cursor: pointer;
  transition: background 0.2s;
  margin-bottom: 8px;
}
.edit-profile-btn:hover, .follow-btn:hover {
  background: rgba(0, 0, 0, 0.05);
}

.follow-btn {
  background: var(--text-primary);
  color: var(--surface);
  border: none;
}

.user-meta {
  margin-bottom: 12px;
}
.display-name {
  font-size: 1.5rem;
  font-weight: 900;
  margin: 0;
}
.user-handle {
  color: var(--text-secondary);
  font-size: 1rem;
}

.bio {
  margin-bottom: 12px;
  line-height: 1.4;
}

.stats-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  color: var(--text-secondary);
  font-size: 0.95rem;
  margin-bottom: 12px;
}
.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
}
.stat-item a {
  color: var(--accent);
  text-decoration: none;
}

.follow-stats {
  display: flex;
  gap: 20px;
  font-size: 0.95rem;
  color: var(--text-secondary);
}
.follow-stats strong {
  color: var(--text-primary);
}

.profile-tabs {
  display: flex;
  border-bottom: 1px solid var(--border);
  margin-top: 16px;
}
.tab {
  flex: 1;
  text-align: center;
  padding: 16px;
  font-weight: 700;
  color: var(--text-secondary);
  cursor: pointer;
  transition: background 0.2s;
  position: relative;
}
.tab:hover {
  background: rgba(0, 0, 0, 0.03);
}
.tab.active {
  color: var(--text-primary);
}
.tab.active::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 60px;
  height: 4px;
  background: var(--accent);
  border-radius: 2px;
}

.empty-timeline {
  padding: 40px;
  text-align: center;
  color: var(--text-secondary);
  font-size: 1.1rem;
}
</style>
