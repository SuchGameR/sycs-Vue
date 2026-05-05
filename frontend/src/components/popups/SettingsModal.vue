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
const avatar_url = ref("");
const header_url = ref("");
const timelineMode = ref(authStore.timelineMode);
const lang = ref(authStore.lang);
const theme = ref(authStore.theme);
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

async function handleUpdate() {
  try {
    await authStore.updateSettings({
      username: username.value,
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
      <!-- Sidebar -->
      <div class="settings-sidebar">
        <div class="sidebar-header">
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

        <div class="sidebar-footer">
          <div class="menu-item logout" @click="handleLogout">
            <LogOut :size="18" /> {{ authStore.t.signout }}
          </div>
          <div class="menu-item back" @click="emit('close')">
            <X :size="18" /> 閉じる
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="settings-content">
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
                <span class="preview-handle"
                  >@{{ authStore.user?.email.split("@")[0] }}</span
                >
              </div>
            </div>
          </div>

          <div class="form-grid">
            <div class="form-group">
              <label>{{ authStore.t.username }}</label>
              <input v-model="username" type="text" />
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
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 3000;
}

.settings-window {
  background: var(--surface);
  width: 90%;
  max-width: 1100px;
  height: 85vh;
  border-radius: 10px;
  display: flex;
  overflow: hidden;
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.4);
  border: 1px solid var(--border);
  position: relative;
}

.settings-sidebar {
  width: 100%;
  max-width: 280px;
  background: var(--surface);
  border-right: 1px solid var(--border);
  padding: 30px 15px;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.sidebar-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 30px;
  padding: 0 10px;
  color: var(--text-primary);
}

.sidebar-header h3 {
  font-size: 20px;
  font-weight: 800;
  color: var(--text-primary);
}

.menu-item {
  padding: 12px 20px;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  gap: 12px;
  transition: all 0.25s;
}

.menu-item:hover {
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-primary);
}

.menu-item.active {
  background: var(--accent);
  color: white;
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
}

.settings-content {
  flex: 1;
  padding: 3rem 4rem;
  overflow-y: auto;
  text-align: left;
}

.section h2 {
  font-size: 2.5rem;
  margin-bottom: 2rem;
  font-weight: 900;
  color: var(--text-primary);
}

/* Profile Preview Card */
.profile-preview-card {
  background: var(--surface);
  border-radius: 20px;
  overflow: hidden;
  border: 1px solid var(--border);
  margin-bottom: 3rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.preview-header-box {
  height: 160px;
  background: #eee;
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
  margin-top: -40px;
}

.preview-avatar-box {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  border: 5px solid var(--surface);
  overflow: hidden;
  background: var(--surface);
}

.preview-avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.preview-name {
  font-size: 1.5rem;
  font-weight: 800;
  display: block;
}
.preview-handle {
  color: var(--text-secondary);
  font-size: 0.95rem;
}

/* Form */
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
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
}

input[type="text"] {
  width: 100%;
  padding: 1rem;
  border-radius: 10px;
  border: 2px solid var(--border);
  color: var(--text-primary);
  font-size: 1rem;
  background: var(--surface);
}

.upload-area {
  border: 2px dashed var(--border);
  border-radius: 16px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  color: var(--text-secondary);
  transition: all 0.2s;
}
.upload-area:hover {
  border-color: var(--accent);
  color: var(--accent);
}
.upload-area.square {
  aspect-ratio: 1/1;
  justify-content: center;
}

.save-btn {
  padding: 1rem 3rem;
  background: var(--accent);
  color: white;
  border-radius: 50px;
  font-weight: 800;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.8rem;
  transition: transform 0.2s;
}
.save-btn:hover {
  transform: translateY(-4px);
}

/* Theme Grid */
.theme-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  margin-bottom: 2rem;
}
.theme-card {
  background: var(--surface);
  border: 3px solid transparent;
  border-radius: 20px;
  padding: 1rem;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}
.theme-card.active {
  border-color: var(--accent);
}
.theme-preview {
  width: 100%;
  height: 60px;
  border-radius: 12px;
  padding: 0.8rem;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}
.preview-line {
  height: 6px;
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
  gap: 1rem;
}
.radio-option {
  display: flex;
  align-items: flex-start;
  gap: 1.5rem;
  padding: 1.5rem;
  border: 2px solid var(--border);
  border-radius: 20px;
  cursor: pointer;
}
.radio-option.active {
  border-color: var(--accent);
  background: rgba(var(--accent-rgb), 0.05);
}
.radio-content .title {
  display: block;
  font-size: 1.1rem;
  font-weight: 800;
}
.radio-content .desc {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

/* Cropper Overlay */
.cropper-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
}
.cropper-container {
  background: var(--surface);
  width: 80%;
  max-width: 700px;
  border-radius: 24px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.cropper-header {
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--border);
}
.cropper-body {
  flex: 1;
  padding: 1rem;
  min-height: 300px;
  max-height: 50vh;
  display: flex;
  justify-content: center;
}
.cropper-work {
  width: 100%;
}
.cropper-footer {
  padding: 1.5rem;
  display: flex;
  justify-content: flex-end;
  border-top: 1px solid var(--border);
}
.crop-btn {
  padding: 0.8rem 2rem;
  background: var(--accent);
  color: white;
  border-radius: 50px;
  font-weight: 800;
  border: none;
  cursor: pointer;
}

.modern-select {
  width: 100%;
  padding: 1rem;
  border-radius: 12px;
  border: 2px solid var(--border);
  background: var(--surface);
  color: var(--text-primary);
  font-size: 1.1rem;
  font-weight: 700;
}

.status-messages {
  margin-top: 2rem;
}
.error-msg {
  color: #ff4757;
  font-weight: 700;
}
.success-msg {
  color: #2ed573;
  font-weight: 700;
}

@media (max-width: 900px) {
  .settings-window {
    flex-direction: column;
    height: 95vh;
  }
  .settings-sidebar {
    width: 100%;
    flex-direction: row;
    overflow-x: auto;
    padding: 1rem;
  }
  .settings-content {
    padding: 2rem;
  }
  .form-grid {
    grid-template-columns: 1fr;
  }
  .form-group.full-width {
    grid-column: span 1;
  }
}
</style>
