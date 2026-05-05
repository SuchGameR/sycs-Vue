<script setup>
import { ref } from "vue";

const emit = defineEmits(["close", "created"]);
const serverName = ref("");
const isSubmitting = ref(false);

const createServer = async () => {
  if (!serverName.value.trim()) return;
  isSubmitting.value = true;
  try {
    // 開発サーバーのバックエンドは3001番ポート
    const res = await fetch(
      `http://${window.location.hostname}:3001/api/servers`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: serverName.value }),
      },
    );

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

.input-group input {
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

.input-group input:focus {
  border-color: #5865f2;
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
