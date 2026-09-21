<script setup lang="ts">
const timelines = useCustomTimelines()
const { fixedTabs, pinnedTabs, unpinnedTabs, activeId } = timelines

const showBuilder = ref(false)
const showMore = ref(false)

const visibleTabs = computed(() => [...fixedTabs, ...pinnedTabs.value])

function select(id: string) {
  timelines.setActive(id)
  showMore.value = false
}
</script>

<template>
  <div class="flex items-center gap-1 overflow-x-auto">
    <button
      v-for="tab in visibleTabs"
      :key="tab.id"
      @click="select(tab.id)"
      class="px-3 py-1.5 rounded-full text-sm font-medium transition whitespace-nowrap shrink-0"
      :class="activeId === tab.id ? 'bg-slate-100 text-slate-900' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'"
    >
      {{ tab.label }}
    </button>

    <div v-if="unpinnedTabs.length" class="relative shrink-0">
      <button
        @click="showMore = !showMore"
        class="px-2.5 py-1.5 rounded-full text-sm font-medium transition text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 flex items-center gap-1"
      >
        その他
        <Icon name="lucide:chevron-down" class="w-3.5 h-3.5" />
      </button>
      <div v-if="showMore" class="absolute top-full left-0 mt-1 bg-slate-900 border border-slate-800 rounded-xl py-1.5 shadow-xl z-50 min-w-48" @click.outside="showMore = false">
        <div v-for="tab in unpinnedTabs" :key="tab.id" class="flex items-center group">
          <button @click="select(tab.id)" class="flex-1 text-left px-3 py-2 text-sm transition truncate"
            :class="activeId === tab.id ? 'text-indigo-400' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'">
            {{ tab.label }}
          </button>
          <button @click.stop="timelines.togglePin(tab.id)" class="p-1.5 mr-1 text-slate-600 hover:text-indigo-400 transition opacity-0 group-hover:opacity-100" title="ピン留め">
            <Icon name="lucide:pin" class="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>

    <button
      @click="showBuilder = true"
      class="p-1.5 rounded-full text-slate-400 hover:text-indigo-400 hover:bg-slate-800/50 transition shrink-0"
      title="カスタムタイムラインを作成"
    >
      <Icon name="lucide:plus" class="w-4 h-4" />
    </button>

    <CustomTimelineModal v-if="showBuilder" @close="showBuilder = false" />
  </div>
</template>
