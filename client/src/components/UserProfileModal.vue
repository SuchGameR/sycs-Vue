<script setup lang="ts">
import { ref } from 'vue'
import { authFetch } from '../utils/api'

const props = defineProps<{
  userId: number
  currentUserId: number
}>()

const emit = defineEmits(['close', 'friend-request-sent', 'blocked', 'message'])

const userProfile = ref<any>(null)
const isLoading = ref(true)
const relationshipStatus = ref<'none' | 'friend' | 'pending_sent' | 'pending_received' | 'blocked'>('none')
const isProcessing = ref(false)

// ユーザー情報取得
const fetchUserProfile = async () => {
  try {
    // ユーザー基本情報取得
    const userRes = await authFetch(`http://localhost:3000/api/users/${props.userId}`)
    
    if (!userRes.ok) {
      throw new Error('User not found')
    }
    
    userProfile.value = await userRes.json()

    // 関係性チェック
    await checkRelationship()
  } catch (error) {
    console.error('Failed to fetch user profile:', error)
  } finally {
    isLoading.value = false
  }
}

const checkRelationship = async () => {
  try {
    // フレンドチェック (user_id query はバックエンド対応済みなら不要だが一旦残す)
    const friendsRes = await authFetch(`http://localhost:3000/api/friends?user_id=${props.currentUserId}`)
    const friends = await friendsRes.json()
    if (friends.some((f: any) => f.id === props.userId)) {
      relationshipStatus.value = 'friend'
      return
    }

    // フレンドリクエストチェック
    const requestsRes = await authFetch(`http://localhost:3000/api/friends/requests?user_id=${props.currentUserId}`)
    const requests = await requestsRes.json()
    
    if (requests.sent.some((r: any) => r.user_id === props.userId)) {
      relationshipStatus.value = 'pending_sent'
      return
    }
    
    if (requests.received.some((r: any) => r.user_id === props.userId)) {
      relationshipStatus.value = 'pending_received'
      return
    }

    // ブロックチェック
    const blocksRes = await authFetch(`http://localhost:3000/api/users/blocks?user_id=${props.currentUserId}`)
    const blocks = await blocksRes.json()
    if (blocks.some((b: any) => b.id === props.userId)) {
      relationshipStatus.value = 'blocked'
      return
    }

    relationshipStatus.value = 'none'
  } catch (error) {
    console.error('Failed to check relationship:', error)
  }
}

// フレンドリクエスト送信
const sendFriendRequest = async () => {
  isProcessing.value = true
  try {
    const response = await authFetch('http://localhost:3000/api/friends/request', {
      method: 'POST',
      body: JSON.stringify({
        search_query: userProfile.value.uuid
      })
    })

    if (response.ok) {
      relationshipStatus.value = 'pending_sent'
      emit('friend-request-sent')
    } else {
      const error = await response.text()
      alert(error)
    }
  } catch (error) {
    console.error('Failed to send friend request:', error)
    alert('フレンドリクエストの送信に失敗しました')
  } finally {
    isProcessing.value = false
  }
}

// ブロック
const blockUser = async () => {
  if (!confirm(`${userProfile.value.username}をブロックしますか?`)) return

  isProcessing.value = true
  try {
    const response = await authFetch('http://localhost:3000/api/users/block', {
      method: 'POST',
      body: JSON.stringify({
        blocked_id: props.userId
      })
    })

    if (response.ok) {
      relationshipStatus.value = 'blocked'
      emit('blocked')
    }
  } catch (error) {
    console.error('Failed to block user:', error)
  } finally {
    isProcessing.value = false
  }
}

// ブロック解除
const unblockUser = async () => {
  isProcessing.value = true
  try {
    const response = await authFetch(`http://localhost:3000/api/users/block/${props.userId}`, {
      method: 'DELETE'
    })

    if (response.ok) {
      relationshipStatus.value = 'none'
    }
  } catch (error) {
    console.error('Failed to unblock user:', error)
  } finally {
    isProcessing.value = false
  }
}

// DM開始
const startDM = () => {
  emit('message', props.userId)
  emit('close')
}

// 初期化
fetchUserProfile()
</script>

<template>
  <div class="modal-overlay" @click.self="emit('close')">
    <div class="profile-modal">
      <div v-if="isLoading" class="loading-state">
        <span class="spinner"></span>
        <p>読み込み中...</p>
      </div>

      <div v-else-if="userProfile" class="profile-content">
        <button class="close-btn" @click="emit('close')">
          <i class='bx bx-x'></i>
        </button>

        <div class="profile-header">
          <img :src="userProfile.avatar_url || '/defaultAvator.svg'" class="profile-avatar" />
          <div class="user-id-group">
            <h2>{{ userProfile.username }}</h2>
            <p class="user-uuid">#{{ userProfile.uuid }}</p>
          </div>
        </div>

        <div class="profile-actions">
          <button 
            v-if="relationshipStatus === 'none'" 
            class="action-btn primary"
            :disabled="isProcessing"
            @click="sendFriendRequest"
          >
            <i class='bx bx-user-plus'></i> フレンド申請
          </button>

          <button 
            v-if="relationshipStatus === 'pending_sent'" 
            class="action-btn disabled"
            disabled
          >
            <i class='bx bx-time'></i> 申請済み
          </button>

          <button 
            v-if="relationshipStatus === 'friend'" 
            class="action-btn primary"
            @click="startDM"
          >
            <i class='bx bx-message'></i> メッセージ
          </button>

          <button 
            v-if="relationshipStatus === 'blocked'" 
            class="action-btn"
            :disabled="isProcessing"
            @click="unblockUser"
          >
            <i class='bx bx-block'></i> ブロック解除
          </button>

          <button 
            v-if="relationshipStatus !== 'blocked'" 
            class="action-btn danger"
            :disabled="isProcessing"
            @click="blockUser"
          >
            <i class='bx bx-block'></i> ブロック
          </button>
        </div>
      </div>

      <div v-else class="error-state">
        <p>ユーザー情報の取得に失敗しました</p>
        <button class="action-btn" @click="emit('close')">閉じる</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.6);
  backdrop-filter: blur(12px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 20px;
}

.profile-modal {
  background: var(--sys-surface);
  color: var(--sys-on-surface);
  border-radius: 28px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.1);
  position: relative;
  overflow: hidden;
  padding: 32px;
}

.profile-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 32px;
}

.profile-avatar {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 16px;
}

.profile-header h2 {
  font-size: 1.5rem;
  font-weight: 500;
  margin: 0;
}

.user-uuid {
  color: var(--sys-on-surface-variant);
  font-size: 0.875rem;
}

.profile-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 24px;
  border-radius: 24px;
  border: 1px solid var(--sys-outline);
  background: var(--sys-surface);
  color: var(--sys-primary);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.action-btn:hover:not(:disabled) {
  background: var(--sys-surface-variant);
}

.action-btn.primary {
  background: var(--sys-primary);
  color: white;
  border: none;
}

.action-btn.danger {
  color: var(--sys-error);
}

.close-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--sys-on-surface-variant);
  transition: background 0.2s;
}

.close-btn:hover {
  background: var(--sys-surface-variant);
}

.spinner {
  width: 24px;
  height: 24px;
  border: 2px solid var(--sys-outline);
  border-top-color: var(--sys-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 16px auto;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.action-btn i {
  font-size: 1.2rem;
}
</style>
