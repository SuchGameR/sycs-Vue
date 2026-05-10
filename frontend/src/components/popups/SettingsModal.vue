<script setup lang="ts">
import { ref, onMounted, computed, watch } from "vue";
import { useAuthStore } from "../../stores/auth";
import { useRouter } from "vue-router";
import {
  User,
  Palette,
  Globe,
  LogOut,
  ArrowLeft,
  Upload,
  CheckCircle2,
  Settings as SettingsIcon,
  Layout,
  X,
  Crop as CropIcon,
  Clock,
} from "lucide-vue-next";
import { Cropper, CircleStencil } from "vue-advanced-cropper";
import "vue-advanced-cropper/dist/style.css";

const props = defineProps<{
  show: boolean;
}>();

const emit = defineEmits(["close"]);

const authStore = useAuthStore();
const router = useRouter();

const activeMenu = ref("profile");
const username = ref("");
const userid = ref("");
const avatar_url = ref("");
const header_url = ref("");
const timelineMode = ref(authStore.timelineMode);
const lang = ref(authStore.lang);
const theme = ref(authStore.theme);
const timeDisplayMode = ref(authStore.timeDisplayMode);
const error = ref("");
const message = ref("");

// Cropper State
const isCropping = ref(false);
const cropTarget = ref<"avatar" | "header" | null>(null);
const cropImage = ref<string | null>(null);
const cropperRef = ref<any>(null);

const avatarInput = ref<HTMLInputElement | null>(null);
const headerInput = ref<HTMLInputElement | null>(null);

onMounted(async () => {
  if (authStore.user) {
    initFields();
  } else if (authStore.token) {
    await authStore.fetchUser();
    initFields();
  }
});

function initFields() {
  if (authStore.user) {
    username.value = authStore.user.username;
    userid.value = authStore.user.userid;
    avatar_url.value = authStore.user.avatar_url || "";
    header_url.value = authStore.user.header_url || "";
  }
}

watch(
  () => props.show,
  (newVal) => {
    if (newVal) initFields();
  },
);

// Image Selection
function onFileSelect(event: Event, target: "avatar" | "header") {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    cropImage.value = e.target?.result as string;
    cropTarget.value = target;
    isCropping.value = true;
  };
  reader.readAsDataURL(file);
}

// Cropping Logic
async function handleCrop() {
  if (!cropperRef.value) return;
  const { canvas } = cropperRef.value.getResult();
  if (canvas) {
    canvas.toBlob(async (blob: Blob) => {
      if (!blob) return;
      const file = new File([blob], `cropped_${Date.now()}.png`, {
        type: "image/png",
      });

      try {
        if (cropTarget.value === "avatar") {
          const url = await authStore.uploadAvatar(file);
          avatar_url.value = url;
        } else if (cropTarget.value === "header") {
          const url = await authStore.uploadHeader(file);
          header_url.value = url;
        }
        closeCropper();
      } catch (err: any) {
        error.value = err.message;
      }
    }, "image/png");
  }
}

function closeCropper() {
  isCropping.value = false;
  cropImage.value = null;
  cropTarget.value = null;
  if (avatarInput.value) avatarInput.value.value = "";
  if (headerInput.value) headerInput.value.value = "";
}

function updateTimelineMode() {
  authStore.setTimelineMode(timelineMode.value);
}
function updateLang() {
  authStore.setLang(lang.value);
}
function updateTheme() {
  authStore.setTheme(theme.value);
}
function updateTimeDisplayMode() {
  authStore.setTimeDisplayMode(timeDisplayMode.value);
}

async function handleUpdate() {
  try {
    await authStore.updateSettings({
      username: username.value,
      userid: userid.value,
      avatar_url: avatar_url.value,
      header_url: header_url.value,
      attributes: { ...authStore.user?.attributes, theme: theme.value },
    });
    message.value = authStore.t.updated;
    error.value = "";
    setTimeout(() => {
      message.value = "";
    }, 3000);
  } catch (err: any) {
    error.value = err.message;
    message.value = "";
  }
}

function handleLogout() {
  authStore.logout();
  emit("close");
  router.push("/signin");
}
</script>

<template>
  <div v-if="show" class="modal-overlay" @click.self="emit('close')">
    <div class="settings-window">
      <!-- Top Header for Mobile -->
      <header class="mobile-only-header">
        <h3>{{ authStore.t.settings }}</h3>
        <button class="header-close-btn" @click="emit('close')">
          <X :size="20" />
          <span>閉じる</span>
        </button>
      </header>

      <!-- Sidebar -->
      <div class="settings-sidebar">
        <div class="sidebar-header desktop-only">
          <SettingsIcon :size="20" />
          <h3>{{ authStore.t.settings }}</h3>
        </div>
        <div
          class="menu-item"
          :class="{ active: activeMenu === 'profile' }"
          @click="activeMenu = 'profile'"
        >
          <User :size="18" /> {{ authStore.t.username }}
        </div>
        <div
          class="menu-item"
          :class="{ active: activeMenu === 'appearance' }"
          @click="activeMenu = 'appearance'"
        >
          <Palette :size="18" /> {{ authStore.t.theme }}
        </div>
        <div
          class="menu-item"
          :class="{ active: activeMenu === 'timeline' }"
          @click="activeMenu = 'timeline'"
        >
          <Layout :size="18" /> {{ authStore.t.timeline_mode }}
        </div>
        <div
          class="menu-item"
          :class="{ active: activeMenu === 'language' }"
          @click="activeMenu = 'language'"
        >
          <Globe :size="18" /> {{ authStore.t.language }}
        </div>
        <div
          class="menu-item"
          :class="{ active: activeMenu === 'time' }"
          @click="activeMenu = 'time'"
        >
          <Clock :size="18" /> {{ authStore.t.timeDisplayMode }}
        </div>

        <div class="sidebar-footer">
          <div class="menu-item logout" @click="handleLogout">
            <LogOut :size="18" /> {{ authStore.t.signout }}
          </div>
          <div class="menu-item back desktop-only" @click="emit('close')">
            <X :size="18" /> 閉じる
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="settings-content">
        <!-- Close Button (Floating/Fixed Desktop Only) -->
        <button class="desktop-close-btn" @click="emit('close')">
          <X :size="24" />
          <span>閉じる</span>
        </button>

        <!-- Profile Section -->
        <div v-if="activeMenu === 'profile'" class="section">
          <h2>{{ authStore.t.username }}</h2>

          <!-- Preview Card -->
          <div class="profile-preview-card">
            <div class="preview-header-box">
              <img :src="header_url || '/image.png'" class="preview-header" />
            </div>
            <div class="preview-info">
              <div class="preview-avatar-box">
                <img
                  :src="avatar_url || '/default-avatar.png'"
                  class="preview-avatar"
                />
              </div>
              <div class="preview-text">
                <span class="preview-name">{{ username || "Username" }}</span>
                <span class="preview-handle">@{{ userid }}</span>
              </div>
            </div>
          </div>

          <div class="form-grid">
            <div class="form-group">
              <label>{{ authStore.t.username }}</label>
              <input v-model="username" type="text" />
            </div>

            <div class="form-group">
              <label>ユーザーID (ハンドネーム)</label>
              <input v-model="userid" type="text" placeholder="bird" />
            </div>

            <div class="form-group full-width">
              <label>{{ authStore.t.header_url }} (3:1)</label>
              <div class="upload-area" @click="headerInput?.click()">
                <Upload :size="24" />
                <span>クリックしてヘッダーをアップロード</span>
                <input
                  ref="headerInput"
                  type="file"
                  hidden
                  accept="image/*"
                  @change="onFileSelect($event, 'header')"
                />
              </div>
            </div>

            <div class="form-group">
              <label>{{ authStore.t.avatar_url }} (1:1)</label>
              <div class="upload-area square" @click="avatarInput?.click()">
                <Upload :size="24" />
                <span>アバター</span>
                <input
                  ref="avatarInput"
                  type="file"
                  hidden
                  accept="image/*"
                  @change="onFileSelect($event, 'avatar')"
                />
              </div>
            </div>
          </div>

          <button class="save-btn" @click="handleUpdate">
            <CheckCircle2 :size="18" /> {{ authStore.t.save }}
          </button>
        </div>

        <!-- Appearance Section -->
        <div v-if="activeMenu === 'appearance'" class="section">
          <h2>{{ authStore.t.theme }}</h2>
          <div class="theme-grid">
            <div
              v-for="t in ['light', 'dark', 'dim']"
              :key="t"
              class="theme-card"
              :class="{ active: theme === t, [t]: true }"
              @click="
                theme = t;
                updateTheme();
              "
            >
              <div class="theme-preview">
                <div class="preview-line"></div>
                <div class="preview-line short"></div>
              </div>
              <span>{{ authStore.t["theme_" + t] }}</span>
            </div>
          </div>
          <button class="save-btn" @click="handleUpdate">
            <CheckCircle2 :size="18" /> {{ authStore.t.save }}
          </button>
        </div>

        <!-- Timeline Section -->
        <div v-if="activeMenu === 'timeline'" class="section">
          <h2>{{ authStore.t.timeline_mode }}</h2>
          <div class="radio-group">
            <label
              class="radio-option"
              :class="{ active: timelineMode === 'scroll' }"
            >
              <input
                type="radio"
                value="scroll"
                v-model="timelineMode"
                @change="updateTimelineMode"
              />
              <div class="radio-content">
                <span class="title">{{ authStore.t.scroll }}</span>
                <span class="desc"
                  >スクロールすると自動的に次の投稿を読み込みます。</span
                >
              </div>
            </label>
            <label
              class="radio-option"
              :class="{ active: timelineMode === 'stream' }"
            >
              <input
                type="radio"
                value="stream"
                v-model="timelineMode"
                @change="updateTimelineMode"
              />
              <div class="radio-content">
                <span class="title">{{ authStore.t.stream }}</span>
                <span class="desc"
                  >新しい投稿がリアルタイムにストリーミングされます。</span
                >
              </div>
            </label>
          </div>
        </div>

        <!-- Language Section -->
        <div v-if="activeMenu === 'language'" class="section">
          <h2>{{ authStore.t.language }}</h2>
          <div class="select-wrapper">
            <select v-model="lang" @change="updateLang" class="modern-select">
              <option value="ja">日本語 (Japanese)</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>

        <!-- Time Display Section -->
        <div v-if="activeMenu === 'time'" class="section">
          <h2>{{ authStore.t.timeDisplayMode }}</h2>
          <div class="radio-group">
            <label
              class="radio-option"
              :class="{ active: timeDisplayMode === 'default' }"
            >
              <input
                type="radio"
                value="default"
                v-model="timeDisplayMode"
                @change="updateTimeDisplayMode"
              />
              <div class="radio-content">
                <span class="title">{{ authStore.t.time_default }}</span>
                <span class="desc">投稿した時刻をそのまま表示します。</span>
              </div>
            </label>
            <label
              class="radio-option"
              :class="{ active: timeDisplayMode === 'minute' }"
            >
              <input
                type="radio"
                value="minute"
                v-model="timeDisplayMode"
                @change="updateTimeDisplayMode"
              />
              <div class="radio-content">
                <span class="title">{{ authStore.t.time_minute }}</span>
                <span class="desc">「5分」のように、分単位で経過時間を表示します。</span>
              </div>
            </label>
            <label
              class="radio-option"
              :class="{ active: timeDisplayMode === 'realtime' }"
            >
              <input
                type="radio"
                value="realtime"
                v-model="timeDisplayMode"
                @change="updateTimeDisplayMode"
              />
              <div class="radio-content">
                <span class="title">{{ authStore.t.time_realtime }}</span>
                <span class="desc">秒単位でリアルタイムに経過時間を更新します。</span>
              </div>
            </label>
            <label
              class="radio-option"
              :class="{ active: timeDisplayMode === 'none' }"
            >
              <input
                type="radio"
                value="none"
                v-model="timeDisplayMode"
                @change="updateTimeDisplayMode"
              />
              <div class="radio-content">
                <span class="title">{{ authStore.t.time_none }}</span>
                <span class="desc">投稿時刻を表示しません。</span>
              </div>
            </label>
          </div>
        </div>

        <div class="status-messages">
          <p v-if="error" class="error-msg">{{ error }}</p>
          <p v-if="message" class="success-msg">{{ message }}</p>
        </div>
      </div>

      <!-- Cropper Overlay -->
      <div v-if="isCropping" class="cropper-overlay">
        <div class="cropper-container">
          <div class="cropper-header">
            <h3>
              画像を切り抜く ({{
                cropTarget === "avatar" ? "アバター" : "ヘッダー"
              }})
            </h3>
            <button class="close-cropper" @click="closeCropper">
              <X :size="20" />
            </button>
          </div>
          <div class="cropper-body">
            <Cropper
              ref="cropperRef"
              :src="cropImage"
              :stencil-component="
                cropTarget === 'avatar' ? CircleStencil : undefined
              "
              :stencil-props="{
                aspectRatio: cropTarget === 'avatar' ? 1 / 1 : 3 / 1,
              }"
              class="cropper-work"
            />
          </div>
          <div class="cropper-footer">
            <button class="crop-btn" @click="handleCrop">
              <CropIcon :size="18" /> 切り抜きを適用
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(12px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 3000;
  padding: 20px;
}

.settings-window {
  background: var(--surface);
  width: 100%;
  max-width: 1100px;
  height: 90vh;
  border-radius: 24px;
  display: flex;
  overflow: hidden;
  box-shadow: 0 50px 100px rgba(0, 0, 0, 0.5);
  border: 1px solid var(--border);
  position: relative;
}

.mobile-only-header {
  display: none;
}

.settings-sidebar {
  width: 280px;
  background: rgba(var(--surface-rgb), 0.5);
  border-right: 1px solid var(--border);
  padding: 40px 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex-shrink: 0;
}

.sidebar-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 40px;
  padding: 0 10px;
  color: var(--text-primary);
}

.sidebar-header h3 {
  font-size: 22px;
  font-weight: 900;
  letter-spacing: -0.5px;
}

.menu-item {
  padding: 14px 20px;
  border-radius: 14px;
  cursor: pointer;
  font-weight: 700;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  gap: 14px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.menu-item:hover {
  background: rgba(var(--accent-rgb), 0.1);
  color: var(--accent);
  transform: translateX(4px);
}

.menu-item.active {
  background: var(--accent);
  color: white;
  box-shadow: 0 8px 20px rgba(var(--accent-rgb), 0.3);
}

.sidebar-footer {
  margin-top: auto;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.menu-item.logout {
  color: #ff4757;
}

.menu-item.back {
  border-top: 1px solid var(--border);
  padding-top: 1.5rem;
  margin-top: 1rem;
}

.settings-content {
  flex: 1;
  padding: 60px 80px;
  overflow-y: auto;
  text-align: left;
  background: rgba(var(--surface-rgb), 0.3);
  scrollbar-width: thin;
  position: relative;
}

.desktop-close-btn {
  position: absolute;
  top: 24px;
  right: 24px;
  height: 48px;
  padding: 0 20px;
  background: var(--accent);
  border: none;
  border-radius: 50px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  z-index: 100;
  cursor: pointer;
  color: white;
  box-shadow: 0 8px 25px rgba(var(--accent-rgb), 0.4);
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.desktop-close-btn:hover {
  transform: translateY(-4px) scale(1.05);
  filter: brightness(1.1);
}

.section {
  max-width: 800px;
  margin: 0 auto;
  animation: fade-in 0.4s ease-out;
}

@keyframes fade-in {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.section h2 {
  font-size: 2.5rem;
  margin-bottom: 2.5rem;
  font-weight: 900;
  color: var(--text-primary);
  letter-spacing: -1px;
}

/* Profile Preview Card */
.profile-preview-card {
  background: var(--surface);
  border-radius: 24px;
  overflow: hidden;
  border: 1px solid var(--border);
  margin-bottom: 3rem;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.1);
}

.preview-header-box {
  height: 180px;
  background: var(--border);
}
.preview-header {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.preview-info {
  padding: 0 2rem 1.5rem;
  display: flex;
  align-items: flex-end;
  gap: 1.5rem;
  margin-top: -50px;
}

.preview-avatar-box {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  border: 6px solid var(--surface);
  overflow: hidden;
  background: var(--surface);
  box-shadow: 0 8px 20px rgba(0,0,0,0.15);
}

.preview-avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.preview-name {
  font-size: 1.8rem;
  font-weight: 900;
  display: block;
  color: var(--text-primary);
}
.preview-handle {
  color: var(--text-secondary);
  font-size: 1.1rem;
}

/* Form */
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-bottom: 2.5rem;
}
.form-group.full-width {
  grid-column: span 2;
}
.form-group label {
  display: block;
  margin-bottom: 0.8rem;
  font-weight: 700;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

input[type="text"] {
  width: 100%;
  padding: 14px 18px;
  border-radius: 12px;
  border: 2px solid var(--border);
  color: var(--text-primary);
  font-size: 1rem;
  background: var(--surface);
  transition: all 0.2s;
}

input[type="text"]:focus {
  border-color: var(--accent);
  background: rgba(var(--accent-rgb), 0.05);
}

.upload-area {
  border: 2px dashed var(--border);
  border-radius: 20px;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.8rem;
  cursor: pointer;
  color: var(--text-secondary);
  transition: all 0.3s;
  background: rgba(var(--surface-rgb), 0.5);
}
.upload-area:hover {
  border-color: var(--accent);
  color: var(--accent);
  background: rgba(var(--accent-rgb), 0.05);
}
.upload-area.square {
  aspect-ratio: 1/1;
  justify-content: center;
}

.save-btn {
  padding: 14px 40px;
  background: var(--accent);
  color: white;
  border-radius: 50px;
  font-weight: 800;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  box-shadow: 0 8px 20px rgba(var(--accent-rgb), 0.3);
}
.save-btn:hover {
  transform: translateY(-4px) scale(1.05);
  box-shadow: 0 12px 30px rgba(var(--accent-rgb), 0.4);
}

/* Theme Grid */
.theme-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}
.theme-card {
  background: var(--surface);
  border: 3px solid var(--border);
  border-radius: 24px;
  padding: 1.5rem;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  transition: all 0.3s;
}
.theme-card:hover {
  transform: translateY(-5px);
  border-color: var(--accent);
}
.theme-card.active {
  border-color: var(--accent);
  background: rgba(var(--accent-rgb), 0.05);
}
.theme-preview {
  width: 100%;
  height: 80px;
  border-radius: 16px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.preview-line {
  height: 8px;
  border-radius: 4px;
}
.preview-line.short {
  width: 60%;
}
.theme-card.light .theme-preview {
  background: #fff;
  border: 1px solid #eee;
}
.theme-card.light .preview-line {
  background: #eee;
}
.theme-card.dark .theme-preview {
  background: #121212;
}
.theme-card.dark .preview-line {
  background: #333;
}
.theme-card.dim .theme-preview {
  background: #15202b;
}
.theme-card.dim .preview-line {
  background: #38444d;
}

/* Radio Options */
.radio-group {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}
.radio-option {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1.8rem;
  border: 2px solid var(--border);
  border-radius: 24px;
  cursor: pointer;
  transition: all 0.3s;
}
.radio-option:hover {
  border-color: var(--accent);
  background: rgba(var(--surface-rgb), 0.8);
}
.radio-option.active {
  border-color: var(--accent);
  background: rgba(var(--accent-rgb), 0.08);
}
.radio-content .title {
  display: block;
  font-size: 1.2rem;
  font-weight: 900;
  color: var(--text-primary);
  margin-bottom: 4px;
}
.radio-content .desc {
  color: var(--text-secondary);
  font-size: 0.95rem;
}

/* Cropper Overlay */
.cropper-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
  backdrop-filter: blur(10px);
}
.cropper-container {
  background: var(--surface);
  width: 90%;
  max-width: 800px;
  border-radius: 32px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 30px 90px rgba(0,0,0,0.6);
}
.cropper-header {
  padding: 1.5rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--border);
}
.cropper-body {
  flex: 1;
  padding: 1.5rem;
  min-height: 400px;
  max-height: 60vh;
  display: flex;
  justify-content: center;
}
.cropper-work {
  width: 100%;
}
.cropper-footer {
  padding: 1.5rem 2rem;
  display: flex;
  justify-content: flex-end;
  border-top: 1px solid var(--border);
}
.crop-btn {
  padding: 12px 30px;
  background: var(--accent);
  color: white;
  border-radius: 50px;
  font-weight: 800;
  border: none;
  cursor: pointer;
}

.modern-select {
  width: 100%;
  padding: 16px;
  border-radius: 16px;
  border: 2px solid var(--border);
  background: var(--surface);
  color: var(--text-primary);
  font-size: 1.1rem;
  font-weight: 800;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 16px center;
}

.status-messages {
  margin-top: 2rem;
}
.error-msg {
  color: #ff4757;
  font-weight: 800;
  padding: 1rem;
  background: rgba(255, 71, 87, 0.1);
  border-radius: 12px;
}
.success-msg {
  color: #2ed573;
  font-weight: 800;
  padding: 1rem;
  background: rgba(46, 213, 115, 0.1);
  border-radius: 12px;
}

@media (max-width: 800px) {
  .modal-overlay {
    padding: 0;
  }
  .settings-window {
    width: 100%;
    height: 100vh;
    border-radius: 0;
    flex-direction: column;
  }

  .mobile-only-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 15px 20px;
    background: var(--surface);
    border-bottom: 1px solid var(--border);
    position: sticky;
    top: 0;
    z-index: 1000;
    padding-top: calc(15px + env(safe-area-inset-top));
  }
  .mobile-only-header h3 { font-size: 1.2rem; font-weight: 900; }
  .header-close-btn {
    background: var(--accent);
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 50px;
    font-weight: 800;
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.9rem;
  }

  .settings-sidebar {
    width: 100%;
    max-width: none;
    height: auto;
    padding: 10px 15px;
    flex-direction: row;
    overflow-x: auto;
    border-right: none;
    border-bottom: 1px solid var(--border);
    scrollbar-width: none;
  }
  .settings-sidebar::-webkit-scrollbar { display: none; }
  .desktop-only { display: none; }
  .menu-item {
    white-space: nowrap;
    padding: 10px 16px;
    font-size: 0.9rem;
  }
  .settings-content {
    padding: 30px 20px 100px;
    background: var(--surface);
  }
  .section h2 { font-size: 1.8rem; margin-bottom: 1.5rem; }
  .form-grid { grid-template-columns: 1fr; }
  .preview-header-box { height: 120px; }
  .preview-info { margin-top: -40px; }
  .preview-avatar-box { width: 90px; height: 90px; }
  .desktop-close-btn { display: none; }
  .sidebar-footer { margin-top: 0; }
}
</style>
