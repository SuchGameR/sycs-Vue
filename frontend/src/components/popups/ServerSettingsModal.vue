<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { useAuthStore } from "../../stores/auth";
import {
  Settings as SettingsIcon,
  X,
  Upload,
  CheckCircle2,
  Crop as CropIcon,
  Layout,
  Globe,
  Palette
} from "lucide-vue-next";
import { Cropper, CircleStencil } from "vue-advanced-cropper";
import "vue-advanced-cropper/dist/style.css";

const props = defineProps<{
  show: boolean;
  server: any;
}>();

const emit = defineEmits(["close", "updated"]);

const authStore = useAuthStore();
const activeMenu = ref("overview");

const serverName = ref("");
const serverIcon = ref("");
const serverHeader = ref("");
const visibility = ref("public");

const error = ref("");
const message = ref("");

// Cropper State
const isCropping = ref(false);
const cropTarget = ref<"icon" | "header" | null>(null);
const cropImage = ref<string | null>(null);
const cropperRef = ref<any>(null);

const iconInput = ref<HTMLInputElement | null>(null);
const headerInput = ref<HTMLInputElement | null>(null);

onMounted(() => {
  if (props.server) {
    initFields();
  }
});

watch(() => props.server, (newVal) => {
  if (newVal) initFields();
}, { deep: true });

function initFields() {
  serverName.value = props.server.name || "";
  serverIcon.value = props.server.icon || "";
  serverHeader.value = props.server.header || "";
  visibility.value = props.server.serversettings?.visibility || "public";
}

// Image Selection
function onFileSelect(event: Event, target: "icon" | "header") {
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
      const file = new File([blob], `cropped_server_${Date.now()}.png`, {
        type: "image/png",
      });

      try {
        const formData = new FormData();
        const fieldName = cropTarget.value === "icon" ? "icon" : "header";
        formData.append(fieldName, file);

        const endpoint = cropTarget.value === "icon" ? "upload-icon" : "upload-header";
        const res = await fetch(`http://${window.location.hostname}:3001/api/servers/${props.server.id}/${endpoint}`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${authStore.token}`,
          },
          body: formData,
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Upload failed");

        if (cropTarget.value === "icon") {
          serverIcon.value = data.icon;
        } else {
          serverHeader.value = data.header;
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
  if (iconInput.value) iconInput.value.value = "";
  if (headerInput.value) headerInput.value.value = "";
}

async function handleUpdate() {
  try {
    const res = await fetch(`http://${window.location.hostname}:3001/api/servers/${props.server.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authStore.token}`,
      },
      body: JSON.stringify({
        name: serverName.value,
        settings: {
          visibility: visibility.value
        }
      }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Update failed");

    message.value = "サーバー設定を更新しました";
    error.value = "";
    emit("updated", data);
    setTimeout(() => {
      message.value = "";
    }, 3000);
  } catch (err: any) {
    error.value = err.message;
    message.value = "";
  }
}
</script>

<template>
  <div v-if="show" class="modal-overlay" @click.self="emit('close')">
    <div class="settings-window">
      <!-- Sidebar -->
      <div class="settings-sidebar">
        <div class="sidebar-header">
          <SettingsIcon :size="20" />
          <h3>サーバー設定</h3>
        </div>
        <div
          class="menu-item"
          :class="{ active: activeMenu === 'overview' }"
          @click="activeMenu = 'overview'"
        >
          <Layout :size="18" /> 概要
        </div>
        <div
          class="menu-item"
          :class="{ active: activeMenu === 'visibility' }"
          @click="activeMenu = 'visibility'"
        >
          <Globe :size="18" /> 公開設定
        </div>

        <div class="sidebar-footer">
          <div class="menu-item back" @click="emit('close')">
            <X :size="18" /> 閉じる
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="settings-content">
        <!-- Overview Section -->
        <div v-if="activeMenu === 'overview'" class="section">
          <h2>サーバー概要</h2>

          <!-- Preview Card -->
          <div class="server-preview-card">
            <div class="preview-header-box">
              <img :src="serverHeader || '/image.png'" class="preview-header" />
            </div>
            <div class="preview-info">
              <div class="preview-icon-box">
                <img
                  :src="serverIcon || '/default-avatar.png'"
                  class="preview-icon"
                />
              </div>
              <div class="preview-text">
                <span class="preview-name">{{ serverName || "Server Name" }}</span>
                <span class="preview-meta">ID: {{ props.server.serverid }}</span>
              </div>
            </div>
          </div>

          <div class="form-grid">
            <div class="form-group full-width">
              <label>サーバー名</label>
              <input v-model="serverName" type="text" />
            </div>

            <div class="form-group full-width">
              <label>サーバーヘッダー (3:1)</label>
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
              <label>サーバーアイコン (1:1)</label>
              <div class="upload-area square" @click="iconInput?.click()">
                <Upload :size="24" />
                <span>アイコン</span>
                <input
                  ref="iconInput"
                  type="file"
                  hidden
                  accept="image/*"
                  @change="onFileSelect($event, 'icon')"
                />
              </div>
            </div>
          </div>

          <button class="save-btn" @click="handleUpdate">
            <CheckCircle2 :size="18" /> 保存
          </button>
        </div>

        <!-- Visibility Section -->
        <div v-if="activeMenu === 'visibility'" class="section">
          <h2>公開設定</h2>
          <div class="radio-group">
            <label class="radio-option" :class="{ active: visibility === 'public' }">
              <input type="radio" value="public" v-model="visibility" />
              <div class="radio-content">
                <span class="title">公開</span>
                <span class="desc">誰でも見つけて参加できます。</span>
              </div>
            </label>
            <label class="radio-option" :class="{ active: visibility === 'private' }">
              <input type="radio" value="private" v-model="visibility" />
              <div class="radio-content">
                <span class="title">非公開</span>
                <span class="desc">サーバー一覧に表示されません。</span>
              </div>
            </label>
            <label class="radio-option" :class="{ active: visibility === 'limited' }">
              <input type="radio" value="limited" v-model="visibility" />
              <div class="radio-content">
                <span class="title">限定</span>
                <span class="desc">招待された人のみが参加できます。</span>
              </div>
            </label>
          </div>
          <button class="save-btn" @click="handleUpdate" style="margin-top: 2rem;">
            <CheckCircle2 :size="18" /> 保存
          </button>
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
            <h3>画像を切り抜く</h3>
            <button class="close-cropper" @click="closeCropper">
              <X :size="20" />
            </button>
          </div>
          <div class="cropper-body">
            <Cropper
              ref="cropperRef"
              :src="cropImage"
              :stencil-component="cropTarget === 'icon' ? CircleStencil : undefined"
              :stencil-props="{
                aspectRatio: cropTarget === 'icon' ? 1 / 1 : 3 / 1,
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

.server-preview-card {
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

.preview-icon-box {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  border: 5px solid var(--surface);
  overflow: hidden;
  background: var(--surface);
}

.preview-icon {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.preview-name {
  font-size: 1.5rem;
  font-weight: 800;
  display: block;
}
.preview-meta {
  color: var(--text-secondary);
  font-size: 0.8rem;
}

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
}
</style>