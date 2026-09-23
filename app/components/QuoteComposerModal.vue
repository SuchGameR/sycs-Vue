<script setup lang="ts">
const quote = useQuoteComposer()
const mediaPane = useMediaPane()

async function submit(content: string, attachments?: Array<any>, visibility?: string, visibleTo?: string[]) {
  await quote.submitQuote(content, attachments, visibility, visibleTo)
}
</script>

<template>
  <Teleport to="body">
    <div v-if="quote.target" class="fixed inset-0 z-[190] flex items-center justify-center p-4">
      <div class="fixed inset-0 bg-black/70" @click="quote.closeQuote()" />
      <div class="relative bg-[#151a24] border border-slate-700 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-4">
        <div class="flex items-center justify-between mb-3">
          <h3 class="font-bold text-white flex items-center gap-2">
            <Icon name="lucide:message-square-quote" class="w-4 h-4 text-indigo-400" />
            引用リポスト
          </h3>
          <button @click="quote.closeQuote()" class="p-1 rounded-full text-slate-500 hover:text-white hover:bg-slate-800 transition">
            <Icon name="lucide:x" class="w-4 h-4" />
          </button>
        </div>

        <QuotedPostCard :post="quote.target" class="mb-3" @open="mediaPane.openSmart(quote.target)" />

        <PostComposer placeholder="コメントを書く...（空でも可）" @submit="submit" />

        <p v-if="quote.error" class="text-sm text-red-400 mt-2">{{ quote.error }}</p>
      </div>
    </div>
  </Teleport>
</template>