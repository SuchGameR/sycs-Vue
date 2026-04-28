<script setup lang="ts">
interface ImageProps {
  src: string;
  alt: string;
}

defineProps<{
  title: string;
  description?: string;
  image: ImageProps;
}>();
</script>
<template>
  <div class="card">
    <img :src="image.src" :alt="image.alt" />
    <h2>{{ title }}</h2>
    <p>{{ description }}</p>
  </div>
</template>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.card {
  aspect-ratio: 2/3;
  width: 220px;
  background-color: #eee;
  color: #111;
  margin: 2.5px;
  border-radius: 10px;
  border: solid 1px #c2c2c2;
  overflow: hidden;
  text-indent: 10px;
  justify-content: center;
  align-items: center;
}

.card img {
  justify-content: center;
  align-items: center;
  display: flex;
  height: 50%;
  width: 100%;
  background-color: red;
  text-indent: 0;
}
</style>
