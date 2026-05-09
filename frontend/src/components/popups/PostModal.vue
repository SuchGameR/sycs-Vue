<script setup lang="ts">
import { ref, computed } from "vue";
import { useAuthStore } from "../../stores/auth";
import { Image, Smile, Calendar, MapPin, List, BarChart2, X, FileIcon, Film, Music, Download, EyeOff } from "lucide-vue-next";

const props = defineProps<{
  show: boolean;
  placeholder?: string;
  btnText?: string;
  title?: string;
  loading?: boolean;
}>();

const emit = defineEmits(["close", "submit"]);

const authStore = useAuthStore();
const content = ref("");
const fileInput = ref<HTMLInputElement | null>(null);
const selectedFiles = ref<{ file: File; options: { downloadable: boolean; blur: boolean } }[]>([]);
const previews = ref<{ url: string; type: string; name: string }[]>([]);
const isUploading = ref(false);

const ALLOWED_EXTENSIONS = ['jpeg', 'jpg', 'png', 'gif', 'svg', 'webm', 'mp3', 'wav', 'ogg', 'mp4', 'mov', 'md'];

const canPost = computed(() => (content.value.trim().length > 0 || selectedFiles.value.length > 0) && !isUploading.value);

function handleFileSelect(e: Event) {
  const target = e.target as HTMLInputElement;
  if (!target.files) return;

  const files = Array.from(target.files);
  const validFiles: File[] = [];
  
  files.forEach(file => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext && ALLOWED_EXTENSIONS.includes(ext)) {
      validFiles.push(file);
    } else {
      alert(`非対応のファイル形式です: ${file.name}\n対応形式: ${ALLOWED_EXTENSIONS.join(', ')}`);
    }
  });

  const nextFiles = [...selectedFiles.value, ...validFiles.map(f => ({ 
    file: f, 
    options: { downloadable: true, blur: false } 
  }))].slice(0, 10);
  
  selectedFiles.value = nextFiles;
  updatePreviews();
}

function updatePreviews() {
  previews.value = [];
  selectedFiles.value.forEach(({ file }) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      previews.value.push({
        url: e.target?.result as string,
        type: file.type,
        name: file.name,
      });
    };
    if (file.type.startsWith("image/") || file.type.startsWith("video/") || file.type.startsWith("audio/")) {
      reader.readAsDataURL(file);
    } else {
      previews.value.push({
        url: "",
        type: file.type,
        name: file.name,
      });
    }
  });
}

function removeFile(index: number) {
  selectedFiles.value.splice(index, 1);
  previews.value.splice(index, 1);
}

async function uploadFiles() {
  if (selectedFiles.value.length === 0) return [];

  const formData = new FormData();
  selectedFiles.value.forEach(({ file }) => {
    formData.append("files", file);
  });
  formData.append("options", JSON.stringify(selectedFiles.value.map(f => f.options)));

  const response = await fetch("/api/upload", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${authStore.token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Upload failed");
  }

  return await response.json();
}

async function handleSubmit() {
  if (!canPost.value) return;

  try {
    isUploading.value = true;
    const attachments = await uploadFiles();
    emit("submit", { content: content.value, attachment: attachments });
    content.value = "";
    selectedFiles.value = [];
    previews.value = [];
  } catch (err) {
    console.error(err);
    alert("アップロードに失敗しました");
  } finally {
    isUploading.value = false;
  }
}

function handleInput(e: Event) {
// ...

  const target = e.target as HTMLTextAreaElement;
  target.style.height = "auto";
  target.style.height = Math.min(target.scrollHeight, 300) + "px";
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === "Enter" && !e.shiftKey) {
    if (e.isComposing) return;
    e.preventDefault();
    handleSubmit();
  }
}
</script>

<template>
  <div v-if="show" class="modal-overlay" @click.self="emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <button class="close-btn" @click="emit('close')"><X :size="20" /></button>
        <div class="header-actions">
          <button class="draft-btn">下書き</button>
        </div>
      </div>

      <slot name="header-extra"></slot>

      <div class="modal-body">
        <div class="avatar-col">
          <img :src="authStore.user?.avatar_url || '/kiwibird-discord.png'" class="user-avatar" />
        </div>
        <div class="content-col">
          <textarea
            v-model="content"
            :placeholder="placeholder || authStore.t.whats_happening"
            autofocus
            @input="handleInput"
            @keydown="handleKeydown"
          ></textarea>

          <!-- File Previews -->
          <div v-if="previews.length > 0" class="previews-container">
            <div v-for="(file, idx) in previews" :key="idx" class="preview-item">
              <button class="remove-file" @click="removeFile(idx)"><X :size="14" /></button>
              
              <img v-if="file.type.startsWith('image/')" :src="file.url" class="preview-media" :class="{ 'preview-blur': selectedFiles[idx].options.blur }" />
              <video v-else-if="file.type.startsWith('video/')" :src="file.url" class="preview-media" muted :class="{ 'preview-blur': selectedFiles[idx].options.blur }"></video>
              <div v-else-if="file.type.startsWith('audio/')" class="preview-file-icon audio">
                <Music :size="32" />
                <span class="file-name">{{ file.name }}</span>
              </div>
              <div v-else class="preview-file-icon">
                <FileIcon :size="32" />
                <span class="file-name">{{ file.name }}</span>
              </div>

              <!-- Options Overlay -->
              <div class="preview-options">
                <button 
                  class="opt-btn" 
                  :class="{ active: selectedFiles[idx].options.downloadable }" 
                  @click="selectedFiles[idx].options.downloadable = !selectedFiles[idx].options.downloadable"
                  title="ダウンロード許可"
                >
                  <Download :size="14" />
                </button>
                <button 
                  class="opt-btn" 
                  :class="{ active: selectedFiles[idx].options.blur }" 
                  @click="selectedFiles[idx].options.blur = !selectedFiles[idx].options.blur"
                  title="ぼかし"
                >
                  <EyeOff :size="14" />
                </button>
              </div>
            </div>
          </div>
          
          <div class="modal-footer">
            <div class="icons-group">
              <input
                type="file"
                ref="fileInput"
                multiple
                hidden
                @change="handleFileSelect"
                accept=".jpeg,.jpg,.png,.gif,.svg,.webm,.mp3,.wav,.ogg,.mp4,.mov,.md"
              />
              <button class="icon-btn" title="メディア" @click="fileInput?.click()">
                <Image :size="20" />
              </button>
              <button class="icon-btn" title="GIF"><span class="gif-icon">GIF</span></button>
              <button class="icon-btn" title="投票"><BarChart2 :size="20" /></button>
              <button class="icon-btn" title="絵文字"><Smile :size="20" /></button>
              <button class="icon-btn" title="予約"><Calendar :size="20" /></button>
              <button class="icon-btn" title="場所"><MapPin :size="20" /></button>
            </div>
            <button
              class="submit-btn"
              :disabled="!canPost || loading || isUploading"
              @click="handleSubmit"
            >
              {{ (loading || isUploading) ? '送信中...' : (btnText || authStore.t.post_btn) }}
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
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(2px);
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding-top: 5vh;
  z-index: 2000;
}

.modal-content {
  background: var(--surface);
  color: var(--text-primary);
  width: 95%;
  max-width: 600px;
  border-radius: 16px;
  padding: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  border: 1px solid var(--border);
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.close-btn {
  background: none;
  border: none;
  padding: 8px;
  border-radius: 50%;
  cursor: pointer;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  transition: background 0.2s;
}

.close-btn:hover {
  background: rgba(0, 0, 0, 0.1);
}

.draft-btn {
  background: transparent;
  color: var(--accent);
  font-weight: 700;
  font-size: 0.9rem;
  padding: 6px 12px;
  border-radius: 20px;
}

.draft-btn:hover {
  background: rgba(var(--accent-rgb, 88, 101, 242), 0.1);
}

.modal-body {
  display: flex;
  gap: 12px;
  padding: 8px 4px;
}

.avatar-col {
  flex-shrink: 0;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.content-col {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

textarea {
  width: 100%;
  min-height: 120px;
  border: none;
  outline: none;
  font-size: 1.25rem;
  resize: none;
  background: transparent;
  color: var(--text-primary);
  line-height: 1.5;
  padding: 4px 0;
  font-family: inherit;
}

textarea::placeholder {
  color: var(--text-secondary);
  opacity: 0.6;
}

.modal-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid var(--border);
  padding-top: 12px;
  margin-top: 12px;
}

.icons-group {
  display: flex;
  gap: 2px;
}

.icon-btn {
  background: transparent;
  border: none;
  color: var(--accent);
  padding: 8px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.icon-btn:hover {
  background: rgba(var(--accent-rgb, 88, 101, 242), 0.1);
}

.gif-icon {
  font-size: 0.7rem;
  font-weight: 900;
  border: 2px solid currentColor;
  border-radius: 4px;
  padding: 0 2px;
  line-height: 1;
}

.submit-btn {
  padding: 8px 24px;
  border-radius: 50px;
  background: var(--accent);
  color: white;
  font-weight: 800;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s;
}

.submit-btn:hover:not(:disabled) {
  filter: brightness(1.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.previews-container {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding: 8px 0;
  margin-top: 8px;
  scrollbar-width: thin;
}

.preview-item {
  position: relative;
  flex-shrink: 0;
  width: 120px;
  height: 120px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid var(--border);
  background: var(--background);
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-media {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.preview-media.preview-blur {
  filter: blur(15px);
}

.preview-options {
  position: absolute;
  bottom: 6px;
  left: 6px;
  right: 6px;
  display: flex;
  gap: 4px;
  justify-content: center;
  z-index: 5;
}

.opt-btn {
  background: rgba(0, 0, 0, 0.6);
  color: white;
  border: none;
  border-radius: 4px;
  padding: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  opacity: 0.8;
  transition: all 0.2s;
}

.opt-btn:hover {
  opacity: 1;
  background: rgba(0, 0, 0, 0.9);
}

.opt-btn.active {
  background: var(--accent);
  opacity: 1;
}

.preview-file-icon {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: var(--text-secondary);
  padding: 8px;
  text-align: center;
}

.file-name {
  font-size: 0.7rem;
  word-break: break-all;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.remove-file {
  position: absolute;
  top: 4px;
  right: 4px;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  border: none;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
}

.remove-file:hover {
  background: rgba(0, 0, 0, 0.8);
}

[data-theme="dark"] .close-btn:hover,
[data-theme="dim"] .close-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}
</style>
