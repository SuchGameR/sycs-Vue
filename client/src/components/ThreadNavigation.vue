<script setup lang="ts">
import { ref, onMounted } from 'vue'

const props = defineProps<{
  currentThread: { id: number, title: string, icon_url?: string, creator_id: number },
  currentUserId: number
}>()

const emit = defineEmits(['select-thread', 'create-thread', 'edit-thread'])

const isOpen = ref(false)
const threads = ref<any[]>([])
const loading = ref(false)

const toggleMenu = () => {
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    fetchThreads()
  }
}

const fetchThreads = async () => {
  loading.value = true
  try {
    const response = await fetch('http://localhost:3000/api/threads')
    if (response.ok) {
      threads.value = await response.json()
    }
  } catch (e) {
    console.error('Failed to fetch threads')
  } finally {
    loading.value = false
  }
}

const selectThread = (thread: any) => {
  emit('select-thread', thread)
  isOpen.value = false
}

onMounted(() => {
  fetchThreads()
})
</script>

<template>
  <div class="thread-nav-container">
    <!-- 現在のスレッド表示 (トリガー) -->
    <div class="current-thread-bar" @click="toggleMenu">
      <div class="thread-info">
        <img :src="currentThread.icon_url || '/defaultIcon.svg'" class="thread-icon-mini" />
        <span class="thread-title">{{ currentThread.title }}</span>
        <i class='bx bx-chevron-down dropdown-arrow' :class="{ rotated: isOpen }"></i>
      </div>
    </div>

    <!-- にょきっと出るメニュー -->
    <Transition name="slide">
      <div v-if="isOpen" class="thread-dropdown">
        <div class="dropdown-content">
          <!-- 左側: 管理ボタン -->
          <div class="side-panel">
            <h3>管理</h3>
            <button @click="emit('create-thread'); isOpen = false" class="action-btn">
              <i class='bx bx-plus'></i> 新規スレッド作成
            </button>
            <button 
              v-if="currentThread.creator_id === currentUserId" 
              @click="emit('edit-thread'); isOpen = false" 
              class="action-btn secondary"
            >
              <i class='bx bx-edit-alt'></i> スレッド編集
            </button>
          </div>

          <!-- 右側: スレッド一覧 -->
          <div class="main-panel">
            <h3>スレッド一覧</h3>
            <div v-if="loading" class="loading">読み込み中...</div>
            <div v-else class="thread-list">
              <div 
                v-for="thread in threads" 
                :key="thread.id" 
                class="thread-item"
                :class="{ active: thread.id === currentThread.id }"
                @click="selectThread(thread)"
              >
                <i class='bx bx-hash'></i>
                <span>{{ thread.title }}</span>
              </div>
            </div>
          </div>
        </div>
        <!-- 閉じるためのオーバーレイ -->
        <div class="overlay" @click="isOpen = false"></div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.thread-nav-container {
  position: relative;
  z-index: 100;
}

.current-thread-bar {
  display: flex;
  align-items: center;
  padding: 12px 24px;
  background: var(--sys-surface);
  border-bottom: 1px solid var(--sys-outline);
  cursor: pointer;
  transition: background 0.2s;
  color: var(--sys-on-surface);
}

.current-thread-bar:hover {
  background: var(--sys-surface-variant);
}

.thread-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.thread-icon-mini {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  object-fit: cover;
}

.thread-title {
  font-weight: 500;
  font-size: 1.125rem;
}

.dropdown-arrow {
    margin-left: 8px;
    font-size: 1.25rem;
    color: var(--sys-on-surface-variant);
    transition: transform 0.2s;
}

.dropdown-arrow.rotated {
    transform: rotate(180deg);
}

/* ドロップダウンメニュー */
.thread-dropdown {
  position: absolute;
  top: 100%;
  left: 16px;
  width: 480px;
  background: var(--sys-surface);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  border-radius: 16px;
  overflow: hidden;
  z-index: 10;
  margin-top: 8px;
  border: 1px solid var(--sys-outline);
}

.dropdown-content {
  display: flex;
  flex-direction: column;
  max-height: 500px;
  padding: 16px;
  gap: 16px;
}

h3 {
  font-size: 0.75rem;
  color: var(--sys-on-surface-variant);
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
}

.thread-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  overflow-y: auto;
}

.thread-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
  color: var(--sys-on-surface);
  font-size: 0.875rem;
}

.thread-item:hover {
  background: var(--sys-surface-variant);
}

.thread-item.active {
  background: var(--sys-primary-container);
  color: var(--sys-on-primary-container);
  font-weight: 500;
}

.side-panel {
    display: flex;
    gap: 8px;
    padding-bottom: 16px;
    border-bottom: 1px solid var(--sys-outline);
}

.action-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px;
  border-radius: 8px;
  border: 1px solid var(--sys-outline);
  background: var(--sys-surface);
  color: var(--sys-primary);
  font-weight: 500;
  font-size: 0.875rem;
  cursor: pointer;
  transition: background 0.2s;
}

.action-btn:hover {
  background: var(--sys-primary-container);
}

/* トランジション */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.2s ease-out;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateY(-10px);
  opacity: 0;
}

.overlay {
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    z-index: -1;
}
</style>
