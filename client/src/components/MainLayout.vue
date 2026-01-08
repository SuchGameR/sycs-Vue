<script setup lang="ts">
import { ref } from 'vue'
import ThreadNavigation from './ThreadNavigation.vue'
import MessageList from './MessageList.vue'

const props = defineProps<{
  user: { id: number, uuid: string, username: string, avatar_url?: string }
}>()

const emit = defineEmits(['logout', 'update-user'])

// --- 設定・ステート管理 ---
const isSettingsOpen = ref(false)
const isUpdating = ref(false)
const isDragging = ref(false)
const settingsForm = ref({
  username: props.user.username,
  avatarUrl: props.user.avatar_url || '/default-avatar.svg'
})
const fileInputRef = ref<HTMLInputElement | null>(null)

// 設定を開く
const handleSettingsClick = () => {
  settingsForm.value.username = props.user.username
  settingsForm.value.avatarUrl = props.user.avatar_url || '/default-avatar.svg'
  isSettingsOpen.value = true
}

// ファイルアップロード処理 (アバター)
const handleFileUpload = async (file: File) => {
  if (!file.type.startsWith('image/')) return
  isUpdating.value = true
  const formData = new FormData()
  formData.append('avatar', file)

  try {
    const response = await fetch('http://localhost:3000/api/upload/avatar', {
      method: 'POST',
      body: formData
    })
    if (response.ok) {
      const data = await response.json()
      settingsForm.value.avatarUrl = data.url
    }
  } catch (e) {
    console.error('Upload failed', e)
  } finally {
    isUpdating.value = false
  }
}

const onDrop = (e: DragEvent) => {
  isDragging.value = false
  const file = e.dataTransfer?.files[0]
  if (file) handleFileUpload(file)
}

const onFileSelect = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) handleFileUpload(file)
}

// プロフィール保存
const handleSaveSettings = async () => {
  isUpdating.value = true
  try {
    const response = await fetch(`http://localhost:3000/api/users/${props.user.id}/profile`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: settingsForm.value.username,
        avatar_url: settingsForm.value.avatarUrl
      })
    })

    if (response.ok) {
      const updatedUser = await response.json()
      emit('update-user', updatedUser)
      isSettingsOpen.value = false
    }
  } catch (e) {
    console.error('Update failed', e)
  } finally {
    isUpdating.value = false
  }
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
  const nextIndex = (currentIndex + 1) % statusList.length
  userStatus.value = statusList[nextIndex].id
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
    const response = await fetch('http://localhost:3000/api/threads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...threadForm.value, creator_id: props.user.id })
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
    const response = await fetch('http://localhost:3000/api/upload/file', {
      method: 'POST',
      body: formData
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
    const response = await fetch('http://localhost:3000/api/upload/file', {
      method: 'POST',
      body: formData
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
    const response = await fetch(`http://localhost:3000/api/threads/${threadSettingsForm.value.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...threadSettingsForm.value, user_id: props.user.id })
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
    const response = await fetch(`http://localhost:3000/api/threads/${threadSettingsForm.value.id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: props.user.id })
    })
    if (response.ok) {
      location.reload()
    }
  } catch (e) {
    console.error('Delete failed', e)
  }
}

// 共通パーツ管理
const activeTab = ref('threads')
const currentThread = ref({ id: 1, title: 'SYCS公式ハブ', icon_url: '/default-thread.svg', creator_id: 0 })
const handleSelectThread = (thread: any) => {
  currentThread.value = thread
}
const isSidebarOpen = ref(false)
const toggleSidebar = () => { isSidebarOpen.value = !isSidebarOpen.value }
</script>

<template>
  <div class="main-layout">
    <!-- モバイル用ハンバーガーボタン -->
    <!-- <button class="menu-button" @click="toggleSidebar" aria-label="メニュー">
      <span></span><span></span><span></span>
    </button> -->

    <!-- サイドバー -->
    <aside :class="{ 'is-open': isSidebarOpen }">
      <div class="sidebar-header">
        <img src="../assets/Logo.svg" alt="SYCS Logo" class="logo">
      </div>
      
      <nav class="sidebar-nav">
        <button :class="{ active: activeTab === 'threads' }" @click="activeTab = 'threads'; isSidebarOpen = false">
          <i class='bx bx-chat icon-bx'></i> スレッド
        </button>
        <button :class="{ active: activeTab === 'dm' }" @click="activeTab = 'dm'; isSidebarOpen = false">
          <i class='bx bx-envelope icon-bx'></i> DM
        </button>
        <button :class="{ active: activeTab === 'favorites' }" @click="activeTab = 'favorites'; isSidebarOpen = false">
          <i class='bx bx-star icon-bx'></i> お気に入り
        </button>
      </nav>

      <div class="sidebar-footer">
        <!-- ユーザーメニュー ポップオーバー -->
        <Transition name="popover">
          <div v-if="isUserMenuOpen" class="user-menu-popover">
            <div class="menu-section">
                <div class="status-toggle" @click="toggleStatus">
                    <span class="status-dot" :style="{ backgroundColor: statusList.find(s => s.id === userStatus)?.color || '#ccc' }"></span>
                    <!-- <span class="status-hint">変更</span> -->
                    <span class="status-label">{{ statusList.find(s => s.id === userStatus)?.label }}</span>
                </div>
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
    <main class="content-area">
      <div v-if="activeTab === 'threads'" class="thread-view-container">
        <ThreadNavigation 
          :current-thread="currentThread" 
          :current-user-id="user.id"
          @select-thread="handleSelectThread"
          @create-thread="handleThreadCreateClick"
          @edit-thread="handleOpenThreadSettings(currentThread)"
        />
        <div class="message-area-wrapper">
          <MessageList :thread-id="currentThread.id" :current-user="user" :current-thread="currentThread" />
        </div>
      </div>
      <div v-else class="empty-view">
        <div class="empty-state">
           <i :class="activeTab === 'dm' ? 'bx bx-envelope' : 'bx bx-star'" class="empty-icon"></i>
           <h2>{{ activeTab === 'dm' ? 'ダイレクトメッセージ' : 'お気に入り' }}</h2>
           <p>近日公開予定の機能です。</p>
        </div>
      </div>
    </main>

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

    <!-- プロフィール設定モーダル -->
    <div v-if="isSettingsOpen" class="modal-overlay" @click.self="isSettingsOpen = false">
      <div class="settings-modal main-modal">
        <div class="modal-header">
          <h3>ユーザー設定</h3>
          <button class="close-btn" @click="isSettingsOpen = false"><i class='bx bx-x'></i></button>
        </div>

        <div class="modal-body">
          <div 
            class="avatar-edit-zone-modern"
            :class="{ active: isDragging }"
            @dragover.prevent="isDragging = true"
            @dragleave="isDragging = false"
            @drop.prevent="onDrop"
            @click="fileInputRef?.click()"
          >
            <div class="avatar-preview-container">
              <img :src="settingsForm.avatarUrl || '/defaultAvator.svg'" class="avatar-large-preview" />
              <div v-if="isUpdating" class="upload-spin-overlay">
                <span class="spinner"></span>
              </div>
            </div>
            <div class="edit-hint">
              <strong>アバターを変更</strong>
              <span>D&D またはクリック</span>
            </div>
            <input ref="fileInputRef" type="file" style="display: none" accept="image/*" @change="onFileSelect" />
          </div>

          <div class="settings-input-group">
            <label>表示名</label>
            <input v-model="settingsForm.username" type="text" />
          </div>
        </div>

        <div class="modal-footer">
          <button class="cancel-btn-modern" @click="isSettingsOpen = false">キャンセル</button>
          <button class="save-btn-modern" :disabled="isUpdating" @click="handleSaveSettings">
            {{ isUpdating ? '保存中...' : '変更を保存' }}
          </button>
        </div>
      </div>
    </div>

    <!-- モバイル用オーバーレイ -->
    <div v-if="isSidebarOpen" class="sidebar-overlay" @click="isSidebarOpen = false"></div>
  </div>
</template>

<style scoped>
.main-layout {
  display: flex;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  background-color: #1a1a1a;
  color: #eee;
}

/* アイコン用クラス */
.icon-bx {
  font-size: 1.4rem;
  margin-right: 12px;
}

/* サイドバー */
aside {
  width: 260px;
  background-color: #1a1a1a;
  display: flex;
  flex-direction: column;
  transition: transform 0.3s ease;
  z-index: 100;
}

.sidebar-header {
  padding: 30px 20px;
  text-align: center;
}

.sidebar-header .logo {
    height: 32px;
    filter: drop-shadow(0 0 8px rgba(100, 108, 255, 0.4));
}

.sidebar-nav {
  flex: 1;
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.sidebar-nav button {
  display: flex;
  align-items: center;
  padding: 14px 18px;
  border: none;
  background: none;
  border-radius: 16px;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  font-size: 0.95rem;
  color: #aaa;
  font-weight: 500;
}

.sidebar-nav button:hover {
  background-color: rgba(255,255,255,0.05);
  color: #fff;
  transform: translateX(4px);
}

.sidebar-nav button.active {
  background: linear-gradient(135deg, #646cff 0%, #535bf2 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(83, 91, 242, 0.3);
}

.sidebar-footer {
  padding: 20px;
  position: relative;
}

/* ユーザー情報 (Apple風) */
.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: rgba(255,255,255,0.03);
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid rgba(255,255,255,0.05);
}

.user-info:hover {
  background: rgba(255,255,255,0.08);
  border-color: rgba(255,255,255,0.1);
}

.user-avatar-mini {
  width: 40px;
  height: 40px;
  border-radius: 14px;
  object-fit: cover;
  background: #333;
}

/* ポップオーバー */
.user-menu-popover {
  position: absolute;
  bottom: 85px;
  left: 20px;
  width: 230px;
  background: rgba(28, 28, 30, 0.95);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 22px;
  box-shadow: 0 20px 50px rgba(0,0,0,0.5);
  padding: 10px;
  z-index: 1000;
}

.menu-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 15px;
  background: none;
  border: none;
  border-radius: 12px;
  color: #eee;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
}

.menu-item i {
  font-size: 1.2rem;
}

.menu-item:hover {
  background: rgba(255,255,255,0.08);
}

.menu-section {
    margin: 6px;
    padding: 6px;
    background-color: #333;
    border-radius: 50px;
    text-align: center;
    cursor: pointer;
    user-select: none;
}

/* その他 UI 要素 (共通) */
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
  z-index: 1000;
  padding: 10px 20px;
}

.modal-header h3 {
    line-height: 2rem;
    font-size: 1.5rem;
    text-align: center;
    padding: 0;
    margin: 10px;
}

.modal-footer {
    display: flex;
    justify-content: space-between;
    margin-top: 20px;
    width: calc(100% - 20px);
    margin: 0 auto;
}

.modal-header span {
    text-align: center;
    width: fit-content;
    padding: 5px 10px;
    background-color: #ddd;
    border-radius: 20px;
    margin: 0 auto;
    display: flex;
}

.setting-info {
    display: block;
    flex-direction: column;
    gap: 12px;
    line-height: 25px;
}

.setting-info div i {
    font-size: 1.2rem;
    line-height: 25px;
}

.setting-info div span.label {
    line-height: 25px;
}

.step-content {
    margin: 20px;
}

.step-content div {
    display: flex;
    gap: 10px;
}

.step-content div span.label {
    font-weight: bold;
}

.step-content .desc {
    color: #797979;
    font-size: 0.9rem;
    margin-left: 30px;
    margin-bottom: 20px;
}

label.toggle-switch {
    margin: 0 auto;
    margin-right: 20px;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 20px;
}

select.modern-select {
    margin: 0 auto;
    margin-top: 20px;
    margin-right: 20px;
    padding: 5px 10px;
    border-radius: 20px;
    width: fit-content;
    height: fit-content;
    border: none;
    cursor: pointer;
    background-color: #ddd;
    color: #1a1a1a;
    font-weight: bold;
    font-size: 1rem;
}

.main-modal {
  background: #fff;
  color: #1a1a1a;
  width: 500px;
  max-width: 90vw;
  border-radius: 32px;
  box-shadow: 0 40px 100px rgba(0,0,0,0.4);
  animation: springUp 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  overflow: hidden;
  padding: 20px 10px;
}

@keyframes springUp {
  from { opacity: 0; transform: translateY(40px) scale(0.9); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

/* ...残りのスタイルもモダンに調整... */

.content-area {
  flex: 1;
  margin: 8px;
  background-color: #f2f2f7; /* Apple Grey */
  border-radius: 24px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: inset 0 0 2px rgba(255,255,255,0.1);
}

.empty-view {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  background: white;
}

.empty-state {
  text-align: center;
  opacity: 0.3;
}

.empty-icon {
  font-size: 5rem;
  margin-bottom: 20px;
}

/* スイッチ/トグル */
.toggle-switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 28px;
}

.toggle-switch input { opacity: 0; width: 0; height: 0; }
.slider {
  position: absolute;
  cursor: pointer;
  top: 0; left: 0; right: 0; bottom: 0;
  background-color: #e9e9eb;
  transition: .3s;
  border-radius: 34px;
}

.avatar-large-preview {
    width: 100px;
    height: 100px;
}

.input-group {
    margin: 20px 0;
    padding: 10px 15px;
    background-color: #eee;
    border-radius: 30px;
    display: flex;
    align-items: center;
    white-space: nowrap;
    gap: 10px;
}

.input-group input {
    width: 100%;
    padding: 10px;
    border: none;
    border-radius: 16px;
    font-size: 1rem;
    color: #1a1a1a;
    background-color: #fff;
}

.slider:before {
  position: absolute;
  content: "";
  height: 22px; width: 22px;
  left: 3px; bottom: 3px;
  background-color: white;
  transition: .3s;
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

input:checked + .slider { background-color: #34c759; }
input:checked + .slider:before { transform: translateX(22px); }

/* モーダル用ボタン */
.next-btn-modern, .save-btn-modern {
  background: #007aff;
  color: white;
  padding: 12px 28px;
  border-radius: 14px;
  font-weight: 600;
  border: none;
  cursor: pointer;
}

/* モーダル用キャンセルボタン */
.cancel-btn-modern {
  background: #eee;
  color: #1a1a1a;
  padding: 12px 28px;
  border-radius: 14px;
  font-weight: 600;
  border: none;
  cursor: pointer;
}

/* スレッドアイコン D&D エリア */
.thread-icon-dropzone {
  position: relative;
  width: calc(100% - 44px);
  padding: 20px;
  background: #f8f8f8;
  border: 2px dashed #ddd;
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  margin: 10px 0;
  transition: all 0.2s;
}

.thread-icon-dropzone.active {
  border-color: #007aff;
  background: #f0f7ff;
}

.icon-preview-large {
  width: 100px;
  height: 100px;
  border-radius: 24px;
  background: #fff;
  box-shadow: 0 8px 24px rgba(0,0,0,0.1);
}
</style>
