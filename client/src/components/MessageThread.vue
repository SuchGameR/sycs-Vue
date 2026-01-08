<script setup lang="ts">
import { computed } from 'vue'
import MessageThread from './MessageThread.vue'

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
    // 追加された拡張プロパティ
    is_pinned?: number | boolean,
    isCompact?: boolean,
    isGroupStart?: boolean,
    isGroupEnd?: boolean,
    user_uuid?: string,
    children?: any[]
  },
  depth: number,
  isLast?: boolean,
  currentUser: any,
  currentThread: any
}>()

const emit = defineEmits(['reply', 'delete-message'])

// 権限チェック: 自分のメッセージ、またはスレッド作成者
const canDelete = computed(() => {
  if (!props.currentUser || !props.currentThread) return false
  const isOwner = props.message.sender_id === props.currentUser.id
  const isThreadCreator = props.currentThread.creator_id === props.currentUser.id
  
  // スレッド設定で削除が許可されているか
  const isDeleteAllowed = props.currentThread.allow_msg_delete === 1 || props.currentThread.allow_msg_delete === true
  
  return (isOwner && isDeleteAllowed) || isThreadCreator
})

const handleDeleteRequest = async (e?: MouseEvent) => {
  if (!e?.shiftKey && !confirm('メッセージを削除しますか？')) return
  try {
    const response = await fetch(`http://localhost:3000/api/messages/${props.message.id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: props.currentUser.id })
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
  const parts: { type: 'text' | 'link' | 'mention', text: string, url?: string }[] = []
  
  // URL正規表現
  const urlRegex = /(https?:\/\/[^\s]+)/g
  // メンション正規表現
  const mentionRegex = /(@[a-zA-Z0-9_]+)/g
  
  // 非常にシンプルな分割ロジック (URLとメンションを同時に扱う)
  // 実際にはより厳密なトークナイザーが必要だが、ここでは代表的な実装を行う
  let lastIndex = 0
  const combinedRegex = new RegExp(`${urlRegex.source}|${mentionRegex.source}`, 'g')
  let match

  while ((match = combinedRegex.exec(content)) !== null) {
    // マッチ前のテキストを追加
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

  // 残りのテキストを追加
  if (lastIndex < content.length) {
    parts.push({ type: 'text', text: content.slice(lastIndex) })
  }

  return parts
})

const handleImageClick = (url: string) => {
  window.open('http://localhost:3000' + url, '_blank')
}
</script>

<template>
  <div 
    class="message-wrapper"
    :class="{
      'is-group-start': message.isGroupStart,
      'compact': message.isCompact
    }"
  >
    <div 
      class="message-container" 
      :class="{ 
        pinned: message.is_pinned, 
        compact: message.isCompact, 
        'is-child': depth > 0,
        'is-last': isLast,
        'is-group-start': message.isGroupStart,
        'is-group-end': message.isGroupEnd
      }"
    >
      <div v-if="message.is_pinned && !message.isCompact" class="pin-badge"><i class='bx bxs-pin' ></i> 固定済み</div>
      
      <div class="msg-main">
        <!-- コンパクトでない場合のみアバターを表示 -->
        <div v-if="!message.isCompact" class="avatar-wrapper">
          <img :src="message.avatar_url || '/default-avatar.svg'" class="msg-avatar" />
        </div>
        <!-- コンパクトな場合は左端にホバー用の隠し時刻エリア -->
        <div v-else class="msg-time-spacer">{{ formattedTime }}</div>
 
        <div class="msg-content-wrapper">
          <!-- コンパクトでない場合のみヘッダーを表示 -->
          <div v-if="!message.isCompact" class="msg-header">
            <span class="msg-username">{{ message.username }}</span>
            <span class="msg-uuid">#{{ message.user_uuid }}</span>
            <span class="msg-time">{{ formattedTime }}</span>
          </div>
 
          <div class="msg-body">
            <!-- パースされたコンテンツの表示 -->
            <template v-for="(part, i) in processedContent" :key="i">
              <span v-if="part.type === 'text'">{{ part.text }}</span>
              <a v-else-if="part.type === 'link'" :href="part.url" target="_blank" rel="noopener" class="msg-link">{{ part.text }}</a>
              <span v-else-if="part.type === 'mention'" class="msg-mention">{{ part.text }}</span>
            </template>
            
            <!-- 添付ファイルの表示 -->
            <div v-if="message.file_url" class="msg-attachment">
              <!-- 画像表示 -->
              <div v-if="isImage" class="attachment-image-wrapper">
                <img :src="'http://localhost:3000' + message.file_url" class="attachment-image" @click="handleImageClick(message.file_url)" />
              </div>
              
              <!-- 動画表示 -->
              <div v-else-if="isVideo" class="attachment-video-wrapper">
                <video controls playsinline class="attachment-video">
                  <source :src="'http://localhost:3000' + message.file_url" />
                  お使いのブラウザでは動画を再生できないようです...
                </video>
              </div>

              <!-- 音声表示 -->
              <div v-else-if="isAudio" class="attachment-audio-wrapper">
                <div class="attachment-audio-card">
                  <div class="audio-icon"><i class='bx bx-music'></i></div>
                  <div class="audio-player-info">
                    <span class="file-name">{{ message.file_name }}</span>
                    <audio controls class="attachment-audio">
                      <source :src="'http://localhost:3000' + message.file_url" />
                    </audio>
                  </div>
                </div>
              </div>

              <!-- その他ファイル -->
              <div v-else class="attachment-file-card">
                <div class="file-icon"><i class='bx bxs-file'></i></div>
                <div class="file-info">
                  <span class="file-name">{{ message.file_name }}</span>
                  <a :href="'http://localhost:3000' + message.file_url" download class="download-link"><i class='bx bx-download'></i>ダウンロード</a>
                </div>
              </div>
            </div>
            
            <div class="msg-actions">
              <button class="action-btn" @click="$emit('reply', message)">
                <i class='bx bx-reply'></i> 返信
              </button>
              <button class="action-btn" title="リアクション">
                <i class='bx bx-smile'></i> リアクション
              </button>
              <button 
                v-if="canDelete" 
                class="action-btn danger-text" 
                @click="handleDeleteRequest"
              >
                <i class='bx bx-trash'></i> 削除
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

      <!-- 子メッセージの再帰表示 -->
      <div v-if="message.children && message.children.length > 0" class="replies-container">
        <MessageThread 
          v-for="(child, idx) in message.children" 
          :key="child.id" 
          :message="child"
          :depth="depth + 1"
          :is-last="idx === message.children.length - 1"
          :current-user="currentUser"
          :current-thread="currentThread"
          @reply="$emit('reply', $event)"
          @delete-message="$emit('delete-message', $event)"
        />
      </div>
  </div>
</template>

<style scoped>
.message-wrapper {
  position: relative;
  display: flex;
  flex-direction: column;
}

/* 階層インデント */
.replies-container {
  margin-left: 36px;
  padding-left: 0;
  position: relative;
}

/* メッセージタイル (カード) */
.message-container {
  position: relative;
  padding: 10px 16px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  background: white;
  margin-bottom: 2px; /* 基本の隙間 */
  z-index: 5;
  border-radius: 0px; /* 中間のデフォルト */
}

/* タイル・グルーピング: 角丸の動的制御 */
.message-container.is-group-start {
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
  margin-top: 6px;
}

.message-container.is-group-end {
  border-bottom-left-radius: 12px;
  border-bottom-right-radius: 12px;
  margin-bottom: 8px;
}

.message-container:hover {
  background-color: #fafafa;
  z-index: 10;
}

/* 連続投稿 (compact) 時のタイル連結 */
.message-container.compact {
  margin-top: -1px;
  border-top-color: transparent;
  box-shadow: none;
  padding-top: 4px;
}

/* スレッドコネクタ: 垂直線セグメント (Wrapper Based) */
/* 子要素を持つラッパー（replies-container内のwrapper）に対して線を描画 */
.replies-container > .message-wrapper::before {
  content: "";
  position: absolute;
  left: -18px; /* Containerの左端基準 */
  top: 0;
  bottom: 0;
  width: 2px;
  background-color: #e1e4e8;
  z-index: 1;
}

/* 最後の要素だけは途中で止める (L字アームとの接続) */
.replies-container > .message-wrapper:last-child::before {
  bottom: auto;
}

/* Last Child Heights based on Wrapper state */
/* Group Start (+6px margin inside) -> Height 26px */
.replies-container > .message-wrapper.is-group-start:last-child::before {
  height: 26px;
}

/* Default (Standard gap) -> Height 20px */
.replies-container > .message-wrapper:not(.is-group-start):not(.compact):last-child::before {
  height: 20px;
}

/* Compact -> Hidden (User request: don't show line for same-user consecutive messages) */
.replies-container > .message-wrapper.compact::before {
  display: none;
}

/* 旧定義の削除 (message-container側のbeforeは不要になる) */
/* message-container.is-child::before ルールと周辺の調整を無効化 */
.message-container.is-child::before {
  display: none;
}

/* スレッドコネクタ: 滑らかな L 字カーブ (水平アーム) */
/* これは message-container 側に残す (位置は変えない) */
.message-container.is-child:not(.compact)::after {
  content: "";
  position: absolute;
  left: -18px;
  top: 8px;
  width: 36px;
  height: 24px; /* アバターの中心までの高さ */
  border-left: 2px solid #e1e4e8;
  border-bottom: 2px solid #e1e4e8;
  border-bottom-left-radius: 12px; /* Reddit 風の丸み */
  pointer-events: none;
  z-index: 2;
}

/* L字アームの下にある垂直線を隠さないように */
/* Wrapperの線は z-index 1, message-containerは z-index 5. 問題なし */

.avatar-wrapper {
  position: relative;
  z-index: 5;
}

.msg-avatar {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  object-fit: cover;
  background: #646cff;
  border: 1px solid #eee;
  flex-shrink: 0;
  margin-top: 2px;
}

.msg-main {
  display: flex;
  gap: 12px;
  position: relative;
}

.msg-time-spacer {
  width: 40px;
  height: 24px;
  font-size: 0.65rem;
  color: transparent;
  display: flex;
  justify-content: center;
  align-items: center;
  user-select: none;
}

.message-container.compact:hover .msg-time-spacer {
  color: #bbb;
}

.msg-content-wrapper {
  flex: 1;
  min-width: 0;
}

.msg-header {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 4px;
}

.msg-username {
  font-weight: 700;
  font-size: 1rem;
  color: #1a1a1a;
  cursor: pointer;
}

.msg-uuid {
  font-size: 0.75rem;
  color: #888;
}

.msg-time {
  font-size: 0.75rem;
  color: #aaa;
}

.msg-body {
  position: relative;
  font-size: 1rem;
  line-height: 1.6;
  color: #333;
  white-space: pre-wrap;
  word-break: break-all;
  display: block;
}

/* アクションバー: Appleらしい浮遊感 */
.msg-link {
  color: #646cff;
  text-decoration: none;
  font-weight: 500;
}

.msg-link:hover {
  text-decoration: underline;
}

.msg-mention {
  background: rgba(100, 108, 255, 0.1);
  color: #646cff;
  padding: 0 4px;
  border-radius: 4px;
  font-weight: 600;
}

.msg-attachment {
  margin-top: 10px;
  margin-bottom: 5px;
}

.attachment-image-wrapper {
  max-width: 300px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  cursor: pointer;
  transition: transform 0.2s;
}

.attachment-image-wrapper:hover {
  transform: scale(1.02);
}

.attachment-image {
  width: 100%;
  display: block;
}

.attachment-video-wrapper {
  max-width: 100%;
  width: 400px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  background: black;
}

.attachment-video {
  width: 100%;
  max-height: 300px;
  display: block;
}

.attachment-audio-wrapper {
  max-width: 400px;
  width: 100%;
}

.attachment-audio-card {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 12px 16px;
  background: #fdfdfd;
  border: 1px solid #eee;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.03);
}

.audio-icon {
  font-size: 2rem;
  background: #f0f2ff;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  flex-shrink: 0;
}

.audio-player-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.audio-player-info .file-name {
  font-weight: 600;
  font-size: 0.95rem;
  color: #333;
}

.attachment-audio {
  width: 100%;
  height: 32px;
}

.attachment-file-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f8f9fa;
  border: 1px solid #e1e4e8;
  border-radius: 12px;
  max-width: 300px;
}

.file-icon {
  font-size: 1.5rem;
}

.file-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.file-name {
  font-weight: 600;
  font-size: 0.9rem;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.download-link {
  font-size: 0.8rem;
  color: #646cff;
  text-decoration: none;
}

.download-link:hover {
  text-decoration: underline;
}

.msg-actions {
  position: absolute;
  right: -4px;
  bottom: -4px;
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: all 0.2s cubic-bezier(0.18, 0.89, 0.32, 1.28);
  background: #fff;
  padding: 4px;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  z-index: 20;
  transform: scale(0.8);
}

.message-container:hover .msg-actions {
  opacity: 1;
  transform: scale(1);
}

.action-btn {
  background: #fdfdfd;
  border: 1px solid #f0f0f0;
  min-width: 32px;
  width: auto;
  height: 32px;
  padding: 0 12px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  cursor: pointer;
  white-space: nowrap;
  font-size: 0.85rem;
  color: #555;
}

.action-btn:hover {
  background-color: #646cff;
  color: white;
  border-color: #646cff;
}

.pin-badge {
  font-size: 0.7rem;
  color: #f39c12;
  font-weight: 700;
  margin-left: 52px;
  margin-bottom: 4px;
}
</style>
