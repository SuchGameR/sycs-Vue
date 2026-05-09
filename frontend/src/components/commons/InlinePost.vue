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
} from "lucide-vue-next";

const props = defineProps<{
  loading?: boolean;
}>();

const authStore = useAuthStore();
const content = ref("");
const emit = defineEmits(["submit"]);

const canPost = computed(() => content.value.trim().length > 0);

function handleSubmit() {
  if (!canPost.value || props.loading) return;
  emit("submit", content.value);
  content.value = "";
  // Reset height
  const textarea = document.querySelector(
    ".inline-post textarea",
  ) as HTMLTextAreaElement;
  if (textarea) textarea.style.height = "auto";
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

        <div class="actions-row">
          <div class="icons-group">
            <button class="icon-btn" title="メディア">
              <Image :size="20" />
            </button>
            <button class="icon-btn" title="GIF">
              <span class="gif-icon">GIF</span>
            </button>
            <button class="icon-btn" title="投票">
              <BarChart2 :size="20" />
            </button>
            <button class="icon-btn" title="絵文字">
              <Smile :size="20" />
            </button>
            <button class="icon-btn" title="予約">
              <Calendar :size="20" />
            </button>
            <button class="icon-btn" title="場所"><MapPin :size="20" /></button>
          </div>
          <button class="submit-btn" :disabled="!canPost || loading" @click="handleSubmit">
            {{ loading ? '...' : authStore.t.post_btn }}
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
