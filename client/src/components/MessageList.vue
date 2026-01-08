<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import MessageThread from './MessageThread.vue'
import { io } from 'socket.io-client'

const props = defineProps<{
  threadId: number,
  currentUser: any,
  currentThread: any
}>()

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
    const response = await fetch('http://localhost:3000/api/upload/file', {
      method: 'POST',
      body: formData
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
    const response = await fetch('http://localhost:3000/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        thread_id: props.threadId,
        sender_id: props.currentUser.id,
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
const organizedMessages = computed(() => {
  const map: any = {}
  const roots: any[] = []
  
  // まず全てのメッセージをマップに登録
  messages.value.forEach(msg => {
    map[msg.id] = { 
      ...msg, 
      children: [], 
      isCompact: false,
      isGroupStart: false,
      isGroupEnd: false
    }
  })
  
  // 親子関係を構築
  messages.value.forEach(msg => {
    if (msg.parent_id && map[msg.parent_id]) {
      map[msg.parent_id].children.push(map[msg.id])
    } else {
      roots.push(map[msg.id])
    }
  })

  // 各階層で連続投稿をマークする再帰関数
  const markGroups = (msgList: any[]) => {
    for (let i = 0; i < msgList.length; i++) {
      const current = msgList[i]
      const previous = i > 0 ? msgList[i - 1] : null
      const next = i < msgList.length - 1 ? msgList[i + 1] : null
      
      const timeDiffPrev = previous ? new Date(current.created_at).getTime() - new Date(previous.created_at).getTime() : Infinity
      const timeDiffNext = next ? new Date(next.created_at).getTime() - new Date(current.created_at).getTime() : Infinity
      const groupWindow = 5 * 60 * 1000 // 5分以内の連続投稿をグループ化

      const isSameAsPrev = previous && current.sender_id === previous.sender_id && timeDiffPrev < groupWindow
      const isSameAsNext = next && current.sender_id === next.sender_id && timeDiffNext < groupWindow

      // Discord風コンパクト表示（今まで通り）
      current.isCompact = isSameAsPrev

      // タイル・グルーピング用フラグ
      current.isGroupStart = !isSameAsPrev
      current.isGroupEnd = !isSameAsNext

      if (current.children.length > 0) {
        markGroups(current.children)
      }
    }
  }

  markGroups(roots)
  
  return roots
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
        <button class="send-btn" :disabled="(!newMessage.trim() && !attachedFile) || isUploading" @click="sendMessage">送信</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.message-list-container {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 120px); /* ナビバー分を引く */
}

.messages-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
  display: flex;
  flex-direction: column;
  /* gap: 15px; */
}

.input-area {
  padding: 20px;
  border-top: 1px solid #eee;
  background: white;
  transition: all 0.2s;
}

.input-area.dragging {
  background: #f0f2ff;
  border-top-color: #646cff;
}

.attachment-preview {
  margin-bottom: 12px;
  animation: fadeIn 0.2s ease-out;
}

.preview-card {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  background: #f8f9fa;
  border: 1px solid #e1e4e8;
  border-radius: 10px;
  font-size: 0.9rem;
}

.file-icon {
  font-size: 1.2rem;
}

.file-name {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #333;
}

.remove-file {
  background: #ddd;
  border: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  cursor: pointer;
  color: #666;
}

.remove-file:hover {
  background: #f44336;
  color: white;
}

.input-wrapper {
  display: flex;
  gap: 12px;
  align-items: flex-end;
}

.clip-btn {
  color: #141414;
  width: 45px;
  height: 45px;
  border-radius: 12px;
  border: 1px solid #ddd;
  background: #fdfdfd;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}

.clip-btn:hover:not(:disabled) {
  background: #eee;
  border-color: #646cff;
}

.mini-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #ddd;
  border-top-color: #646cff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
}

textarea {
  color: #141414;
  flex: 1;
  padding: 12px;
  border-radius: 12px;
  border: 1px solid #ddd;
  resize: none;
  height: 45px;
  font-family: inherit;
  font-size: 1rem;
  transition: all 0.2s;
  background: #fafafa;
}

textarea:focus {
  outline: none;
  border-color: #646cff;
  background: white;
  box-shadow: 0 0 0 4px rgba(100, 108, 255, 0.05);
}

.send-btn {
  padding: 0 24px;
  height: 45px;
  background: #646cff;
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}

.send-btn:hover:not(:disabled) {
  background: #535bf2;
  transform: translateY(-1px);
}

.send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.empty {
  text-align: center;
  color: #999;
  margin-top: 50px;
}
</style>
