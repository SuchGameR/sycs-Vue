<script setup lang="ts">
import { ref, onMounted, watch, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";
import TweetItem from "../components/commons/TweetItem.vue";
import UserListModal from "../components/popups/UserListModal.vue";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Link as LinkIcon,
  MoreHorizontal,
} from "lucide-vue-next";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const user = ref<any>(null);
const posts = ref<any[]>([]);
const loading = ref(true);
const loadingPosts = ref(false);
const error = ref("");
const hasMore = ref(true);
const offset = ref(0);
const limit = 20;

// Follow Logic State
const isFollowing = ref(false);
const followersCount = ref(0);
const followingCount = ref(0);

// Friend Logic State
const isFriend = ref(false);
const friendRequestStatus = ref<string | null>(null);
const friendRequestSenderId = ref<number | null>(null);

// Modal State
const showUserList = ref(false);
const modalTitle = ref("");
const modalType = ref<"followers" | "following">("followers");

async function fetchUserData() {
  const handle = route.params.handle as string;
  loading.value = true;
  error.value = "";
  posts.value = [];
  offset.value = 0;
  hasMore.value = true;
  try {
    const response = await fetch(`/api/users/${handle}`, {
      headers: authStore.token ? { Authorization: `Bearer ${authStore.token}` } : {},
    });
    if (!response.ok) throw new Error("User not found");
    const data = await response.json();
    user.value = data;

    // フォロー状態とカウントの初期化 (数値変換を強制)
    isFollowing.value = !!data.is_following;
    followersCount.value = Number(data.followers_count) || 0;
    followingCount.value = Number(data.following_count) || 0;

    // フレンド状態の初期化
    isFriend.value = !!data.is_friend;
    friendRequestStatus.value = data.friend_request_status;
    friendRequestSenderId.value = data.friend_request_sender_id;

    // ユーザーの投稿取得
    await fetchUserPosts();
  } catch (err: any) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
}

async function handleFriendAction() {
  if (!authStore.isAuthenticated) {
    router.push("/signin");
    return;
  }

  if (isFriend.value) {
    router.push("/message");
    return;
  }

  try {
    if (!friendRequestStatus.value || friendRequestStatus.value === 'rejected') {
      const res = await fetch(`/api/friends/request/${user.value.id}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${authStore.token}` },
      });
      if (res.ok) {
        friendRequestStatus.value = 'pending';
        friendRequestSenderId.value = authStore.user?.id || null;
      }
    } else if (friendRequestStatus.value === 'pending') {
      if (friendRequestSenderId.value !== authStore.user?.id) {
        // Redirect to message page to accept
        router.push("/message?view=requests");
      }
    }
  } catch (e) {
    console.error("Friend action failed", e);
  }
}

async function fetchUserPosts(isLoadMore = false) {
  if (loadingPosts.value || (isLoadMore && !hasMore.value)) return;
  const handle = route.params.handle as string;
  loadingPosts.value = true;

  try {
    const postsRes = await fetch(`/api/users/${handle}/messages?limit=${limit}&offset=${offset.value}`, {
      headers: authStore.token ? { Authorization: `Bearer ${authStore.token}` } : {},
    });
    if (postsRes.ok) {
      const data = await postsRes.json();
      if (data.length < limit) hasMore.value = false;
      
      if (isLoadMore) {
        posts.value = [...posts.value, ...data];
      } else {
        posts.value = data;
      }
      offset.value += data.length;
    }
  } catch (e) {
    console.error("Failed to fetch posts", e);
  } finally {
    loadingPosts.value = false;
  }
}

function handleScroll(e: Event) {
  const target = e.target as HTMLElement;
  if (target.scrollHeight - target.scrollTop <= target.clientHeight + 100) {
    fetchUserPosts(true);
  }
}

async function toggleFollow() {
  if (!authStore.isAuthenticated) {
    router.push("/signin");
    return;
  }

  try {
    const method = isFollowing.value ? "DELETE" : "POST";
    const res = await fetch(`/api/users/${user.value.id}/follow`, {
      method,
      headers: { Authorization: `Bearer ${authStore.token}` },
    });

    if (res.ok) {
      isFollowing.value = !isFollowing.value;
      followersCount.value += isFollowing.value ? 1 : -1;
    }
  } catch (e) {
    console.error("Follow failed", e);
  }
}

function openUserList(type: "followers" | "following") {
  modalType.value = type;
  modalTitle.value = type === "followers" ? "フォロワー" : "フォロー中";
  showUserList.value = true;
}

onMounted(fetchUserData);
watch(() => route.params.handle, fetchUserData);

function goBack() {
  router.back();
}

const isMe = computed(() => authStore.user?.id === user.value?.id);
</script>

<template>
  <div class="profile-page" @scroll="handleScroll">
    <header class="profile-header-nav">
      <button class="back-btn" @click="goBack">
        <ArrowLeft :size="20" />
      </button>
      <div class="header-info">
        <h2 class="header-name">{{ user?.username || "プロフィール" }}</h2>
        <span class="post-count">{{ user?.posts_count || 0 }} ポスト</span>
      </div>
    </header>

    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
    </div>
    <div v-else-if="error" class="error-state">
      <p>{{ error }}</p>
      <button @click="router.push('/')" class="home-btn">ホームに戻る</button>
    </div>
    <div v-else class="profile-content">
      <!-- Header Image -->
      <div class="header-banner">
        <img :src="user?.header_url || '/image.png'" alt="header" />
      </div>

      <!-- Profile Info -->
      <div class="profile-main-info">
        <div class="avatar-row">
          <div class="avatar-wrapper">
            <img
              :src="user?.avatar_url || '/default-avatar.png'"
              class="profile-avatar"
            />
          </div>
          <div class="action-buttons">
            <button
              v-if="isMe"
              class="edit-profile-btn"
              @click="router.push('/settings')"
            >
              プロフィールを編集
            </button>
            <template v-else>
              <button 
                class="friend-btn" 
                @click="handleFriendAction"
                :class="{ 'is-friend': isFriend, 'is-pending': friendRequestStatus === 'pending' }"
              >
                <template v-if="isFriend">メッセージ</template>
                <template v-else-if="friendRequestStatus === 'pending'">
                  {{ friendRequestSenderId === authStore.user?.id ? '申請中' : '承認する' }}
                </template>
                <template v-else>フレンド申請</template>
              </button>
              <button class="more-actions-btn">
                <MoreHorizontal :size="20" />
              </button>
              <button
                :class="['follow-btn', { 'is-following': isFollowing }]"
                @click="toggleFollow"
              >
                {{ isFollowing ? "フォロー中" : "フォロー" }}
              </button>
            </template>
          </div>
        </div>

        <div class="user-meta">
          <h1 class="display-name">{{ user?.username }}</h1>
          <span class="user-handle">@{{ user?.userid }}</span>
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
            <a :href="user.website" target="_blank">{{
              user.website.replace(/^https?:\/\//, "")
            }}</a>
          </div>
          <div class="stat-item">
            <Calendar :size="16" />
            {{
              new Date(user?.created_at).toLocaleDateString("ja-JP", {
                year: "numeric",
                month: "long",
              })
            }}に登録
          </div>
        </div>

        <div class="follow-stats">
          <span class="stat-link" @click="openUserList('following')">
            <strong>{{ followingCount }}</strong> フォロー中
          </span>
          <span class="stat-link" @click="openUserList('followers')">
            <strong>{{ followersCount }}</strong> フォロワー
          </span>
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
        
        <div v-if="loadingPosts" class="loading-more">
          <div class="small-spinner"></div>
          読み込み中...
        </div>
        <div v-if="!hasMore && posts.length > 0" class="no-more">
          これ以上のポストはありません
        </div>

        <div v-if="posts.length === 0 && !loadingPosts" class="empty-timeline">
          まだポストがありません
        </div>
      </div>
    </div>

    <!-- Modals -->
    <UserListModal
      v-if="showUserList"
      :show="showUserList"
      :title="modalTitle"
      :userId="user?.id"
      :type="modalType"
      @close="showUserList = false"
    />
  </div>
</template>

<style scoped>
.profile-page {
  background: var(--surface);
  min-height: 100vh;
  overflow-y: scroll;
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
  display: flex;
  align-items: center;
  justify-content: center;
}
.back-btn:hover {
  background: rgba(0, 0, 0, 0.1);
}

.header-info {
  display: flex;
  flex-direction: column;
}
.header-name {
  font-size: 1.25rem;
  font-weight: 800;
  margin: 0;
  color: var(--text-primary);
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
  margin-top: -65px;
  margin-bottom: 16px;
}

.avatar-wrapper {
  position: relative;
}

.profile-avatar {
  width: 134px;
  height: 134px;
  border-radius: 50%;
  border: 4px solid var(--surface);
  background: var(--surface);
  object-fit: cover;
}

.action-buttons {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
}

.edit-profile-btn,
.follow-btn,
.more-actions-btn,
.friend-btn {
  padding: 0 16px;
  height: 36px;
  border-radius: 50px;
  font-weight: 700;
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text-primary);
  cursor: pointer;
  transition: background 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.edit-profile-btn:hover,
.more-actions-btn:hover,
.friend-btn:hover {
  background: rgba(0, 0, 0, 0.05);
}

.friend-btn.is-friend {
  background: var(--accent);
  color: white;
  border: none;
}

.friend-btn.is-pending {
  background: var(--secondary);
  color: var(--text-primary);
}

.follow-btn {
  background: var(--text-primary);
  color: var(--surface);
  border: none;
  min-width: 100px;
}

.follow-btn.is-following {
  background: var(--surface);
  color: var(--text-primary);
  border: 1px solid var(--border);
}

.follow-btn.is-following:hover {
  background: rgba(255, 0, 0, 0.05);
  color: #f4212e;
  border-color: #f4212e;
}
.follow-btn.is-following:hover::after {
  content: "";
}

.user-meta {
  margin-bottom: 12px;
}
.display-name {
  font-size: 1.5rem;
  font-weight: 900;
  margin: 0;
  color: var(--text-primary);
}
.user-handle {
  color: var(--text-secondary);
  font-size: 1rem;
}

.bio {
  margin-bottom: 12px;
  line-height: 1.4;
  color: var(--text-primary);
  white-space: pre-wrap;
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
.stat-item a:hover {
  text-decoration: underline;
}

.follow-stats {
  display: flex;
  gap: 20px;
  font-size: 0.95rem;
  color: var(--text-secondary);
}
.stat-link {
  cursor: pointer;
}
.stat-link:hover {
  text-decoration: underline;
}
.stat-link strong {
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

.loading-state {
  display: flex;
  justify-content: center;
  padding: 100px;
}
.spinner {
  width: 30px;
  height: 30px;
  border: 3px solid var(--border);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.error-state {
  padding: 40px;
  text-align: center;
}
.home-btn {
  margin-top: 16px;
  padding: 8px 16px;
  background: var(--accent);
  color: white;
  border: none;
  border-radius: 20px;
  font-weight: 700;
  cursor: pointer;
}

.empty-timeline {
  padding: 40px;
  text-align: center;
  color: var(--text-secondary);
  font-size: 1.1rem;
}

.loading-more, .no-more {
  padding: 20px;
  text-align: center;
  color: var(--text-secondary);
  font-size: 0.9rem;
  border-top: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.small-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid var(--border);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.profile-content {
  overflow-y: scroll;
}
</style>
