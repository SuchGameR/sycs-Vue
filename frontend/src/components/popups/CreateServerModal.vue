<script setup>
import { ref } from "vue";
import { useAuthStore } from "@/stores/auth";

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
    // 開発サーバーのバックエンドは3001番ポート
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
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <h2>サーバーを作成</h2>
      <p class="description">
        サーバーはあなたとフレンドが一緒に過ごす場所です。自分だけのサーバーを作って、会話を始めましょう。
      </p>

      <div class="input-group">
        <label>サーバー名 <span class="required">*</span></label>
        <input
          v-model="serverName"
          type="text"
          placeholder="新規サーバー"
          @keyup.enter="createServer"
          ref="nameInput"
          autofocus
        />
      </div>

      <div class="input-group">
        <label>サーバー説明</label>
        <textarea
          v-model="description"
          placeholder="サーバーの目的や案内を入力してください"
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
              <span class="desc">サーバー一覧に表示されません。</span>
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
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background-color: var(--background, #fff);
  color: var(--text-primary, #1e1e1e);
  border-radius: 8px;
  width: 440px;
  max-width: 90%;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.modal-content h2 {
  margin-top: 0;
  text-align: center;
  font-size: 24px;
  margin-bottom: 8px;
  color: var(--text-primary);
}

.description {
  text-align: center;
  color: var(--text-secondary, #666);
  font-size: 14px;
  margin-bottom: 24px;
  line-height: 1.5;
}

.input-group {
  margin-bottom: 24px;
  color: var(--text-primary);
}

.input-group label {
  display: block;
  font-size: 12px;
  font-weight: 700;
  margin-bottom: 8px;
  text-transform: uppercase;
  color: var(--text-secondary, #666);
}

.required {
  color: #ed4245;
}

.input-group input[type="text"],
.input-group textarea {
  width: 100%;
  padding: 10px;
  border-radius: 4px;
  border: 1px solid var(--border-subtle, #ccc);
  background: var(--input-bg, #f5f5f5);
  color: var(--text-primary, #000);
  box-sizing: border-box;
  font-size: 16px;
  outline: none;
  background-color: var(--surface);
}

.input-group input[type="text"]:focus,
.input-group textarea:focus {
  border-color: #5865f2;
}

.visibility-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.radio-card {
  display: flex;
  align-items: center;
  padding: 12px;
  border: 1px solid var(--border-subtle, #ccc);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  background: var(--surface);
}

.radio-card:hover {
  background: var(--hover-bg, #f9f9f9);
}

.radio-card.active {
  border-color: #5865f2;
  background: rgba(88, 101, 242, 0.05);
}

.radio-card input {
  margin-right: 12px;
}

.radio-info {
  display: flex;
  flex-direction: column;
}

.radio-info .label {
  font-weight: 600;
  font-size: 14px;
}

.radio-info .desc {
  font-size: 12px;
  color: var(--text-secondary, #666);
}

.actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
}

.btn-cancel {
  background: transparent;
  border: none;
  cursor: pointer;
  color: var(--text-primary, #000);
  font-weight: 500;
  padding: 8px 16px;
}

.btn-cancel:hover {
  text-decoration: underline;
}

.btn-create {
  background: #5865f2;
  color: white;
  border: none;
  padding: 10px 24px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.2s;
}

.btn-create:hover:not(:disabled) {
  background: #4752c4;
}

.btn-create:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
