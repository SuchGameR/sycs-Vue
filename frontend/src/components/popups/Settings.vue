<script setup>
import PrimaryProfile from "../commons/PrimaryProfile.vue";
defineEmits(['close']);
</script>

<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <h2>ユーザー設定</h2>
      <div class="settings-body">
        <PrimaryProfile username="KiwiBird" />
        <div class="settings-details">
          <p>ステータス: オンライン</p>
          <p>自己紹介: SYCS開発中！</p>
        </div>
      </div>
      <button class="btn-close" @click="$emit('close')">閉じる</button>
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
  z-index: 2000;
}

.modal-content {
  background: var(--background, #fff);
  color: var(--text-primary, #000);
  border-radius: 8px;
  width: 480px;
  max-width: 90%;
  padding: 32px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.3);
}

h2 {
  margin-top: 0;
  margin-bottom: 24px;
}

.settings-body {
  border: 1px solid rgba(0,0,0,0.1);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;
}

.settings-details {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid rgba(0,0,0,0.1);
  color: var(--text-secondary);
}

.btn-close {
  width: 100%;
  padding: 12px;
  background: #5865F2;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
}
</style>
