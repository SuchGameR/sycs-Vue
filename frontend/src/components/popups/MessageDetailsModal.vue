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
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10000;
}

.modal-content {
  background: var(--surface);
  color: var(--text-primary);
  width: 90%;
  max-width: 700px;
  max-height: 80vh;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  border: 1px solid var(--border);
}

.modal-header {
  padding: 16px 20px;
  border-bottom: 1px solid var(--border);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  font-weight: 800;
}

.close-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  padding: 4px;
  border-radius: 50%;
}

.close-btn:hover {
  background: rgba(0, 0, 0, 0.1);
}

.modal-body {
  padding: 20px;
  overflow-y: auto;
  flex: 1;
}

.scrollable {
  scrollbar-width: thin;
  scrollbar-color: var(--accent) transparent;
}

.info-section {
  margin-bottom: 24px;
}

.info-section h4 {
  display: flex;
  align-items: center;
  gap: 6px;
  border-bottom: 2px solid var(--accent);
  padding-bottom: 4px;
  margin-bottom: 12px;
  font-size: 1rem;
  color: var(--accent);
}

.info-grid {
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: 12px;
  font-size: 0.9rem;
}

.info-label {
  font-weight: 700;
  color: var(--text-secondary);
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.history-item {
  padding: 12px;
  background: var(--secondary);
  border-radius: 8px;
  border-left: 4px solid var(--accent);
}

.history-meta {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--text-secondary);
}

.history-content {
  font-size: 0.9rem;
  white-space: pre-wrap;
  color: var(--text-primary);
}

.no-history {
  color: var(--text-secondary);
  font-style: italic;
  font-size: 0.9rem;
}

.json-debug {
  background: #000;
  color: #0f0;
  padding: 12px;
  border-radius: 8px;
  font-size: 0.8rem;
  overflow-x: auto;
  font-family: monospace;
}
</style>
