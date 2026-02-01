<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { authFetch } from '../utils/api'

const props = defineProps<{
  currentUser: { id: number, uuid: string, username: string, avatar_url?: string }
}>()

const emit = defineEmits(['open-dm', 'open-profile'])

const activeTab = ref<'friends' | 'pending' | 'blocked' | 'add'>('friends')
const friends = ref<any[]>([])
const pendingRequests = ref<{ received: any[], sent: any[] }>({ received: [], sent: [] })
const blockedUsers = ref<any[]>([])
const searchQuery = ref('')
const searchResults = ref<any[]>([])
const isLoading = ref(false)
const isSearching = ref(false)

// フレンド一覧取得
const fetchFriends = async () => {
  isLoading.value = true
  try {
    const response = await authFetch('http://localhost:3000/api/friends')
    friends.value = await response.json()
  } catch (error) {
    console.error('Failed to fetch friends:', error)
  } finally {
    isLoading.value = false
  }
}

// フレンドリクエスト一覧取得
const fetchPendingRequests = async () => {
  isLoading.value = true
  try {
    const response = await authFetch('http://localhost:3000/api/friends/requests')
    pendingRequests.value = await response.json()
  } catch (error) {
    console.error('Failed to fetch pending requests:', error)
  } finally {
    isLoading.value = false
  }
}

// ブロックリスト取得
const fetchBlockedUsers = async () => {
  isLoading.value = true
  try {
    const response = await authFetch('http://localhost:3000/api/users/blocks')
    blockedUsers.value = await response.json()
  } catch (error) {
    console.error('Failed to fetch blocked users:', error)
  } finally {
    isLoading.value = false
  }
}

// ユーザー検索
const searchUsers = async () => {
  if (!searchQuery.value.trim()) {
    searchResults.value = []
    return
  }

  isSearching.value = true
  try {
    const response = await authFetch(`http://localhost:3000/api/users/search?query=${encodeURIComponent(searchQuery.value)}`)
    searchResults.value = await response.json()
  } catch (error) {
    console.error('Failed to search users:', error)
  } finally {
    isSearching.value = false
  }
}

// フレンドリクエスト承認
const approveRequest = async (requestId: number) => {
  try {
    const response = await fetch('http://localhost:3000/api/friends/approve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ request_id: requestId, user_id: props.currentUser.id })
    })

    if (response.ok) {
      await fetchPendingRequests()
      await fetchFriends()
    }
  } catch (error) {
    console.error('Failed to approve request:', error)
  }
}

// フレンドリクエスト拒否/キャンセル
const rejectRequest = async (requestId: number) => {
  try {
    const response = await fetch(`http://localhost:3000/api/friends/request/${requestId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: props.currentUser.id })
    })

    if (response.ok) {
      await fetchPendingRequests()
    }
  } catch (error) {
    console.error('Failed to reject request:', error)
  }
}

// フレンド削除
const removeFriend = async (friendId: number) => {
  if (!confirm('フレンドを削除しますか?')) return

  try {
    const response = await fetch(`http://localhost:3000/api/friends/${friendId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: props.currentUser.id })
    })

    if (response.ok) {
      await fetchFriends()
    }
  } catch (error) {
    console.error('Failed to remove friend:', error)
  }
}

// ブロック解除
const unblockUser = async (userId: number) => {
  try {
    const response = await fetch(`http://localhost:3000/api/users/block/${userId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ blocker_id: props.currentUser.id })
    })

    if (response.ok) {
      await fetchBlockedUsers()
    }
  } catch (error) {
    console.error('Failed to unblock user:', error)
  }
}

// DM開始
const startDM = (friendId: number) => {
  emit('open-dm', friendId)
}

// プロフィール表示
const showProfile = (userId: number) => {
  emit('open-profile', userId)
}

// タブ切り替え時のデータ取得
const handleTabChange = (tab: typeof activeTab.value) => {
  activeTab.value = tab
  if (tab === 'friends') fetchFriends()
  else if (tab === 'pending') fetchPendingRequests()
  else if (tab === 'blocked') fetchBlockedUsers()
}

onMounted(() => {
  fetchFriends()
})
</script>

<template>
  <div class="friend-hub">
    <div class="hub-header">
      <h2>フレンド</h2>
    </div>

    <div class="hub-tabs">
      <button 
        :class="{ active: activeTab === 'friends' }" 
        @click="handleTabChange('friends')"
      >
        <i class='bx bx-user'></i> フレンド
      </button>
      <button 
        :class="{ active: activeTab === 'pending' }" 
        @click="handleTabChange('pending')"
      >
        <i class='bx bx-time'></i> 申請
        <span v-if="pendingRequests.received.length > 0" class="badge">{{ pendingRequests.received.length }}</span>
      </button>
      <button 
        :class="{ active: activeTab === 'blocked' }" 
        @click="handleTabChange('blocked')"
      >
        <i class='bx bx-block'></i> ブロック
      </button>
      <button 
        :class="{ active: activeTab === 'add' }" 
        @click="activeTab = 'add'"
      >
        <i class='bx bx-user-plus'></i> 追加
      </button>
    </div>

    <div class="hub-content">
      <!-- フレンド一覧 -->
      <div v-if="activeTab === 'friends'" class="content-section">
        <div v-if="isLoading" class="loading-state">
          <span class="spinner"></span>
        </div>
        <div v-else-if="friends.length === 0" class="empty-state">
          <i class='bx bx-user-x'></i>
          <p>フレンドがいません</p>
        </div>
        <div v-else class="user-list">
          <div v-for="friend in friends" :key="friend.id" class="user-item">
            <img :src="friend.avatar_url || '/defaultAvator.svg'" class="user-avatar" @click="showProfile(friend.id)" />
            <div class="user-info" @click="showProfile(friend.id)">
              <span class="user-name">{{ friend.username }}</span>
              <span class="user-uuid">#{{ friend.uuid }}</span>
            </div>
            <div class="user-actions">
              <button class="icon-btn" @click="startDM(friend.id)" title="メッセージ">
                <i class='bx bx-message'></i>
              </button>
              <button class="icon-btn danger" @click="removeFriend(friend.id)" title="削除">
                <i class='bx bx-trash'></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 申請一覧 -->
      <div v-if="activeTab === 'pending'" class="content-section">
        <div v-if="isLoading" class="loading-state">
          <span class="spinner"></span>
        </div>
        <div v-else>
          <div v-if="pendingRequests.received.length > 0" class="subsection">
            <h3>受信したリクエスト</h3>
            <div class="user-list">
              <div v-for="request in pendingRequests.received" :key="request.id" class="user-item">
                <img :src="request.avatar_url || '/defaultAvator.svg'" class="user-avatar" @click="showProfile(request.user_id)" />
                <div class="user-info" @click="showProfile(request.user_id)">
                  <span class="user-name">{{ request.username }}</span>
                  <span class="user-uuid">#{{ request.uuid }}</span>
                </div>
                <div class="user-actions">
                  <button class="icon-btn success" @click="approveRequest(request.id)" title="承認">
                    <i class='bx bx-check'></i>
                  </button>
                  <button class="icon-btn danger" @click="rejectRequest(request.id)" title="拒否">
                    <i class='bx bx-x'></i>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div v-if="pendingRequests.sent.length > 0" class="subsection">
            <h3>送信したリクエスト</h3>
            <div class="user-list">
              <div v-for="request in pendingRequests.sent" :key="request.id" class="user-item">
                <img :src="request.avatar_url || '/defaultAvator.svg'" class="user-avatar" @click="showProfile(request.user_id)" />
                <div class="user-info" @click="showProfile(request.user_id)">
                  <span class="user-name">{{ request.username }}</span>
                  <span class="user-uuid">#{{ request.uuid }}</span>
                </div>
                <div class="user-actions">
                  <button class="icon-btn" @click="rejectRequest(request.id)" title="キャンセル">
                    <i class='bx bx-x'></i>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div v-if="pendingRequests.received.length === 0 && pendingRequests.sent.length === 0" class="empty-state">
            <i class='bx bx-time'></i>
            <p>申請はありません</p>
          </div>
        </div>
      </div>

      <!-- ブロックリスト -->
      <div v-if="activeTab === 'blocked'" class="content-section">
        <div v-if="isLoading" class="loading-state">
          <span class="spinner"></span>
        </div>
        <div v-else-if="blockedUsers.length === 0" class="empty-state">
          <i class='bx bx-block'></i>
          <p>ブロックしているユーザーはいません</p>
        </div>
        <div v-else class="user-list">
          <div v-for="user in blockedUsers" :key="user.id" class="user-item">
            <img :src="user.avatar_url || '/defaultAvator.svg'" class="user-avatar" />
            <div class="user-info">
              <span class="user-name">{{ user.username }}</span>
              <span class="user-uuid">#{{ user.uuid }}</span>
            </div>
            <div class="user-actions">
              <button class="icon-btn" @click="unblockUser(user.id)" title="ブロック解除">
                <i class='bx bx-block'></i> 解除
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- フレンド追加 -->
      <div v-if="activeTab === 'add'" class="content-section">
        <div class="search-section">
          <div class="search-box">
            <i class='bx bx-search'></i>
            <input 
              v-model="searchQuery" 
              type="text" 
              placeholder="ユーザー名またはUUIDで検索..."
              @input="searchUsers"
            />
          </div>

          <div v-if="isSearching" class="loading-state">
            <span class="spinner"></span>
          </div>
          <div v-else-if="searchQuery && searchResults.length === 0" class="empty-state">
            <i class='bx bx-search-alt'></i>
            <p>ユーザーが見つかりませんでした</p>
          </div>
          <div v-else-if="searchResults.length > 0" class="user-list">
            <div v-for="user in searchResults" :key="user.id" class="user-item">
              <img :src="user.avatar_url || '/defaultAvator.svg'" class="user-avatar" @click="showProfile(user.id)" />
              <div class="user-info" @click="showProfile(user.id)">
                <span class="user-name">{{ user.username }}</span>
                <span class="user-uuid">#{{ user.uuid }}</span>
              </div>
              <div class="user-actions">
                <button class="icon-btn primary" @click="showProfile(user.id)" title="プロフィール">
                  <i class='bx bx-user'></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.friend-hub {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #f5f5f5;
}

.hub-header {
  margin-bottom: 24px;
}

.hub-header h2 {
  font-size: 1.375rem;
  font-weight: 400;
  margin: 0;
}

.hub-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  border-bottom: 1px solid var(--sys-outline);
}

.hub-tabs button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border: none;
  background: none;
  color: var(--sys-on-surface-variant);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.hub-tabs button:hover {
  background: var(--sys-surface-variant);
}

.hub-tabs button.active {
  color: var(--sys-primary);
}

.hub-tabs button.active::after {
    content: "";
    position: absolute;
    bottom: -1px;
    left: 8px;
    right: 8px;
    height: 3px;
    background: var(--sys-primary);
    border-radius: 3px 3px 0 0;
}

.badge {
  background: var(--sys-error);
  color: white;
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 0.75rem;
  font-weight: 600;
}

.hub-content {
  flex: 1;
  overflow-y: auto;
}

.content-section {
  padding: 16px 0;
}

.subsection {
  margin-bottom: 30px; /* Kept from original, not in provided diff */
}

.subsection:last-child {
  margin-bottom: 0; /* Kept from original, not in provided diff */
}

.subsection h3 {
  font-size: 0.75rem;
  color: var(--sys-on-surface-variant);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 24px 0 8px 16px;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #999; /* Kept from original, not in provided diff */
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 64px 0;
  color: var(--sys-on-surface-variant);
  text-align: center; /* Kept from original, not in provided diff */
}

.empty-state i {
  font-size: 3rem;
  margin-bottom: 16px;
  opacity: 0.5;
}

.spinner {
  width: 24px;
  height: 24px;
  border: 2px solid var(--sys-outline);
  border-top-color: var(--sys-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.user-list {
  display: flex;
  flex-direction: column;
}

.user-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 16px;
  border-radius: 12px;
  transition: background 0.2s;
  cursor: pointer;
  border-bottom: 1px solid #f1f3f4; /* Kept from original, not in provided diff */
}

.user-item:last-child {
    border-bottom: none; /* Kept from original, not in provided diff */
}

.user-item:hover {
  background: var(--sys-surface-variant);
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.user-info {
  flex: 1;
}

.user-name {
  font-weight: 500;
  font-size: 0.9375rem;
  color: var(--sys-on-surface);
}

.user-uuid {
  font-size: 0.75rem;
  color: var(--sys-on-surface-variant);
}

.user-actions {
  display: flex;
  gap: 8px;
}

.icon-btn {
  padding: 8px;
  border: 1px solid var(--sys-outline);
  background: var(--sys-surface);
  border-radius: 50%;
  color: var(--sys-on-surface-variant);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  cursor: pointer;
}

.icon-btn:hover {
  background: var(--sys-surface-variant);
  color: var(--sys-primary);
}

.icon-btn i {
  font-size: 1.2rem; /* Kept from original, not in provided diff */
}

.icon-btn.primary { color: var(--sys-primary); }
.icon-btn.success {
  background: #44b700; /* Kept from original, not in provided diff */
  color: white; /* Kept from original, not in provided diff */
}

.icon-btn.danger { color: var(--sys-error); }

.search-section {
  padding: 10px 0; /* Kept from original, not in provided diff */
}

.search-box {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  background: var(--sys-surface-variant);
  border-radius: 28px;
  margin-bottom: 24px;
}

.search-box i {
  font-size: 1.25rem; /* Kept from original, not in provided diff */
  color: var(--sys-on-surface-variant); /* Kept from original, not in provided diff */
}

.search-box input {
  flex: 1;
  border: none;
  background: none;
  font-size: 1rem;
  outline: none;
  color: var(--sys-on-surface);
}
</style>
```
