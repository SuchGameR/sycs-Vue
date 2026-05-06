<script setup lang="ts">
import { computed, ref, onMounted, watch } from "vue";
import { marked } from "marked";
import DOMPurify from "dompurify";
import {
  MessageCircle,
  Repeat2,
  Heart,
  BarChart3,
  Share,
  MoreHorizontal,
  Bookmark,
  Pencil,
  Trash2,
  Copy,
  Check,
} from "lucide-vue-next";
import { useAuthStore } from "../../stores/auth";
import { createHighlighter } from "shiki";

const props = defineProps<{
  msg: any;
}>();

const emit = defineEmits([
  "reply",
  "retweet",
  "like",
  "bookmark",
  "edit",
  "delete",
  "refresh",
]);

const authStore = useAuthStore();
const highlightedHtml = ref("");
const isCopying = ref(false);
const showContextMenu = ref(false);
const menuPos = ref({ x: 0, y: 0 });

// Shiki Highlighter
let highlighter: any = null;
async function initHighlighter() {
  if (!highlighter) {
    highlighter = await createHighlighter({
      themes: ["github-dark", "github-light"],
      langs: [
        "javascript",
        "typescript",
        "vue",
        "css",
        "html",
        "bash",
        "json",
        "sql",
      ],
    });
  }
}

async function renderContent() {
  await initHighlighter();
  const contentToRender = props.msg.retweet_id
    ? props.msg.orig_content
    : props.msg.content;
  const escapedContent = (contentToRender || "").replace(
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
  const rawHtml = await marked.parse(escapedContent, { renderer, async: true });
  highlightedHtml.value = DOMPurify.sanitize(rawHtml);
}

// Increment view count on mount
async function incrementViews() {
  try {
    const targetId = props.msg.retweet_id || props.msg.id;
    await fetch(
      `/api/messages/${targetId}/views`,
      {
        method: "POST",
      },
    );
  } catch (e) {
    console.error(e);
  }
}

onMounted(() => {
  renderContent();
  incrementViews();
});

watch(() => props.msg.content, renderContent);
watch(() => authStore.theme, renderContent);

function handleAction(type: string) {
  emit(type as any, props.msg);
}

function openContextMenu(e: MouseEvent) {
  e.preventDefault();
  menuPos.value = { x: e.clientX, y: e.clientY };
  showContextMenu.value = true;
}

function copyToClipboard() {
  navigator.clipboard.writeText(props.msg.content);
  isCopying.value = true;
  setTimeout(() => (isCopying.value = false), 2000);
}

const isAuthor = computed(() => authStore.user?.id === props.msg.user_id);
const displayAuthor = computed(() =>
  props.msg.retweet_id
    ? {
        name: props.msg.orig_author_name,
        handle: props.msg.orig_author_handle,
        avatar: props.msg.orig_avatar_url,
      }
    : {
        name: props.msg.author_name,
        handle: props.msg.author_handle,
        avatar: props.msg.avatar_url,
      },
);

const formattedTime = computed(() => {
  const date = new Date(props.msg.created_at);
  const now = new Date();
  const diff = (now.getTime() - date.getTime()) / 1000;

  if (diff < 60) return "今";
  if (diff < 3600) return Math.floor(diff / 60) + "分";
  if (diff < 86400) return Math.floor(diff / 3600) + "時間";
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
});
</script>

<template>
  <div class="tweet-container" @contextmenu="openContextMenu">
    <!-- Retweet Indicator -->
    <div v-if="msg.retweet_id" class="retweet-indicator">
      <Repeat2 :size="14" />
      <span>{{ msg.author_name }}さんがリポストしました</span>
    </div>

    <div class="tweet-main">
      <div class="avatar-col">
        <img
          :src="displayAuthor.avatar || '/default-avatar.png'"
          class="author-avatar"
        />
      </div>
      <div class="content-col">
        <div class="tweet-header">
          <div class="author-info">
            <span class="author-name">{{ displayAuthor.name }}</span>
            <span class="author-handle">@{{ displayAuthor.handle }}</span>
            <span class="dot">·</span>
            <span class="timestamp">{{ formattedTime }}</span>
          </div>
          <button class="more-btn" @click.stop="openContextMenu">
            <MoreHorizontal :size="18" />
          </button>
        </div>

        <div class="tweet-body markdown-body" v-html="highlightedHtml"></div>

        <div class="tweet-actions">
          <!-- Reply -->
          <button
            class="action-btn reply"
            @click.stop="handleAction('reply')"
            title="返信"
          >
            <div class="icon-wrap"><MessageCircle :size="18" /></div>
            <span class="count" v-if="msg.reply_count">{{
              msg.reply_count
            }}</span>
          </button>

          <!-- Retweet -->
          <button
            class="action-btn retweet"
            :class="{ active: msg.is_retweeted }"
            @click.stop="handleAction('retweet')"
            title="リポスト"
          >
            <div class="icon-wrap"><Repeat2 :size="18" /></div>
            <span class="count" v-if="msg.retweet_count">{{
              msg.retweet_count
            }}</span>
          </button>

          <!-- Like -->
          <button
            class="action-btn like"
            :class="{ active: msg.is_liked }"
            @click.stop="handleAction('like')"
            title="いいね"
          >
            <div class="icon-wrap">
              <Heart
                :size="18"
                :fill="msg.is_liked ? 'currentColor' : 'none'"
              />
            </div>
            <span
              class="count"
              v-if="msg.likes_count || Object.keys(msg.reactions || {}).length"
            >
              {{ msg.likes_count || Object.keys(msg.reactions || {}).length }}
            </span>
          </button>

          <!-- Views -->
          <button class="action-btn views" title="表示件数">
            <div class="icon-wrap"><BarChart3 :size="18" /></div>
            <span class="count">{{ msg.views_count || 0 }}</span>
          </button>

          <!-- Share/Bookmark -->
          <div class="share-group">
            <button
              class="action-btn bookmark"
              :class="{ active: msg.is_bookmarked }"
              @click.stop="handleAction('bookmark')"
              title="ブックマーク"
            >
              <div class="icon-wrap">
                <Bookmark
                  :size="18"
                  :fill="msg.is_bookmarked ? 'currentColor' : 'none'"
                />
              </div>
            </button>
            <button
              class="action-btn share"
              @click.stop="copyToClipboard"
              title="共有"
            >
              <div class="icon-wrap"><Share :size="18" /></div>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Context Menu (Simplified for brevity, but functional) -->
    <Teleport to="body">
      <div
        v-if="showContextMenu"
        class="context-menu"
        :style="{ top: menuPos.y + 'px', left: menuPos.x + 'px' }"
        @click.stop="showContextMenu = false"
      >
        <div class="menu-item" @click="copyToClipboard">
          <component :is="isCopying ? Check : Copy" :size="16" />
          リンクをコピー
        </div>
        <div v-if="isAuthor" class="menu-item" @click="handleAction('edit')">
          <Pencil :size="16" /> 編集
        </div>
        <div
          v-if="isAuthor"
          class="menu-item delete"
          @click="handleAction('delete')"
        >
          <Trash2 :size="16" /> 削除
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.tweet-container {
  padding: 12px 16px;
  border-bottom: 1px solid var(--border);
  background: var(--surface);
  transition: background 0.2s;
  cursor: pointer;
  display: flex;
  flex-direction: column;
}

.tweet-container:hover {
  background: rgba(0, 0, 0, 0.02);
}

[data-theme="dark"] .tweet-container:hover,
[data-theme="dim"] .tweet-container:hover {
  background: rgba(255, 255, 255, 0.03);
}

.retweet-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: 28px;
  margin-bottom: 4px;
  color: var(--text-secondary);
  font-size: 0.85rem;
  font-weight: 700;
}

.tweet-main {
  display: flex;
  gap: 12px;
}

.avatar-col {
  flex-shrink: 0;
}
.author-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
}

.content-col {
  flex-grow: 1;
  min-width: 0;
}

.tweet-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2px;
}

.author-info {
  display: flex;
  align-items: baseline;
  gap: 4px;
  overflow: hidden;
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
  white-space: nowrap;
}

.dot,
.timestamp {
  color: var(--text-secondary);
  font-size: 0.95rem;
}

.more-btn {
  background: transparent;
  border: none;
  color: var(--text-secondary);
  padding: 8px;
  border-radius: 50%;
  cursor: pointer;
  margin-right: -8px;
}

.more-btn:hover {
  background: rgba(var(--accent-rgb), 0.1);
  color: var(--accent);
}

.tweet-body {
  font-size: 1rem;
  line-height: 1.5;
  color: var(--text-primary);
  word-break: break-word;
}

.tweet-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 12px;
  margin-left: -8px;
  max-width: 500px;
}

.action-btn {
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

.icon-wrap {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background 0.2s;
}

.count {
  font-size: 0.85rem;
}

.action-btn.reply:hover {
  color: var(--accent);
}
.action-btn.reply:hover .icon-wrap {
  background: rgba(var(--accent-rgb), 0.1);
}

.action-btn.retweet:hover {
  color: #00ba7c;
}
.action-btn.retweet:hover .icon-wrap {
  background: rgba(0, 186, 124, 0.1);
}
.action-btn.retweet.active {
  color: #00ba7c;
}

.action-btn.like:hover {
  color: #f91880;
}
.action-btn.like:hover .icon-wrap {
  background: rgba(249, 24, 128, 0.1);
}
.action-btn.like.active {
  color: #f91880;
}

.action-btn.views:hover {
  color: var(--accent);
}
.action-btn.views:hover .icon-wrap {
  background: rgba(var(--accent-rgb), 0.1);
}

.share-group {
  display: flex;
  gap: 4px;
}
.action-btn.bookmark:hover {
  color: var(--accent);
}
.action-btn.bookmark:hover .icon-wrap {
  background: rgba(var(--accent-rgb), 0.1);
}
.action-btn.bookmark.active {
  color: var(--accent);
}

.action-btn.share:hover {
  color: var(--accent);
}
.action-btn.share:hover .icon-wrap {
  background: rgba(var(--accent-rgb), 0.1);
}

/* Context Menu */
.context-menu {
  position: fixed;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
  padding: 8px;
  min-width: 180px;
  z-index: 9999;
}

.menu-item {
  padding: 10px 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
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
</style>
