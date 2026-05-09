<script setup lang="ts">
import { ref, computed } from "vue";
import { useAuthStore } from "../../stores/auth";
import {
  Image,
  Upload,
  List,
  BarChart2,
  X,
  FileIcon,
  Film,
  Music,
} from "lucide-vue-next";

const props = defineProps<{
  loading?: boolean;
}>();

const authStore = useAuthStore();
const content = ref("");
const fileInput = ref<HTMLInputElement | null>(null);
const selectedFiles = ref<File[]>([]);
const previews = ref<{ url: string; type: string; name: string }[]>([]);
const isUploading = ref(false);
const emit = defineEmits(["submit"]);

const canPost = computed(
  () =>
    (content.value.trim().length > 0 || selectedFiles.value.length > 0) &&
    !isUploading.value,
);

function handleFileSelect(e: Event) {
  const target = e.target as HTMLInputElement;
  if (!target.files) return;

  const files = Array.from(target.files);
  selectedFiles.value = [...selectedFiles.value, ...files].slice(0, 10);

  files.forEach((file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      previews.value.push({
        url: e.target?.result as string,
        type: file.type,
        name: file.name,
      });
    };
    if (
      file.type.startsWith("image/") ||
      file.type.startsWith("video/") ||
      file.type.startsWith("audio/")
    ) {
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
  selectedFiles.value.forEach((file) => {
    formData.append("files", file);
  });

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
  if (!canPost.value || props.loading || isUploading.value) return;

  try {
    isUploading.value = true;
    const attachments = await uploadFiles();
    emit("submit", { content: content.value, attachment: attachments });
    content.value = "";
    selectedFiles.value = [];
    previews.value = [];

    // Reset height
    const textarea = document.querySelector(
      ".inline-post textarea",
    ) as HTMLTextAreaElement;
    if (textarea) textarea.style.height = "auto";
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
  target.style.height = target.scrollHeight + "px";
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
    // Prevent sending during IME composition
    if (e.isComposing) return;

    e.preventDefault();
    handleSubmit();
  }
}
</script>

<template>
  <div class="inline-post">
    <div class="post-layout">
      <div class="avatar-col">
        <img
          :src="authStore.user?.avatar_url || '/kiwibird-discord.png'"
          class="user-avatar"
        />
      </div>
      <div class="content-col">
        <textarea
          v-model="content"
          :placeholder="authStore.t.whats_happening + ' (Ctrl+Enterで送信)'"
          rows="1"
          @input="handleInput"
          @keydown="handleKeydown"
        ></textarea>

        <!-- File Previews -->
        <div v-if="previews.length > 0" class="previews-container">
          <div v-for="(file, idx) in previews" :key="idx" class="preview-item">
            <button class="remove-file" @click="removeFile(idx)">
              <X :size="14" />
            </button>

            <img
              v-if="file.type.startsWith('image/')"
              :src="file.url"
              class="preview-media"
            />
            <video
              v-else-if="file.type.startsWith('video/')"
              :src="file.url"
              class="preview-media"
              muted
            ></video>
            <div
              v-else-if="file.type.startsWith('audio/')"
              class="preview-file-icon audio"
            >
              <Music :size="24" />
              <span class="file-name">{{ file.name }}</span>
            </div>
            <div v-else class="preview-file-icon">
              <FileIcon :size="24" />
              <span class="file-name">{{ file.name }}</span>
            </div>
          </div>
        </div>

        <div class="actions-row">
          <div class="icons-group">
            <input
              type="file"
              ref="fileInput"
              multiple
              hidden
              @change="handleFileSelect"
              accept="image/*,video/*,audio/*,.md,text/markdown,text/plain,application/pdf"
            />
            <button
              class="icon-btn"
              title="ファイルを添付"
              @click="fileInput?.click()"
            >
              <Upload :size="20" />
            </button>
          </div>
          <button
            class="submit-btn"
            :disabled="!canPost || loading || isUploading"
            @click="handleSubmit"
          >
            {{ loading || isUploading ? "..." : authStore.t.post_btn }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@container small (max-width: 500px) {
  .user-avatar {
    width: 40px;
    height: 40px;
  }
  .icons-group {
    display: none;
  }
}

.previews-container {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding: 8px 0;
  margin-bottom: 8px;
  scrollbar-width: thin;
}

.preview-item {
  position: relative;
  flex-shrink: 0;
  width: 100px;
  height: 100px;
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

.preview-file-icon {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  color: var(--text-secondary);
  padding: 4px;
  text-align: center;
}

.preview-file-icon.audio {
  color: #ff9f43;
}

.file-name {
  font-size: 0.6rem;
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
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
}

.remove-file:hover {
  background: rgba(0, 0, 0, 0.8);
}

.inline-post {
  padding: 16px;
  border-bottom: 1px solid var(--border);
  background: var(--surface);
  width: 100%;
  container-name: small;
}

.post-layout {
  display: flex;
  gap: 12px;
}

.avatar-col {
  flex-shrink: 0;
}

.user-avatar {
  width: 48px;
  height: 48px;
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
  border: none;
  background: transparent;
  color: var(--text-primary);
  font-size: 1.25rem;
  font-family: inherit;
  resize: none;
  padding: 12px 0;
  outline: none;
  min-height: 52px;
  line-height: 1.5;
}

textarea::placeholder {
  color: var(--text-secondary);
  opacity: 0.6;
}

.actions-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid var(--border);
  margin-top: 4px;
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
  background: var(--accent);
  color: white;
  border: none;
  padding: 8px 24px;
  border-radius: 50px;
  font-weight: 800;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.submit-btn:not(:disabled):hover {
  filter: brightness(1.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

[data-theme="dark"] .icon-btn:hover,
[data-theme="dim"] .icon-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}
</style>
