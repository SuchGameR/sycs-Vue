<script setup lang="ts">
const now = ref(new Date())
let timer: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  timer = setInterval(() => { now.value = new Date() }, 1000)
})
onUnmounted(() => { if (timer) clearInterval(timer) })

const time = computed(() =>
  now.value.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
)
const date = computed(() =>
  now.value.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })
)
</script>

<template>
  <div class="h-full flex flex-col items-center justify-center gap-1 px-4 text-center">
    <p class="text-3xl font-extrabold tracking-tight text-white tabular-nums">{{ time }}</p>
    <p class="text-xs text-slate-400">{{ date }}</p>
  </div>
</template>
