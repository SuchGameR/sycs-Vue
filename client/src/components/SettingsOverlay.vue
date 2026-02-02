<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { authFetch } from '../utils/api'
import UserProfilePopover from './UserProfilePopover.vue'

const props = defineProps<{
  user: { 
    id: number, 
    uuid: string, 
    username: string, 
    avatar_url?: string, 
    theme?: string, 
    decoration?: string, 
    status_message?: string,
    tagline?: string,
    bio?: string,
    location?: string,
    hobbies?: string,
    activity_url?: string,
    banner_url?: string,
    deco_front_url?: string,
    deco_back_url?: string,
    language?: string,
    timezone?: string
  }
}>()

const emit = defineEmits(['close', 'logout', 'update-profile'])

const activeSection = ref('account')
const isUpdating = ref(false)

// フォームステート
const profileForm = ref({
  username: props.user.username,
  avatarUrl: props.user.avatar_url || '/default-avatar.svg',
  statusMessage: props.user.status_message || '',
  tagline: props.user.tagline || 'ウルトラスーパー色とりどりな鳥',
  bio: props.user.bio || '',
  location: props.user.location || '',
  hobbies: props.user.hobbies || '',
  activityUrl: props.user.activity_url || '',
  bannerUrl: props.user.banner_url || '',
  decoFrontUrl: props.user.deco_front_url || '',
  decoBackUrl: props.user.deco_back_url || '',
  theme: props.user.theme || 'dark',
  decoration: props.user.decoration || 'none',
  activeTabSecondary: 'dm',
  language: props.user.language || 'ja',
  timezone: props.user.timezone || 'local'
})

const securityForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const badgePresetList = [
  { id: 'code', icon: 'bx-code-alt', label: 'CODE' },
  { id: 'award', icon: 'bx-award', label: 'AWARD' },
  { id: 'bolt', icon: 'bx-bolt-circle', label: 'BOLT' },
  { id: 'leaf', icon: 'bxs-leaf', label: 'LEAF' }
]

const extensionList = ref([
  { id: 'markdown', name: 'Markdown Plus', desc: '数式や図表を強化する拡張機能です。', icon: 'bxl-javascript', enabled: true },
  { id: 'glass', name: 'Glass UI Theme', desc: 'アプリ全体をガラスのような質感にします。', icon: 'bx-brush', enabled: false }
])

const appSettings = ref({
  splitView: false,
  glassUi: false,
  notificationDesktop: true,
  notificationSound: true
})

const notificationSettings = ref({
  desktop: true,
  sound: true,
  email: false,
  mentionsOnly: false
})

const sections = [
  { id: 'account', label: 'アカウント情報', icon: 'bx-user' },
  { id: 'security', label: 'セキュリティ', icon: 'bx-shield-quarter' },
  { id: 'theme', label: 'テーマ', icon: 'bx-palette' },
  { id: 'customization', label: 'カスタマイズ', icon: 'bx-customize' },
  { id: 'extensions', label: '拡張機能', icon: 'bx-extension' },
  { id: 'language', label: '言語設定', icon: 'bx-globe' },
  { id: 'utility', label: 'ユーティリティ', icon: 'bx-wrench' },
  { id: 'connections', label: 'コネクション', icon: 'bx-link' },
  { id: 'notifications', label: '通知', icon: 'bx-bell' },
]

const handleSaveAccount = async () => {
  isUpdating.value = true
  try {
    const response = await authFetch(`http://localhost:3000/api/users/${props.user.id}/profile`, {
      method: 'PATCH',
      body: JSON.stringify({
        username: profileForm.value.username,
        avatar_url: profileForm.value.avatarUrl,
        status_message: profileForm.value.statusMessage,
        tagline: profileForm.value.tagline,
        bio: profileForm.value.bio,
        location: profileForm.value.location,
        hobbies: profileForm.value.hobbies,
        activity_url: profileForm.value.activityUrl,
        banner_url: profileForm.value.bannerUrl,
        deco_front_url: profileForm.value.decoFrontUrl,
        deco_back_url: profileForm.value.decoBackUrl,
        theme: profileForm.value.theme,
        decoration: profileForm.value.decoration,
        language: profileForm.value.language,
        timezone: profileForm.value.timezone
      })
    })

    if (response.ok) {
      const updatedUser = await response.json()
      emit('update-profile', { ...updatedUser, appSettings: appSettings.value, activeTabSecondary: profileForm.value.activeTabSecondary })
    }
  } catch (e) {
    console.error('Update failed', e)
  } finally {
    isUpdating.value = false
  }
}

const handleEditField = (data: { field: string, value: string }) => {
  if (data.field === 'username') profileForm.value.username = data.value
  else if (data.field === 'status_message') profileForm.value.statusMessage = data.value
  else if (data.field === 'tagline') profileForm.value.tagline = data.value
  else if (data.field === 'bio') profileForm.value.bio = data.value
  else if (data.field === 'decoration') profileForm.value.decoration = data.value
  
  handleSaveAccount()
}

const handleBannerUpload = async (file: File) => {
  if (!file || isUpdating.value) return
  isUpdating.value = true
  const formData = new FormData()
  formData.append('banner', file)

  try {
    const response = await authFetch('http://localhost:3000/api/upload/banner', {
      method: 'POST',
      body: formData
    })
    if (response.ok) {
      const data = await response.json()
      profileForm.value.bannerUrl = data.url
      await handleSaveAccount()
    }
  } catch (e) {
    console.error('Banner upload failed', e)
  } finally {
    isUpdating.value = false
  }
}

const handleDeleteAvatar = () => {
  profileForm.value.avatarUrl = '/defaultAvator.svg'
  handleSaveAccount()
}

const handleSaveSecurity = async () => {
  if (securityForm.value.newPassword !== securityForm.value.confirmPassword) {
    alert('新しいパスワードが一致しません')
    return
  }
  isUpdating.value = true
  try {
    const response = await authFetch(`http://localhost:3000/api/users/${props.user.id}/password`, {
      method: 'POST',
      body: JSON.stringify({
        current_password: securityForm.value.currentPassword,
        new_password: securityForm.value.newPassword
      })
    })
    if (response.ok) {
      alert('パスワードを変更しました')
      securityForm.value = { currentPassword: '', newPassword: '', confirmPassword: '' }
    } else {
      const err = await response.json()
      alert(`エラー: ${err.message}`)
    }
  } catch (e) {
    console.error('Security update failed', e)
  } finally {
    isUpdating.value = false
  }
}

// テーマ適用ロジック
const applyTheme = (theme: string) => {
  profileForm.value.theme = theme
  if (theme === 'system') {
    document.documentElement.removeAttribute('data-theme')
  } else {
    document.documentElement.setAttribute('data-theme', theme)
  }
  handleSaveAccount() // 自動保存
}

onMounted(() => {
  // 初期テーマ適用
  if (profileForm.value.theme !== 'system') {
    document.documentElement.setAttribute('data-theme', profileForm.value.theme)
  }
})

const handleAvatarUpload = async (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file || !file.type.startsWith('image/')) return
  
  isUpdating.value = true
  const formData = new FormData()
  formData.append('avatar', file)

  try {
    const response = await authFetch('http://localhost:3000/api/upload/avatar', {
      method: 'POST',
      body: formData
    })
    if (response.ok) {
      const data = await response.json()
      profileForm.value.avatarUrl = data.url
      // 即座にサーバーに保存
      await handleSaveAccount()
    }
  } finally {
    isUpdating.value = false
  }
}

const bannerInputGlobal = ref<HTMLInputElement | null>(null)

watch(extensionList, (newList) => {
  const glass = newList.find(e => e.id === 'glass')
  if (glass) {
    appSettings.value.glassUi = glass.enabled
    handleSaveAccount()
  }
}, { deep: true })

const handleClose = async () => {
  await handleSaveAccount()
  emit('close')
}
</script>

<template>
  <div class="settings-overlay">
    <div class="settings-container">
      <!-- Sidebar -->
      <aside class="settings-sidebar">
        <div class="sidebar-label">ユーザー設定</div>
        <nav class="sidebar-nav">
          <button 
            v-for="section in sections" 
            :key="section.id"
            :class="{ active: activeSection === section.id }"
            @click="activeSection = section.id"
          >
            <i :class="['bx', section.icon]"></i>
            {{ section.label }}
          </button>
          
          <div class="sidebar-divider"></div>
          
          <button class="logout-btn" @click="emit('logout')">
            <i class='bx bx-log-out'></i>
            ログアウト
          </button>
        </nav>

        <div class="sidebar-footer">
          <div class="app-version">SYCS v1.2.0</div>
          <div class="app-copyright">© 2026 SGR Studio</div>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="settings-content">
        <div class="content-wrapper">
          <!-- アカウント情報 (直感的な編集) -->
          <section v-if="activeSection === 'account'" class="section-pane">
            <h2>マイアカウント</h2>
            <div class="account-grid-layout">
              <div class="live-preview-container">
                <div class="preview-label">プロフィールプレビュー (直接編集)</div>
                <UserProfilePopover 
                  :userId="user.id" 
                  :currentUserId="user.id" 
                  :position="{ top: 0, left: 0 }"
                  :previewMode="true"
                  :inline="true"
                  :previewData="{ 
                    ...user, 
                    username: profileForm.username, 
                    avatar_url: profileForm.avatarUrl,
                    status_message: profileForm.statusMessage,
                    tagline: profileForm.tagline,
                    bio: profileForm.bio,
                    location: profileForm.location,
                    hobbies: profileForm.hobbies,
                    activity_url: profileForm.activityUrl,
                    banner_url: profileForm.bannerUrl
                  }"
                  :decoration="profileForm.decoration"
                  class="inline-preview"
                  @edit-avatar="handleAvatarUpload"
                  @edit-banner="handleBannerUpload"
                  @delete-avatar="handleDeleteAvatar"
                  @edit-field="handleEditField"
                />
              </div>

              <div class="quick-settings-pane">
                <h3>装飾・カスタマイズ</h3>
                <div class="setting-item-block">
                  <label>ステータスメッセージ</label>
                  <input v-model="profileForm.statusMessage" class="setting-input-field" placeholder="ステータスメッセージを入力..." @blur="handleSaveAccount" />
                </div>
                <div class="setting-item-block">
                  <label>デコレーション</label>
                  <select v-model="profileForm.decoration" class="setting-input-field" @change="handleSaveAccount">
                    <option value="none">なし</option>
                    <!-- Add more predefined decorations here -->
                  </select>
                </div>
                <div class="setting-item-block">
                  <label>バナー背景 (Color or manual URL)</label>
                  <div class="banner-edit-row">
                    <input v-model="profileForm.bannerUrl" class="setting-input-field" placeholder="#HEX or URL" @blur="handleSaveAccount" />
                    <button class="btn-secondary-small" @click="() => bannerInputGlobal?.click()">画像をアップロード</button>
                    <input ref="bannerInputGlobal" type="file" style="display: none" accept="image/*" @change="(e: any) => handleBannerUpload(e.target.files[0])" />
                  </div>
                </div>
                
                <div class="edit-tip-pane">
                  <i class='bx bx-info-circle'></i>
                  <span>プレビュー内の各項目を直接クリックして編集できます。アバターをクリックすると画像の変更・削除が可能です。</span>
                </div>
              </div>
              
              <input ref="fileInputRef" type="file" style="display: none" accept="image/gif,image/png,image/jpeg,video/webm" @change="handleAvatarUpload" />
            </div>

            <div class="danger-zone-box">
              <h3>アカウントの削除</h3>
              <p>アカウントを削除すると、すべてのデータが失われます。この操作は取り消せません。</p>
              <button class="btn-danger-outline">アカウントを削除</button>
            </div>
          </section>

          <!-- セキュリティ -->
          <section v-if="activeSection === 'security'" class="section-pane">
            <h2>パスワードと認証</h2>
            <div class="settings-group">
              <div class="password-fields">
                <div class="input-item">
                  <label>現在のパスワード</label>
                  <input v-model="securityForm.currentPassword" type="password" class="modern-input" />
                </div>
                <div class="input-item">
                  <label>新しいパスワード</label>
                  <input v-model="securityForm.newPassword" type="password" class="modern-input" />
                </div>
                <div class="input-item">
                  <label>新しいパスワード（確認）</label>
                  <input v-model="securityForm.confirmPassword" type="password" class="modern-input" />
                </div>
              </div>
              <button class="btn-primary-md" style="margin-top: 16px" @click="handleSaveSecurity">パスワードを変更</button>
            </div>
            
            <div class="divider"></div>
            
            <div class="settings-group">
              <label>二要素認証 (2FA)</label>
              <p class="desc">アカウントのセキュリティを強化するために二要素認証を有効にします。</p>
              <button class="btn-primary-md outline">認証を有効にする</button>
            </div>
          </section>

          <!-- テーマ -->
          <section v-if="activeSection === 'theme'" class="section-pane">
            <h2>外観</h2>
            <h3>テーマ</h3>
            <div class="theme-grid">
              <div 
                class="theme-card dark" 
                :class="{ active: profileForm.theme === 'dark' }"
                @click="applyTheme('dark')"
              >
                <div class="preview"></div>
                <span>ダーク</span>
              </div>
              <div 
                class="theme-card light" 
                :class="{ active: profileForm.theme === 'light' }"
                @click="applyTheme('light')"
              >
                <div class="preview"></div>
                <span>ライト</span>
              </div>
              <div 
                class="theme-card os" 
                :class="{ active: profileForm.theme === 'system' }"
                @click="applyTheme('system')"
              >
                <div class="preview"></div>
                <span>システム設定に同期</span>
              </div>
            </div>

            <h3>アクセントカラー</h3>
            <div class="color-presets">
              <span class="color-dot" style="background: #5865f2"></span>
              <span class="color-dot" style="background: #43b581"></span>
              <span class="color-dot" style="background: #faa61a"></span>
              <span class="color-dot" style="background: #f04747"></span>
            </div>
          </section>

          <!-- 通知 -->
          <section v-if="activeSection === 'notifications'" class="section-pane">
            <h2>通知</h2>
            <div class="setting-item-toggle">
              <div class="texts">
                <div class="label">デスクトップ通知</div>
                <div class="desc">ブラウザまたはアプリ経由でデスクトップ通知を受け取ります。</div>
              </div>
              <label class="toggle-switch">
                <input type="checkbox" v-model="notificationSettings.desktop">
                <span class="slider"></span>
              </label>
            </div>
            <div class="setting-item-toggle">
              <div class="texts">
                <div class="label">通知音</div>
                <div class="desc">新着メッセージ受信時にサウンドを再生します。</div>
              </div>
              <label class="toggle-switch">
                <input type="checkbox" v-model="notificationSettings.sound">
                <span class="slider"></span>
              </label>
            </div>
          </section>

          <!-- カスタマイズ -->
          <section v-if="activeSection === 'customization'" class="section-pane">
            <h2>カスタマイズ</h2>
            <h3>アバターデコレーション</h3>
            <div class="decoration-grid">
               <div 
                class="deco-card" 
                :class="{ active: profileForm.decoration === 'none' }"
                @click="profileForm.decoration = 'none'; handleSaveAccount()"
               >
                  <div class="deco-preview none">なし</div>
                  <span>なし</span>
               </div>
               <div 
                class="deco-card" 
                :class="{ active: profileForm.decoration === 'nekomimi' }"
                @click="profileForm.decoration = 'nekomimi'; handleSaveAccount()"
               >
                  <div class="deco-preview nekomimi">
                    <div class="ear-mock left"></div>
                    <div class="ear-mock right"></div>
                  </div>
                  <span>ネコミミ</span>
               </div>
            </div>

            <div class="divider"></div>

            <h3>アバターバッジ</h3>
            <div class="badge-grid">
               <div 
                v-for="badge in badgePresetList" 
                :key="badge.id"
                class="badge-item-card"
                :class="{ active: profileForm.decoration.includes(badge.id) }"
                @click="profileForm.decoration = badge.id; handleSaveAccount()"
               >
                  <i :class="['bx', badge.icon]"></i>
                  <span>{{ badge.label }}</span>
               </div>
            </div>

            <div class="divider"></div>

            <h3>レイアウト設定</h3>
            <div class="setting-item-toggle">
              <div class="texts">
                <div class="label">分割ビュー (Split View)</div>
                <div class="desc">スレッドとメッセージを左右に並べて表示します。</div>
              </div>
              <label class="toggle-switch">
                <input type="checkbox" v-model="appSettings.splitView" @change="handleSaveAccount">
                <span class="slider"></span>
              </label>
            </div>
            <div v-if="appSettings.splitView" class="setting-item-toggle">
              <div class="texts">
                <div class="label">右側ペインの表示</div>
                <div class="desc">分割ビューの右側に表示するタブを選択します。</div>
              </div>
              <select v-model="profileForm.activeTabSecondary" class="modern-select" @change="handleSaveAccount">
                <option value="dm">メッセージ</option>
                <option value="friends">フレンド</option>
              </select>
            </div>
            <div class="custom-item-grid">
               <div class="custom-card">
                  <div class="icon-box"><i class='bx bx-smile'></i></div>
                  <div class="name">カスタムステッカー</div>
                  <button class="btn-primary-md outline">設定</button>
               </div>
               <div class="custom-card">
                  <div class="icon-box"><i class='bx bx-ghost'></i></div>
                  <div class="name">サウンドパック</div>
                  <button class="btn-primary-md outline">設定</button>
               </div>
            </div>
            
            <h3>バッジ設定</h3>
            <div class="badge-selection">
              <div class="badge-item active"><i class='bx bx-code-alt'></i></div>
              <div class="badge-item"><i class='bx bx-award'></i></div>
              <div class="badge-item"><i class='bx bx-bolt-circle'></i></div>
              <div class="badge-item add-more"><i class='bx bx-plus'></i></div>
            </div>
          </section>

          <!-- 拡張機能 -->
          <section v-if="activeSection === 'extensions'" class="section-pane">
            <h2>拡張機能</h2>
            <div class="extension-grid">
              <div v-for="ext in extensionList" :key="ext.id" class="extension-card">
                <div class="ext-icon-box"><i :class="['bx', ext.icon]"></i></div>
                <div class="ext-details">
                  <div class="ext-name">{{ ext.name }}</div>
                  <div class="ext-desc">{{ ext.desc }}</div>
                </div>
                <label class="toggle-switch">
                  <input type="checkbox" v-model="ext.enabled">
                  <span class="slider"></span>
                </label>
              </div>
            </div>
            <button class="btn-primary-md" style="margin-top: 20px">プラグインブラウザを開く</button>
          </section>

          <!-- 言語設定 -->
          <section v-if="activeSection === 'language'" class="section-pane">
            <h2>言語設定</h2>
            <div class="settings-group">
              <label>表示言語</label>
              <p class="desc">SYCSで使用する言語を選択してください。</p>
              <select v-model="profileForm.language" class="modern-select" @change="handleSaveAccount">
                <option value="ja">日本語</option>
                <option value="en">English</option>
                <option value="ko">한국어</option>
                <option value="zh">中文</option>
              </select>
            </div>
          </section>

          <!-- ユーティリティ -->
          <section v-if="activeSection === 'utility'" class="section-pane">
            <h2>ユーティリティ</h2>
            <div class="settings-group">
              <h3>時刻の基準</h3>
              <p class="desc">メッセージやアクティビティの時刻表示に使用する基準を選択します。</p>
              <div class="radio-group-modern">
                <label class="radio-item">
                  <input type="radio" v-model="profileForm.timezone" value="local" @change="handleSaveAccount">
                  <div class="radio-content">
                    <span class="label">ローカル時刻</span>
                    <span class="desc">お使いのデバイスの現在時刻（推奨）</span>
                  </div>
                </label>
                <label class="radio-item">
                  <input type="radio" v-model="profileForm.timezone" value="utc" @change="handleSaveAccount">
                  <div class="radio-content">
                    <span class="label">UTC (世界協定時)</span>
                    <span class="desc">標準的な基準時刻</span>
                  </div>
                </label>
              </div>
            </div>
            
            <div class="divider"></div>
            
            <div class="settings-group">
              <h3>データ管理</h3>
              <p class="desc">キャッシュされた画像やメッセージ履歴の管理を行います。</p>
              <button class="btn-secondary-md">キャッシュをクリア</button>
            </div>
          </section>

          <!-- コネクション -->
          <section v-if="activeSection === 'connections'" class="section-pane">
            <h2>接続済みのサービス</h2>
            <div class="connections-wrapper">
              <div class="connection-btn discord">
                <i class='bx bxl-discord-alt'></i>
                <span>Discord</span>
              </div>
              <div class="connection-btn github">
                <i class='bx bxl-github'></i>
                <span>GitHub</span>
              </div>
              <div class="connection-btn twitter">
                <i class='bx bxl-twitter'></i>
                <span>Twitter</span>
              </div>
            </div>
          </section>
        </div>

        <button class="close-settings-btn" @click="handleClose">
          <i class='bx bx-x-circle'></i>
          <span>ESC</span>
        </button>
      </main>
    </div>
  </div>
</template>

<style scoped>
.settings-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: #313338;
  z-index: 5000;
  display: flex;
  color: #dbdee1;
  font-family: 'Inter', -apple-system, sans-serif;
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

.settings-container {
  display: flex;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
}

/* Sidebar */
.settings-sidebar {
  width: 280px;
  background: #2b2d31;
  padding: 60px 20px 20px 40px;
  display: flex;
  flex-direction: column;
}

.sidebar-label {
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  color: #949ba4;
  margin-bottom: 8px;
  padding-left: 10px;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.sidebar-nav button {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 10px;
  border: none;
  background: none;
  border-radius: 4px;
  color: #949ba4;
  font-size: 16px;
  cursor: pointer;
  text-align: left;
  transition: all 0.2s;
}

.sidebar-nav button:hover {
  background: #3f4147;
  color: #dbdee1;
}

.sidebar-nav button.active {
  background: #404249;
  color: #fff;
}

.sidebar-divider {
  height: 1px;
  background: #3f4147;
  margin: 8px 10px;
}

.logout-btn:hover {
  color: #fa777c !important;
}

.sidebar-footer {
  margin-top: auto;
  font-size: 12px;
  color: #949ba4;
  padding: 20px 10px;
}

/* Main Content */
.settings-content {
  flex: 1;
  background: #313338;
  padding: 60px 40px 40px 40px;
  position: relative;
  overflow-y: auto;
}

.content-wrapper {
  max-width: 740px;
}

.section-pane h2 {
  font-size: 20px;
  font-weight: 600;
  color: #fff;
  margin-bottom: 20px;
}

.section-pane h3 {
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  color: #949ba4;
  margin: 40px 0 16px 0;
}

/* Profile Card */
.profile-card-large {
  background: #111214;
  border-radius: 8px;
  overflow: hidden;
}

.profile-card-large .banner {
  height: 100px;
  background: #5865f2;
}

.user-meta {
  padding: 16px;
}

.avatar-group {
  margin-top: -60px;
  display: flex;
  align-items: flex-end;
  gap: 20px;
  margin-bottom: 24px;
}

.avatar-large {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: 4px solid #111214;
  background: #111214;
}

.change-avatar-btn {
  background: #5865f2;
  color: #fff;
  border: none;
  padding: 6px 16px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  margin-bottom: 4px;
}

.user-details {
  background: #2b2d31;
  border-radius: 8px;
  padding: 16px;
}

.info-row {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 16px;
}

.info-row:last-child { margin-bottom: 0; }

.info-row label {
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  color: #949ba4;
}

.value-group {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.uuid-text { color: #dbdee1; font-family: monospace; }
.edit-text-btn {
  background: #4e5058;
  color: #fff;
  border: none;
  padding: 4px 12px;
  border-radius: 3px;
  font-size: 14px;
  cursor: pointer;
}

.edit-text-btn:hover { background: #6d6f78; }

/* Themes */
.theme-grid {
  display: flex;
  gap: 16px;
}

.theme-card {
  flex: 1;
  background: #2b2d31;
  border: 2px solid transparent;
  border-radius: 8px;
  padding: 12px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
}

.theme-card.active { border-color: #5865f2; }
.theme-card:hover { background: #35373c; }

.theme-card .preview {
  width: 100%;
  height: 60px;
  border-radius: 4px;
}

.theme-card.dark .preview { background: #313338; }
.theme-card.light .preview { background: #fff; }
.theme-card.os .preview { background: linear-gradient(135deg, #313338 50%, #fff 50%); }

/* Controls */
.setting-item-toggle {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.setting-item-toggle .label { font-size: 16px; color: #fff; margin-bottom: 4px; }
.setting-item-toggle .desc { font-size: 14px; color: #949ba4; }

.toggle-switch {
  position: relative;
  width: 40px;
  height: 24px;
}

.toggle-switch input { opacity: 0; width: 0; height: 0; }
.slider {
  position: absolute;
  cursor: pointer;
  top: 0; left: 0; right: 0; bottom: 0;
  background-color: #80848e;
  transition: .4s;
  border-radius: 24px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 18px; width: 18px;
  left: 3px; bottom: 3px;
  background-color: white;
  transition: .4s;
  border-radius: 50%;
}

input:checked + .slider { background-color: #3ba55c; }
input:checked + .slider:before { transform: translateX(16px); }

/* Buttons */
.btn-primary-md {
  background: #5865f2;
  color: #fff;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
}

.btn-primary-md:hover { background: #4752c4; }
.btn-primary-md.outline { background: none; border: 1px solid #5865f2; color: #5865f2; }

.btn-danger-outline {
  border: 1px solid #da373c;
  color: #da373c;
  background: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.btn-danger-outline:hover { background: #da373c; color: #fff; }

.danger-zone-box {
  margin-top: 40px;
  border: 1px solid rgba(218, 55, 60, 0.4);
  padding: 16px;
  border-radius: 8px;
}

/* Inputs */
.modern-input {
  width: 100%;
  background: #1e1f22;
  border: 1px solid #111214;
  border-radius: 8px;
  padding: 10px;
  color: #fff;
  font-size: 16px;
}

.input-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 20px;
}

.input-item label {
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  color: #949ba4;
}

.footer-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
}

.btn-ghost {
  background: none;
  border: none;
  color: #fff;
  cursor: pointer;
}

/* Mock Sections (New) */
.custom-item-grid {
  display: grid; grid-template-columns: 1fr 1fr; gap: 16px;
}
.custom-card {
  background: #2b2d31; padding: 20px; border-radius: 12px; text-align: center;
}
.icon-box { font-size: 32px; margin-bottom: 12px; color: #5865f2; }

.badge-selection { display: flex; gap: 12px; }
.badge-item {
  width: 48px; height: 48px; background: #2b2d31; border-radius: 8px;
  display: flex; align-items: center; justify-content: center; font-size: 24px;
}
.badge-item.active { background: #35373c; border: 2px solid #5865f2; color: #fff; }

.extension-list { display: flex; flex-direction: column; gap: 12px; }
.extension-card {
  display: flex; justify-content: space-between; align-items: center;
  background: #2b2d31; padding: 16px; border-radius: 12px;
}
.ext-info { display: flex; gap: 16px; align-items: center; }
.ext-icon { font-size: 24px; color: #faa61a; }
.ext-name { font-weight: 600; color: #fff; }
.ext-desc { font-size: 12px; color: #949ba4; }

.connections-wrapper { display: flex; gap: 16px; }
.connection-btn {
  flex: 1; height: 48px; border-radius: 8px; display: flex; align-items: center; justify-content: center;
  gap: 12px; cursor: pointer; transition: opacity 0.2s;
}
.connection-btn:hover { opacity: 0.8; }
.discord { background: #5865f2; color: #fff; }
.github { background: #24292e; color: #fff; }
.twitter { background: #1da1f2; color: #fff; }

/* Close Button */
.close-settings-btn {
  position: absolute;
  top: 60px;
  right: 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  background: none;
  border: none;
  color: #949ba4;
  cursor: pointer;
  transition: color 0.2s;
}

.close-settings-btn:hover { color: #dbdee1; }
.close-settings-btn i { font-size: 32px; }
.close-settings-btn span { font-size: 12px; font-weight: 700; }

/* Live Preview */
.live-preview-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  background: #2b2d31;
  padding: 24px;
  border-radius: 8px;
  margin-bottom: 24px;
}

.preview-label {
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  color: #949ba4;
}

.inline-preview {
  position: relative !important;
  display: block !important;
  width: 100% !important;
  max-width: 300px;
  margin: 0 auto;
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  /* pointer-events: none; Removed to allow direct editing */
}

/* UserProfilePopover within settings needs to be relative */
:deep(.inline-preview .user-popover) {
  position: relative;
  top: 0 !important;
  left: 0 !important;
  margin: 0 auto;
  box-shadow: none;
}

:deep(.inline-preview .popover-overlay) {
  position: relative;
  z-index: 1;
}

.edit-controls-inline {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-top: 20px;
  border-top: 1px solid #3f4147;
}

/* Decoration Grid */
.decoration-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 16px;
}

.deco-card {
  background: #2b2d31;
  border: 2px solid transparent;
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  transition: all 0.2s;
}

.deco-card:hover { background: #35373c; }
.deco-card.active { border-color: #5865f2; background: #35373c; }

.deco-preview {
  width: 60px;
  height: 60px;
  background: #1e1f22;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  color: #949ba4;
  position: relative;
}

.deco-preview.nekomimi:before,
.deco-preview.nekomimi:after {
  content: "";
  position: absolute;
  top: -5px;
  width: 20px;
  height: 20px;
  background: #5865f2;
  clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
}

.deco-preview.nekomimi:before { left: 5px; transform: rotate(-15deg); }
.deco-preview.nekomimi:after { right: 5px; transform: rotate(15deg); }

/* Extension Grid */
.extension-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.extension-card {
  background: #2b2d31;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.ext-icon-box {
  width: 48px;
  height: 48px;
  background: #1e1f22;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.ext-details { flex: 1; }
.ext-name { font-weight: 600; font-size: 16px; margin-bottom: 4px; }
.ext-desc { font-size: 14px; color: #949ba4; }

/* Badge Grid */
.badge-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 12px;
}

.badge-item-card {
  background: #2b2d31;
  border: 2px solid transparent;
  border-radius: 8px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.badge-item-card:hover { background: #35373c; }
.badge-item-card.active { border-color: #5865f2; background: #35373c; }
.badge-item-card i { font-size: 24px; }
.badge-item-card span { font-size: 10px; font-weight: 700; color: #949ba4; }

.divider { height: 1px; background: #3f4147; margin: 24px 0; }

/* Radio Group Modern */
.radio-group-modern {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 12px;
}

.radio-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  background: #2b2d31;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
}

.radio-item:hover {
  background: #35373c;
}

.radio-item input[type="radio"] {
  margin-top: 4px;
}

.radio-content {
  display: flex;
  flex-direction: column;
}

.radio-content .label {
  font-weight: 600;
  color: #fff;
}

.radio-content .desc {
  font-size: 12px;
  color: #949ba4;
}

/* Modern Select */
.modern-select {
  width: 100%;
  padding: 10px 12px;
  background: #1e1f22;
  border: 1px solid #1e1f22;
  border-radius: 4px;
  color: #dbdee1;
  font-size: 16px;
  outline: none;
  cursor: pointer;
  transition: border-color 0.2s;
}

.modern-select:focus {
  border-color: #5865f2;
}

/* Edit Tip & Avatar Actions */
.account-grid-layout {
  display: grid;
  grid-template-columns: minmax(320px, 400px) 1fr;
  gap: 32px;
  align-items: start;
}

@media (max-width: 1000px) {
  .account-grid-layout {
    grid-template-columns: 1fr;
  }
}

.quick-settings-pane {
  background: #111214;
  padding: 24px;
  border-radius: 12px;
}

.quick-settings-pane h3 {
  font-size: 14px;
  margin-bottom: 24px;
  color: #fff;
  text-transform: uppercase;
}

.setting-item-block {
  margin-bottom: 20px;
}

.setting-item-block label {
  display: block;
  font-size: 12px;
  font-weight: 700;
  color: #b5bac1;
  text-transform: uppercase;
  margin-bottom: 8px;
}

.setting-input-field {
  width: 100%;
  padding: 10px;
  background: #1e1f22;
  border: none;
  border-radius: 4px;
  color: #dbdee1;
  outline: none;
  transition: box-shadow 0.2s;
}

.setting-input-field:focus {
  box-shadow: 0 0 0 2px #5865f2;
}

.edit-tip-pane {
  display: flex;
  gap: 12px;
  padding: 16px;
  background: rgba(88, 101, 242, 0.1);
  border: 1px solid rgba(88, 101, 242, 0.3);
  border-radius: 8px;
  color: #cfd3ff;
  font-size: 13px;
  line-height: 1.4;
  margin-top: 24px;
}

.edit-tip-pane i {
  font-size: 18px;
  color: #5865f2;
  flex-shrink: 0;
}
</style>
