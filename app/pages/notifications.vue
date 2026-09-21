<script setup lang="ts">
definePageMeta({
  middleware: [
    function () {
      return navigateTo('/actions', { redirectCode: 302 })
    },
  ],
})
</script>

<template>
  <div class="text-center text-slate-500 py-12">通知を移動しました…</div>
</template>
