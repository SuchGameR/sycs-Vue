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
  fill: {
    type: String,
    default: "none",
    required: false,
  },
  url: String,
});

const url = computed(() => {
  return props.url;
});

const iconFillColor = computed(() => {
  return props.fill;
});

const currentIcon = computed(() => {
  return icons[props.ui] || icons.Info;
});
</script>

<template>
  <router-link v-if="url" :to="url" class="link">
    <div class="button">
      <component
        :is="currentIcon"
        :size="20"
        :fill="iconFillColor"
        class="UIcon"
      />
      <span class="menu-text">{{ name }}</span>
    </div>
  </router-link>
  <div v-else class="link" @click="$emit('click')">
    <div class="button">
      <component
        :is="currentIcon"
        :size="20"
        :fill="iconFillColor"
        class="UIcon"
      />
      <span class="menu-text">{{ name }}</span>
    </div>
  </div>
</template>

<style scoped>
@container small (max-width: 100px) {
  .menu-text {
    display: none;
  }
  .button:hover .menu-text {
    display: flex;
    min-width: fit-content;
    position: absolute;
    z-index: 1000 !important;
    left: 75px;
    justify-content: center;
    align-items: center;
    white-space: nowrap;
    padding-left: 5px;
    padding-right: 5px;
    padding-bottom: 2px;
    border-radius: 8px;
    line-height: 35px;
    background-color: var(--background);
    border: 1px solid var(--primary);
  }
  .button {
    justify-content: center;
    gap: 0;
  }
  .UIcon {
    padding: 0;
  }
}

.UIcon {
  width: 20px;
  height: 20px;
  min-width: 20px;
  min-height: 20px;
  max-width: 20px;
  max-height: 20px;
}

.menu-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  /* font-size: 0.8rem; */
}

.link {
  display: block;
  width: 100%;
}
.button {
  color: var(--text-primary);
  display: inline-flex;
  align-items: center;
  width: 100%;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 8px;
  cursor: pointer;
  transition: opacity 0.2s;
  margin-bottom: 2.5px;
  margin-top: 2.5px;
  height: 40px;
  user-select: none;
  position: relative;
}

.button:hover {
  background-color: rgba(0, 0, 0, 0.05);
}
</style>
