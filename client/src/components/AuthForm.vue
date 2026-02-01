<script setup lang="ts">
import { ref, reactive, computed } from 'vue'

const emit = defineEmits(['login-success'])

// 状態管理
const mode = ref<'login' | 'signup'>('login')
const step = ref(1)
const loading = ref(false)
const errorMessage = ref('')

// 入力データ
const form = reactive({
  identity: '', // login用 (user or email)
  username: '', // signup用
  email: '',    // signup用
  password: '',
  avatarUrl: '/default-avatar.svg'
})

// ステップ2で見せるユーザー情報 (Login用)
const previewUser = ref<{ username: string, avatar_url: string } | null>(null)

// バリデーション
const isStep1Valid = computed(() => {
  if (mode.value === 'login') return form.identity.length > 0
  return form.username.length > 2 && form.email.includes('@') && form.password.length >= 4
})

// モード切り替え
const toggleMode = () => {
  mode.value = mode.value === 'login' ? 'signup' : 'login'
  step.value = 1
  errorMessage.value = ''
}

// ファイルアップロード処理
const isDragging = ref(false)
const handleFileUpload = async (file: File) => {
  if (!file.type.startsWith('image/')) {
    errorMessage.value = '画像ファイルを選択してください'
    return
  }

  loading.value = true
  const formData = new FormData()
  formData.append('avatar', file)

  try {
    const response = await fetch('http://localhost:3000/api/upload/avatar', {
      method: 'POST',
      body: formData,
      credentials: 'include'
    })
    if (response.ok) {
      const data = await response.json()
      form.avatarUrl = data.url
    } else {
      errorMessage.value = 'アップロードに失敗しました'
    }
  } catch (e) {
    errorMessage.value = 'サーバーとの通信に失敗しました'
  } finally {
    loading.value = false
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

const fileInputRef = ref<HTMLInputElement | null>(null)
const triggerFileInput = () => {
  fileInputRef.value?.click()
}

// 次へ (Login Step 1 -> 2: パスワード入力へ)
const handleLoginStep1 = () => {
  if (form.identity) step.value = 2
}

// 次へ (Login Step 2 -> 3: アカウント確認へ)
const handleLoginStep2 = async () => {
  errorMessage.value = ''
  loading.value = true
  try {
    const response = await fetch('http://localhost:3000/api/auth/check-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identity: form.identity }),
      credentials: 'include'
    })
    
    if (response.ok) {
      previewUser.value = await response.json()
      step.value = 3
    } else {
      errorMessage.value = 'ユーザーが見つかりませんでした'
    }
  } catch (e) {
    errorMessage.value = '通信エラーが発生しました'
  } finally {
    loading.value = false
  }
}

// ログイン実行 (Step 3)
const handleLogin = async () => {
  errorMessage.value = ''
  loading.value = true
  try {
    const response = await fetch('http://localhost:3000/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identity: form.identity, password: form.password }),
      credentials: 'include'
    })
    
    if (response.ok) {
      const data = await response.json()
      emit('login-success', data)
    } else {
      errorMessage.value = 'パスワードが正しくありません。最初からやり直してください。'
      step.value = 1
      form.password = ''
    }
  } catch (e) {
    errorMessage.value = 'エラーが発生しました'
  } finally {
    loading.value = false
  }
}

// サインアップ 次へ (Step 1 -> 2)
const handleSignupNext = () => {
  step.value = 2
}

// サインアップ実行
const handleSignup = async () => {
  errorMessage.value = ''
  loading.value = true
  try {
    const response = await fetch('http://localhost:3000/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: form.username,
        email: form.email,
        password: form.password,
        avatar_url: form.avatarUrl
      })
    })
    
    if (response.ok) {
      alert('登録完了！ログインしてください')
      mode.value = 'login'
      step.value = 1
      form.identity = form.username
    } else {
      errorMessage.value = await response.text()
    }
  } catch (e) {
    errorMessage.value = '登録に失敗しました'
  } finally {
    loading.value = false
  }
}

// アバター更新 (簡易)
const setAvatar = (url: string) => {
  form.avatarUrl = url
}

</script>

<template>
  <div class="auth-card">
    <!-- ヘッダー -->
    <div class="auth-header">
      <img src="../assets/Logo.svg" alt="SYCS" class="logo" />
      <h2>{{ mode === 'login' ? 'おかえりなさい' : 'アカウントを作成' }}</h2>
      <p class="subtitle">{{ mode === 'login' ? 'SYCSで友達と繋がりましょう' : '数ステップで始められます' }}</p>
    </div>

    <!-- フォームエリア -->
    <div class="auth-body">
      
      <!-- ログイン Step 1: ID入力 -->
      <div v-if="mode === 'login' && step === 1" class="step-content">
        <div class="input-group">
          <label>ユーザー名 または メールアドレス</label>
          <input v-model="form.identity" type="text" placeholder="example@mail.com" auto-focus @keyup.enter="isStep1Valid && handleLoginStep1()" />
        </div>
        <button class="primary" :disabled="!isStep1Valid || loading" @click="handleLoginStep1">
          次へ
        </button>
      </div>

      <!-- ログイン Step 2: パスワード入力 -->
      <div v-if="mode === 'login' && step === 2" class="step-content">
        <div class="input-group">
          <label>パスワードを入力してください</label>
          <input v-model="form.password" type="password" placeholder="••••••••" autofocus @keyup.enter="handleLoginStep2" />
        </div>
        <button class="primary" :disabled="!form.password || loading" @click="handleLoginStep2">
          {{ loading ? '確認中...' : '次へ' }}
        </button>
        <button class="link-btn" @click="step = 1">戻る</button>
      </div>

      <!-- ログイン Step 3: 最終確認 -->
      <div v-if="mode === 'login' && step === 3" class="step-content">
        <p class="confirm-text">このアカウントでログインしますか？</p>
        <div class="user-preview">
          <img :src="previewUser?.avatar_url" class="avatar-large" />
          <div class="preview-info">
            <strong>{{ previewUser?.username }}</strong>
            <span @click="step = 1">アカウントを切り替える</span>
          </div>
        </div>
        <button class="primary" :disabled="loading" @click="handleLogin">
          {{ loading ? 'ログイン中...' : 'ログインする' }}
        </button>
        <button class="link-btn" @click="step = 2">戻る</button>
      </div>

      <!-- サインアップ Step 1 -->
      <div v-if="mode === 'signup' && step === 1" class="step-content">
        <div class="input-group">
          <label>ユーザー名</label>
          <input v-model="form.username" type="text" placeholder="あなたの名前" />
        </div>
        <div class="input-group">
          <label>メールアドレス</label>
          <input v-model="form.email" type="email" placeholder="example@mail.com" />
        </div>
        <div class="input-group">
          <label>パスワード</label>
          <input v-model="form.password" type="password" placeholder="4文字以上" />
        </div>
        <button class="primary" :disabled="!isStep1Valid || loading" @click="handleSignupNext">次へ</button>
      </div>

      <!-- サインアップ Step 2 (アバター設定) -->
      <div v-if="mode === 'signup' && step === 2" class="step-content">
        <div 
          class="avatar-picker"
          :class="{ dragging: isDragging }"
          @dragover.prevent="isDragging = true"
          @dragleave="isDragging = false"
          @drop.prevent="onDrop"
          @click="triggerFileInput"
        >
          <div class="avatar-container">
            <img :src="form.avatarUrl" class="avatar-huge" />
            <div v-if="loading" class="upload-overlay">
              <span class="spinner"></span>
            </div>
          </div>
          <div class="drop-hint">
            <strong>アイコンをドラッグ & ドロップ</strong>
            <span>またはクリックしてファイルを選択</span>
          </div>
          <input 
            ref="fileInputRef" 
            type="file" 
            style="display: none" 
            accept="image/*" 
            @change="onFileSelect" 
          />
        </div>
        <div class="avatar-quick-presets">
          <button class="preset-btn" @click.stop="setAvatar('/default-avatar.svg')">初期に戻す</button>
        </div>
        <button class="primary" :disabled="loading" @click="handleSignup">登録を完了する</button>
        <button class="link-btn" @click="step = 1">戻る</button>
      </div>

      <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
    </div>

    <!-- フッター -->
    <div class="auth-footer">
      <p v-if="mode === 'login'">
        アカウントをお持ちでないですか？ 
        <button class="link-btn" @click="toggleMode">新規登録</button>
      </p>
      <p v-else>
        すでにアカウントをお持ちですか？ 
        <button class="link-btn" @click="toggleMode">ログイン</button>
      </p>
    </div>
  </div>
</template>

<style scoped>
.auth-card {
  background: white;
  padding: 40px;
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.1);
  width: 100%;
  max-width: 400px;
  margin: auto;
  text-align: left;
}

.auth-header {
  text-align: center;
  margin-bottom: 30px;
}

.logo {
  height: 60px;
  margin-bottom: 15px;
}

h2 {
  margin: 0;
  font-size: 1.5rem;
  color: #1a1a1a;
}

.subtitle {
  color: #666;
  margin-top: 5px;
  font-size: 0.9rem;
}

.input-group {
  margin-bottom: 20px;
}

.input-group label {
  display: block;
  font-size: 0.85rem;
  font-weight: 600;
  margin-bottom: 8px;
  color: #444;
}

input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.2s;
  background-color: #f9f9f9;
  box-sizing: border-box;
  color: #1a1a1a;
}

input:focus {
  outline: none;
  border-color: #646cff;
  background-color: white;
  box-shadow: 0 0 0 4px rgba(100, 108, 255, 0.1);
}

button.primary {
  width: 100%;
  padding: 14px;
  background-color: #646cff;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

button.primary:hover:not(:disabled) {
  background-color: #535bf2;
  transform: translateY(-1px);
}

button.primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.auth-footer {
  margin-top: 25px;
  text-align: center;
  font-size: 0.9rem;
  color: #666;
}

.link-btn {
  background: none;
  border: none;
  color: #646cff;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
  margin-left: 5px;
}

.link-btn:hover {
  text-decoration: underline;
}

.error {
  color: #e74c3c;
  font-size: 0.9rem;
  margin-top: 15px;
  text-align: center;
}

/* ユーザー確認画面用のスタイル */
.user-preview {
  display: flex;
  align-items: center;
  padding: 12px;
  background: #f0f2ff;
  border-radius: 12px;
  margin-bottom: 20px;
  cursor: pointer;
}

.avatar-large {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #ddd;
  margin-right: 15px;
}

.preview-info strong {
  display: block;
}

.preview-info span {
  font-size: 0.8rem;
  color: #646cff;
}

/* アバター選択 */
.avatar-picker {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  padding: 30px;
  border: 2px dashed #ddd;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.2s;
  background: #fafafa;
  margin: 10px 0 20px 0;
}

.avatar-picker:hover, .avatar-picker.dragging {
  border-color: #646cff;
  background: #f0f1ff;
}

.avatar-container {
  position: relative;
  width: 100px;
  height: 100px;
}

.avatar-huge {
  width: 100px;
  height: 100px;
  border-radius: 16px;
  object-fit: cover;
  background: #f0f0f0;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.upload-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.3);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.drop-hint {
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.drop-hint strong {
  font-size: 0.9rem;
  color: #333;
}

.drop-hint span {
  font-size: 0.8rem;
  color: #888;
}

.avatar-quick-presets {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.preset-btn {
  background: none;
  border: 1px solid #ddd;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 0.8rem;
  color: #666;
  cursor: pointer;
}

.preset-btn:hover {
  background: #eee;
}

.spinner {
  width: 24px;
  height: 24px;
  border: 3px solid rgba(255,255,255,0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>