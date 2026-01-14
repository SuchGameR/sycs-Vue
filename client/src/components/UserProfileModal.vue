<script setup lang="ts">
import { ref } from 'vue'

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
    const userRes = await fetch(`http://localhost:3000/api/users/${props.userId}`)
    
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
    // フレンドチェック
    const friendsRes = await fetch(`http://localhost:3000/api/friends?user_id=${props.currentUserId}`)
    const friends = await friendsRes.json()
    if (friends.some((f: any) => f.id === props.userId)) {
      relationshipStatus.value = 'friend'
      return
    }

    // フレンドリクエストチェック
    const requestsRes = await fetch(`http://localhost:3000/api/friends/requests?user_id=${props.currentUserId}`)
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
    const blocksRes = await fetch(`http://localhost:3000/api/users/blocks?user_id=${props.currentUserId}`)
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
    const response = await fetch('http://localhost:3000/api/friends/request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sender_id: props.currentUserId,
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
    const response = await fetch('http://localhost:3000/api/users/block', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        blocker_id: props.currentUserId,
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
    const response = await fetch(`http://localhost:3000/api/users/block/${props.userId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ blocker_id: props.currentUserId })
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
          <h2>{{ userProfile.username }}</h2>
          <p class="user-uuid">#{{ userProfile.uuid }}</p>
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
  background: #fff;
  color: #1a1a1a;
  border-radius: 24px;
  width: 100%;
  max-width: 450px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
  position: relative;
  overflow: hidden;
}

.loading-state, .error-state {
  padding: 60px 40px;
  text-align: center;
}

.spinner {
  display: inline-block;
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #646cff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.close-btn {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: rgba(0,0,0,0.05);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  z-index: 10;
}

.close-btn:hover {
  background: rgba(0,0,0,0.1);
  transform: scale(1.1);
}

.close-btn i {
  font-size: 24px;
}

.profile-content {
  padding: 40px;
}

.profile-header {
  text-align: center;
  margin-bottom: 30px;
}

.profile-avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 20px;
  border: 4px solid #f0f0f0;
}

.profile-header h2 {
  margin: 0 0 8px 0;
  font-size: 1.8rem;
  font-weight: 600;
}

.user-uuid {
  color: #666;
  font-size: 0.95rem;
  margin: 0;
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
  padding: 14px 24px;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  background: #f0f0f0;
  color: #1a1a1a;
}

.action-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.action-btn.primary {
  background: linear-gradient(135deg, #646cff 0%, #535bf2 100%);
  color: white;
}

.action-btn.primary:hover:not(:disabled) {
  box-shadow: 0 4px 20px rgba(100, 108, 255, 0.4);
}

.action-btn.danger {
  background: #f04747;
  color: white;
}

.action-btn.danger:hover:not(:disabled) {
  box-shadow: 0 4px 20px rgba(240, 71, 71, 0.4);
}

.action-btn.disabled {
  background: #e0e0e0;
  color: #999;
}

.action-btn i {
  font-size: 1.2rem;
}
</style>
