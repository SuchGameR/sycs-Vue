<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { io, Socket } from 'socket.io-client'
import { authFetch } from '../utils/api'

const props = defineProps<{
  channelId: number
  currentUser: { id: number, uuid: string, username: string, avatar_url?: string }
  friendInfo: { id: number, username: string, avatar_url?: string }
}>()

const emit = defineEmits(['back', 'block-user'])

const messages = ref<any[]>([])
const messageInput = ref('')
const replyTo = ref<any>(null)
const isLoading = ref(true)
const messagesContainer = ref<HTMLElement | null>(null)
let socket: Socket | null = null

// メッセージ取得
const fetchMessages = async () => {
  try {
    const response = await authFetch(`http://localhost:3000/api/dm/${props.channelId}/messages`)
    messages.value = await response.json()
    await nextTick()
    scrollToBottom()
  } catch (error) {
    console.error('Failed to fetch messages:', error)
  } finally {
    isLoading.value = false
  }
}

// メッセージ送信
const sendMessage = async () => {
  const content = messageInput.value.trim()
  if (!content) return

  try {
    const response = await authFetch(`http://localhost:3000/api/dm/${props.channelId}/messages`, {
      method: 'POST',
      body: JSON.stringify({
        content,
        parent_id: replyTo.value?.id || null
      })
    })

    if (response.ok) {
      messageInput.value = ''
      replyTo.value = null
    }
  } catch (error) {
    console.error('Failed to send message:', error)
  }
}

// メッセージ削除
const deleteMessage = async (messageId: number, event?: MouseEvent) => {
  const skipConfirm = event?.shiftKey
  if (!skipConfirm && !confirm('メッセージを削除しますか?')) return

  try {
    const response = await authFetch(`http://localhost:3000/api/dm/messages/${messageId}`, {
      method: 'DELETE',
      body: JSON.stringify({})
    })

    if (!response.ok) {
      const error = await response.text()
      alert(error)
    }
  } catch (error) {
    console.error('Failed to delete message:', error)
  }
}

// 返信設定
const setReplyTo = (message: any) => {
  replyTo.value = message
}

// スクロール
const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

// メッセージグループ化判定 (重要: 返信の場合はグループ化しない)
const shouldGroupWithPrevious = (currentMsg: any, index: number): boolean => {
  if (index === 0) return false
  
  const prevMsg = messages.value[index - 1]
  
  // 返信メッセージの場合はグループ化しない
  if (currentMsg.parent_id) return false
  
  // 前のメッセージが返信の場合もグループ化しない
  if (prevMsg.parent_id) return false
  
  // 同じ送信者で、5分以内のメッセージのみグループ化
  if (currentMsg.sender_id === prevMsg.sender_id) {
    const timeDiff = new Date(currentMsg.created_at).getTime() - new Date(prevMsg.created_at).getTime()
    return timeDiff < 5 * 60 * 1000 // 5分
  }
  
  return false
}

// 親メッセージ取得
const getParentMessage = (parentId: number) => {
  return messages.value.find(m => m.id === parentId)
}

// Socket.io接続
onMounted(() => {
  fetchMessages()

  socket = io('http://localhost:3000')
  socket.emit('join_dm', props.channelId)

  socket.on('new_dm_message', (message: any) => {
    messages.value.push(message)
    nextTick(() => scrollToBottom())
  })

  socket.on('dm_message_deleted', (data: { id: number }) => {
    const index = messages.value.findIndex(m => m.id === data.id)
    if (index !== -1) {
      messages.value.splice(index, 1)
    }
  })
})

onUnmounted(() => {
  if (socket) {
    socket.disconnect()
  }
})
</script>

<template>
  <div class="dm-chat">
    <!-- ヘッダー -->
    <div class="chat-header">
      <button class="back-btn" @click="emit('back')">
        <i class='bx bx-arrow-back'></i>
      </button>
      <img :src="friendInfo.avatar_url || '/defaultAvator.svg'" class="friend-avatar" />
      <div class="friend-info">
        <span class="friend-name">{{ friendInfo.username }}</span>
      </div>
      <button class="icon-btn danger" @click="emit('block-user', friendInfo.id)" title="ブロック">
        <i class='bx bx-block'></i>
      </button>
    </div>

    <!-- メッセージリスト -->
    <div ref="messagesContainer" class="messages-container">
      <div v-if="isLoading" class="loading-state">
        <span class="spinner"></span>
      </div>
      <div v-else-if="messages.length === 0" class="empty-state">
        <i class='bx bx-message'></i>
        <p>メッセージを送信して会話を始めましょう</p>
      </div>
      <div v-else class="messages-list">
        <div 
          v-for="(message, index) in messages" 
          :key="message.id"
          :class="[
            'message-item',
            { 
              'is-own': message.sender_id === currentUser.id,
              'is-compact': shouldGroupWithPrevious(message, index),
              'has-reply': message.parent_id
            }
          ]"
        >
          <!-- アバター (グループ化されていない場合のみ表示) -->
          <img 
            v-if="!shouldGroupWithPrevious(message, index)" 
            :src="message.avatar_url || '/defaultAvator.svg'" 
            class="message-avatar"
          />
          <div v-else class="message-avatar-placeholder"></div>

          <div class="message-content-wrapper">
            <!-- ヘッダー (グループ化されていない場合のみ表示) -->
            <div v-if="!shouldGroupWithPrevious(message, index)" class="message-header">
              <span class="message-author">{{ message.username }}</span>
              <span class="message-time">{{ new Date(message.created_at).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }) }}</span>
            </div>

            <!-- 返信先表示 -->
            <div v-if="message.parent_id" class="reply-indicator">
              <i class='bx bx-subdirectory-right'></i>
              <span>{{ getParentMessage(message.parent_id)?.username || 'Unknown' }}: {{ getParentMessage(message.parent_id)?.content?.substring(0, 50) || '' }}</span>
            </div>

            <!-- メッセージ本文 -->
            <div class="message-bubble">
              <p class="message-text">{{ message.content }}</p>
              
              <!-- アクションボタン -->
              <div class="message-actions">
                <button class="action-btn" @click="setReplyTo(message)" title="返信">
                  <i class='bx bx-reply'></i>
                </button>
                <button 
                  v-if="message.sender_id === currentUser.id" 
                  class="action-btn danger" 
                  @click="deleteMessage(message.id, $event)" 
                  title="削除 (Shift+クリックで確認スキップ)"
                >
                  <i class='bx bx-trash'></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 入力エリア -->
    <div class="input-area">
      <div v-if="replyTo" class="reply-preview">
        <i class='bx bx-subdirectory-right'></i>
        <span>{{ replyTo.username }}: {{ replyTo.content.substring(0, 50) }}</span>
        <button class="cancel-reply" @click="replyTo = null">
          <i class='bx bx-x'></i>
        </button>
      </div>
      <div class="input-box">
        <input 
          v-model="messageInput" 
          type="text" 
          placeholder="メッセージを入力..."
          @keydown.enter="sendMessage"
        />
        <button class="send-btn" :disabled="!messageInput.trim()" @click="sendMessage">
          <i class='bx bx-send'></i>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dm-chat {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #f5f5f5;
}

.chat-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 24px;
  background: white;
  border-bottom: 1px solid #e0e0e0;
}

.back-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: #f0f0f0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #1a1a1a;
  transition: all 0.2s;
}

.back-btn:hover {
  background: #e0e0e0;
  transform: scale(1.05);
}

.back-btn i {
  font-size: 1.4rem;
}

.friend-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.friend-info {
  flex: 1;
}

.friend-name {
  font-weight: 600;
  font-size: 1.1rem;
  color: #1a1a1a;
}

.icon-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;
}

.icon-btn.danger {
  background: #f04747;
  color: white;
}

.icon-btn.danger:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(240, 71, 71, 0.3);
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.loading-state, .empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
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

.messages-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.message-item {
  display: flex;
  gap: 12px;
  padding: 8px 0;
}

.message-item.is-compact {
  padding-top: 2px;
}

.message-item.has-reply {
  padding-top: 8px;
}

.message-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.message-avatar-placeholder {
  width: 40px;
  flex-shrink: 0;
}

.message-content-wrapper {
  flex: 1;
  min-width: 0;
}

.message-header {
  display: flex;
  align-items: baseline;
  gap: 12px;
  margin-bottom: 4px;
}

.message-author {
  font-weight: 600;
  color: #1a1a1a;
}

.message-time {
  font-size: 0.75rem;
  color: #999;
}

.reply-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: rgba(100, 108, 255, 0.1);
  border-left: 3px solid #646cff;
  border-radius: 8px;
  margin-bottom: 8px;
  font-size: 0.85rem;
  color: #666;
}

.reply-indicator i {
  font-size: 1rem;
  color: #646cff;
}

.message-bubble {
  position: relative;
  background: white;
  padding: 12px 16px;
  border-radius: 12px;
  max-width: 70%;
  color: #1a1a1a;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}

.message-item.is-own .message-bubble {
  background: linear-gradient(135deg, #646cff 0%, #535bf2 100%);
  color: white;
  margin-left: auto;
}

.message-text {
  margin: 0;
  word-wrap: break-word;
  line-height: 1.5;
}

.message-actions {
  display: none;
  position: absolute;
  top: -12px;
  right: 12px;
  gap: 4px;
  background: white;
  border-radius: 8px;
  padding: 4px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
}

.message-bubble:hover .message-actions {
  display: flex;
}

.action-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  background: #f0f0f0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.action-btn:hover {
  background: #e0e0e0;
  transform: scale(1.1);
}

.action-btn.danger {
  background: #f04747;
  color: white;
}

.action-btn i {
  font-size: 1.1rem;
}

.input-area {
  background: white;
  border-top: 1px solid #e0e0e0;
  padding: 16px 24px;
}

.reply-preview {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: rgba(100, 108, 255, 0.1);
  border-left: 3px solid #646cff;
  border-radius: 8px;
  margin-bottom: 12px;
  font-size: 0.9rem;
  color: #666;
}

.reply-preview i {
  color: #646cff;
}

.cancel-reply {
  margin-left: auto;
  width: 24px;
  height: 24px;
  border: none;
  border-radius: 50%;
  background: rgba(0,0,0,0.1);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cancel-reply:hover {
  background: rgba(0,0,0,0.2);
}

.input-box {
  display: flex;
  gap: 12px;
  align-items: center;
}

.input-box input {
  flex: 1;
  padding: 12px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  font-size: 1rem;
  outline: none;
  transition: all 0.2s;
}

.input-box input:focus {
  border-color: #646cff;
  box-shadow: 0 0 0 3px rgba(100, 108, 255, 0.1);
}

.send-btn {
  width: 48px;
  height: 48px;
  border: none;
  border-radius: 50%;
  background: linear-gradient(135deg, #646cff 0%, #535bf2 100%);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.send-btn:hover:not(:disabled) {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(100, 108, 255, 0.4);
}

.send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.send-btn i {
  font-size: 1.4rem;
}
</style>
