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
  padding: 10px 20px;
  background: #ffffff;
  border-bottom: 1px solid #eee;
  cursor: pointer;
  transition: background 0.2s;
  color: #141414;
}

.current-thread-bar:hover {
  background: #f9f9f9;
}

.thread-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.thread-icon-mini {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  background: #eee;
}

.thread-title {
  font-weight: 600;
  font-size: 1.1rem;
}

.chevron {
  font-size: 0.7rem;
  color: #999;
  transition: transform 0.3s;
}

.chevron.rotated {
  transform: rotate(180deg);
}

/* ドロップダウンメニュー */
.thread-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  border-bottom-left-radius: 20px;
  border-bottom-right-radius: 20px;
  overflow: hidden;
  z-index: 10;
}

.dropdown-content {
  display: flex;
  max-height: 400px;
  padding: 20px;
  gap: 30px;
}

.side-panel {
  flex: 1;
  border-right: 1px solid #eee;
  padding-right: 20px;
}

.main-panel {
  flex: 2;
}

h3 {
  font-size: 0.9rem;
  color: #888;
  margin-bottom: 15px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.thread-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 10px;
  overflow-y: auto;
}

.thread-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  color: #141414;
}

.thread-item:hover {
  background: #f0f2ff;
}

.thread-item.active {
  background: #646cff;
  color: white;
}

.thread-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  background: #eee;
}

.action-btn {
  width: 100%;
  padding: 12px;
  border-radius: 10px;
  border: none;
  background: #646cff;
  color: white;
  font-weight: 600;
  margin-bottom: 10px;
  cursor: pointer;
}

.action-btn.secondary {
  background: #f0f0f0;
  color: #444;
}

/* トランジション */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease-out;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateY(-20px);
  opacity: 0;
}
</style>
