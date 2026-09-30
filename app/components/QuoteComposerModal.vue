<script setup lang="ts">
const { target, error, closeQuote, submitQuote } = useQuoteComposer()
const mediaPane = useMediaPane()
const route = useRoute()

watch(() => route.fullPath, () => closeQuote())
</script>

<template>
  <ClientOnly>
    <BottomSheet :open="!!target" height="min(90dvh, 36rem)" :dismiss-on-backdrop="true" @close="closeQuote()">
      <div class="p-4">
        <div class="flex items-center justify-between mb-3">
          <h3 class="font-bold text-white flex items-center gap-2">
            <Icon name="lucide:message-square-quote" class="w-4 h-4 text-indigo-400" />
            引用リポスト
          </h3>
          <button @click="closeQuote()" class="p-1 rounded-full text-on-surface-variant hover:text-white hover:bg-surface-container transition">
            <Icon name="lucide:x" class="w-4 h-4" />
          </button>
        </div>

        <QuotedPostCard :post="target" class="mb-3" @open="mediaPane.openSmart(target)" />

        <PostComposer placeholder="コメントを書く...（空でも可）" @submit="submitQuote" />

        <p v-if="error" class="text-sm text-red-400 mt-2">{{ error }}</p>
      </div>
    </BottomSheet>
  </ClientOnly>
</template>