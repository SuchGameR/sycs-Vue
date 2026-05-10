import { defineStore } from "pinia";
import { ref } from "vue";

export const useUIStore = defineStore("ui", () => {
  const isListOpen = ref(false);
  const isSidebarOpen = ref(false); // For mobile server drawer
  const isSettingsOpen = ref(false);
  const isCreateServerModalOpen = ref(false);
  const isMobile = ref(window.innerWidth < 510);

  function toggleList() {
    isListOpen.value = !isListOpen.value;
  }

  function setListOpen(value: boolean) {
    isListOpen.value = value;
  }

  function toggleSidebar() {
    isSidebarOpen.value = !isSidebarOpen.value;
  }

  function setSidebarOpen(value: boolean) {
    isSidebarOpen.value = value;
  }

  function toggleSettings() {
    isSettingsOpen.value = !isSettingsOpen.value;
  }

  function setSettingsOpen(value: boolean) {
    isSettingsOpen.value = value;
  }

  function toggleCreateServer() {
    isCreateServerModalOpen.value = !isCreateServerModalOpen.value;
  }

  function setCreateServerOpen(value: boolean) {
    isCreateServerModalOpen.value = value;
  }

  function updateMobile() {
    isMobile.value = window.innerWidth < 510;
  }

  window.addEventListener("resize", updateMobile);

  return {
    isListOpen,
    toggleList,
    setListOpen,
    isSidebarOpen,
    toggleSidebar,
    setSidebarOpen,
    isSettingsOpen,
    toggleSettings,
    setSettingsOpen,
    isCreateServerModalOpen,
    toggleCreateServer,
    setCreateServerOpen,
    isMobile,
  };
});
