<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import {
  FileIcon,
  Download,
  Music,
  Film,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from "lucide-vue-next";
import { marked } from "marked";
import DOMPurify from "dompurify";

const props = defineProps<{
  attachments: any[];
}>();

const revealed = ref<Record<string, boolean>>({});
const showMd = ref<Record<number, boolean>>({});
const mdContent = ref<Record<number, string>>({});

async function fetchMd(url: string, index: number) {
  if (mdContent.value[index]) {
    showMd.value[index] = !showMd.value[index];
    return;
  }

  try {
    const res = await fetch(url);
    const text = await res.text();
    mdContent.value[index] = DOMPurify.sanitize(await marked.parse(text));
    showMd.value[index] = true;
  } catch (e) {
    console.error("Failed to fetch markdown:", e);
  }
}

function getGridClass(count: number) {
  if (count === 1) return "grid-1";
  if (count === 2) return "grid-2";
  if (count === 3) return "grid-3";
  return "grid-4";
}

const images = computed(
  () =>
    props.attachments?.filter((a) => a.mimetype?.startsWith("image/")) || [],
);
const videos = computed(
  () =>
    props.attachments?.filter((a) => a.mimetype?.startsWith("video/")) || [],
);
const audios = computed(
  () =>
    props.attachments?.filter((a) => a.mimetype?.startsWith("audio/")) || [],
);
const documents = computed(
  () =>
    props.attachments?.filter(
      (a) =>
        !a.mimetype?.startsWith("image/") &&
        !a.mimetype?.startsWith("video/") &&
        !a.mimetype?.startsWith("audio/"),
    ) || [],
);
</script>

<template>
  <div
    class="media-preview-container"
    v-if="attachments && attachments.length > 0"
  >
    <!-- Image Grid -->
    <div
      v-if="images.length > 0"
      class="image-grid"
      :class="getGridClass(images.length)"
    >
      <div
        v-for="(img, idx) in images.slice(0, 4)"
        :key="idx"
        class="image-wrapper"
        :class="{ 'is-blurred': img.options?.blur && !revealed[img.url] }"
      >
        <img
          :src="img.optimizedUrl || img.url"
          class="media-content"
          loading="lazy"
        />
        <div
          v-if="img.options?.blur && !revealed[img.url]"
          class="blur-overlay"
          @click="revealed[img.url] = true"
        >
          <span class="blur-text">クリックで表示</span>
        </div>
        <a
          v-if="img.options?.downloadable !== false"
          :href="img.url"
          download
          :title="img.originalName"
          class="download-overlay"
        >
          <Download :size="16" />
        </a>
      </div>
    </div>

    <!-- Videos -->
    <div v-if="videos.length > 0" class="video-list">
      <div
        v-for="(video, idx) in videos"
        :key="idx"
        class="video-wrapper"
        :class="{ 'is-blurred': video.options?.blur && !revealed[video.url] }"
      >
        <div
          v-if="video.options?.blur && !revealed[video.url]"
          class="blur-overlay video"
          @click="revealed[video.url] = true"
        >
          <Film :size="48" />
          <span class="blur-text">クリックで表示 (閲覧注意)</span>
        </div>
        <video v-else :src="video.url" controls class="media-video"></video>
        <div class="file-info">
          <span class="file-name">{{ video.originalName }}</span>
          <a
            v-if="video.options?.downloadable !== false"
            :href="video.url"
            download
            class="icon-link"
            ><Download :size="16"
          /></a>
        </div>
      </div>
    </div>

    <!-- Audios -->
    <div v-if="audios.length > 0" class="audio-list">
      <div v-for="(audio, idx) in audios" :key="idx" class="audio-wrapper">
        <div class="audio-header">
          <Music :size="20" />
          <span class="file-name">{{ audio.originalName }}</span>
          <a
            v-if="audio.options?.downloadable !== false"
            :href="audio.url"
            download
            class="icon-link"
            ><Download :size="16"
          /></a>
        </div>
        <audio :src="audio.url" controls class="media-audio"></audio>
      </div>
    </div>

    <!-- Documents / Markdown -->
    <div v-if="documents.length > 0" class="document-list">
      <div v-for="(doc, idx) in documents" :key="idx" class="document-wrapper">
        <div class="document-header">
          <FileIcon :size="20" />
          <span class="file-name">{{ doc.originalName }}</span>
          <div class="doc-actions">
            <button
              v-if="doc.originalName.endsWith('.md')"
              class="text-btn"
              @click="fetchMd(doc.url, idx)"
            >
              <component
                :is="showMd[idx] ? ChevronUp : ChevronDown"
                :size="16"
              />
              {{ showMd[idx] ? "閉じる" : "プレビュー" }}
            </button>
            <a
              v-if="doc.options?.downloadable !== false"
              :href="doc.url"
              download
              class="icon-link"
              ><Download :size="16"
            /></a>
          </div>
        </div>
        <div
          v-if="showMd[idx]"
          class="md-preview markdown-body"
          v-html="mdContent[idx]"
        ></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.media-preview-container {
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow: hidden;
  border-radius: 16px;
  width: 100%;
  max-width: var(--preview-max-size);
  height: auto;
}

/* Blur effect */
.image-wrapper.is-blurred .media-content {
  filter: blur(40px);
  cursor: pointer;
}

.blur-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  z-index: 5;
  cursor: pointer;
}

.blur-overlay.video {
  background: rgba(0, 0, 0, 0.8);
}

.blur-text {
  font-weight: 800;
  font-size: 0.9rem;
  background: rgba(0, 0, 0, 0.6);
  padding: 4px 12px;
  border-radius: 20px;
  margin-top: 8px;
}

/* Image Grid */
.image-grid {
  display: grid;
  gap: 2px;

  border: 1px solid var(--border);
  /* aspect-ratio: 16 / 9; */
}

.image-grid.grid-1 {
  grid-template-columns: 1fr;
  /* aspect-ratio: auto; */
  /* max-height: 500px; */
}
.image-grid.grid-2 {
  grid-template-columns: 1fr 1fr;
}
.image-grid.grid-3 {
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
}
.image-grid.grid-3 .image-wrapper:first-child {
  grid-row: span 2;
}
.image-grid.grid-4 {
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
}

.image-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
}

.media-content {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.grid-1 .media-content {
  object-fit: contain;
  background: rgba(0, 0, 0, 0.05);
}

.download-overlay {
  position: absolute;
  bottom: 8px;
  right: 8px;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  padding: 6px;
  border-radius: 50%;
  opacity: 0;
  transition: opacity 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-wrapper:hover .download-overlay {
  opacity: 1;
}

/* Video */
.video-wrapper {
  position: relative;
  border: 1px solid var(--border);
  border-radius: 12px;
  overflow: hidden;
  background: black;
}

.media-video {
  width: 100%;
  display: block;
  max-height: 500px;
  position: relative;
  color: white;
}

.file-info {
  padding: 8px 12px;
  background: linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7));
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: white;
  border-top: 1px solid var(--border);
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  opacity: 0;
  transition: opacity 0.2s;
}

.video-wrapper .icon-link {
  color: white;
}

.video-wrapper:hover .file-info {
  opacity: 1;
}

/* Audio */
.audio-wrapper {
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 12px;
  background: var(--surface);
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.audio-header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.media-audio {
  width: 100%;
  height: 32px;
}

/* Document */
.document-wrapper {
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--surface);
  overflow: hidden;
}

.document-header {
  padding: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.file-name {
  flex: 1;
  font-size: 0.9rem;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.doc-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.text-btn {
  background: transparent;
  border: none;
  color: var(--accent);
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
}

.icon-link {
  color: var(--text-secondary);
  display: flex;
  align-items: center;
}

.icon-link:hover {
  color: var(--accent);
}

.md-preview {
  padding: 16px;
  background: var(--background);
  border-top: 1px solid var(--border);
  max-height: 300px;
  overflow-y: auto;
  font-size: 0.9rem;
}
</style>
