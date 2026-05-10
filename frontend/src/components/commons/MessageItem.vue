<script setup lang="ts">
import { computed, ref, onMounted, watch, onUnmounted } from "vue";
import { marked } from "marked";
import DOMPurify from "dompurify";
import {
  Reply,
  Smile,
  MoreHorizontal,
  CornerDownRight,
  Copy,
  Check,
  Pencil,
  Trash2,
  X,
  MoreVertical,
  Heart,
  Repeat2,
  Share,
  BarChart3,
  Info,
} from "lucide-vue-next";
import { useAuthStore } from "../../stores/auth";
import MessageDetailsModal from "../popups/MessageDetailsModal.vue";
import { useRouter } from "vue-router";
import UserProfileCard from "./UserProfileCard.vue";
import MediaPreview from "./MediaPreview.vue";
import { getHighlighter } from "../../utils/shiki";

const props = defineProps<{
  msg: any;
  isReply?: boolean;
  variant?: "discord" | "twitter";
}>();

const emit = defineEmits(["reply", "react", "edit", "delete"]);

const authStore = useAuthStore();
const router = useRouter();
const showEmojiPicker = ref(false);
const highlightedHtml = ref("");
const isCopying = ref(false);
const showDetailsModal = ref(false);
const showEditHistory = ref(false);

// Hover Profile Card State
const showProfileCard = ref(false);
const cardPosition = ref({ top: 0, left: 0 });
let hoverTimer: any = null;

function handleMouseEnter(e: MouseEvent) {
  clearTimeout(hoverTimer);
  hoverTimer = setTimeout(() => {
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    cardPosition.value = {
      top: rect.bottom + 5,
      left: rect.left,
    };
    showProfileCard.value = true;
  }, 400);
}

function handleMouseLeave() {
  clearTimeout(hoverTimer);
  hoverTimer = setTimeout(() => {
    showProfileCard.value = false;
  }, 300);
}

function goToProfile() {
  const handle = props.msg.author_handle || props.msg.email?.split("@")[0];
  if (handle) {
    router.push(`/user/${handle}`);
  }
}

// Edit State
const isEditing = ref(false);
const editContent = ref(props.msg.content);
const editInput = ref<HTMLTextAreaElement | null>(null);

// Context Menu State
const showContextMenu = ref(false);
const menuPos = ref({ x: 0, y: 0 });

function escapeHtml(unsafe: string) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

async function renderContent() {
  const highlighter = await getHighlighter();
  const contentToRender = props.msg.content || "";

  let processed = contentToRender.replace(
    /[&<>"']/g,
    (m) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
      })[m] || m,
  );

  processed = processed.replace(
    /@([a-zA-Z0-9_]+)/g,
    '<a href="#" class="mention">@$1</a>',
  );

  const renderer = new marked.Renderer();
  renderer.code = ({ text, lang }) => {
    const theme = authStore.theme === "light" ? "github-light" : "github-dark";
    try {
      const html = highlighter.codeToHtml(text, {
        lang: lang || "text",
        theme,
      });
      return `<div class="code-block-wrapper"><div class="code-lang">${lang || "text"}</div>${html}</div>`;
    } catch (e) {
      return `<pre><code>${text}</code></pre>`;
    }
  };
  renderer.link = ({ href, title, text }) => {
    return `<a href="${href}" title="${title || ""}" target="_blank" rel="noopener noreferrer">${text}</a>`;
  };
  const rawHtml = await marked.parse(processed, {
    renderer,
    async: true,
    breaks: true,
    gfm: true,
  });
  highlightedHtml.value = DOMPurify.sanitize(rawHtml, {
    ADD_ATTR: ["target", "class", "rel"],
  });
}

onMounted(() => {
  renderContent();
  window.addEventListener("click", closeMenus);
});

onUnmounted(() => {
  window.removeEventListener("click", closeMenus);
});

watch(
  () => props.msg.content,
  () => {
    renderContent();
    editContent.value = props.msg.content;
  },
);

watch(
  () => authStore.theme,
  () => {
    renderContent();
  },
);

const emojis = [
  "👍",
  "❤️",
  "😂",
  "😮",
  "😢",
  "🔥",
  "🚀",
  "✅",
  "👀",
  "✨",
  "🎉",
  "💯",
];

function handleReact(emoji: string) {
  emit("react", props.msg.id, emoji);
  showEmojiPicker.value = false;
  showContextMenu.value = false;
}

function handleReply() {
  emit("reply", props.msg);
  showContextMenu.value = false;
}

function startEdit() {
  isEditing.value = true;
  showContextMenu.value = false;
  setTimeout(() => editInput.value?.focus(), 50);
}

function cancelEdit() {
  isEditing.value = false;
  editContent.value = props.msg.content;
}

async function submitEdit() {
  if (!editContent.value.trim() || editContent.value === props.msg.content) {
    cancelEdit();
    return;
  }
  emit("edit", props.msg.id, editContent.value);
  isEditing.value = false;
}

function handleDelete() {
  if (confirm("このメッセージを削除しますか？")) {
    emit("delete", props.msg.id);
  }
  showContextMenu.value = false;
}

function openContextMenu(e: MouseEvent) {
  e.preventDefault();
  menuPos.value = { x: e.clientX, y: e.clientY };
  showContextMenu.value = true;
}

function closeMenus() {
  showContextMenu.value = false;
  showEmojiPicker.value = false;
}

function copyToClipboard() {
  navigator.clipboard.writeText(props.msg.content);
  isCopying.value = true;
  showContextMenu.value = false;
  setTimeout(() => (isCopying.value = false), 2000);
}

const isAuthor = computed(() => authStore.user?.id === props.msg.user_id);
const hasMyReaction = (emoji: string) =>
  (props.msg.reactions?.[emoji] || []).includes(authStore.user?.id);

function parseMessageDate(rawDate: string) {
  let dateStr = rawDate;
  if (typeof dateStr === "string") {
    const hasTZ = /Z|[+-]\d{2}(?::?\d{2})?$/.test(dateStr);
    if (!hasTZ) {
      dateStr = dateStr.replace(" ", "T") + "Z";
    } else if (dateStr.includes(" ") && !dateStr.includes("T")) {
      dateStr = dateStr.replace(" ", "T");
    }
  }
  return new Date(dateStr);
}

function formatMessageTimestamp(rawDate: string) {
  if (!rawDate) return "";

  const date = parseMessageDate(rawDate);
  const now = new Date();
  const locale = authStore.lang === "ja" ? "ja-JP" : undefined;
  const hourCycle = authStore.lang === "ja" ? "h24" : undefined;

  return date.toLocaleDateString() === now.toLocaleDateString()
    ? date.toLocaleTimeString(locale, {
        hour: "2-digit",
        minute: "2-digit",
        hourCycle,
      })
    : date.toLocaleDateString(locale);
}
</script>

<template>
  <div class="message-item-root" style="display: contents;">
    <div
      class="message-container"
    :class="{
      'is-reply': isReply,
      'is-editing': isEditing,
      'variant-twitter': variant === 'twitter',
      'variant-discord': variant !== 'twitter',
    }"
    @contextmenu="openContextMenu"
  >
    <!-- Action Bar (Discord Style - Top Right) -->
    <div
      v-if="!isEditing && !isReply && variant !== 'twitter'"
      class="message-actions-bar"
    >
      <button class="action-btn" @click="handleReply" title="返信">
        <Reply :size="18" />
      </button>
      <div class="emoji-trigger">
        <button
          class="action-btn"
          @click.stop="showEmojiPicker = !showEmojiPicker"
          title="リアクション"
        >
          <Smile :size="18" />
        </button>
        <div v-if="showEmojiPicker" class="emoji-picker mini">
          <span
            v-for="e in emojis.slice(0, 6)"
            :key="e"
            @click="handleReact(e)"
            class="picker-emoji"
            >{{ e }}</span
          >
          <button class="more-emojis" @click.stop="showContextMenu = true">
            ...
          </button>
        </div>
      </div>
      <button
        v-if="isAuthor"
        class="action-btn"
        @click="startEdit"
        title="編集"
      >
        <Pencil :size="18" />
      </button>
      <button
        v-if="isAuthor"
        class="action-btn delete"
        @click="handleDelete"
        title="削除"
      >
        <Trash2 :size="18" />
      </button>
      <button class="action-btn" @click.stop="openContextMenu" title="その他">
        <MoreHorizontal :size="18" />
      </button>
    </div>

    <!-- Parent Reply Reference -->
    <div v-if="msg.parent_msg && !isReply" class="reply-reference">
      <CornerDownRight :size="14" class="reply-icon" />
      <span class="reply-author">{{ msg.parent_msg.author_name }}</span>
      <span class="reply-preview">{{ msg.parent_msg.content }}</span>
    </div>

    <div class="message-main">
      <div class="avatar-column">
        <img
          :src="msg.avatar_url || '/default-avatar.png'"
          class="author-avatar"
          @mouseenter="handleMouseEnter"
          @mouseleave="handleMouseLeave"
          @click.stop="goToProfile"
        />
      </div>
      <div class="content-column">
        <div class="message-header">
          <div class="header-left">
            <span
              class="author-name"
              @mouseenter="handleMouseEnter"
              @mouseleave="handleMouseLeave"
              @click.stop="goToProfile"
              >{{ msg.author_name }}</span
            >
            <span v-if="msg.author_handle" class="author-handle"
              >@{{ msg.author_handle }}</span
            >
            <span class="dot">·</span>
            <span class="timestamp">{{
              formatMessageTimestamp(msg.created_at)
            }}</span>
            <span
              v-if="msg.edit_history?.length > 0"
              class="edited-tag"
              @click.stop="showEditHistory = true"
              >(編集済)</span
            >
          </div>
          <button
            v-if="variant === 'twitter'"
            class="more-btn-twitter"
            @click.stop="openContextMenu"
          >
            <MoreHorizontal :size="18" />
          </button>
        </div>

        <!-- Normal Display -->
        <div
          v-if="!isEditing"
          class="message-body markdown-body"
          v-html="highlightedHtml"
        ></div>

        <!-- Attachments -->
        <MediaPreview v-if="msg.attachment" :attachments="msg.attachment" />

        <!-- Inline Edit UI -->
        <div v-else class="edit-ui">
          <textarea
            ref="editInput"
            v-model="editContent"
            @keydown.enter.prevent="submitEdit"
            @keydown.esc="cancelEdit"
          ></textarea>
          <div class="edit-controls">
            <span
              >Escで<button class="link-btn" @click="cancelEdit">
                キャンセル
              </button>
              • Enterで<button class="link-btn save" @click="submitEdit">
                保存
              </button></span
            >
          </div>
        </div>

        <!-- Twitter Style Actions Row -->
        <div v-if="variant === 'twitter' && !isEditing" class="tweet-actions">
          <button
            class="tweet-action-btn reply"
            @click.stop="handleReply"
            title="返信"
          >
            <div class="icon-circle"><Reply :size="18" /></div>
            <span class="action-count" v-if="msg.reply_count">{{
              msg.reply_count
            }}</span>
          </button>
          <button class="tweet-action-btn retweet" title="リポスト">
            <div class="icon-circle"><Repeat2 :size="18" /></div>
            <span class="action-count" v-if="msg.retweet_count">{{
              msg.retweet_count
            }}</span>
          </button>
          <button
            class="tweet-action-btn like"
            :class="{ active: hasMyReaction('❤️') }"
            @click.stop="handleReact('❤️')"
            title="いいね"
          >
            <div class="icon-circle">
              <Heart
                :size="18"
                :fill="hasMyReaction('❤️') ? 'currentColor' : 'none'"
              />
            </div>
            <span class="action-count" v-if="msg.reactions?.['❤️']?.length">{{
              msg.reactions["❤️"].length
            }}</span>
          </button>
          <button class="tweet-action-btn views" title="表示件数">
            <div class="icon-circle"><BarChart3 :size="18" /></div>
            <span class="action-count">{{
              Math.floor(Math.random() * 1000)
            }}</span>
          </button>
          <button
            class="tweet-action-btn share"
            @click.stop="copyToClipboard"
            title="共有"
          >
            <div class="icon-circle"><Share :size="18" /></div>
          </button>
        </div>

        <!-- Reactions (Discord Style) -->
        <div
          v-if="
            variant !== 'twitter' &&
            msg.reactions &&
            Object.keys(msg.reactions).length > 0
          "
          class="reactions-list"
        >
          <div
            v-for="(users, emoji) in msg.reactions"
            :key="emoji"
            class="reaction-badge"
            :class="{ active: hasMyReaction(emoji) }"
            @click="handleReact(emoji)"
          >
            <span class="emoji">{{ emoji }}</span>
            <span class="count">{{ users.length }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit History Popup -->
    <Teleport to="body">
      <div
        v-if="showEditHistory"
        class="history-overlay"
        @click="showEditHistory = false"
      >
        <div class="history-popup" @click.stop>
          <div class="history-header">
            <h3>編集履歴</h3>
            <button @click="showEditHistory = false" class="close-history">
              <X :size="20" />
            </button>
          </div>
          <div class="history-list">
            <div
              v-for="(item, idx) in msg.edit_history"
              :key="idx"
              class="history-item"
            >
              <div class="history-time">
                {{ new Date(item.edited_at).toLocaleString() }}
              </div>
              <div class="history-content">
                {{ item.content }}
              </div>
            </div>
            <!-- Current version -->
            <div class="history-item current">
              <div class="history-time">現在</div>
              <div class="history-content">
                {{ msg.content }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Context Menu -->
    <Teleport to="body">
      <div
        v-if="showContextMenu"
        class="context-menu"
        :style="{ top: menuPos.y + 'px', left: menuPos.x + 'px' }"
        @click.stop
      >
        <div class="menu-section emoji-strip">
          <span
            v-for="e in emojis.slice(0, 8)"
            :key="e"
            @click="handleReact(e)"
            class="menu-emoji"
            >{{ e }}</span
          >
        </div>
        <div class="menu-item" @click="handleReply">
          <Reply :size="16" /> 返信
        </div>
        <div class="menu-item" @click="copyToClipboard">
          <component
            :is="isCopying ? Check : Copy"
            :size="16"
            :color="isCopying ? '#2ed573' : undefined"
          />
          メッセージリンクをコピー
        </div>
        <div v-if="isAuthor" class="menu-item" @click="startEdit">
          <Pencil :size="16" /> メッセージを編集
        </div>
        <div v-if="isAuthor" class="menu-item delete" @click="handleDelete">
          <Trash2 :size="16" /> メッセージを削除
        </div>
      </div>
    </Teleport>

    <!-- User Profile Hover Card -->
    <UserProfileCard
      :user="msg"
      :show="showProfileCard"
      :position="cardPosition"
      @mouseenter="clearTimeout(hoverTimer)"
      @mouseleave="handleMouseLeave"
    />
    </div>
    </div>
    </template>
<style scoped>
.message-container {
  display: flex;
  flex-direction: column;
  padding: 12px 20px;
  border-bottom: 1px solid var(--border);
  background: var(--surface);
  transition: background 0.1s;
  position: relative;
}

.message-container:hover {
  background: rgba(0, 0, 0, 0.02);
}

[data-theme="dark"] .message-container:hover,
[data-theme="dim"] .message-container:hover {
  background: rgba(255, 255, 255, 0.03);
}

/* Action Bar */
.message-actions-bar {
  position: absolute;
  top: -16px;
  right: 20px;
  display: flex;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 2px;
  z-index: 10;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.1s;
}

.message-container:hover .message-actions-bar {
  opacity: 1;
  pointer-events: auto;
}

.action-btn {
  background: transparent;
  border: none;
  padding: 6px 10px;
  cursor: pointer;
  color: var(--text-secondary);
  border-radius: 4px;
  display: flex;
  align-items: center;
  transition: all 0.2s;
}

.action-btn:hover {
  background: var(--secondary);
  color: var(--accent);
}

.action-btn.delete:hover {
  color: #ff4757;
  background: rgba(255, 71, 87, 0.1);
}

/* Reply & Info */
.reply-reference {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  margin-left: 28px;
  color: var(--text-secondary);
  font-size: 0.85rem;
  opacity: 0.7;
}

.reply-author {
  font-weight: 800;
  color: var(--accent);
}
.reply-preview {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 400px;
}

.message-main {
  display: flex;
  gap: 16px;
}
.author-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
}
.content-column {
  flex: 1;
  min-width: 0;
}
.message-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 6px;
}
.header-left {
  display: flex;
  align-items: baseline;
  gap: 4px;
  overflow: hidden;
}
.dot {
  color: var(--text-secondary);
  font-size: 0.8rem;
}
.author-name {
  font-weight: 800;
  color: var(--text-primary);
  font-size: 1rem;
  white-space: nowrap;
}

.author-handle {
  color: var(--text-secondary);
  font-size: 0.95rem;
  font-weight: 400;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Twitter Variant Specifics */
.variant-twitter {
  padding: 12px 16px;
  cursor: pointer;
}

.variant-twitter:hover {
  background: rgba(0, 0, 0, 0.03);
}

.variant-twitter .author-avatar {
  width: 40px;
  height: 40px;
}

.more-btn-twitter {
  background: transparent;
  border: none;
  color: var(--text-secondary);
  padding: 8px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: all 0.2s;
  margin-right: -8px;
}

.more-btn-twitter:hover {
  background: rgba(var(--accent-rgb), 0.1);
  color: var(--accent);
}

.tweet-actions {
  display: flex;
  justify-content: space-between;
  max-width: 425px;
  margin-top: 12px;
  margin-left: -8px;
}

.tweet-action-btn {
  background: transparent;
  border: none;
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s;
  padding: 0;
}

.icon-circle {
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background 0.2s;
}

.action-count {
  font-size: 0.8rem;
}

/* Hover Colors */
.tweet-action-btn.reply:hover {
  color: var(--accent);
}
.tweet-action-btn.reply:hover .icon-circle {
  background: rgba(var(--accent-rgb), 0.1);
}

.tweet-action-btn.retweet:hover {
  color: #00ba7c;
}
.tweet-action-btn.retweet:hover .icon-circle {
  background: rgba(0, 186, 124, 0.1);
}

.tweet-action-btn.like:hover {
  color: #f91880;
}
.tweet-action-btn.like:hover .icon-circle {
  background: rgba(249, 24, 128, 0.1);
}
.tweet-action-btn.like.active {
  color: #f91880;
}

.tweet-action-btn.views:hover {
  color: var(--accent);
}
.tweet-action-btn.views:hover .icon-circle {
  background: rgba(var(--accent-rgb), 0.1);
}

.tweet-action-btn.share:hover {
  color: var(--accent);
}
.tweet-action-btn.share:hover .icon-circle {
  background: rgba(var(--accent-rgb), 0.1);
}

.timestamp {
  font-size: 0.75rem;
  color: var(--text-secondary);
  font-weight: 500;
}
.edited-tag {
  font-size: 0.65rem;
  color: var(--text-secondary);
  margin-left: 4px;
  cursor: pointer;
  text-decoration: underline dotted;
}
.edited-tag:hover {
  color: var(--accent);
}

.message-body {
  line-height: 1.6;
  color: var(--text-primary);
  word-break: break-word;
  font-size: 1rem;
}

:deep(.mention) {
  color: var(--accent);
  font-weight: 700;
  text-decoration: none;
}
:deep(.mention:hover) {
  text-decoration: underline;
}

:deep(a) {
  color: var(--accent);
  text-decoration: none;
}
:deep(a:hover) {
  text-decoration: underline;
}

/* Edit UI */
.edit-ui textarea {
  width: 100%;
  min-height: 100px;
  padding: 12px;
  border-radius: 8px;
  background: var(--secondary);
  color: var(--text-primary);
  border: 1px solid var(--accent);
  font-size: 1rem;
  line-height: 1.5;
  resize: vertical;
  outline: none;
}

.edit-controls {
  margin-top: 8px;
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.link-btn {
  background: transparent;
  border: none;
  color: var(--accent);
  cursor: pointer;
  padding: 0;
  font-size: inherit;
  font-weight: 700;
}

.link-btn:hover {
  text-decoration: underline;
}
.link-btn.save {
  color: #2ed573;
}

/* History Popup */
.history-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10000;
  backdrop-filter: blur(4px);
}
.history-popup {
  background: var(--surface);
  border-radius: 16px;
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
  border: 1px solid var(--border);
}
.history-header {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--border);
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.history-header h3 {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 800;
}
.close-history {
  background: transparent;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
}
.history-list {
  padding: 1rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.history-item {
  padding: 1rem;
  border-radius: 12px;
  background: var(--background);
  border: 1px solid var(--border);
}
.history-item.current {
  border-color: var(--accent);
  background: rgba(var(--accent-rgb), 0.05);
}
.history-time {
  font-size: 0.75rem;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
}
.history-content {
  font-size: 0.95rem;
  white-space: pre-wrap;
  word-break: break-word;
}

/* Context Menu */
.context-menu {
  position: fixed;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
  padding: 8px;
  min-width: 220px;
  z-index: 9999;
}

.emoji-strip {
  display: flex;
  justify-content: space-around;
  padding: 8px;
  border-bottom: 1px solid var(--border);
  margin-bottom: 4px;
}

.menu-emoji {
  cursor: pointer;
  font-size: 1.4rem;
  transition: transform 0.1s;
}
.menu-emoji:hover {
  transform: scale(1.3);
}

.menu-item {
  padding: 10px 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  color: var(--text-primary);
  font-size: 0.9rem;
}

.menu-item:hover {
  background: var(--accent);
  color: white;
}
.menu-item.delete {
  color: #ff4757;
}
.menu-item.delete:hover {
  background: #ff4757;
  color: white;
}

/* Reactions */
.reactions-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}
.reaction-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border: 1px solid var(--border);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.95rem;
}
.reaction-badge:hover {
  border-color: var(--accent);
}
.reaction-badge.active {
  background: rgba(var(--accent-rgb), 0.12);
  border-color: var(--accent);
}

/* Emoji Picker Mini */
.emoji-picker.mini {
  position: absolute;
  bottom: 100%;
  right: 0;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 4px;
  display: flex;
  gap: 4px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  margin-bottom: 8px;
}

.more-emojis {
  background: transparent;
  border: none;
  cursor: pointer;
  color: var(--text-secondary);
  font-weight: 800;
}
</style>
