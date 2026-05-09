<script setup lang="ts">
import { ref, computed } from "vue";
import { useAuthStore } from "../../stores/auth";
import { Image, Smile, Calendar, MapPin, List, BarChart2, X } from "lucide-vue-next";

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

const canPost = computed(() => content.value.trim().length > 0);

function handleSubmit() {
  if (!canPost.value) return;
  emit("submit", content.value);
  content.value = "";
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
          
          <div class="modal-footer">
            <div class="icons-group">
              <button class="icon-btn" title="メディア"><Image :size="20" /></button>
              <button class="icon-btn" title="GIF"><span class="gif-icon">GIF</span></button>
              <button class="icon-btn" title="投票"><BarChart2 :size="20" /></button>
              <button class="icon-btn" title="絵文字"><Smile :size="20" /></button>
              <button class="icon-btn" title="予約"><Calendar :size="20" /></button>
              <button class="icon-btn" title="場所"><MapPin :size="20" /></button>
            </div>
            <button
              class="submit-btn"
              :disabled="!canPost || loading"
              @click="handleSubmit"
            >
              {{ loading ? '送信中...' : (btnText || authStore.t.post_btn) }}
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

[data-theme="dark"] .close-btn:hover,
[data-theme="dim"] .close-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}
</style>
