import { defineStore } from "pinia";
import { ref } from "vue";

export const useUIStore = defineStore("ui", () => {
  const isListOpen = ref(false);

  function toggleList() {
    isListOpen.value = !isListOpen.value;
  }

  function setListOpen(value: boolean) {
    isListOpen.value = value;
  }

  return {
    isListOpen,
    toggleList,
    setListOpen,
  };
});
