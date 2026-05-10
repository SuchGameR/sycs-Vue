<script setup lang="ts">
import { ref } from "vue";
import { useAuthStore } from "@/stores/auth";
import { X } from "lucide-vue-next";

const props = defineProps<{
  show: boolean;
}>();

const emit = defineEmits(["close", "created"]);
const authStore = useAuthStore();

const serverName = ref("");
const description = ref("");
const visibility = ref("public");
const isSubmitting = ref(false);

const createServer = async () => {
  if (!serverName.value.trim()) return;
  isSubmitting.value = true;
  try {
    const res = await fetch(`/api/servers`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authStore.token}`,
      },
      body: JSON.stringify({
        name: serverName.value,
        settings: {
          visibility: visibility.value,
          description: description.value.trim(),
        },
      }),
    });

    if (res.ok) {
      const data = await res.json();
      emit("created", data);
    } else {
      console.error("Failed to create server");
    }
  } catch (e) {
    console.error("Error creating server:", e);
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <div v-if="show" class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <header class="modal-header">
        <button class="close-btn-top" @click="$emit('close')">
          <X :size="18" />
          <span class="close-label">閉じる</span>
        </button>
      </header>

      <div class="modal-body">
        <h2>コミュニティを作成</h2>
        <p class="description">自分だけのコミュニティを作ろう！</p>

        <div class="input-group">
          <label>コミュニティ名 <span class="required">*</span></label>
          <input
            v-model="serverName"
            type="text"
            placeholder="新規コミュニティ"
            @keyup.enter="createServer"
            autofocus
          />
        </div>

        <div class="input-group">
          <label>コミュニティ説明</label>
          <textarea
            v-model="description"
            placeholder="コミュニティの目的や案内を入力してください"
            rows="3"
          ></textarea>
        </div>

        <div class="input-group">
          <label>公開設定</label>
          <div class="visibility-options">
            <label
              class="radio-card"
              :class="{ active: visibility === 'public' }"
            >
              <input type="radio" v-model="visibility" value="public" />
              <div class="radio-info">
                <span class="label">公開</span>
                <span class="desc">誰でも見つけて参加できます。</span>
              </div>
            </label>
            <label
              class="radio-card"
              :class="{ active: visibility === 'private' }"
            >
              <input type="radio" v-model="visibility" value="private" />
              <div class="radio-info">
                <span class="label">非公開</span>
                <span class="desc">コミュニティ一覧に表示されません。</span>
              </div>
            </label>
            <label
              class="radio-card"
              :class="{ active: visibility === 'limited' }"
            >
              <input type="radio" v-model="visibility" value="limited" />
              <div class="radio-info">
                <span class="label">限定</span>
                <span class="desc">招待された人のみが参加できます。</span>
              </div>
            </label>
          </div>
        </div>

        <div class="actions">
          <button class="btn-cancel" @click="$emit('close')">戻る</button>
          <button
            class="btn-create"
            :disabled="isSubmitting || !serverName.trim()"
            @click="createServer"
          >
            {{ isSubmitting ? "作成中..." : "新規作成" }}
          </button>
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
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2100;
  padding: 20px;
}

.modal-content {
  background: var(--surface);
  color: var(--text-primary);
  border-radius: 24px;
  width: 100%;
  max-width: 480px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.4);
  position: relative;
  border: 1px solid var(--border);
  animation: modal-pop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes modal-pop {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

.modal-header {
  padding: 16px;
  display: flex;
  justify-content: flex-end;
  background: var(--surface);
  z-index: 10;
}

.close-btn-top {
  background: var(--accent);
  border: none;
  color: white;
  cursor: pointer;
  padding: 8px 20px;
  border-radius: 50px;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(var(--accent-rgb), 0.3);
}

.close-label {
  font-weight: 800;
  font-size: 0.9rem;
}

.close-btn-top:hover {
  filter: brightness(1.1);
  transform: translateY(-2px);
}

.modal-body {
  padding: 0 32px 32px;
  overflow-y: auto;
  scrollbar-width: thin;
}

.modal-content h2 {
  margin-top: 0;
  text-align: center;
  font-size: 1.8rem;
  font-weight: 900;
  margin-bottom: 8px;
  color: var(--text-primary);
  letter-spacing: -0.5px;
}

.description {
  text-align: center;
  color: var(--text-secondary);
  font-size: 0.95rem;
  margin-bottom: 32px;
  line-height: 1.5;
  font-weight: 500;
}

.input-group {
  margin-bottom: 24px;
}

.input-group label {
  display: block;
  font-size: 0.75rem;
  font-weight: 800;
  margin-bottom: 8px;
  text-transform: uppercase;
  color: var(--text-secondary);
  letter-spacing: 0.5px;
}

.required {
  color: #ff4757;
}

.input-group input[type="text"],
.input-group textarea {
  width: 100%;
  padding: 14px;
  border-radius: 12px;
  border: 2px solid var(--border);
  background: var(--surface);
  color: var(--text-primary);
  font-size: 1rem;
  outline: none;
  transition: all 0.2s;
  font-family: inherit;
}

.input-group input[type="text"]:focus,
.input-group textarea:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 4px rgba(var(--accent-rgb), 0.1);
}

.visibility-options {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.radio-card {
  display: flex;
  align-items: center;
  padding: 16px;
  border: 2px solid var(--border);
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.2s;
  background: var(--surface);
}

.radio-card:hover {
  border-color: var(--accent);
  background: rgba(var(--accent-rgb), 0.02);
}

.radio-card.active {
  border-color: var(--accent);
  background: rgba(var(--accent-rgb), 0.05);
}

.radio-card input {
  margin-right: 16px;
  width: 18px;
  height: 18px;
  accent-color: var(--accent);
}

.radio-info {
  display: flex;
  flex-direction: column;
}

.radio-info .label {
  font-weight: 800;
  font-size: 1rem;
  color: var(--text-primary);
}

.radio-info .desc {
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 32px;
  gap: 16px;
}

.btn-cancel {
  flex: 1;
  background: transparent;
  border: 1px solid var(--border);
  cursor: pointer;
  color: var(--text-primary);
  font-weight: 700;
  padding: 14px;
  border-radius: 14px;
  transition: all 0.2s;
}

.btn-create {
  flex: 2;
  background: var(--accent);
  color: white;
  border: none;
  padding: 14px;
  border-radius: 14px;
  cursor: pointer;
  font-weight: 800;
  font-size: 1rem;
  transition: all 0.3s;
  box-shadow: 0 8px 20px rgba(var(--accent-rgb), 0.2);
}

.btn-create:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 500px) {
  .modal-overlay {
    padding: 0;
  }
  .modal-content {
    border-radius: 0;
    max-height: 100vh;
    height: 100vh;
    padding-top: env(safe-area-inset-top);
  }
}
</style>
