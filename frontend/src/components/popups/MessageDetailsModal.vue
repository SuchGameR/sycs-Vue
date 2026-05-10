<script setup lang="ts">
import { X, Clock, Info, History } from "lucide-vue-next";

const props = defineProps<{
  show: boolean;
  msg: any;
}>();

const emit = defineEmits(["close"]);

function formatDate(dateStr: string) {
  if (!dateStr) return "N/A";
  return new Date(dateStr).toLocaleString();
}
</script>

<template>
  <div v-if="show" class="modal-overlay" @click.self="emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <h3><Info :size="18" /> メッセージの詳細情報</h3>
        <button class="close-btn" @click="emit('close')"><X :size="20" /></button>
      </div>

      <div class="modal-body scrollable">
        <section class="info-section">
          <h4><Clock :size="16" /> 基本情報</h4>
          <div class="info-grid">
            <div class="info-label">メッセージID</div>
            <div class="info-value">{{ msg.id }} (UUID: {{ msg.messageid }})</div>
            
            <div class="info-label">投稿者</div>
            <div class="info-value">{{ msg.author_name }} (@{{ msg.author_handle }})</div>
            
            <div class="info-label">作成日時</div>
            <div class="info-value">{{ formatDate(msg.created_at) }}</div>
            
            <div class="info-label">最終更新</div>
            <div class="info-value">{{ formatDate(msg.updated_at || msg.created_at) }}</div>
          </div>
        </section>

        <section class="info-section">
          <h4><History :size="16" /> 編集履歴 ({{ msg.edit_history?.length || 0 }})</h4>
          <div v-if="msg.edit_history && msg.edit_history.length > 0" class="history-list">
            <div v-for="(hist, idx) in msg.edit_history" :key="idx" class="history-item">
              <div class="history-meta">
                <span class="history-idx">#{{ idx + 1 }}</span>
                <span class="history-date">{{ formatDate(hist.edited_at) }}</span>
              </div>
              <div class="history-content">{{ hist.content }}</div>
            </div>
          </div>
          <div v-else class="no-history">編集履歴はありません。</div>
        </section>

        <section class="info-section">
          <h4>デバッグ情報 (JSON)</h4>
          <pre class="json-debug">{{ JSON.stringify(msg, null, 2) }}</pre>
        </section>
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
  backdrop-filter: blur(12px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10000;
  padding: 20px;
}

.modal-content {
  background: var(--surface);
  color: var(--text-primary);
  width: 100%;
  max-width: 750px;
  max-height: 85vh;
  border-radius: 24px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 40px 100px rgba(0, 0, 0, 0.4);
  border: 1px solid var(--border);
  animation: modal-pop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  overflow: hidden;
}

@keyframes modal-pop {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

.modal-header {
  padding: 20px 24px;
  border-bottom: 1px solid var(--border);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(var(--surface-rgb), 0.5);
  backdrop-filter: blur(5px);
}

.modal-header h3 {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0;
  font-weight: 900;
  font-size: 1.4rem;
  letter-spacing: -0.5px;
}

.close-btn {
  background: rgba(var(--text-primary-rgb), 0.05);
  border: none;
  cursor: pointer;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  padding: 8px;
  border-radius: 50%;
  transition: all 0.2s;
}

.close-btn:hover {
  background: rgba(var(--text-primary-rgb), 0.1);
  transform: rotate(90deg);
}

.modal-body {
  padding: 32px;
  overflow-y: auto;
  flex: 1;
  scrollbar-width: thin;
}

.info-section {
  margin-bottom: 32px;
}

.info-section h4 {
  display: flex;
  align-items: center;
  gap: 8px;
  border-bottom: 2px solid var(--accent);
  padding-bottom: 8px;
  margin-bottom: 16px;
  font-size: 1.1rem;
  font-weight: 800;
  color: var(--accent);
}

.info-grid {
  display: grid;
  grid-template-columns: 140px 1fr;
  gap: 16px;
  font-size: 0.95rem;
}

.info-label {
  font-weight: 800;
  color: var(--text-secondary);
}

.info-value {
  color: var(--text-primary);
  font-weight: 500;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.history-item {
  padding: 16px;
  background: rgba(var(--accent-rgb), 0.05);
  border-radius: 16px;
  border-left: 4px solid var(--accent);
}

.history-meta {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  font-size: 0.85rem;
  font-weight: 800;
  color: var(--text-secondary);
}

.history-content {
  font-size: 1rem;
  white-space: pre-wrap;
  color: var(--text-primary);
  line-height: 1.5;
}

.no-history {
  color: var(--text-secondary);
  font-style: italic;
  font-size: 1rem;
  padding: 20px;
  text-align: center;
}

.json-debug {
  background: #111;
  color: #2ed573;
  padding: 20px;
  border-radius: 16px;
  font-size: 0.85rem;
  overflow-x: auto;
  font-family: 'Fira Code', monospace;
  border: 1px solid #333;
}

@media (max-width: 600px) {
  .modal-overlay { padding: 0; }
  .modal-content {
    max-height: none;
    height: 100vh;
    border-radius: 0;
  }
  .info-grid { grid-template-columns: 1fr; gap: 4px; }
  .info-label { font-size: 0.8rem; }
  .modal-body { padding: 20px; }
}
</style>
