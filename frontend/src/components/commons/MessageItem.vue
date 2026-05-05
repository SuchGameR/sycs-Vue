<script setup lang="ts">
import { computed, ref, onMounted, watch } from 'vue';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { 
  Reply, 
  Smile, 
  MoreHorizontal,
  CornerDownRight,
  Copy,
  Check
} from 'lucide-vue-next';
import { useAuthStore } from '../../stores/auth';
import { createHighlighter } from 'shiki';

const props = defineProps<{
  msg: any;
  isReply?: boolean;
}>();

const emit = defineEmits(['reply', 'react']);

const authStore = useAuthStore();
const showEmojiPicker = ref(false);
const highlightedHtml = ref('');
const isCopying = ref(false);

// Escape raw HTML tags so they are shown as text instead of being stripped by DOMPurify
function escapeHtml(unsafe: string) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Shiki highlighter instance
let highlighter: any = null;

async function initHighlighter() {
  if (!highlighter) {
    highlighter = await createHighlighter({
      themes: ['github-dark', 'github-light'],
      langs: ['javascript', 'typescript', 'vue', 'css', 'html', 'bash', 'json', 'sql']
    });
  }
}

async function renderContent() {
  await initHighlighter();
  
  // 1. Escape HTML first to prevent XSS and tag stripping
  const escapedContent = escapeHtml(props.msg.content || '');
  
  // 2. Configure marked to use shiki for code blocks
  const renderer = new marked.Renderer();
  renderer.code = ({ text, lang }) => {
    const theme = authStore.theme === 'light' ? 'github-light' : 'github-dark';
    try {
      const html = highlighter.codeToHtml(text, { lang: lang || 'text', theme });
      return `
        <div class="code-block-wrapper">
          <div class="code-lang">${lang || 'text'}</div>
          ${html}
        </div>
      `;
    } catch (e) {
      return `<pre><code>${text}</code></pre>`;
    }
  };

  const rawHtml = await marked.parse(escapedContent, { renderer, async: true });
  
  // 3. Final sanitize for safety
  highlightedHtml.value = DOMPurify.sanitize(rawHtml);
}

onMounted(() => {
  renderContent();
});

watch(() => props.msg.content, () => {
  renderContent();
});

watch(() => authStore.theme, () => {
  renderContent();
});

const emojis = ['👍', '❤️', '😂', '😮', '😢', '🔥', '🚀', '✅', '👀', '✨', '🎉', '💯'];

function handleReact(emoji: string) {
  emit('react', props.msg.id, emoji);
  showEmojiPicker.value = false;
}

const hasMyReaction = (emoji: string) => {
  const users = props.msg.reactions?.[emoji] || [];
  return users.includes(authStore.user?.id);
};

function copyToClipboard() {
  navigator.clipboard.writeText(props.msg.content);
  isCopying.value = true;
  setTimeout(() => isCopying.value = false, 2000);
}
</script>

<template>
  <div class="message-container" :class="{ 'is-reply': isReply, 'dim-theme': authStore.theme === 'dim' }">
    <!-- Parent Reply Reference -->
    <div v-if="msg.parent_msg && !isReply" class="reply-reference">
      <CornerDownRight :size="14" class="reply-icon" />
      <span class="reply-author">{{ msg.parent_msg.author_name }}</span>
      <span class="reply-preview">{{ msg.parent_msg.content }}</span>
    </div>

    <div class="message-main">
      <div class="avatar-column">
        <img :src="msg.avatar_url || '/kiwibird-discord.png'" class="author-avatar" />
      </div>
      <div class="content-column">
        <div class="message-header">
          <span class="author-name">{{ msg.author_name }}</span>
          <span class="timestamp">{{ new Date(msg.created_at).toLocaleString() }}</span>
        </div>
        
        <div class="message-body markdown-body" v-html="highlightedHtml"></div>

        <!-- Reactions -->
        <div v-if="msg.reactions && Object.keys(msg.reactions).length > 0" class="reactions-list">
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

        <!-- Actions -->
        <div class="message-actions">
          <button class="action-btn" @click="emit('reply', msg)" title="返信">
            <Reply :size="16" />
          </button>
          <div class="emoji-trigger">
            <button class="action-btn" @click="showEmojiPicker = !showEmojiPicker" title="リアクション">
              <Smile :size="16" />
            </button>
            <div v-if="showEmojiPicker" class="emoji-picker">
              <span 
                v-for="e in emojis" 
                :key="e" 
                @click="handleReact(e)"
                class="picker-emoji"
              >{{ e }}</span>
            </div>
          </div>
          <button class="action-btn" @click="copyToClipboard" title="コピー">
            <Check v-if="isCopying" :size="16" color="#2ed573" />
            <Copy v-else :size="16" />
          </button>
          <button class="action-btn">
            <MoreHorizontal :size="16" />
          </button>
        </div>
      </div>
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
  transition: background 0.2s;
  position: relative;
}

.message-container:hover {
  background: rgba(0, 0, 0, 0.02);
}

[data-theme="dark"] .message-container:hover,
[data-theme="dim"] .message-container:hover {
  background: rgba(255, 255, 255, 0.03);
}

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

.avatar-column {
  flex-shrink: 0;
}

.author-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.content-column {
  flex: 1;
  min-width: 0;
}

.message-header {
  display: flex;
  align-items: baseline;
  gap: 10px;
  margin-bottom: 6px;
}

.author-name {
  font-weight: 900;
  color: var(--text-primary);
  font-size: 1.05rem;
}

.timestamp {
  font-size: 0.75rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.message-body {
  line-height: 1.6;
  color: var(--text-primary);
  word-break: break-word;
  font-size: 1rem;
}

/* Markdown styling - Shiki Integration */
:deep(.markdown-body p) {
  margin-bottom: 0.8rem;
}
:deep(.markdown-body p:last-child) {
  margin-bottom: 0;
}

:deep(.markdown-body pre) {
  margin: 1rem 0;
  padding: 1.2rem;
  border-radius: 12px;
  overflow-x: auto;
  font-family: 'Fira Code', 'Cascadia Code', monospace;
  font-size: 0.9rem;
  border: 1px solid var(--border);
}

:deep(.shiki) {
  background-color: #1e1e1e !important; /* Default fallback */
}

[data-theme="light"] :deep(.shiki) {
  background-color: #f6f8fa !important;
}

:deep(.markdown-body code:not(pre code)) {
  background: var(--secondary);
  padding: 0.2rem 0.4rem;
  border-radius: 6px;
  font-family: monospace;
  font-weight: 600;
  font-size: 0.9em;
  color: var(--accent);
}

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
  background: var(--secondary);
  border: 1px solid var(--border);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  font-size: 0.95rem;
  user-select: none;
}

.reaction-badge:hover {
  border-color: var(--accent);
  transform: scale(1.05);
}

.reaction-badge.active {
  background: rgba(var(--accent-rgb), 0.12);
  border-color: var(--accent);
}

.reaction-badge.active .count {
  color: var(--accent);
}

.count {
  font-weight: 800;
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.message-actions {
  display: flex;
  gap: 12px;
  margin-top: 12px;
  opacity: 0;
  transition: opacity 0.2s, transform 0.2s;
  transform: translateY(5px);
}

.message-container:hover .message-actions {
  opacity: 1;
  transform: translateY(0);
}

.action-btn {
  background: transparent;
  border: none;
  padding: 6px;
  cursor: pointer;
  color: var(--text-secondary);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.action-btn:hover {
  background: var(--secondary);
  color: var(--accent);
}

.emoji-trigger {
  position: relative;
}

.emoji-picker {
  position: absolute;
  bottom: 100%;
  left: 0;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 10px;
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 8px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.2);
  z-index: 100;
  margin-bottom: 12px;
  width: max-content;
}

.picker-emoji {
  cursor: pointer;
  font-size: 1.4rem;
  padding: 4px;
  border-radius: 8px;
  transition: all 0.1s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.picker-emoji:hover {
  background: var(--secondary);
  transform: scale(1.2);
}

@media (max-width: 600px) {
  .message-actions {
    opacity: 1;
    transform: none;
  }
}
</style>
