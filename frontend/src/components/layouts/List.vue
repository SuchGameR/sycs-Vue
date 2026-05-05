<template>
  <aside class="user-list-sidebar">
    <h3>ユーザー — 3</h3>
    <div class="user-group">
      <div class="user-item">
        <div class="avatar online"></div>
        <span>KiwiBird</span>
      </div>
      <div class="user-item">
        <div class="avatar online"></div>
        <span>Antigravity</span>
      </div>
      <div class="user-item">
        <div class="avatar offline"></div>
        <span>User123</span>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
// ロジックが必要になったらここに書くよ
</script>

<style scoped>
.user-list-sidebar {
  /* display: none; */
  width: 240px;
  background-color: var(--background);
  color: var(--text-primary);
  padding: 20px;
  margin: var(--tiny-gap);
  margin-left: 0;
  border-radius: calc(var(--tiny-gap) * 2);
  /* height: calc(100vh - var(--tiny-gap) * 2); */
  height: 100vh;
  border-left: solid 1px rgba(0, 0, 0, 0.05);
}

h3 {
  font-size: 0.75rem;
  text-transform: uppercase;
  color: var(--text-secondary);
  margin-bottom: 16px;
  letter-spacing: 0.5px;
}

.user-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.user-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 6px 8px;
  border-radius: 4px;
  cursor: pointer;
}

.user-item:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.avatar {
  width: 32px;
  height: 32px;
  background-color: #ccc;
  border-radius: 50%;
  position: relative;
}

.avatar.online::after {
  content: "";
  position: absolute;
  bottom: 0;
  right: 0;
  width: 10px;
  height: 10px;
  background-color: #3ba55c;
  border-radius: 50%;
  border: 2px solid var(--background);
}

.avatar.offline::after {
  content: "";
  position: absolute;
  bottom: 0;
  right: 0;
  width: 10px;
  height: 10px;
  background-color: #747f8d;
  border-radius: 50%;
  border: 2px solid var(--background);
}
</style>
