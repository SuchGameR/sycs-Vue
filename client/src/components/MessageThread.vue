<script setup lang="ts">
import { ref, computed } from 'vue'
import { authFetch } from '../utils/api'

const props = defineProps<{
  message: {
    id: number,
    content: string,
    sender_id: number,
    username: string,
    avatar_url?: string,
    created_at: string,
    file_url?: string,
    file_type?: string,
    file_name?: string,
    is_pinned?: number | boolean,
    isCompact?: boolean,
    isGroupStart?: boolean,
    isGroupEnd?: boolean,
    user_uuid?: string,
    replyTo?: any,
    updated_at?: string // 追加
  },
  depth: number,
  isLast?: boolean,
  currentUser: any,
  currentThread: any
}>()

const emit = defineEmits(['reply', 'delete-message', 'show-profile', 'message-updated'])

// 編集状態
const isEditing = ref(false)
const editText = ref(props.message.content)

const handleEditStart = () => {
  if (props.message.sender_id !== props.currentUser.id) return
  editText.value = props.message.content
  isEditing.value = true
}

const handleCancelEdit = () => {
  isEditing.value = false
}

const handleSaveEdit = async () => {
  if (editText.value.trim() === props.message.content) {
    isEditing.value = false
    return
  }
  try {
    const response = await authFetch(`http://localhost:3000/api/messages/${props.message.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ content: editText.value })
    })
    if (response.ok) {
      isEditing.value = false
    }
  } catch (e) {
    console.error('Edit failed', e)
  }
}

const handleAvatarClick = () => {
  emit('show-profile', props.message.sender_id)
}

const canDelete = computed(() => {
  if (!props.currentUser || !props.currentThread) return false
  const isOwner = props.message.sender_id === props.currentUser.id
  const isThreadCreator = props.currentThread.creator_id === props.currentUser.id
  const isDeleteAllowed = props.currentThread.allow_msg_delete === 1 || props.currentThread.allow_msg_delete === true
  return (isOwner && isDeleteAllowed) || isThreadCreator
})

const handleDeleteRequest = async (e?: MouseEvent) => {
  if (!e?.shiftKey && !confirm('メッセージを削除しますか？')) return
  try {
    const response = await authFetch(`http://localhost:3000/api/messages/${props.message.id}`, {
      method: 'DELETE'
    })
    if (response.ok) {
        emit('delete-message', props.message.id)
    }
  } catch (e) {
    console.error('Delete failed', e)
  }
}

const formattedTime = computed(() => {
  const date = new Date(props.message.created_at)
  return `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`
})
const isImage = computed(() => {
  if (!props.message.file_url) return false
  return /\.(jpg|jpeg|png|gif|svg|ico|webp)$/i.test(props.message.file_url)
})
const isVideo = computed(() => {
  if (!props.message.file_url) return false
  return /\.(mp4|mov|webm)$/i.test(props.message.file_url)
})
const isAudio = computed(() => {
  if (!props.message.file_url) return false
  return /\.(mp3|wav|ogg|flac)$/i.test(props.message.file_url)
})

const processedContent = computed(() => {
  const content = props.message.content || ''
  const parts: any[] = []
  const urlRegex = /(https?:\/\/[^\s]+)/g
  const mentionRegex = /(@[a-zA-Z0-9_]+)/g
  let lastIndex = 0
  const combinedRegex = new RegExp(`${urlRegex.source}|${mentionRegex.source}`, 'g')
  let match
  while ((match = combinedRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: 'text', text: content.slice(lastIndex, match.index) })
    }
    const matchedText = match[0]
    if (matchedText.startsWith('http')) {
      parts.push({ type: 'link', text: matchedText, url: matchedText })
    } else if (matchedText.startsWith('@')) {
      parts.push({ type: 'mention', text: matchedText })
    }
    lastIndex = combinedRegex.lastIndex
  }
  if (lastIndex < content.length) {
    parts.push({ type: 'text', text: content.slice(lastIndex) })
  }
  return parts
})

const handleImageClick = (url: string) => {
  window.open('http://localhost:3000' + url, '_blank')
}

// 編集履歴
const edits = ref<any[]>([])
const loadingEdits = ref(false)
const fetchEdits = async () => {
  if (edits.value.length > 0 || loadingEdits.value) return
  loadingEdits.value = true
  try {
    const response = await authFetch(`http://localhost:3000/api/messages/${props.message.id}/edits`)
    if (response.ok) {
      edits.value = await response.json()
    }
  } catch (e) {
    console.error('Failed to fetch edits', e)
  } finally {
    loadingEdits.value = false
  }
}

const formatFullDate = (dateStr: string) => {
  const d = new Date(dateStr)
  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:${d.getMinutes().toString().padStart(2, '0')}`
}
</script>

<template>
  <div 
    class="message-outer"
    :class="{ 'is-compact': message.isCompact, 'has-reply': message.replyTo }"
  >
    <!-- Discordスタイルの返信先表示 -->
    <div v-if="message.replyTo" class="reply-reference">
      <div class="reply-spine"></div>
      <img :src="message.replyTo.avatar_url || '/default-avatar.svg'" class="reply-avatar" />
      <span class="reply-user">@{{ message.replyTo.username }}</span>
      <span class="reply-content">{{ message.replyTo.content }}</span>
    </div>

    <div 
      class="message-container" 
      :class="{ 
        'is-compact': message.isCompact,
        'is-editing': isEditing
      }"
    >
      <div class="msg-main">
        <!-- アバターエリア -->
        <div v-if="!message.isCompact" class="avatar-column">
          <img 
            :src="message.avatar_url || '/default-avatar.svg'" 
            class="msg-avatar" 
            @click="handleAvatarClick"
          />
        </div>
        <div v-else class="compact-time">
          {{ formattedTime }}
        </div>

        <div class="msg-content-area">
          <!-- ヘッダーエリア (名前 + 時間) -->
          <div v-if="!message.isCompact" class="msg-header">
            <span class="msg-username" @click="handleAvatarClick">{{ message.username }}</span>
            <span class="msg-time">{{ formattedTime }}</span>
          </div>

          <!-- メッセージ本文 or 編集フォーム -->
          <div class="msg-body-wrapper">
            <div v-if="isEditing" class="edit-form">
              <textarea 
                v-model="editText" 
                @keydown.enter.prevent="handleSaveEdit"
                @keydown.esc="handleCancelEdit"
                ref="editArea"
              ></textarea>
              <div class="edit-hint">
                キャンセルは <span>Esc</span>、保存は <span>Enter</span>
              </div>
            </div>
            <div v-else class="msg-body">
              <template v-for="(part, i) in processedContent" :key="i">
                <span v-if="part.type === 'text'">{{ part.text }}</span>
                <a v-else-if="part.type === 'link'" :href="part.url" target="_blank" rel="noopener" class="msg-link">{{ part.text }}</a>
                <span v-else-if="part.type === 'mention'" class="msg-mention">{{ part.text }}</span>
              </template>
              <span 
                v-if="message.updated_at" 
                class="edited-mark"
                @mouseenter="fetchEdits"
              >
                (編集済み)
                <div class="edit-history-popover">
                  <div class="popover-title">編集履歴</div>
                  <div v-if="loadingEdits" class="popover-loading">読み込み中...</div>
                  <div v-else-if="edits.length === 0" class="popover-empty">履歴なし</div>
                  <ul v-else class="popover-list">
                    <li v-for="edit in edits" :key="edit.id" class="popover-item">
                      {{ formatFullDate(edit.created_at) }}
                    </li>
                  </ul>
                </div>
              </span>
            </div>

            <!-- 添付ファイル -->
            <div v-if="message.file_url" class="msg-attachment">
              <div v-if="isImage" class="attachment-image-wrapper">
                <img :src="'http://localhost:3000' + message.file_url" class="attachment-image" @click="handleImageClick(message.file_url)" />
              </div>
              <div v-else-if="isVideo" class="attachment-video-wrapper">
                <video controls playsinline class="attachment-video">
                  <source :src="'http://localhost:3000' + message.file_url" />
                </video>
              </div>
              <div v-else-if="isAudio" class="attachment-audio-wrapper">
                <audio controls class="attachment-audio">
                  <source :src="'http://localhost:3000' + message.file_url" />
                </audio>
              </div>
              <div v-else class="attachment-file-card">
                <i class='bx bxs-file'></i>
                <div class="file-info">
                  <span class="file-name">{{ message.file_name }}</span>
                  <a :href="'http://localhost:3000' + message.file_url" download class="download-link">ダウンロード</a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- アクションボタン (ホバーで表示) -->
        <div class="msg-actions">
          <button class="action-btn" title="返信" @click="$emit('reply', message)">
            <i class='bx bx-reply'></i>
          </button>
          <button 
            v-if="message.sender_id === currentUser.id" 
            class="action-btn" 
            title="編集"
            @click="handleEditStart"
          >
            <i class='bx bx-edit-alt'></i>
          </button>
          <button 
            v-if="canDelete" 
            class="action-btn danger" 
            title="削除"
            @click="handleDeleteRequest"
          >
            <i class='bx bx-trash'></i>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.message-outer {
  position: relative;
  transition: background-color 0.1s;
}

.message-outer:hover {
  background-color: rgba(0, 0, 0, 0.02);
}

.message-outer.has-reply {
  margin-top: 8px;
}

/* 返信先のリファレンス */
.reply-reference {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-left: 56px;
  position: relative;
  height: 20px;
  margin-bottom: 2px;
}

.reply-spine {
  position: absolute;
  top: 10px;
  left: 28px;
  width: 24px;
  height: 10px;
  border-left: 2px solid var(--sys-outline-variant);
  border-top: 2px solid var(--sys-outline-variant);
  border-top-left-radius: 6px;
}

.reply-avatar {
  width: 16px;
  height: 16px;
  border-radius: 50%;
}

.reply-user {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--sys-on-surface-variant);
  opacity: 0.8;
  cursor: pointer;
}

.reply-user:hover {
  text-decoration: underline;
}

.reply-content {
  font-size: 0.85rem;
  color: var(--sys-on-surface-variant);
  opacity: 0.6;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 60%;
}

/* メインコンテナ */
.message-container {
  padding: 2px 16px;
  position: relative;
}

.message-container.is-compact {
  padding-top: 0;
  padding-bottom: 0;
}

.msg-main {
  display: flex;
  gap: 16px;
}

/* アバターカラム */
.avatar-column {
  width: 40px;
  flex-shrink: 0;
  padding-top: 2px;
}

.msg-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  transition: transform 0.2s;
}

.msg-avatar:hover {
  transform: scale(1.05);
}

.compact-time {
  width: 40px;
  flex-shrink: 0;
  font-size: 0.7rem;
  color: var(--sys-on-surface-variant);
  opacity: 0;
  text-align: right;
  padding-top: 4px;
  user-select: none;
}

.message-outer:hover .compact-time {
  opacity: 1;
}

/* コンテンツエリア */
.msg-content-area {
  flex: 1;
  min-width: 0;
}

.msg-header {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 2px;
}

.msg-username {
  font-weight: 600;
  font-size: 1rem;
  color: var(--sys-on-surface);
  cursor: pointer;
}

.msg-username:hover {
  text-decoration: underline;
}

.msg-time {
  font-size: 0.75rem;
  color: var(--sys-on-surface-variant);
  opacity: 0.7;
}

/* 本文 */
.msg-body-wrapper {
  color: var(--sys-on-surface);
  line-height: 1.5;
  word-wrap: break-word;
}

.msg-body {
  font-size: 0.95rem;
  white-space: pre-wrap;
}

.edited-mark {
  font-size: 0.7rem;
  color: var(--sys-on-surface-variant);
  opacity: 0.5;
  margin-left: 4px;
  cursor: help;
  position: relative;
}

.edited-mark:hover .edit-history-popover {
  display: block;
}

.edit-history-popover {
  display: none;
  position: absolute;
  bottom: 100%;
  left: 0;
  background: var(--sys-surface);
  border: 1px solid var(--sys-outline-variant);
  border-radius: 8px;
  padding: 8px 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  z-index: 100;
  min-width: 180px;
  margin-bottom: 8px;
}

.popover-title {
  font-weight: 600;
  font-size: 0.8rem;
  margin-bottom: 4px;
  border-bottom: 1px solid var(--sys-outline-variant);
  padding-bottom: 2px;
}

.popover-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.popover-item {
  font-size: 0.75rem;
  padding: 2px 0;
}

/* リンク・メンション */
.msg-link {
  color: #0067e6;
  text-decoration: none;
}

.msg-link:hover {
  text-decoration: underline;
}

.msg-mention {
  color: #5865f2;
  background-color: rgba(88, 101, 242, 0.1);
  padding: 0 2px;
  border-radius: 3px;
  font-weight: 500;
  cursor: pointer;
}

.msg-mention:hover {
  background-color: rgba(88, 101, 242, 0.2);
}

/* アクションボタン (ホバーで右上に浮遊) */
.msg-actions {
  position: absolute;
  top: -16px;
  right: 16px;
  display: flex;
  gap: 4px;
  background: var(--sys-surface);
  border: 1px solid var(--sys-outline-variant);
  border-radius: 4px;
  padding: 2px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  opacity: 0;
  transform: translateY(8px);
  transition: opacity 0.1s, transform 0.1s;
  z-index: 10;
}

.message-outer:hover .msg-actions {
  opacity: 1;
  transform: translateY(0);
}

.action-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  color: var(--sys-on-surface-variant);
  border-radius: 4px;
  cursor: pointer;
  font-size: 1.1rem;
  transition: background 0.1s;
}

.action-btn:hover {
  background: rgba(0,0,0,0.05);
  color: var(--sys-on-surface);
}

.action-btn.danger:hover {
  background: #f4433622;
  color: #f44336;
}

/* 編集フォーム */
.edit-form {
  margin-top: 4px;
}

.edit-form textarea {
  width: 100%;
  min-height: 44px;
  padding: 8px;
  background: var(--sys-surface-variant);
  border: 1px solid var(--sys-primary);
  border-radius: 8px;
  color: var(--sys-on-surface);
  font-family: inherit;
  font-size: 0.95rem;
  resize: vertical;
  outline: none;
}

.edit-hint {
  font-size: 0.75rem;
  color: var(--sys-on-surface-variant);
  margin-top: 4px;
}

.edit-hint span {
  color: var(--sys-primary);
  font-weight: 600;
}

/* 添付ファイル */
.msg-attachment {
  margin-top: 8px;
}

.attachment-image-wrapper,
.attachment-video-wrapper,
.attachment-audio-wrapper {
  margin-top: 4px;
}

.attachment-image {
  max-width: 100%;
  max-height: 400px;
  border-radius: 8px;
  cursor: zoom-in;
}

.attachment-video {
  max-width: 100%;
  max-height: 400px;
  border-radius: 8px;
}

.attachment-audio {
  max-width: 100%;
  max-height: 400px;
  border-radius: 8px;
}

.attachment-file-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: var(--sys-surface-variant);
  border-radius: 8px;
  width: fit-content;
  min-width: 240px;
}

.attachment-file-card i {
  font-size: 2rem;
  color: var(--sys-primary);
}

.file-info {
  display: flex;
  flex-direction: column;
}

.file-name {
  font-weight: 600;
  font-size: 0.9rem;
}

.download-link {
  font-size: 0.8rem;
  color: var(--sys-primary);
  text-decoration: none;
}

.download-link:hover {
  text-decoration: underline;
}

/* レスポンシブ対応 (モバイル) */
@media (max-width: 768px) {
  .message-container {
    padding-left: 12px;
    padding-right: 12px;
  }
  .msg-main {
    gap: 12px;
  }
  .reply-reference {
    padding-left: 48px;
  }
  .reply-spine {
    left: 20px;
  }
  .msg-actions {
    right: 8px;
  }
}
</style>
