<script setup lang="ts">
import { usePhpBridge } from '../composables/usePhpBridge'
import { useRealtime } from '../composables/useRealtime'

const bridge = usePhpBridge()
const realtime = useRealtime()

const open = ref(false)
const tab = ref<'status' | 'call' | 'events'>('status')

const selectedAction = ref('hello')
const actionParams = ref('{}')
const csrfToken = ref('')
const logs = ref<{ ts: number; text: string }[]>([])
const registerFields = reactive({ id: 'suchgamer-php', name: 'SuchGamer PHP', version: '1.0.0' })

function log(text: string) {
  logs.value = [{ ts: Date.now(), text }, ...logs.value].slice(0, 50)
}

onMounted(async () => {
  await bridge.refreshStatus()
})

function onKeydown(e: KeyboardEvent) {
  if (e.ctrlKey && e.key.toLowerCase() === 'j') {
    e.preventDefault()
    open.value = !open.value
  }
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => window.removeEventListener('keydown', onKeydown))

realtime.on('bridge.*', (payload) => {
  const p = (payload ?? {}) as { type?: string; source?: string; payload?: Record<string, unknown>; ts?: number }
  bridge.pushEvent({
    type: p.type ?? 'bridge.event',
    source: p.source ?? 'bridge',
    payload: p.payload ?? {},
    ts: p.ts ?? Date.now(),
  })
})

async function runCall() {
  let params: Record<string, unknown> = {}
  try {
    params = JSON.parse(actionParams.value || '{}')
  } catch {
    log('params: invalid JSON, using {}')
  }
  const result = await bridge.call(selectedAction.value, params, csrfToken.value || undefined)
  log(`${selectedAction.value} => ${result.ok ? JSON.stringify(result.data) : 'ERR ' + result.error}`)
}

async function runRegister() {
  const r = await bridge.register({ ...registerFields, capabilities: ['carbon'] })
  log(`register => ${JSON.stringify(r)}`)
  await bridge.refreshStatus()
}

async function runRelay() {
  await bridge.relay('bridge.test', { hello: 'world', at: new Date().toISOString() })
  log('relay bridge.test sent')
}
</script>

<template>
  <div v-if="open" class="fixed inset-y-0 right-0 z-[100] flex w-[520px] max-w-[92vw] flex-col border-l border-zinc-800 bg-[#101014] shadow-2xl">
    <div class="flex items-center justify-between border-b border-zinc-800 px-4 py-3">
      <div class="flex items-center gap-2">
        <Icon name="mdi:bridge" class="text-xl" />
        <span class="font-bold">PHP Bridge</span>
        <span
          class="rounded px-1.5 py-0.5 text-[10px] font-bold"
          :class="bridge.status?.enabled ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-700 text-zinc-300'"
        >
          {{ bridge.status?.enabled ? 'ENABLED' : (bridge.status?.reachable === false ? 'UNREACHABLE' : 'DISABLED') }}
        </span>
      </div>
      <button class="text-zinc-500 hover:text-white" @click="open = false">
        <Icon name="mdi:close" class="text-xl" />
      </button>
    </div>

    <div class="flex gap-1 border-b border-zinc-800 px-3 pt-2 text-sm">
      <button
        v-for="t in (['status', 'call', 'events'] as const)"
        :key="t"
        class="rounded-t px-3 py-1.5"
        :class="tab === t ? 'border-b-2 border-emerald-500 font-semibold' : 'text-zinc-500'"
        @click="tab = t"
      >
        {{ t }}
      </button>
    </div>

    <div class="flex-1 overflow-auto p-4">
      <div v-if="tab === 'status'" class="space-y-4 text-sm">
        <div class="grid grid-cols-[120px_1fr] gap-y-2">
          <span class="text-zinc-500">phpBase</span><span class="break-all">{{ bridge.status?.phpBase || '-' }}</span>
          <span class="text-zinc-500">enabled</span><span>{{ bridge.status?.enabled }}</span>
          <span class="text-zinc-500">reachable</span><span>{{ bridge.status?.reachable }}</span>
        </div>
        <div>
          <div class="mb-2 font-semibold">Registered plugins ({{ bridge.status?.plugins?.length ?? 0 }})</div>
          <div v-for="p in bridge.status?.plugins ?? []" :key="p.id" class="mb-2 rounded-lg border border-zinc-800 p-2">
            <div class="flex items-center justify-between">
              <span class="font-medium" :class="p.source === 'nuxt' ? 'text-emerald-400' : ''">{{ p.name }}</span>
              <span class="text-[10px] text-zinc-500">{{ p.id }} · v{{ p.version }} · {{ p.source }}</span>
            </div>
            <div class="mt-1 flex flex-wrap gap-1">
              <span v-for="c in p.capabilities" :key="c" class="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] text-zinc-300">{{ c }}</span>
            </div>
          </div>
        </div>
        <button class="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-semibold hover:bg-emerald-500" @click="bridge.refreshStatus">
          Refresh
        </button>
      </div>

      <div v-else-if="tab === 'call'" class="space-y-4 text-sm">
        <div class="grid grid-cols-2 gap-2">
          <div>
            <label class="mb-1 block text-xs text-zinc-500">Action</label>
            <input v-model="selectedAction" type="text" class="w-full rounded border border-zinc-800 bg-zinc-900 px-2 py-1.5" />
            <div class="mt-1 max-h-40 overflow-y-auto">
              <button
                v-for="(v, k) in PHP_ACTIONS"
                :key="k"
                class="mb-0.5 block w-full rounded px-2 py-1 text-left text-xs hover:bg-zinc-800"
                @click="selectedAction = v"
              >
                {{ k }} → {{ v }}
              </button>
            </div>
          </div>
          <div>
            <label class="mb-1 block text-xs text-zinc-500">csrfToken</label>
            <input v-model="csrfToken" type="text" class="mb-3 w-full rounded border border-zinc-800 bg-zinc-900 px-2 py-1.5" />
            <label class="mb-1 block text-xs text-zinc-500">params (JSON)</label>
            <textarea v-model="actionParams" rows="8" class="w-full rounded border border-zinc-800 bg-zinc-900 px-2 py-1.5 font-mono text-xs" />
          </div>
        </div>
        <button class="rounded-lg bg-emerald-600 px-3 py-1.5 font-semibold hover:bg-emerald-500" :disabled="busy" @click="runCall">
          {{ busy ? 'Calling…' : 'Call PHP API' }}
        </button>

        <div class="border-t border-zinc-800 pt-3">
          <div class="mb-2 font-semibold">Register plugin</div>
          <div class="grid grid-cols-3 gap-2">
            <input v-model="registerFields.id" placeholder="id" class="rounded border border-zinc-800 bg-zinc-900 px-2 py-1.5" />
            <input v-model="registerFields.name" placeholder="name" class="rounded border border-zinc-800 bg-zinc-900 px-2 py-1.5" />
            <input v-model="registerFields.version" placeholder="version" class="rounded border border-zinc-800 bg-zinc-900 px-2 py-1.5" />
          </div>
          <div class="mt-2 flex gap-2">
            <button class="rounded-lg bg-zinc-700 px-3 py-1.5 hover:bg-zinc-600" @click="runRegister">Register</button>
            <button class="rounded-lg bg-zinc-700 px-3 py-1.5 hover:bg-zinc-600" @click="runRelay">Relay test</button>
          </div>
        </div>

        <div class="mt-4">
          <div class="mb-2 font-semibold">Logs ({{ logs.length }})</div>
          <div class="max-h-48 space-y-1 overflow-y-auto font-mono text-xs">
            <div v-for="(l, i) in logs" :key="i" class="break-all border-b border-zinc-900 py-1">
              <span class="text-zinc-500">&gt;</span> {{ l.text }}
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="tab === 'events'" class="space-y-1 text-sm">
        <div v-for="(e, i) in bridge.events" :key="e.ts + '-' + i" class="rounded border border-zinc-800/50 p-2">
          <span class="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-bold text-emerald-400">{{ e.type }}</span>
          <span class="ml-2 text-[10px] text-zinc-500">{{ e.source }} · {{ new Date(e.ts).toLocaleTimeString() }}</span>
          <pre class="mt-1 overflow-x-auto text-[10px] text-zinc-300">{{ JSON.stringify(e.payload, null, 2) }}</pre>
        </div>
        <div v-if="!bridge.events.length" class="text-zinc-500">No events yet</div>
      </div>
    </div>
  </div>
</template>