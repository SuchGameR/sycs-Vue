<template>
  <div
    v-if="visible"
    class="fixed bottom-4 right-4 z-[9999] w-[560px] max-w-[90vw] h-[320px] max-h-[70vh] flex flex-col bg-[#0b1020] border border-slate-800 rounded-lg shadow-xl overflow-hidden"
  >
    <header
      class="flex items-center justify-between px-3 py-1.5 text-xs bg-slate-900/80 border-b border-slate-800 text-slate-200"
    >
      <div class="flex items-center gap-2">
        <span class="font-semibold">SYCS Bridge Console</span>
        <span
          class="px-1.5 py-0.5 rounded border"
          :class="
            status.enabled
              ? status.reachable
                ? 'border-emerald-600/60 bg-emerald-600/20 text-emerald-200'
                : 'border-amber-600/60 bg-amber-600/20 text-amber-200'
              : 'border-slate-600/60 bg-slate-600/20 text-slate-300'
          "
        >
          {{ status.enabled ? (status.reachable ? 'PHP connected' : 'PHP unreachable') : 'PHP disabled' }}
        </span>
      </div>
      <div class="flex items-center gap-1">
        <button class="px-2 py-0.5 border border-slate-700 rounded hover:bg-slate-800" @click="refresh">Refresh</button>
        <button class="px-2 py-0.5 border border-slate-700 rounded hover:bg-slate-800" @click="toggle">Close</button>
      </div>
    </header>

    <nav class="flex items-center gap-1 px-2 py-1 border-b border-slate-800 bg-[#0b1020]/90 text-[11px]">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        class="px-2 py-0.5 rounded"
        :class="activeTab === tab.id ? 'bg-slate-700 text-white' : 'text-slate-300 hover:bg-slate-800/70'"
        @click="activeTab = tab.id"
      >
        {{ tab.name }}
      </button>
    </nav>

    <main class="flex-1 overflow-auto text-xs text-slate-100">
      <section v-if="activeTab === 'status'" class="p-2 space-y-2">
        <div class="grid grid-cols-2 gap-2">
          <div class="p-2 border border-slate-800 rounded bg-slate-900/40">
            <div class="text-slate-400">PHP_API_BASE</div>
            <div class="truncate">{{ status.phpBase || '(not set)' }}</div>
          </div>
          <div class="p-2 border border-slate-800 rounded bg-slate-900/40">
            <div class="text-slate-400">Enabled / Reachable</div>
            <div>{{ status.enabled }} / {{ status.reachable }}</div>
          </div>
        </div>
        <div class="p-2 border border-slate-800 rounded bg-slate-900/40">
          <div class="flex items-center justify-between">
            <div class="text-slate-400">Plugins ({{ pluginsList.length }})</div>
            <button class="px-2 py-0.5 border border-slate-700 rounded hover:bg-slate-800" @click="loadPlugins">
              Load
            </button>
          </div>
          <ul class="mt-1 space-y-0.5 max-h-[120px] overflow-auto">
            <li v-for="p in pluginsList" :key="p.id" class="flex justify-between">
              <span>{{ p.name }} <span class="text-slate-400">({{ p.id }})</span></span>
              <span class="text-slate-400">{{ p.source }}</span>
            </li>
            <li v-if="!pluginsList.length" class="text-slate-400">None</li>
          </ul>
        </div>
      </section>

      <section v-if="activeTab === 'call'" class="flex flex-col h-full p-2 gap-2">
        <div class="flex items-center gap-2">
          <select v-model="selectedAction" class="flex-1 bg-slate-900 border border-slate-700 rounded px-2 py-1">
            <option v-for="a in PHP_ACTIONS" :key="a.key" :value="a.key">
              {{ a.key }}
              <span v-if="a.description"> — {{ a.description }}</span>
            </option>
          </select>
          <button class="px-2 py-1 border border-slate-700 rounded hover:bg-slate-800" @click="execute">Call</button>
        </div>
        <textarea
          v-model="paramsJson"
          class="flex-1 bg-slate-900 border border-slate-700 rounded px-2 py-1 font-mono"
          spellcheck="false"
          placeholder='{"thread_id":1}'
        />
        <div class="h-[80px] overflow-auto border border-slate-800 rounded bg-slate-950/60 p-2 font-mono whitespace-pre-wrap">
          {{ callResultText }}
        </div>
      </section>

      <section v-if="activeTab === 'events'" class="p-2">
        <div class="max-h-[220px] overflow-auto space-y-1">
          <div v-for="e in events" :key="e.ts + e.type" class="p-1.5 border border-slate-800 rounded bg-slate-900/40">
            <div class="flex justify-between text-slate-400">
              <span>{{ e.type }}</span>
              <span>{{ new Date(e.ts).toLocaleTimeString() }}</span>
            </div>
            <pre class="mt-0.5 whitespace-pre-wrap">{{ pretty(e.data) }}</pre>
          </div>
          <div v-if="!events.length" class="text-slate-400">No events</div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
const { status, events, PHP_ACTIONS, refresh, call, plugins } = usePhpBridge()

const visible = ref(false)
const activeTab = ref<'status' | 'call' | 'events'>('status')
const tabs = [
  { id: 'status', name: 'Status' },
  { id: 'call', name: 'Call' },
  { id: 'events', name: 'Events' },
] as const

const selectedAction = ref(PHP_ACTIONS[0]?.key || 'get_threads')
const paramsJson = ref('{}')
const callResult = ref<any>(null)
const pluginsList = ref<Array<{ id: string; name: string; source: string }>>([])

const callResultText = computed(() => {
  if (callResult.value === null) return '(no result)'
  return JSON.stringify(callResult.value, null, 2)
})

function toggle() {
  visible.value = !visible.value
}

function pretty(d: unknown) {
  try {
    return JSON.stringify(d, null, 2)
  } catch {
    return String(d)
  }
}

async function execute() {
  let p: Record<string, unknown> = {}
  try {
    p = JSON.parse(paramsJson.value || '{}')
  } catch {
    callResult.value = { ok: false, error: 'Invalid JSON in params' }
    return
  }
  const r = await call(selectedAction.value, p)
  callResult.value = r
}

async function loadPlugins() {
  try {
    const r = await plugins()
    pluginsList.value = r.plugins as any
  } catch {
    pluginsList.value = []
  }
}

onMounted(() => {
  const handler = (e: KeyboardEvent) => {
    if (e.ctrlKey && e.key.toLowerCase() === 'j') {
      e.preventDefault()
      toggle()
    }
  }
  window.addEventListener('keydown', handler)
  onUnmounted(() => window.removeEventListener('keydown', handler))
})

onMounted(() => refresh())
</script>