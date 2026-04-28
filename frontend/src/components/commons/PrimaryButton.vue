<script setup>
import { computed } from "vue";
import * as icons from "lucide-vue-next";

const props = defineProps({
  name: {
    type: String,
    required: true,
  },
  ui: {
    type: String,
    default: "Info",
  },
  backgroundColor: String,
  textColor: String,
});

const currentIcon = computed(() => {
  return icons[props.ui] || icons.Info;
});
</script>

<template>
  <div class="button">
    <component :is="currentIcon" :size="20" />
    {{ name }}
  </div>
</template>

<style scoped>
.button {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 8px;
  cursor: pointer;
  transition: opacity 0.2s;
  margin-bottom: 2.5px;
  margin-top: 2.5px;
  user-select: none;
}

.button:hover {
  background-color: rgba(0, 0, 0, 0.05);
}
</style>
