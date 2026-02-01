<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { authFetch } from '../utils/api'
import MessageThread from './MessageThread.vue'
import { io } from 'socket.io-client'

const props = defineProps<{
  threadId: number,
  currentUser: any,
  currentThread: any
}>()

const emit = defineEmits(['show-profile'])

const socket = io('http://localhost:3000') // Socket.io 接続

onUnmounted(() => {
  socket.disconnect()
})
const messages = ref<any[]>([])
const newMessage = ref('')
const replyingTo = ref<any>(null)
const loading = ref(false)

// メッセージ取得
const fetchMessages = async () => {
  if (!props.threadId) return
  loading.value = true
  try {
    const response = await fetch(`http://localhost:3000/api/threads/${props.threadId}/messages`)
    if (response.ok) {
      messages.value = await response.json()
      
      // スレッドのルームに参加
      socket.emit('join_thread', props.threadId)
    }
  } catch (e) {
    console.error('Failed to fetch messages')
  } finally {
    loading.value = false
  }
}

// リアルタイム受信の設定
socket.on('new_message', (msg: any) => {
  if (!messages.value.find(m => m.id === msg.id)) {
    messages.value.push(msg)
  }
})

socket.on('message_deleted', (data: { id: number }) => {
  messages.value = messages.value.filter(m => m.id !== data.id)
})

socket.on('message_updated', (updatedMsg: any) => {
  const idx = messages.value.findIndex(m => m.id === updatedMsg.id)
  if (idx !== -1) {
    messages.value[idx] = updatedMsg
  }
})

// 添付ファイル状態
const attachedFile = ref<{ url: string, name: string } | null>(null)
const isDraggingInput = ref(false)
const isUploading = ref(false)
const fileInputRef = ref<HTMLInputElement | null>(null)

// 許可リスト (フロント)
const ALLOWED_EXTS = [
  '.png', '.jpg', '.jpeg', '.svg', '.ico', '.gif',
  '.mp4', '.mov', '.webm',
  '.mp3', '.wav', '.ogg', '.flac'
]

// ファイルアップロード (メッセージ用)
const handleFileSelect = async (e: Event | File) => {
  let file: File | null = null
  if (e instanceof File) {
    file = e
  } else {
    file = (e.target as HTMLInputElement).files?.[0] || null
  }
  
  if (!file) return

  // バリデーション: 拡張子
  const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase()
  if (!ALLOWED_EXTS.includes(ext)) {
    alert('許可されていないファイル形式です (画像, 動画, 音声のみ)')
    return
  }

  // バリデーション: サイズ (30MB)
  if (file.size > 30 * 1024 * 1024) {
    alert('ファイルサイズが大きすぎます (最大30MB)')
    return
  }

  isUploading.value = true
  const formData = new FormData()
  formData.append('file', file)

  try {
    const response = await authFetch('http://localhost:3000/api/upload/file', {
      method: 'POST',
      body: formData,
      headers: {} // authFetch will set Authorization, but we want to let browser set Content-Type for FormData
    })
    if (response.ok) {
      const data = await response.json()
      attachedFile.value = { url: data.url, name: data.originalName }
    } else {
      const errorMsg = await response.text()
      alert(errorMsg || 'アップロードに失敗しました')
    }
  } catch (err) {
    console.error('File upload failed', err)
  } finally {
    isUploading.value = false
  }
}

const onInputDrop = (e: DragEvent) => {
  isDraggingInput.value = false
  const file = e.dataTransfer?.files[0]
  if (file) handleFileSelect(file)
}

// 投稿実行
const sendMessage = async () => {
  if (!newMessage.value.trim() && !attachedFile.value) return
  
  try {
    const response = await authFetch('http://localhost:3000/api/messages', {
      method: 'POST',
      body: JSON.stringify({
        thread_id: props.threadId,
        content: newMessage.value,
        parent_id: replyingTo.value?.id || null,
        file_url: attachedFile.value?.url || null,
        file_name: attachedFile.value?.name || null
      })
    })
    
    if (response.ok) {
      newMessage.value = ''
      attachedFile.value = null
      replyingTo.value = null
      fetchMessages() // 再取得
    }
  } catch (e) {
    alert('送信に失敗しました')
  }
}

// メッセージを階層化するロジック (Discord風の連続投稿判定も含む)
// メッセージを階層化せず、フラットな連続投稿判定のみを行う (Discord風)
const organizedMessages = computed(() => {
  const result: any[] = []
  
  // マップを作成して親メッセージを素早く参照できるようにする
  const map: any = {}
  messages.value.forEach(msg => {
    map[msg.id] = msg
  })

  for (let i = 0; i < messages.value.length; i++) {
    const current = { ...messages.value[i] }
    const previous = i > 0 ? messages.value[i - 1] : null
    const next = i < messages.value.length - 1 ? messages.value[i + 1] : null
    
    // 親メッセージの情報（返信先）を付与
    if (current.parent_id && map[current.parent_id]) {
      current.replyTo = map[current.parent_id]
    }

    const timeDiffPrev = previous ? new Date(current.created_at).getTime() - new Date(previous.created_at).getTime() : Infinity
    const timeDiffNext = next ? new Date(next.created_at).getTime() - new Date(current.created_at).getTime() : Infinity
    const groupWindow = 7 * 60 * 1000 // 7分以内の連続投稿をグループ化

    // Discordは「返信」がついている場合は、同じユーザーでもグループ化されない
    const isSameAsPrev = previous && 
                       current.sender_id === previous.sender_id && 
                       timeDiffPrev < groupWindow &&
                       !current.parent_id

    const isSameAsNext = next && 
                       current.sender_id === next.sender_id && 
                       timeDiffNext < groupWindow &&
                       !next.parent_id

    current.isCompact = isSameAsPrev
    current.isGroupStart = !isSameAsPrev
    current.isGroupEnd = !isSameAsNext
    
    result.push(current)
  }
  
  return result
})

watch(() => props.threadId, fetchMessages)

onMounted(fetchMessages)
</script>

<template>
  <div class="message-list-container">
    <!-- メッセージ表示エリア -->
    <div class="messages-scroll">
      <div v-if="loading" class="loading">メッセージを読み込み中...</div>
      <div v-else-if="organizedMessages.length === 0" class="empty">
        ｼｰﾝ...静かな場所ですね。<br>少し世間話でもどうでしょう?
      </div>
      
      <!-- 再帰コンポーネントを使わずにシンプルなフラット表示 or ネスト表示 -->
      <MessageThread 
        v-for="(msg, index) in organizedMessages" 
        :key="msg.id" 
        :message="msg" 
        :depth="0"
        :is-last="index === organizedMessages.length - 1"
        :current-user="currentUser"
        :current-thread="currentThread"
        @reply="(m) => replyingTo = m"
        @delete-message="fetchMessages"
        @show-profile="(userId) => emit('show-profile', userId)"
      />
    </div>

    <!-- 投稿フォーム (フッターのように固定) -->
    <div class="input-area" :class="{ dragging: isDraggingInput }">
      <div v-if="replyingTo" class="reply-hint">
        <span>{{ replyingTo.username }} への返信</span>
        <button @click="replyingTo = null">×</button>
      </div>

      <!-- 添付ファイルプレビュー -->
      <div v-if="attachedFile" class="attachment-preview">
        <div class="preview-card">
          <span class="file-icon">{{ attachedFile.name.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? '🛡️' : '📄' }}</span>
          <span class="file-name">{{ attachedFile.name }}</span>
          <button class="remove-file" @click="attachedFile = null"><i class="bx bx-x"></i></button>
        </div>
      </div>

      <div class="input-wrapper">
        <button class="clip-btn" @click="fileInputRef?.click()" :disabled="isUploading">
          <span v-if="!isUploading"><i class='bx bx-paperclip'></i></span>
          <span v-else class="mini-spinner"></span>
        </button>
        <input 
          ref="fileInputRef"
          type="file"
          style="display: none"
          @change="handleFileSelect"
        />
        <textarea 
          v-model="newMessage" 
          placeholder="メッセージを入力... (D&Dでファイルを添付)"
          @keydown.enter.exact.prevent="sendMessage"
          @dragover.prevent="isDraggingInput = true"
          @dragleave="isDraggingInput = false"
          @drop.prevent="onInputDrop"
        ></textarea>
        <button class="send-btn" :disabled="(!newMessage.trim() && !attachedFile) || isUploading" @click="sendMessage">
          <i class='bx bxs-send'></i>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.message-list-container {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 50px);
}

.messages-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
}

.input-area {
  padding: 16px 24px 24px 24px;
  background: var(--sys-surface);
  transition: all 0.2s;
}

.input-area.dragging {
  background: var(--sys-primary-container);
}

.input-wrapper {
  display: flex;
  gap: 8px;
  align-items: center;
  background: var(--sys-surface-variant);
  padding: 4px 8px 4px 16px;
  border-radius: 28px;
}

.clip-btn {
  color: var(--sys-primary);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: none;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  cursor: pointer;
  transition: background 0.2s;
}

.clip-btn:hover:not(:disabled) {
  background: rgba(0,0,0,0.05);
}

textarea {
  color: var(--sys-on-surface);
  flex: 1;
  padding: 12px 0;
  border: none;
  background: transparent;
  resize: none;
  height: 24px;
  min-height: 24px;
  max-height: 200px;
  font-family: inherit;
  font-size: 1rem;
  outline: none;
}

.send-btn {
  width: 40px;
  height: 40px;
  background: var(--sys-primary);
  color: white;
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.2s, opacity 0.2s;
  flex-shrink: 0;
}

.send-btn:hover:not(:disabled) {
    opacity: 0.9;
    transform: scale(1.05);
}

.send-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.reply-hint {
    background: var(--sys-surface-variant);
    padding: 8px 16px;
    border-top-left-radius: 16px;
    border-top-right-radius: 16px;
    font-size: 0.875rem;
    color: var(--sys-on-surface-variant);
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid var(--sys-outline);
    margin-bottom: -16px;
    position: relative;
    z-index: 1;
}

.attachment-preview {
    padding: 8px 16px;
    background: var(--sys-surface-variant);
    border-top-left-radius: 16px;
    border-top-right-radius: 16px;
    margin-bottom: -16px;
}

.empty {
  text-align: center;
  color: #999;
  margin-top: 50px;
}
</style>
```
