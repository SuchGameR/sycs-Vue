import { ref, onMounted, onUnmounted } from "vue";
import { useUIStore } from "../stores/ui";

export function useSidebarSwipe() {
  const uiStore = useUIStore();
  const touchStartX = ref(0);
  const touchStartY = ref(0);
  const minSwipeDistance = 40;
  const edgeThreshold = 40; // 画面端から40px以内を「エッジ」とする

  const handleTouchStart = (e: TouchEvent) => {
    touchStartX.value = e.touches[0].clientX;
    touchStartY.value = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: TouchEvent) => {
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const deltaX = touchEndX - touchStartX.value;
    const deltaY = touchEndY - touchStartY.value;
    const screenWidth = window.innerWidth;

    // 水平方向のスワイプが垂直方向より大きく、かつ一定以上の距離がある場合
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > minSwipeDistance) {
      
      // 左端からの右スワイプ -> サーバーリスト（サイドバー）を開く
      if (deltaX > 0 && touchStartX.value < edgeThreshold) {
        uiStore.setSidebarOpen(true);
        uiStore.setListOpen(false);
      } 
      // 右端からの左スワイプ -> メンバーリストを開く
      else if (deltaX < 0 && touchStartX.value > screenWidth - edgeThreshold) {
        uiStore.setListOpen(true);
        uiStore.setSidebarOpen(false);
      }
      // 中央付近でのスワイプ（ドロワーが開いている時の閉じる動作）
      else if (deltaX < 0 && uiStore.isSidebarOpen) {
        uiStore.setSidebarOpen(false);
      }
      else if (deltaX > 0 && uiStore.isListOpen) {
        uiStore.setListOpen(false);
      }
    }
  };

  onMounted(() => {
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });
  });

  onUnmounted(() => {
    window.removeEventListener("touchstart", handleTouchStart);
    window.removeEventListener("touchend", handleTouchEnd);
  });
}
