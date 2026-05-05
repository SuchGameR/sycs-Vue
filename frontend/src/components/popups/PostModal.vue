<script setup lang="ts">
import { ref } from "vue";

const props = defineProps<{
  show: boolean;
  placeholder?: string;
  btnText?: string;
  title?: string;
}>();

const emit = defineEmits(["close", "submit"]);

const content = ref("");

function handleSubmit() {
  if (!content.value.trim()) return;
  emit("submit", content.value);
  content.value = "";
}
</script>

<template>
  <div v-if="show" class="modal-overlay" @click.self="emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <h2>{{ title || "新規ポスト" }}</h2>
        <button class="close-btn" @click="emit('close')">&times;</button>
      </div>

      <slot name="header-extra"></slot>

      <textarea
        v-model="content"
        :placeholder="placeholder || ''"
        autofocus
      ></textarea>

      <div class="modal-footer">
        <button
          class="submit-btn"
          :disabled="!content.trim()"
          @click="handleSubmit"
        >
          {{ btnText || "ポストする" }}
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
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
}

.modal-content {
  background: var(--surface);
  color: var(--text-primary);
  width: 90%;
  max-width: 600px;
  border-radius: 24px;
  padding: 2rem;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
  border: 1px solid var(--border);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.modal-header h2 {
  font-weight: 900;
  font-size: 1.5rem;
}

.close-btn {
  background: none;
  border: none;
  font-size: 2rem;
  cursor: pointer;
  color: var(--text-secondary);
}

textarea {
  width: 100%;
  height: 200px;
  border: none;
  outline: none;
  font-size: 1.25rem;
  resize: none;
  background: transparent;
  color: var(--text-primary);
  line-height: 1.6;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  border-top: 1px solid var(--border);
  padding-top: 1.5rem;
  margin-top: 1rem;
}

.submit-btn {
  padding: 0.8rem 2rem;
  border-radius: 50px;
  background: var(--accent);
  color: white;
  font-weight: 800;
  border: none;
  cursor: pointer;
  font-size: 1.1rem;
  transition: transform 0.2s;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  filter: brightness(1.1);
}

.submit-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>
