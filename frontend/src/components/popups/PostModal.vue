<script setup lang="ts">
import { ref, computed } from "vue";
import { useAuthStore } from "../../stores/auth";
import {
  Image,
  Smile,
  Calendar,
  MapPin,
  List,
  BarChart2,
  Upload,
  X,
  FileIcon,
  Film,
  Music,
  Download,
  EyeOff,
} from "lucide-vue-next";
import { uploadAttachments } from "../../utils/upload";

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
const selectedFiles = ref<
  { file: File; options: { downloadable: boolean; blur: boolean } }[]
>([]);
const previews = ref<{ url: string; type: string; name: string }[]>([]);
const isUploading = ref(false);

const MAX_FILE_SIZE = 20 * 1024 * 1024;
const MAX_INLINE_PREVIEW_SIZE = 5 * 1024 * 1024;

const canPost = computed(
  () =>
    (content.value.trim().length > 0 || selectedFiles.value.length > 0) &&
    !isUploading.value,
);

function handleFileSelect(e: Event) {
  const target = e.target as HTMLInputElement;
  if (!target.files) return;

  const files = Array.from(target.files);
  const validFiles: File[] = [];

  files.forEach((file) => {
    if (file.size <= MAX_FILE_SIZE) {
      validFiles.push(file);
    } else {
      alert(
        `ファイルサイズが大きすぎます: ${file.name}\n1ファイル20MBまで添付できます`,
      );
    }
  });

  const nextFiles = [
    ...selectedFiles.value,
    ...validFiles.map((f) => ({
      file: f,
      options: { downloadable: true, blur: false },
    })),
  ].slice(0, 10);

  selectedFiles.value = nextFiles;
  target.value = "";
  updatePreviews();
}

function updatePreviews() {
  previews.value.forEach((preview) => {
    if (preview.url) URL.revokeObjectURL(preview.url);
  });
  previews.value = [];
  selectedFiles.value.forEach(({ file }) => {
    const canPreview =
      file.type.startsWith("image/") && file.size <= MAX_INLINE_PREVIEW_SIZE;

    previews.value.push({
      url: canPreview ? URL.createObjectURL(file) : "",
      type: file.type,
      name: file.name,
    });
  });
}

function removeFile(index: number) {
  const preview = previews.value[index];
  if (preview?.url) URL.revokeObjectURL(preview.url);
  selectedFiles.value.splice(index, 1);
  previews.value.splice(index, 1);
}

function fileOptions(index: number) {
  return selectedFiles.value[index]?.options;
}

function toggleDownloadable(index: number) {
  const options = fileOptions(index);
  if (options) options.downloadable = !options.downloadable;
}

function toggleBlur(index: number) {
  const options = fileOptions(index);
  if (options) options.blur = !options.blur;
}

async function uploadFiles() {
  return uploadAttachments(selectedFiles.value, authStore.token);
}

async function handleSubmit() {
  if (!canPost.value) return;

  try {
    isUploading.value = true;
    const attachments = await uploadFiles();
    emit("submit", { content: content.value, attachment: attachments });
    content.value = "";
    selectedFiles.value = [];
    previews.value.forEach((preview) => {
      if (preview.url) URL.revokeObjectURL(preview.url);
    });
    previews.value = [];
  } catch (err) {
    console.error(err);
    alert("アップロードに失敗しました");
  } finally {
    isUploading.value = false;
  }
}

function handleInput(e: Event) {
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
        <button class="close-btn" @click="emit('close')">
          <X :size="20" />
          <span class="close-label">閉じる</span>
        </button>
        <div class="header-actions">
          <button class="draft-btn">下書き</button>
        </div>
      </div>

      <slot name="header-extra"></slot>

      <div class="modal-body">
        <div class="avatar-col">
          <img
            :src="authStore.user?.avatar_url || '/default-avatar.png'"
            class="user-avatar"
          />
        </div>
        <div class="content-col">
          <textarea
            v-model="content"
            :placeholder="placeholder || authStore.t.whats_happening"
            autofocus
            @input="handleInput"
            @keydown="handleKeydown"
          ></textarea>

          <div v-if="previews.length > 0" class="previews-container">
            <div
              v-for="(file, idx) in previews"
              :key="idx"
              class="preview-item"
            >
              <button class="remove-file" @click="removeFile(idx)">
                <X :size="14" />
              </button>
              <img
                v-if="file.url && file.type.startsWith('image/')"
                :src="file.url"
                class="preview-media"
                :class="{ 'preview-blur': fileOptions(idx)?.blur }"
              />
              <video
                v-else-if="file.url && file.type.startsWith('video/')"
                :src="file.url"
                class="preview-media"
                muted
                :class="{ 'preview-blur': fileOptions(idx)?.blur }"
              ></video>
              <div v-else class="preview-file-icon">
                <FileIcon :size="32" />
                <span class="file-name">{{ file.name }}</span>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <div class="icons-group">
              <input type="file" ref="fileInput" multiple hidden @change="handleFileSelect" />
              <button class="icon-btn" @click="fileInput?.click()">
                <Upload :size="20" />
              </button>
            </div>
            <button
              class="submit-btn"
              :disabled="!canPost || loading || isUploading"
              @click="handleSubmit"
            >
              {{ loading || isUploading ? "送信中..." : btnText || authStore.t.post_btn }}
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
  align-items: flex-start;
  padding-top: 10vh;
  z-index: 2000;
}

.modal-content {
  background: var(--surface);
  color: var(--text-primary);
  width: 95%;
  max-width: 650px;
  border-radius: 24px;
  padding: 20px;
  box-shadow: 0 40px 100px rgba(0, 0, 0, 0.4);
  border: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  animation: modal-pop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes modal-pop {
  from { opacity: 0; transform: scale(0.9) translateY(20px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  position: sticky;
  top: 0;
  background: var(--surface);
  z-index: 10;
}

.close-btn {
  background: var(--accent);
  border: none;
  padding: 8px 20px;
  border-radius: 50px;
  cursor: pointer;
  color: white;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(var(--accent-rgb), 0.3);
}

.close-label {
  font-weight: 800;
  font-size: 0.95rem;
}

.close-btn:hover {
  transform: translateY(-2px);
  filter: brightness(1.1);
}

.draft-btn {
  background: transparent;
  color: var(--accent);
  font-weight: 800;
  font-size: 0.95rem;
  padding: 8px 16px;
  border-radius: 20px;
}

.modal-body {
  display: flex;
  gap: 16px;
  padding: 10px 0;
}

.avatar-col {
  flex-shrink: 0;
}

.user-avatar {
  width: 52px;
  height: 52px;
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
  min-height: 150px;
  border: none;
  outline: none;
  font-size: 1.4rem;
  resize: none;
  background: transparent;
  color: var(--text-primary);
  line-height: 1.4;
  padding: 8px 0;
  font-family: inherit;
}

textarea::placeholder {
  color: var(--text-secondary);
  opacity: 0.5;
}

.modal-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid var(--border);
  padding-top: 20px;
  margin-top: 20px;
}

.icons-group {
  display: flex;
  gap: 8px;
}

.icon-btn {
  background: rgba(var(--accent-rgb), 0.05);
  border: none;
  color: var(--accent);
  padding: 12px;
  border-radius: 14px;
  cursor: pointer;
}

.submit-btn {
  padding: 12px 32px;
  border-radius: 50px;
  background: var(--accent);
  color: white;
  font-weight: 900;
  border: none;
  cursor: pointer;
  font-size: 1.1rem;
  transition: all 0.3s;
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.previews-container {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding: 15px 0;
  scrollbar-width: none;
}

.preview-item {
  position: relative;
  flex-shrink: 0;
  width: 120px;
  height: 120px;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid var(--border);
}

.preview-media {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.remove-file {
  position: absolute;
  top: 4px;
  right: 4px;
  background: rgba(0,0,0,0.6);
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  z-index: 5;
}

@media (max-width: 600px) {
  .modal-overlay {
    padding-top: 0;
  }
  .modal-content {
    width: 100%;
    height: 100vh;
    max-width: none;
    border-radius: 0;
    padding: 15px;
    padding-top: calc(15px + env(safe-area-inset-top));
  }
  textarea {
    font-size: 1.2rem;
    min-height: 200px;
  }
}
</style>
