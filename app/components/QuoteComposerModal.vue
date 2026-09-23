<script setup lang="ts">
const { target, error, closeQuote, submitQuote } = useQuoteComposer()
const mediaPane = useMediaPane()
const route = useRoute()

watch(() => route.fullPath, () => closeQuote())
</script>

<template>
  <Teleport to="body">
    <ClientOnly>
    <div v-if="target" class="fixed inset-0 z-[190] flex items-center justify-center p-4">
      <div class="fixed inset-0 bg-black/70" @click="closeQuote()" />
      <div class="relative bg-[#151a24] border border-slate-700 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-4">
        <div class="flex items-center justify-between mb-3">
          <h3 class="font-bold text-white flex items-center gap-2">
            <Icon name="lucide:message-square-quote" class="w-4 h-4 text-indigo-400" />
            引用リポスト
          </h3>
          <button @click="closeQuote()" class="p-1 rounded-full text-slate-500 hover:text-white hover:bg-slate-800 transition">
            <Icon name="lucide:x" class="w-4 h-4" />
          </button>
        </div>

        <QuotedPostCard :post="target" class="mb-3" @open="mediaPane.openSmart(target)" />

        <PostComposer placeholder="コメントを書く...（空でも可）" @submit="submitQuote" />

        <p v-if="error" class="text-sm text-red-400 mt-2">{{ error }}</p>
      </div>
    </div>
    </ClientOnly>
  </Teleport>
</template>