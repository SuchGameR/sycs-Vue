<script setup>
import { ref, onMounted, watch, onUnmounted, nextTick } from "vue";
import { useAuthStore } from "../../stores/auth";
import { useUIStore } from "../../stores/ui";
import { useRouter, useRoute } from "vue-router";
import * as icons from "lucide-vue-next";

const authStore = useAuthStore();
const uiStore = useUIStore();
const router = useRouter();
const route = useRoute();

const scrollContainer = ref(null);
let scrollTimeout = null;
let resizeTimeout = null;

const navItems = [
  { name: "home", ui: "Armchair", url: "/" },
  { name: "message", ui: "MessageCircle", url: "/message" },
  { name: "notice", ui: "Bell", url: "/notice", badge: true },
  { name: "favorite", ui: "Heart", url: "/favorite" },
  { name: "search", ui: "Search", url: "/search" },
  { name: "profile", ui: "User", isProfile: true },
];

const activeIndex = ref(0);
let isInternalAction = false;
let isResizing = false;

// 精密な計算用の定数
const ITEM_SIZE = 56;
const GAP = 24;
const ITEM_WIDTH = ITEM_SIZE + GAP;

const updateActiveByScroll = () => {
  if (!scrollContainer.value || isInternalAction || isResizing) return;

  const container = scrollContainer.value;
  const scrollLeft = container.scrollLeft;
  const index = Math.round(scrollLeft / ITEM_WIDTH);

  if (index >= 0 && index < navItems.length) {
    if (activeIndex.value !== index) {
      activeIndex.value = index;
    }

    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      if (isInternalAction || isResizing) return;

      const item = navItems[index];

      // プロフィール項目が中央に来た時、自動遷移はさせない（クリックで設定を開くため）
      if (item.isProfile) return;

      const targetUrl = item.url;

      if (targetUrl && route.path !== targetUrl) {
        isInternalAction = true;
        router.push(targetUrl).then(() => {
          setTimeout(() => {
            isInternalAction = false;
          }, 300);
        });
      }
    }, 50);
  }
};

const handleItemClick = (index, url) => {
  if (isResizing) return;

  const item = navItems[index];

  // プロフィールアイコンをクリックしたら即座に設定を開く
  if (item.isProfile) {
    uiStore.setSettingsOpen(true);
    activeIndex.value = index;
    if (scrollContainer.value) {
      scrollContainer.value.scrollTo({
        left: index * ITEM_WIDTH,
        behavior: "smooth",
      });
    }
    return;
  }

  isInternalAction = true;
  activeIndex.value = index;

  if (url) {
    router.push(url);
  }

  if (scrollContainer.value) {
    scrollContainer.value.scrollTo({
      left: index * ITEM_WIDTH,
      behavior: "smooth",
    });
  }

  setTimeout(() => {
    isInternalAction = false;
  }, 800);
};

const handleResize = () => {
  isResizing = true;
  clearTimeout(resizeTimeout);
  if (scrollContainer.value) {
    scrollContainer.value.scrollTo({
      left: activeIndex.value * ITEM_WIDTH,
      behavior: "auto",
    });
  }
  resizeTimeout = setTimeout(() => {
    isResizing = false;
  }, 400);
};

const syncCarouselToRoute = (newPath) => {
  const index = navItems.findIndex(
    (item) =>
      item.url === newPath || (item.isProfile && uiStore.isSettingsOpen),
  );

  if (index !== -1) {
    activeIndex.value = index;
    nextTick(() => {
      if (scrollContainer.value) {
        if (
          Math.abs(scrollContainer.value.scrollLeft - index * ITEM_WIDTH) > 2
        ) {
          isInternalAction = true;
          scrollContainer.value.scrollTo({
            left: index * ITEM_WIDTH,
            behavior: "smooth",
          });
          setTimeout(() => {
            isInternalAction = false;
          }, 800);
        }
      }
    });
  }
};

watch(
  () => route.path,
  (newPath) => {
    if (isInternalAction) return;
    syncCarouselToRoute(newPath);
  },
  { immediate: true },
);

// 設定画面の開閉を監視して同期
watch(
  () => uiStore.isSettingsOpen,
  (isOpen) => {
    if (isOpen) {
      const index = navItems.findIndex((item) => item.isProfile);
      if (index !== -1) {
        activeIndex.value = index;
        if (scrollContainer.value) {
          scrollContainer.value.scrollTo({
            left: index * ITEM_WIDTH,
            behavior: "smooth",
          });
        }
      }
    }
  },
);

onMounted(() => {
  if (scrollContainer.value) {
    scrollContainer.value.addEventListener("scroll", updateActiveByScroll, {
      passive: true,
    });
    window.addEventListener("resize", handleResize);
    syncCarouselToRoute(route.path);
  }
});

onUnmounted(() => {
  if (scrollContainer.value) {
    scrollContainer.value.removeEventListener("scroll", updateActiveByScroll);
  }
  window.removeEventListener("resize", handleResize);
});
</script>

<template>
  <div class="mobile-nav-bar">
    <!-- 左: サーバーアイコン -->
    <button class="side-icon-btn server-btn" @click="uiStore.toggleSidebar">
      <icons.LayoutGrid :size="24" />
    </button>

    <!-- 中央: カルーセル -->
    <div class="carousel-viewport">
      <div class="carousel-mask left"></div>
      <div class="center-scroll-nav" ref="scrollContainer">
        <div class="snap-container">
          <div
            v-for="(item, index) in navItems"
            :key="item.name"
            class="snap-item"
            :class="{ active: activeIndex === index }"
            @click="handleItemClick(index, item.url)"
          >
            <div class="icon-wrapper">
              <template v-if="item.isProfile">
                <div
                  class="nav-avatar-wrapper"
                  :class="{ 'active-border': activeIndex === index }"
                >
                  <img
                    :src="authStore.user?.avatar_url || '/default-avatar.png'"
                    class="nav-avatar"
                  />
                </div>
              </template>
              <template v-else>
                <component :is="icons[item.ui]" :size="30" />
                <Transition name="scale">
                  <span
                    v-if="item.badge && authStore.notificationCount > 0"
                    class="badge"
                  >
                    {{ authStore.notificationCount }}
                  </span>
                </Transition>
              </template>
            </div>
          </div>
        </div>
      </div>
      <div class="carousel-mask right"></div>
    </div>

    <!-- 右: メンバーリストアイコン -->
    <button class="side-icon-btn list-btn" @click="uiStore.toggleList">
      <icons.ChevronLeft
        :size="28"
        :class="{ 'rotate-180': uiStore.isListOpen }"
      />
    </button>
  </div>
</template>

<style scoped>
.mobile-nav-bar {
  display: flex;
  align-items: center;
  height: 90px;
  background: var(--surface);
  border-top: 1px solid var(--border);
  padding: 0 10px;
  backdrop-filter: blur(25px);
  background: rgba(var(--surface, 255, 255, 255), 0.88);
  box-shadow: 0 -8px 30px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 100;
}

.side-icon-btn {
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(var(--text-primary-rgb), 0.05);
  border: none;
  color: var(--text-secondary);
  border-radius: 18px;
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.side-icon-btn:active {
  transform: scale(0.85);
  background: rgba(var(--accent-rgb), 0.1);
  color: var(--accent);
}

.carousel-viewport {
  flex: 1;
  position: relative;
  height: 100%;
  display: flex;
  align-items: center;
  overflow: hidden;
  margin: 0 10px;
}

.carousel-mask {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 80px;
  z-index: 5;
  pointer-events: none;
}

.carousel-mask.left {
  left: 0;
  background: linear-gradient(to right, var(--surface) 10%, transparent);
}

.carousel-mask.right {
  right: 0;
  background: linear-gradient(to left, var(--surface) 10%, transparent);
}

.center-scroll-nav {
  width: 100%;
  height: 100%;
  overflow-x: auto;
  scrollbar-width: none;
  display: flex;
  align-items: center;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
  scroll-snap-align: start;
  /* アイテムサイズ 56px の半分 = 28px */
  padding-left: calc(50% - 28px);
  padding-right: calc(50% - 28px);
}

.center-scroll-nav::-webkit-scrollbar {
  display: none;
}

.snap-container {
  display: flex;
  align-items: center;
  gap: 24px;
}

.snap-item {
  scroll-snap-align: center;
  flex-shrink: 0;
  width: 56px;
  height: 56px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  color: var(--text-secondary);
  transition: all 0.6s cubic-bezier(0.2, 1, 0.3, 1);
  position: relative;
}

.snap-item.active {
  color: var(--accent);
  /* transform: scale(1.35) translateY(-6px); */
  transform: scale(1.35);
  border-radius: 50%;
  background: rgba(var(--accent-rgb), 0.1);
  /* box-shadow: 0 4px 12px rgba(var(--accent-rgb), 0.3); */
}

.icon-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-avatar-wrapper {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  padding: 2px;
  border: 2px solid var(--border);
  transition: all 0.3s;
  overflow: hidden;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.nav-avatar-wrapper.active-border {
  border-color: var(--accent);
  box-shadow: 0 0 15px rgba(var(--accent-rgb), 0.5);
  border-width: 3px;
  transform: scale(1.1);
}

.nav-avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

.badge {
  position: absolute;
  top: -8px;
  right: -12px;
  background: #ff4757;
  color: white;
  font-size: 0.75rem;
  padding: 2px 6px;
  border-radius: 12px;
  min-width: 20px;
  font-weight: 900;
  border: 2px solid var(--surface);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

.scale-enter-active,
.scale-leave-active {
  transition: transform 0.2s;
}
.scale-enter-from,
.scale-leave-to {
  transform: scale(0);
}

.rotate-180 {
  transform: rotate(180deg);
}
</style>
