<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { authFetch } from '../utils/api'

const props = defineProps<{
  userId: number
  currentUserId: number
  position: { top: number, left: number }
  decoration?: string
  decoFrontUrl?: string
  decoBackUrl?: string
  previewMode?: boolean
  previewData?: any
  inline?: boolean
}>() 

const emit = defineEmits(['close', 'message', 'friend-request-sent', 'blocked', 'update:previewData', 'edit-avatar', 'edit-banner', 'edit-field', 'delete-avatar'])

const isEditingName = ref(false)
const isEditingTagline = ref(false)
const isEditingBio = ref(false)

const editData = ref<any>({})
const avatarPopupVisible = ref(false)

const startEdit = (field: string) => {
  if (!props.previewMode) return
  editData.value[field] = displayData.value[field] || ''
  if (field === 'username') isEditingName.value = true
  else if (field === 'tagline') isEditingTagline.value = true
  else if (field === 'bio') isEditingBio.value = true
}

const saveEdit = (field: string) => {
  if (field === 'username') isEditingName.value = false
  else if (field === 'tagline') isEditingTagline.value = false
  else if (field === 'bio') isEditingBio.value = false

  const oldValue = displayData.value[field] || ''
  if (editData.value[field] !== oldValue) {
    emit('edit-field', { field, value: editData.value[field] })
  }
}

const userProfile = ref<any>(null)
const isLoading = ref(!props.previewMode)
const displayData = computed(() => props.previewMode ? props.previewData : userProfile.value)
const relationshipStatus = ref<'none' | 'friend' | 'pending_sent' | 'pending_received' | 'blocked'>('none')
const isMobile = ref(window.innerWidth <= 768)

const popoverStyle = computed(() => {
  if (props.inline) return {}
  if (isMobile.value) return {}

  const width = 300
  const height = 450
  let left = props.position.left
  let top = props.position.top

  // 画面端での見切れ防止 (デスクトップ)
  const minLeft = 280 // サイドバー幅
  if (left < minLeft) left = minLeft + 10

  if (left + width > window.innerWidth) left = window.innerWidth - width - 10
  
  // 上部見切れ防止 (重要)
  if (top < 10) top = 10
  if (top + height > window.innerHeight) top = Math.max(10, window.innerHeight - height - 10)

  return {
    top: `${top}px`,
    left: `${left}px`
  }
})

const fetchUserProfile = async () => {
  if (props.previewMode) return
  try {
    const userRes = await authFetch(`http://localhost:3000/api/users/${props.userId}`)
    if (!userRes.ok) throw new Error('User not found')
    userProfile.value = await userRes.json()
    await checkRelationship()
  } catch (error) {
    console.error('Failed to fetch user profile:', error)
  } finally {
    isLoading.value = false
  }
}

const checkRelationship = async () => {
  try {
    const friendsRes = await authFetch(`http://localhost:3000/api/friends`)
    const friends = await friendsRes.json()
    if (friends.some((f: any) => f.id === props.userId)) {
      relationshipStatus.value = 'friend'
      return
    }

    const requestsRes = await authFetch(`http://localhost:3000/api/friends/requests`)
    const requests = await requestsRes.json()
    if (requests.sent.some((r: any) => r.user_id === props.userId)) {
      relationshipStatus.value = 'pending_sent'
      return
    }
    if (requests.received.some((r: any) => r.user_id === props.userId)) {
      relationshipStatus.value = 'pending_received'
      return
    }

    const blocksRes = await authFetch(`http://localhost:3000/api/users/blocks`)
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

const triggerAvatarDelete = () => {
  avatarPopupVisible.value = false
  emit('delete-avatar')
}

onMounted(() => {
  fetchUserProfile()
  window.addEventListener('resize', () => {
    isMobile.value = window.innerWidth <= 768
  })
})

const bannerFileInput = ref<HTMLInputElement | null>(null)
const handleBannerClick = () => {
  if (props.previewMode) {
    bannerFileInput.value?.click()
  }
}

const onBannerFileChange = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file) {
    emit('edit-banner', file)
  }
}

const avatarFileInput = ref<HTMLInputElement | null>(null)
const triggerAvatarUpload = () => {
  avatarPopupVisible.value = false
  avatarFileInput.value?.click()
}

const onAvatarFileChange = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file) {
    emit('edit-avatar', file)
  }
}

const startDM = () => {
  emit('message', props.userId)
  emit('close')
}

const handleAvatarClick = () => {
  if (props.previewMode) {
    avatarPopupVisible.value = !avatarPopupVisible.value
  }
}

const closeAvatarPopup = () => {
  avatarPopupVisible.value = false
}

const showCopyTooltip = ref(false)
const copyToClipboard = async () => {
  const fullId = `${displayData.value.username}#${displayData.value.uuid || '0000'}`
  try {
    await navigator.clipboard.writeText(fullId)
    showCopyTooltip.value = true
    setTimeout(() => { showCopyTooltip.value = false }, 2000)
  } catch (err) {
    console.error('Failed to copy:', err)
  }
}
</script>

<template>
  <div>
    <!-- Overlay (only when not inline) -->
    <div v-if="!inline" class="popover-overlay" :class="{ 'is-mobile': isMobile }" @click="emit('close')"></div>

    <!-- Popover Card -->
    <div 
      class="popover-card" 
      :class="{ 'inline-mode': inline, 'is-mobile': isMobile }"
      :style="popoverStyle"
    >
      <div v-if="isLoading" class="loading-state">
        <i class='bx bx-loader-alt bx-spin'></i>
        <span>読み込み中...</span>
      </div>

      <div v-else-if="displayData" class="popover-content">
        <!-- Banner -->
        <div 
          class="banner-section" 
          :style="{ 
            backgroundColor: '#9e6240',
            backgroundImage: displayData.banner_url && displayData.banner_url.startsWith('url') ? displayData.banner_url : (displayData.banner_url ? `url(${displayData.banner_url})` : 'none')
          }"
          :class="{ 'editable': previewMode }"
          @click="handleBannerClick"
        >
          <input 
            type="file" 
            ref="bannerFileInput" 
            style="display: none" 
            accept="image/*" 
            @change="onBannerFileChange" 
          />
          <div class="mobile-handle" v-if="isMobile"></div>
          <div v-if="previewMode" class="edit-overlay-banner">
            <i class='bx bx-camera'></i>
          </div>
        </div>

        <!-- Global Triple Dot Menu -->
        <button class="more-btn-global"><i class='bx bx-dots-horizontal-rounded'></i></button>

        <!-- Avatar Section -->
        <div class="avatar-section">
          <div 
            class="avatar-wrapper" 
            :class="[
              decoration ? `deco-${decoration}` : '',
              { 'editable': previewMode }
            ]"
            @click="handleAvatarClick"
          >
            <!-- 3-Layer Decoration System -->
            <div class="back-layer">
               <!-- Managed by internal CSS class on wrapper -->
            </div>

            <img :src="displayData.avatar_url || '/defaultAvator.svg'" class="popover-avatar" />

            <div class="front-layer">
               <!-- Managed by internal CSS class on wrapper -->
            </div>

            <!-- Status Indicator (NOW IN FRONT) -->
            <div class="status-indicator online"></div>
            
            <!-- Avatar Edit Popup -->
            <div v-if="avatarPopupVisible" class="avatar-popup-overlay" @click.stop="closeAvatarPopup"></div>
            <div v-if="avatarPopupVisible" class="avatar-popup" @click.stop>
              <button @click="triggerAvatarUpload"><i class='bx bx-upload'></i> 画像をアップロード</button>
              <button class="danger" @click="triggerAvatarDelete"><i class='bx bx-trash'></i> 画像を削除</button>
              <div class="popup-arrow"></div>
              <input 
                type="file" 
                ref="avatarFileInput" 
                style="display: none" 
                accept="image/*" 
                @change="onAvatarFileChange" 
              />
            </div>

            <div v-if="previewMode" class="edit-overlay-avatar">
              <i class='bx bx-camera'></i>
            </div>
          </div>
          <div class="status-bubble-preview" v-if="!isMobile">
            <i class='bx bx-plus-circle'></i>
            <span>君のキャラクタークラスを選んでみて</span>
          </div>
        </div>

        <!-- User Info -->
        <div class="info-scroller">
          <div class="user-info-main">
            <h2 
              v-if="!isEditingName"
              class="display-name" 
              :class="{ 'editable': previewMode }"
              @click="previewMode ? startEdit('username') : copyToClipboard()"
            >
              {{ displayData.username }}
              <i v-if="previewMode" class='bx bx-edit-alt edit-icon-small'></i>
              
              <div v-if="showCopyTooltip" class="copy-success-tooltip">コピーしました！</div>
            </h2>
            <input 
              v-else 
              v-model="editData.username" 
              class="edit-input-inline name-input" 
              placeholder="名前を入力..."
              @blur="saveEdit('username')" 
              @keyup.enter="saveEdit('username')"
              v-focus
            />
            <div class="user-sub-info">
              <!-- Removed small name as requested -->
              <span class="user-id" @click="copyToClipboard">#{{ displayData.uuid || '0000' }}</span>
              <span class="separator">•</span>
              <span 
                v-if="!isEditingTagline"
                class="short-bio" 
                :class="{ 'editable': previewMode }"
                @click="startEdit('tagline')"
              >
                {{ displayData.tagline || 'ウルトラスーパー色とりどりな鳥' }}
                <i v-if="previewMode" class='bx bx-edit-alt edit-icon-small'></i>
              </span>
              <input 
                v-else 
                v-model="editData.tagline" 
                class="edit-input-inline tagline-input" 
                placeholder="代名詞を入力..."
                @blur="saveEdit('tagline')" 
                @keyup.enter="saveEdit('tagline')"
                v-focus
              />
            </div>

            <!-- Badges -->
            <div class="badges-row">
              <div class="badge-pill leaf">
                <i class='bx bxs-leaf'></i>
                <span>CODE</span>
              </div>
              <div class="badge-icons">
                <i class='bx bx-chevron-down-square'></i>
                <i class='bx bx-hash'></i>
                <i class='bx bx-award'></i>
                <i class='bx bx-bolt-circle'></i>
              </div>
            </div>
          </div>

          <div class="action-buttons">
            <button v-if="previewMode" class="btn-primary" @click="emit('close')">
              <i class='bx bx-check'></i> プレビューを閉じる
            </button>
            <template v-else>
              <button v-if="displayData.id === currentUserId" class="btn-primary">
                <i class='bx bx-edit-alt'></i> プロフィールを編集
              </button>
              <button v-else class="btn-primary" @click="startDM">
                <i class='bx bx-message-square-detail'></i> メッセージを送る
              </button>
            </template>
          </div>

          <!-- Profile Details (Card Style) -->
          <div class="details-card">
            <h4 class="card-title">自己紹介</h4>
            
            <div 
              class="detail-bio-area" 
              :class="{ 'editable': previewMode }"
              @click="startEdit('bio')"
            >
              <div v-if="!isEditingBio" class="bio-text">
                {{ displayData.bio || '自己紹介を入力...' }}
              </div>
              <textarea 
                v-else 
                v-model="editData.bio" 
                class="edit-input-inline bio-textarea" 
                placeholder="自己紹介を入力..."
                @blur="saveEdit('bio')"
                v-focus
              ></textarea>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.popover-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  z-index: 3000;
  pointer-events: auto;
}

.popover-overlay.is-mobile {
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: flex-end;
}

.popover-card {
  position: absolute;
  width: 320px;
  background: #111214; /* Discord-like dark card background */
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.5);
  overflow: hidden;
  color: #fff;
  font-family: 'Inter', -apple-system, sans-serif;
  animation: popIn 0.2s ease-out;
  z-index: 3001;
}

.popover-card.inline-mode {
  position: relative;
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
  animation: none;
  box-shadow: none;
  border: 1px solid #1e1f22;
  background: #111214;
}

.popover-card.is-mobile {
  position: relative;
  width: 100%;
  max-height: 90vh;
  border-radius: 24px 24px 0 0;
  animation: slideUp 0.3s ease-out;
  left: 0 !important;
  top: 0 !important;
}

@keyframes popIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

.banner-section {
  height: 60px; /* Discord-like height */
  position: relative;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.mobile-handle {
  width: 40px;
  height: 4px;
  background: rgba(255,255,255,0.3);
  border-radius: 2px;
  position: absolute;
  top: 8px;
  left: 50%;
  transform: translateX(-50%);
}

.banner-overlay {
  position: absolute;
  top: 12px;
  right: 12px;
}

.more-btn-global {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(0,0,0,0.2);
  border: none;
  color: #fff;
  width: 24px;
  height: 24px;
  border-radius: 4px; /* Squares buttons on Discord menu */
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  z-index: 100;
  transition: background 0.2s;
}

.more-btn-global:hover {
  background: rgba(0,0,0,0.5);
}

.avatar-section {
  padding: 0 16px;
  margin-top: -40px; /* High overlap for 80px avatar/60px banner */
  display: flex;
  align-items: flex-end;
  gap: 12px;
  position: relative;
  z-index: 10;
}

.avatar-wrapper {
  position: relative;
  border: 4px solid #000;
  border-radius: 50%;
  padding: 2px;
  background: #000;
}

.popover-avatar {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  display: block;
  object-fit: cover;
}

.status-indicator {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 3px solid #000;
  background: #23a559;
}

.status-bubble-preview {
  background: #1e1f22;
  padding: 6px 12px;
  border-radius: 12px;
  font-size: 11px;
  color: #dbdee1;
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
  max-width: 180px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

.info-scroller {
  padding: 12px 16px;
  max-height: 500px;
  overflow-y: auto;
}

.display-name {
  font-size: 1.25rem;
  font-weight: 800;
  margin: 0;
}

.user-sub-info {
  font-size: 12px;
  color: #b5bac1;
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 2px;
}

.badges-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
}

.badge-pill {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 700;
}

.badge-pill.leaf {
  background: #1e1f22;
  color: #43b581;
}

.badge-icons {
  display: flex;
  gap: 6px;
  font-size: 16px;
  color: #dbdee1;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 16px 0;
}

.btn-primary {
  background: #5865f2;
  color: #fff;
  border: none;
  padding: 10px;
  border-radius: 18px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.details-card {
  background: #111214;
  border-radius: 12px;
  padding: 12px;
}

.card-title {
  font-size: 12px;
  font-weight: 700;
  color: #dbdee1;
  margin: 0 0 12px 0;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  margin-bottom: 8px;
}

.detail-item .label {
  color: #b5bac1;
  min-width: 30px;
}

.value-tags {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
}

.value-tag {
  background: #2b2d31;
  padding: 1px 4px;
  border-radius: 3px;
}

.suffix { color: #b5bac1; }

.status-quote {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  margin: 16px 0;
}

.activity-link {
  font-size: 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.activity-link a {
  color: #00a8fc;
  text-decoration: none;
}

.activity-link a:hover { text-decoration: underline; }

.loading-state {
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.spinner {
  width: 24px;
  height: 24px;
  border: 2px solid #333;
  border-top-color: #5865f2;
  border-radius: 50%;
  animation: spin 1s infinite linear;
}

@keyframes spin { to { transform: rotate(360deg); } }

/* Editable States (Preview Mode) */
.editable {
  cursor: pointer;
  position: relative;
  transition: filter 0.2s;
}

.editable:hover {
  filter: brightness(1.2);
}

.edit-overlay-banner {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
  pointer-events: none;
  font-size: 14px;
  font-weight: 600;
  gap: 8px;
}

.editable:hover .edit-overlay-banner {
  opacity: 1;
}

.edit-overlay-avatar {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.5);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
  pointer-events: none;
  font-size: 24px;
}

.editable:hover .edit-overlay-avatar {
  opacity: 1;
}

.edit-icon-small {
  font-size: 14px;
  margin-left: 8px;
  color: #b5bac1;
  vertical-align: middle;
}

.display-name.editable:hover {
  background: rgba(255,255,255,0.05);
  border-radius: 4px;
}

.status-quote.editable:hover {
  background: rgba(255,255,255,0.05);
  border-radius: 4px;
  padding: 4px;
}

.edit-input-inline {
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(88, 101, 242, 0.5);
  border-radius: 4px;
  color: #fff;
  padding: 4px 8px;
  width: 100%;
  font-family: inherit;
  outline: none;
  transition: border-color 0.2s;
}

.edit-input-inline:focus {
  border-color: #5865f2;
  background: rgba(255,255,255,0.1);
}

.edit-input-inline.name-input {
  font-size: 1.25rem;
  font-weight: 800;
  margin: 0;
  padding: 0 4px; /* Align with text */
  background: transparent;
  border: none;
  border-bottom: 2px solid #5865f2;
  border-radius: 0;
}

.edit-input-inline.status-input {
  font-size: 12px;
  margin: 4px 0;
  resize: none;
  height: 40px;
  background: transparent;
  border: none;
  border-bottom: 1px solid #5865f2;
  border-radius: 0;
}

.edit-input-inline.tagline-input {
  font-size: 12px;
  background: transparent;
  border: none;
  border-bottom: 1px solid #5865f2;
  border-radius: 0;
  padding: 0;
  width: auto;
  min-width: 100px;
}

.edit-input-inline.bio-textarea {
  font-size: 13px;
  min-height: 80px;
  background: rgba(0,0,0,0.2);
  border: 1px solid #5865f2;
  padding: 8px;
  line-height: 1.6;
  white-space: pre-wrap;
}

.detail-bio-area {
  margin-bottom: 12px;
  transition: background 0.2s;
  border-radius: 4px;
}

.detail-bio-area.editable:hover {
  background: rgba(255,255,255,0.05);
}

.bio-text {
  font-size: 13px;
  line-height: 1.6;
  white-space: pre-wrap;
  color: #dbdee1;
}

.card-divider {
  border: none;
  border-top: 1px solid #2b2d31;
  margin: 12px 0;
}

.detail-input {
  background: transparent;
  border: none;
  border-bottom: 1px solid #5865f2;
  font-size: 12px;
  padding: 0;
}

/* 3-Layer Decoration System */
.avatar-wrapper {
  position: relative;
  border: 4px solid #000;
  border-radius: 50%;
  background: #000;
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-layer, .front-layer {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 130%; /* Slightly larger for better framing */
  height: 130%;
  pointer-events: none;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
}

.back-layer { z-index: 1; }
.popover-avatar {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  display: block;
  object-fit: cover;
  position: relative;
  z-index: 2;
}
.front-layer { z-index: 3; }

.status-indicator {
  position: absolute;
  bottom: 0px;
  right: 0px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 4px solid #111214; /* Matches card background for better blending */
  background: #23a559;
  z-index: 20; /* FORCED FRONT */
}

/* Add more internal decorations as needed */

/* Add more internal decorations as needed */

/* User name copy tooltip */
.display-name {
  position: relative;
  width: fit-content;
}

.copy-success-tooltip {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: #23a559;
  color: #fff;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  white-space: nowrap;
  animation: fadeInOut 2s forwards;
  pointer-events: none;
  z-index: 1000;
}

@keyframes fadeInOut {
  0% { opacity: 0; transform: translate(-50%, 5px); }
  10% { opacity: 1; transform: translate(-50%, -5px); }
  80% { opacity: 1; }
  100% { opacity: 0; }
}

.user-id { cursor: pointer; transition: color 0.2s; }
.user-id:hover { color: #fff; }

.popover-card.inline-mode .avatar-popup-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  z-index: 90;
  cursor: default;
}

/* Avatar Popup (Positioned BELOW avatar to avoid clipping header) */
.avatar-popup {
  position: absolute;
  top: 90px;
  left: 50%;
  transform: translateX(-50%);
  background: #111214;
  border: 1px solid #2b2d31;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.5);
  display: flex;
  flex-direction: column;
  padding: 4px;
  z-index: 100;
  min-width: 160px;
}

.avatar-popup button {
  background: transparent;
  border: none;
  color: #dbdee1;
  padding: 8px 12px;
  text-align: left;
  font-size: 13px;
  cursor: pointer;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background 0.2s;
}

.avatar-popup button:hover {
  background: #2b2d31;
  color: #fff;
}

.avatar-popup button.danger:hover {
  background: #da373c;
  color: #fff;
}

.popup-arrow {
  position: absolute;
  top: -6px;
  left: 50%;
  transform: translateX(-50%);
  width: 12px;
  height: 12px;
  background: #111214;
  clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
  border-left: 1px solid #2b2d31;
  border-top: 1px solid #2b2d31;
}

/* スクロールバー調整 */
.info-scroller::-webkit-scrollbar { width: 4px; }
.info-scroller::-webkit-scrollbar-thumb { background: #1e1f22; border-radius: 2px; }
</style>
