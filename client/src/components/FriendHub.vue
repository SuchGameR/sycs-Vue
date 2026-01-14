<script setup lang="ts">
import { ref, onMounted } from 'vue'

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
    const response = await fetch(`http://localhost:3000/api/friends?user_id=${props.currentUser.id}`)
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
    const response = await fetch(`http://localhost:3000/api/friends/requests?user_id=${props.currentUser.id}`)
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
    const response = await fetch(`http://localhost:3000/api/users/blocks?user_id=${props.currentUser.id}`)
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
    const response = await fetch(`http://localhost:3000/api/users/search?query=${encodeURIComponent(searchQuery.value)}&user_id=${props.currentUser.id}`)
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
  padding: 24px 30px;
  background: white;
  border-bottom: 1px solid #e0e0e0;
}

.hub-header h2 {
  margin: 0;
  font-size: 1.5rem;
  color: #1a1a1a;
}

.hub-tabs {
  display: flex;
  gap: 8px;
  padding: 16px 20px;
  background: white;
  border-bottom: 1px solid #e0e0e0;
  overflow-x: auto;
}

.hub-tabs button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border: none;
  background: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  color: #666;
  font-weight: 500;
  white-space: nowrap;
  position: relative;
}

.hub-tabs button:hover {
  background: #f0f0f0;
  color: #1a1a1a;
}

.hub-tabs button.active {
  background: linear-gradient(135deg, #646cff 0%, #535bf2 100%);
  color: white;
}

.hub-tabs button i {
  font-size: 1.2rem;
}

.badge {
  background: #f04747;
  color: white;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 0.75rem;
  font-weight: 600;
}

.hub-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.content-section {
  background: white;
  border-radius: 16px;
  padding: 20px;
  min-height: 400px;
}

.subsection {
  margin-bottom: 30px;
}

.subsection:last-child {
  margin-bottom: 0;
}

.subsection h3 {
  margin: 0 0 16px 0;
  font-size: 1.1rem;
  color: #666;
}

.loading-state, .empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #999;
}

.empty-state i {
  font-size: 4rem;
  margin-bottom: 16px;
  opacity: 0.3;
}

.spinner {
  display: inline-block;
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #646cff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.user-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.user-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px;
  border-radius: 12px;
  transition: all 0.2s;
  cursor: pointer;
}

.user-item:hover {
  background: #f8f8f8;
}

.user-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
  cursor: pointer;
}

.user-info {
  flex: 1;
  min-width: 0;
  cursor: pointer;
}

.user-name {
  display: block;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 4px;
}

.user-uuid {
  display: block;
  font-size: 0.85rem;
  color: #999;
}

.user-actions {
  display: flex;
  gap: 8px;
}

.icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 12px;
  border: none;
  border-radius: 8px;
  background: #f0f0f0;
  color: #1a1a1a;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.9rem;
}

.icon-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.icon-btn i {
  font-size: 1.2rem;
}

.icon-btn.primary {
  background: linear-gradient(135deg, #646cff 0%, #535bf2 100%);
  color: white;
}

.icon-btn.success {
  background: #44b700;
  color: white;
}

.icon-btn.danger {
  background: #f04747;
  color: white;
}

.search-section {
  padding: 10px 0;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 20px;
  background: #f8f8f8;
  border-radius: 12px;
  margin-bottom: 20px;
}

.search-box i {
  font-size: 1.4rem;
  color: #999;
}

.search-box input {
  flex: 1;
  border: none;
  background: none;
  font-size: 1rem;
  outline: none;
  color: #1a1a1a;
}

.search-box input::placeholder {
  color: #999;
}
</style>
