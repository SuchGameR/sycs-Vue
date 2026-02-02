<script setup lang="ts">
import { ref } from 'vue'
import { authFetch } from '../utils/api'
import ThreadNavigation from './ThreadNavigation.vue'
import MessageList from './MessageList.vue'
import FriendHub from './FriendHub.vue'
import DMChat from './DMChat.vue'
import UserProfilePopover from './UserProfilePopover.vue'
import SettingsOverlay from './SettingsOverlay.vue'

const props = defineProps<{
  user: { id: number, uuid: string, username: string, avatar_url?: string, theme?: string, decoration?: string }
}>()

const emit = defineEmits(['logout', 'update-user'])

import { onMounted } from 'vue'

onMounted(() => {
  // 初期テーマ適用
  if (props.user.theme && props.user.theme !== 'system') {
    document.documentElement.setAttribute('data-theme', props.user.theme)
  }
})

// --- 設定・ステート管理 ---
const isSettingsOpen = ref(false)
const appSettings = ref({
  splitView: false,
  glassUi: false
})
const activeTab = ref('threads')
const activeTabSecondary = ref('dm') // 分割時の右側
const isDragging = ref(false)

// 設定を開く
const handleSettingsClick = () => {
  isSettingsOpen.value = true
}

// --- ユーザーメニュー & ステータス ---
const isUserMenuOpen = ref(false)
const userStatus = ref('online')
const statusList = [
  { id: 'online', label: 'オンライン', color: '#44b700' },
  { id: 'away', label: '離席中', color: '#faa61a' },
  { id: 'busy', label: '取り込み中', color: '#f04747' },
  { id: 'offline', label: '隠れる', color: '#747f8d' }
]
const toggleStatus = () => {
  const currentIndex = statusList.findIndex(s => s.id === userStatus.value)
  const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % statusList.length
  const nextStatus = statusList[nextIndex]
  if (nextStatus) {
    userStatus.value = nextStatus.id
  }
}

// --- スレッド作成・管理 ---
const isThreadCreateOpen = ref(false)
const threadCreateStep = ref(1)
const isThreadUpdating = ref(false)
const threadForm = ref({
  title: '',
  icon_url: '/default-thread.svg',
  visibility: 'public',
  spam_check: false,
  mod_enabled: false,
  allow_msg_delete: true,
  allow_attachments: true
})

const handleThreadCreateClick = () => {
  threadForm.value = {
    title: '',
    icon_url: '/default-thread.svg',
    visibility: 'public',
    spam_check: false,
    mod_enabled: false,
    allow_msg_delete: true,
    allow_attachments: true
  }
  threadCreateStep.value = 1
  isThreadCreateOpen.value = true
}

const handleCreateThread = async () => {
  isThreadUpdating.value = true
  try {
    const response = await authFetch('http://localhost:3000/api/threads', {
      method: 'POST',
      body: JSON.stringify({ ...threadForm.value })
    })
    if (response.ok) {
      const newThread = await response.json()
      isThreadCreateOpen.value = false
      currentThread.value = newThread
      location.reload() // スレッド一覧を再読込
    }
  } catch (e) {
    console.error('Thread creation failed', e)
  } finally {
    isThreadUpdating.value = false
  }
}

const handleThreadIconUpload = async (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  isThreadUpdating.value = true
  try {
    const response = await authFetch('http://localhost:3000/api/upload/file', {
      method: 'POST',
      body: formData,
      headers: {}
    })
    if (response.ok) {
      const data = await response.json()
      threadForm.value.icon_url = data.url
    }
  } catch (e) {
    console.error('Thread icon upload failed', e)
  } finally {
    isThreadUpdating.value = false
  }
}

const handleThreadIconUploadForEdit = async (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  isThreadUpdating.value = true
  try {
    const response = await authFetch('http://localhost:3000/api/upload/file', {
      method: 'POST',
      body: formData,
      headers: {}
    })
    if (response.ok) {
      const data = await response.json()
      if (threadSettingsForm.value) {
        threadSettingsForm.value.icon_url = data.url
      }
    }
  } catch (e) {
    console.error('Thread icon upload for edit failed', e)
  } finally {
    isThreadUpdating.value = false
  }
}

const isThreadSettingsOpen = ref(false)
const threadSettingsForm = ref<any>(null)
const handleOpenThreadSettings = (thread: any) => {
  threadSettingsForm.value = { ...thread }
  isThreadSettingsOpen.value = true
}

const handleUpdateThread = async () => {
  isThreadUpdating.value = true
  try {
    const response = await authFetch(`http://localhost:3000/api/threads/${threadSettingsForm.value.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ ...threadSettingsForm.value })
    })
    if (response.ok) {
      const updated = await response.json()
      currentThread.value = updated
      isThreadSettingsOpen.value = false
    }
  } catch (e) {
    console.error('Update failed', e)
  } finally {
    isThreadUpdating.value = false
  }
}

const handleDeleteThread = async () => {
  if (!confirm('スレッドを削除しますか？内容もすべて失われます。')) return
  try {
    const response = await authFetch(`http://localhost:3000/api/threads/${threadSettingsForm.value.id}`, {
      method: 'DELETE',
      body: JSON.stringify({})
    })
    if (response.ok) {
      location.reload()
    }
  } catch (e) {
    console.error('Delete failed', e)
  }
}

// 共通パーツ管理
const currentThread = ref({ id: 1, title: 'SYCS公式ハブ', icon_url: '/default-thread.svg', creator_id: 0 })
const handleSelectThread = (thread: any) => {
  currentThread.value = thread
}
const isSidebarOpen = ref(false)

// --- DM & Profile 管理 ---
const dmView = ref<'hub' | 'chat'>('hub')
const currentDMChannel = ref<number | null>(null)
const currentDMFriend = ref<any>(null)
const profileModalUserId = ref<number | null>(null)
const profilePopoverPosition = ref({ top: 0, left: 0 })
// DM開始
const handleOpenDM = async (friendId: number) => {
  try {
    // チャンネル取得/作成
    const response = await authFetch('http://localhost:3000/api/dm/channels', {
      method: 'POST',
      body: JSON.stringify({ friend_id: friendId })
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      if (response.status === 403) {
        alert('このユーザーとのDMは現在利用できません。ブロックが解除されているか確認してください。')
      } else {
        alert(`DMの作成に失敗しました: ${errorText}`)
      }
      return
    }
    
    const data = await response.json()
    
    // フレンド情報取得 (本来はストア等で管理すべきだが現状は毎時取得)
    const friendsRes = await authFetch(`http://localhost:3000/api/friends?user_id=${props.user.id}`)
    const friends = await friendsRes.json()
    const friend = friends.find((f: any) => f.id === friendId)
    
    if (friend) {
      currentDMChannel.value = data.channel_id
      currentDMFriend.value = friend
      dmView.value = 'chat'
      activeTab.value = 'dm'
    }
  } catch (error) {
    console.error('Failed to open DM:', error)
    alert('DMの作成中にエラーが発生しました。')
  }
}

// DM戻る
const handleBackToDMHub = () => {
  dmView.value = 'hub'
  activeTab.value = 'friends'
  currentDMChannel.value = null
  currentDMFriend.value = null
}

// プロフィール表示 (イベントから座標を受け取るように拡張)
const handleOpenProfile = (data: number | { userId: number, x: number, y: number }) => {
  if (typeof data === 'number') {
    profileModalUserId.value = data
    profilePopoverPosition.value = { top: 100, left: 100 } // デフォルト位置
  } else {
    profileModalUserId.value = data.userId
    profilePopoverPosition.value = { top: data.y, left: data.x }
  }
}

// プロフィール更新時の処理
const handleUserProfileUpdate = (data: any) => {
  if (data.appSettings) {
    appSettings.value = { ...appSettings.value, ...data.appSettings }
  }
  if (data.activeTabSecondary) {
    activeTabSecondary.value = data.activeTabSecondary
  }
  emit('update-user', { ...props.user, ...data })
}

// ブロック処理
const handleBlockUser = async (userId: number) => {
  if (!confirm('このユーザーをブロックしますか?')) return
  
  try {
    await authFetch('http://localhost:3000/api/users/block', {
      method: 'POST',
      body: JSON.stringify({ blocked_id: userId })
    })
    
    // DM画面から戻る
    handleBackToDMHub()
  } catch (error) {
    console.error('Failed to block user:', error)
  }
}
const touchStartX = ref(0)
const touchStartY = ref(0)
const isSwiping = ref(false)
const swipeX = ref(0) // 0 (閉) 〜 280 (開)
const dragStartX = ref(0)

const handleTouchStart = (e: TouchEvent) => {
  if (e.touches && e.touches[0]) {
    touchStartX.value = e.touches[0].clientX
    touchStartY.value = e.touches[0].clientY
    
    // スワイプ開始判定
    if (!isSidebarOpen.value) {
      isSwiping.value = true
      swipeX.value = 0
      dragStartX.value = touchStartX.value
    } else if (isSidebarOpen.value) {
      isSwiping.value = true
      swipeX.value = 280
      dragStartX.value = touchStartX.value
    }
  }
}

const handleTouchMove = (e: TouchEvent) => {
  if (!isSwiping.value || !e.touches[0]) return
  
  const currentX = e.touches[0].clientX
  const deltaX = currentX - dragStartX.value
  
  if (isSidebarOpen.value) {
    swipeX.value = Math.max(0, Math.min(280, 280 + deltaX))
  } else {
    swipeX.value = Math.max(0, Math.min(280, deltaX))
  }
}

const handleTouchEnd = () => {
  if (!isSwiping.value) return
  isSwiping.value = false
  
  if (swipeX.value > 140) {
    isSidebarOpen.value = true
    swipeX.value = 280
  } else {
    isSidebarOpen.value = false
    swipeX.value = 0
  }
}
</script>

<template>
  <div 
    class="main-layout" 
    @touchstart="handleTouchStart" 
    @touchmove="handleTouchMove"
    @touchend="handleTouchEnd"
  >
    <!-- モバイル用ハンバーガーボタンはスワイプ機能に置き換えるため削除 -->

    <!-- サイドバー -->
    <aside 
      :class="{ 'is-open': isSidebarOpen, 'is-swiping': isSwiping }"
      :style="(isSwiping || isSidebarOpen) ? { transform: `translateX(${swipeX - 280}px)` } : {}"
    >
      <div class="sidebar-header">
        <img src="../assets/Logo.svg" alt="SYCS Logo" class="logo">
      </div>

      <div class="sidebar-actions">
        <button class="compose-btn" @click="handleThreadCreateClick">
          <i class='bx bx-plus'></i>
          <span>スレッドを作成</span>
        </button>
      </div>
      
      <nav class="sidebar-nav">
        <!-- スレッドタブを復旧 -->
        <button :class="{ active: activeTab === 'threads' }" @click="activeTab = 'threads'; isSidebarOpen = false">
          <i class='bx bx-chat'></i>
          <span>スレッド</span>
        </button>
        <button :class="{ active: activeTab === 'dm' }" @click="activeTab = 'dm'; isSidebarOpen = false">
          <i class='bx bx-envelope'></i>
          <span>メッセージ</span>
        </button>
        <button :class="{ active: activeTab === 'friends' }" @click="activeTab === 'friends' || (activeTab = 'friends'); isSidebarOpen = false">
          <i class='bx bx-group'></i>
          <span>フレンド</span>
        </button>
        <button :class="{ active: activeTab === 'favorites' }" @click="activeTab = 'favorites'; isSidebarOpen = false">
          <i class='bx bx-star'></i>
          <span>お気に入り</span>
        </button>
      </nav>

      <div class="sidebar-footer">
        <!-- ユーザーメニュー ポップオーバー -->
        <Transition name="popover">
          <div v-if="isUserMenuOpen" class="user-menu-popover">
            <div class="menu-user-header">
                <img :src="user.avatar_url || '/defaultAvator.svg'" class="user-avatar-large" />
                <div class="user-details">
                    <span class="username">{{ user.username }}</span>
                    <span class="user-uuid">#{{ user.uuid }}</span>
                </div>
            </div>
            <div class="menu-divider"></div>
            <div class="status-selector" @click="toggleStatus">
                <i class='bx bx-bolt-circle' :style="{ color: statusList.find(s => s.id === userStatus)?.color }"></i>
                <span>ステータス: {{ statusList.find(s => s.id === userStatus)?.label }}</span>
            </div>
            <div class="menu-divider"></div>
            <button class="menu-item" @click="handleSettingsClick(); isUserMenuOpen = false">
              <i class='bx bx-cog'></i> ユーザー設定
            </button>
            <button class="menu-item danger" @click="emit('logout')">
              <i class='bx bx-log-out'></i> ログアウト
            </button>
          </div>
        </Transition>

        <div class="user-info" @click="isUserMenuOpen = !isUserMenuOpen">
          <div class="user-avatar-wrapper">
            <img :src="user.avatar_url || '/defaultAvator.svg'" class="user-avatar-mini" />
            <span class="status-badge" :style="{ backgroundColor: statusList.find(s => s.id === userStatus)?.color || '#ccc' }"></span>
          </div>
          <div class="user-text">
            <span class="username">{{ user.username }}</span>
            <span class="user-uuid">#{{ user.uuid }}</span>
          </div>
        </div>
      </div>
    </aside>

    <!-- メインコンテンツ -->
    <main 
      class="content-area"
      :class="{ 
        'is-swiping': isSwiping, 
        'split-mode': appSettings.splitView,
        'glass-ui': appSettings.glassUi 
      }"
      :style="(isSwiping || isSidebarOpen) ? { transform: `translateX(${swipeX}px)` } : {}"
    >
      <div class="content-pane primary">
        <div v-if="activeTab === 'threads'" class="thread-view-container">
          <ThreadNavigation 
            :current-thread="currentThread" 
            :current-user-id="user.id"
            @select-thread="handleSelectThread"
            @create-thread="handleThreadCreateClick"
            @edit-thread="handleOpenThreadSettings(currentThread)"
          />
          <div class="message-area-wrapper">
            <MessageList 
              :thread-id="currentThread.id" 
              :current-user="user" 
              :current-thread="currentThread"
              @show-profile="handleOpenProfile"
            />
          </div>
        </div>
        <div v-else-if="activeTab === 'dm'" class="dm-view-container">
          <DMChat 
            v-if="currentDMChannel && currentDMFriend"
            :channel-id="currentDMChannel"
            :current-user="user"
            :friend-info="currentDMFriend"
            @back="handleBackToDMHub"
            @block-user="handleBlockUser"
          />
          <div v-else class="empty-view">
            <div class="empty-state">
                <i class='bx bx-envelope empty-icon'></i>
                <h2>メッセージ</h2>
                <p>フレンドを選択してメッセージを開始してください。</p>
            </div>
          </div>
        </div>
        <div v-else-if="activeTab === 'friends'" class="friends-view-container">
          <FriendHub 
            :current-user="user"
            @open-dm="handleOpenDM"
            @open-profile="handleOpenProfile"
          />
        </div>
      </div>

      <!-- 分割ビュー時の二次ペイン -->
      <div v-if="appSettings.splitView" class="content-pane secondary">
        <div v-if="activeTabSecondary === 'dm'" class="dm-view-container">
          <DMChat 
            v-if="currentDMChannel && currentDMFriend"
            :channel-id="currentDMChannel"
            :current-user="user"
            :friend-info="currentDMFriend"
            @back="handleBackToDMHub"
            @block-user="handleBlockUser"
          />
          <div v-else class="empty-view">
             <div class="empty-state">
                <h2>メッセージ</h2>
                <p>フレンドを選択...</p>
             </div>
          </div>
        </div>
        <div v-else-if="activeTabSecondary === 'friends'" class="friends-view-container">
          <FriendHub :current-user="user" @open-dm="handleOpenDM" @open-profile="handleOpenProfile" />
        </div>
      </div>
    </main>

    <!-- ユーザープロフィールポップアップ -->
    <UserProfilePopover 
      v-if="profileModalUserId !== null"
      :user-id="profileModalUserId"
      :current-user-id="user.id"
      :position="profilePopoverPosition"
      @close="profileModalUserId = null"
      @friend-request-sent="profileModalUserId = null"
      @blocked="profileModalUserId = null"
      @message="handleOpenDM"
    />

    <!-- スレッド作成モーダル (2ステップ / 中央配置) -->
    <Transition name="modal">
      <div v-if="isThreadCreateOpen" class="modal-overlay" @click.self="isThreadCreateOpen = false">
        <div class="thread-modal main-modal">
          <div class="modal-header">
            <h3>{{ threadCreateStep === 1 ? 'スレッドの作成' : '高度な設定' }}</h3>
            <span class="step-indicator">Step {{ threadCreateStep }} / 2</span>
          </div>

          <div class="modal-body">
            <!-- Step 1: 基本情報 -->
            <div v-if="threadCreateStep === 1" class="step-content">
              <div class="input-group">
                <label>スレッド名</label>
                <input v-model="threadForm.title" type="text" placeholder="スレッドの名前を入力..." />
              </div>
              
              <div class="icon-section">
                <!-- <label>スレッドアイコン</label> -->
                <div 
                  class="thread-icon-dropzone"
                  :class="{ active: isDragging }"
                  @dragover.prevent="isDragging = true"
                  @dragleave="isDragging = false"
                  @drop.prevent="(e) => { isDragging = false; const file = e.dataTransfer?.files[0]; if(file) handleThreadIconUpload(file) }"
                >
                  <img :src="threadForm.icon_url || '/defaultIcon.svg'" class="icon-preview-large" />
                  <div class="drop-hint">
                    <i class='bx bx-cloud-upload'></i>
                    <span>画像をドロップして変更</span>
                  </div>
                  <div v-if="isThreadUpdating" class="modal-spin-overlay">
                    <span class="spinner"></span>
                  </div>
                </div>
                <!-- <div class="icon-presets-mini">
                  <button v-for="i in 4" :key="i" @click="threadForm.icon_url = `/default-thread-${i}.svg`" class="preset-btn-mini">
                    <img :src="`/default-thread-${i}.svg`" />
                  </button>
                </div> -->
              </div>
            </div>

            <!-- Step 2: 高度な設定 -->
            <div v-else class="step-content">
              <div class="setting-row-modern">
                <div class="setting-info">
                    <div>
                        <div class="setting-icon"><i class='bx bx-globe'></i></div>
                        <span class="label">公開設定</span>
                    </div>
                    <span class="desc">誰がこのスレッドを見られるか</span>
                </div>
                <select v-model="threadForm.visibility" class="modern-select">
                  <option value="public">公開</option>
                  <option value="private">非公開</option>
                  <option value="invite">招待制</option>
                </select>
              </div>
              <div class="setting-row-modern">
                  <div class="setting-info">
                    <div>
                        <div class="setting-icon"><i class='bx bx-shield-quarter'></i></div>
                        <span class="label">スパム対策</span>
                    </div>
                  <span class="desc">怪しい投稿を自動的に制限します</span>
                </div>
                <label class="toggle-switch">
                  <input type="checkbox" v-model="threadForm.spam_check" />
                  <span class="slider"></span>
                </label>
              </div>
              <div class="setting-row-modern">
                  <div class="setting-info">
                    <div>
                        <div class="setting-icon"><i class='bx bx-paperclip'></i></div>
                        <span class="label">添付ファイルの許可</span>
                    </div>
                    <span class="desc">画像や動画の投稿を許可します</span>
                </div>
                <label class="toggle-switch">
                  <input type="checkbox" v-model="threadForm.allow_attachments" />
                  <span class="slider"></span>
                </label>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button v-if="threadCreateStep === 2" class="back-btn" @click="threadCreateStep = 1">戻る</button>
            <button class="cancel-btn-modern" @click="isThreadCreateOpen = false">キャンセル</button>
            <button 
              class="next-btn-modern" 
              :disabled="!threadForm.title || isThreadUpdating"
              @click="threadCreateStep === 1 ? threadCreateStep = 2 : handleCreateThread()"
            >
              {{ isThreadUpdating ? '処理中...' : (threadCreateStep === 1 ? '次へ' : 'スレッドを作成') }}
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- スレッド編集モーダル (中央配置) -->
    <Transition name="modal">
      <div v-if="isThreadSettingsOpen" class="modal-overlay" @click.self="isThreadSettingsOpen = false">
        <div class="thread-modal settings main-modal">
          <div class="modal-header">
            <h3>スレッド設定</h3>
            <button class="danger-btn-pill" @click="handleDeleteThread">
              <i class='bx bx-trash'></i> 削除
            </button>
          </div>
          <div class="modal-body" v-if="threadSettingsForm">
            <div class="input-group">
              <label>スレッド名</label>
              <input v-model="threadSettingsForm.title" type="text" />
            </div>
            
            <div class="icon-section">
              <label>アイコン変更</label>
              <div 
                class="thread-icon-dropzone"
                @dragover.prevent="isDragging = true"
                @dragleave="isDragging = false"
                @drop.prevent="(e) => { isDragging = false; const file = e.dataTransfer?.files[0]; if(file) handleThreadIconUploadForEdit(file) }"
              >
                 <img :src="threadSettingsForm.icon_url || '../assets/defaultIcon.svg'" class="icon-preview-large" />
                 <div class="drop-hint">
                    <i class='bx bx-refresh'></i>
                    <span>D&D で変更</span>
                 </div>
              </div>
            </div>

            <div class="setting-row-modern">
              <div class="setting-info">
                <span class="label">公開設定</span>
              </div>
              <select v-model="threadSettingsForm.visibility" class="modern-select">
                <option value="public">公開</option>
                <option value="private">非公開</option>
                <option value="invite">招待制</option>
              </select>
            </div>
            <div class="setting-row-modern">
               <div class="setting-info">
                 <span class="label">メッセージの削除を全員に許可</span>
               </div>
               <label class="toggle-switch">
                  <input type="checkbox" v-model="threadSettingsForm.allow_msg_delete" />
                  <span class="slider"></span>
               </label>
            </div>
          </div>
          <div class="modal-footer">
            <button class="cancel-btn-modern" @click="isThreadSettingsOpen = false">閉じる</button>
            <button class="save-btn-modern" :disabled="isThreadUpdating" @click="handleUpdateThread">
              {{ isThreadUpdating ? '保存中...' : '変更を保存' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- ユーザー設定オーバーレイ -->
    <SettingsOverlay 
      v-if="isSettingsOpen"
      :user="user"
      @close="isSettingsOpen = false"
      @logout="emit('logout')"
      @update-profile="handleUserProfileUpdate"
    />

    <!-- モバイル用オーバーレイ -->
    <div 
      class="sidebar-overlay" 
      :class="{ 'is-open': isSidebarOpen || isSwiping, 'is-swiping': isSwiping }"
      :style="isSwiping ? { display: 'block', opacity: swipeX / 280 } : {}"
      @click="isSidebarOpen = false"
    ></div>
  </div>
</template>

<style scoped>
.main-layout {
  display: flex;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  background-color: #1a1a1a;
  color: #111;
}

/* アイコン用クラス */
.icon-bx {
  font-size: 1.25rem;
  margin-right: 12px;
}

/* 全体レイアウト */
.main-layout {
    display: flex;
    width: 100vw;
    height: 100vh;
    background-color: var(--sys-background);
}

/* サイドバー (Google Apps 風) */
aside {
  width: 280px;
  background-color: var(--sys-surface);
  display: flex;
  flex-direction: column;
  transition: transform 0.3s ease;
  z-index: 100;
  border-right: 1px solid var(--sys-outline);
}

.sidebar-header {
  padding: 24px;
  display: flex;
  align-items: center;
}

.sidebar-header .logo {
    height: 35px;
}

.sidebar-actions {
    padding: 8px 16px 16px 16px;
}

.compose-btn {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 0 24px;
    height: 56px;
    background-color: var(--sys-surface);
    border: 1px solid var(--sys-outline);
    border-radius: 16px;
    color: var(--sys-primary);
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: box-shadow 0.2s, background-color 0.2s;
    box-shadow: 0 1px 2px rgba(60,64,67,0.3), 0 1px 3px 1px rgba(60,64,67,0.15);
}

.compose-btn:hover {
    box-shadow: 0 1px 3px rgba(60,64,67,0.3), 0 4px 8px 3px rgba(60,64,67,0.15);
    background-color: var(--sys-surface-variant);
}

.compose-btn i {
    font-size: 1.5rem;
}

.sidebar-nav {
  flex: 1;
  padding: 8px 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.sidebar-nav button {
  display: flex;
  align-items: center;
  padding: 0 24px;
  height: 48px;
  border: none;
  background: none;
  border-radius: 24px; /* Pill shape */
  text-align: left;
  cursor: pointer;
  transition: background 0.2s;
  font-size: 0.875rem;
  color: var(--sys-on-surface);
  font-weight: 500;
}

.sidebar-nav button:hover {
  background-color: var(--sys-surface-variant);
}

.sidebar-nav button.active {
  background-color: var(--sys-primary-container);
  color: var(--sys-on-primary-container);
}

.nav-badge {
    background: var(--sys-error);
    color: white;
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 0.75rem;
    margin-left: auto;
}

.sidebar-footer {
  padding: 16px;
  border-top: 1px solid var(--sys-outline);
}

/* User Info (Google Account 風) Decoration */
.user-avatar-wrapper {
  position: relative;
}


.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  border-radius: 12px;
  cursor: pointer;
  transition: background 0.2s;
}

.user-info:hover {
  background: var(--sys-surface-variant);
}

.user-avatar-mini {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
}

.user-text {
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.username {
    font-size: 0.875rem;
    font-weight: 600;
}

.user-uuid {
    font-size: 0.75rem;
    color: var(--sys-on-surface-variant);
}

/* ポップオーバー */
.user-menu-popover {
  position: absolute;
  bottom: 80px;
  left: 16px;
  width: 240px;
  background: var(--sys-surface);
  border: 1px solid var(--sys-outline);
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  padding: 8px;
  z-index: 1000;
}

.menu-user-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 16px;
    gap: 12px;
}

.user-avatar-large {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    object-fit: cover;
}

.user-details {
    text-align: center;
}

.status-selector {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 12px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 0.875rem;
}

.status-selector:hover {
    background: var(--sys-surface-variant);
}

.menu-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  background: none;
  border: none;
  border-radius: 8px;
  color: var(--sys-on-surface);
  font-size: 0.875rem;
  cursor: pointer;
}

.menu-item:hover {
  background: var(--sys-surface-variant);
}

.menu-item.danger {
    color: var(--sys-error);
}

.menu-divider {
    height: 1px;
    background: var(--sys-outline);
    margin: 4px 0;
}

/* メインコンテンツエリア */
.content-area {
  flex: 1;
  background-color: var(--sys-surface);
  display: flex;
  overflow: hidden;
}

.content-pane {
  flex: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.content-pane.primary {
  min-width: 320px;
}

.content-pane.secondary {
  border-left: 1px solid var(--sys-outline);
  background: linear-gradient(135deg, var(--sys-surface-container-low), var(--sys-surface));
  max-width: 450px;
  box-shadow: -4px 0 20px rgba(0,0,0,0.15);
  animation: slideLeft 0.3s ease-out;
}

@keyframes slideLeft {
  from { transform: translateX(20px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

/* Glass UI Theme Extension */
.content-area.glass-ui {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
}

.content-area.glass-ui .content-pane {
  background: transparent;
}

/* モーダル (Material Design 3) */
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.32);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.main-modal {
  background: var(--sys-surface);
  color: var(--sys-on-surface);
  width: 560px;
  max-width: 90vw;
  border-radius: 28px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.08);
  padding: 24px;
}

.modal-header h3 {
    font-size: 1.5rem;
    margin: 0 0 16px 0;
    font-weight: 400;
}

.input-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 24px;
}

.input-group label {
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--sys-on-surface-variant);
}

.input-group input {
    padding: 12px 16px;
    border: 1px solid var(--sys-outline);
    border-radius: 8px;
    font-size: 1rem;
    outline-color: var(--sys-primary);
}

.modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    margin-top: 32px;
}

.next-btn-modern, .save-btn-modern {
  background: var(--sys-primary);
  color: white;
  padding: 10px 24px;
  border-radius: 20px;
  font-weight: 500;
  border: none;
}

.cancel-btn-modern {
  background: none;
  color: var(--sys-primary);
  padding: 10px 16px;
  border-radius: 20px;
  font-weight: 500;
  border: none;
}

.cancel-btn-modern:hover {
    background: var(--sys-surface-variant);
}

/* ステータスバッジ */
.status-badge {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    border: 2px solid var(--sys-surface);
    position: absolute;
    bottom: 0;
    right: 0;
}

.user-avatar-wrapper {
    position: relative;
    display: flex;
}
.sidebar-overlay {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  z-index: 90;
}

@media (max-width: 768px) {
  aside {
    position: fixed;
    height: 100vh;
    left: 0;
    top: 0;
    transform: translateX(-100%);
    box-shadow: 4px 0 12px rgba(0,0,0,0.15);
  }

  aside.is-swiping {
    transition: none !important;
  }

  aside.is-open {
    transform: translateX(0);
  }

  .content-area {
    transition: transform 0.3s ease;
  }

  .content-area.is-swiping {
    transition: none !important;
  }

  .sidebar-overlay {
    display: none;
    pointer-events: none;
    transition: opacity 0.3s ease;
  }

  .sidebar-overlay.is-open {
    display: block;
    pointer-events: auto;
  }
  
  .sidebar-overlay.is-swiping {
    display: block;
    pointer-events: auto;
    transition: none !important;
  }
}
</style>
