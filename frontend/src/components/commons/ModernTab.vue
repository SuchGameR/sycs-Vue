<script setup>
import { computed } from "vue";
import * as icons from "lucide-vue-next";

const tabName = defineProps({
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
  fill: {
    type: String,
    default: "none",
    required: false,
  },
  url: String,
});

const url = computed(() => {
  return tabName.url;
});

const iconFillColor = computed(() => {
  return tabName.fill;
});

const currentIcon = computed(() => {
  return icons[tabName.ui] || icons.Info;
});
</script>
<template>
  <router-link :to="url">
    <li class="mainTab">
      <component
        :is="currentIcon"
        :size="20"
        :fill="iconFillColor"
        class="icon"
      />
      {{ name }}
    </li>
  </router-link>
</template>
<style scoped>
template {
  text-decoration: none;
}
.mainTab {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: var(--background);
  width: fit-content;
  height: 40px;
  line-height: 30px;
  padding: 5px;
  margin-right: var(--tiny-gap);
  border-radius: var(--sidebar-paddingSize);
  cursor: pointer;
  user-select: none;
}

.mainTab:hover {
  background-color: #dddddd;
}

.mainTab .icon {
  line-height: 40px;
  margin-right: 4px;
}
</style>
