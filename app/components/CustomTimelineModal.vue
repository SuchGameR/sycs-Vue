<script setup lang="ts">
import { TIMELINE_PRESETS } from '~/composables/useCustomTimelines'

const emit = defineEmits<{ close: [] }>()
const timelines = useCustomTimelines()

const mode = ref<'easy' | 'detail'>('easy')
const label = ref('')
const conditions = reactive({
  scope: 'global' as 'global' | 'local' | 'following' | 'recommended',
  mediaType: '' as '' | 'image' | 'video' | 'audio' | 'text',
  sort: 'latest' as 'latest' | 'popular',
  includeRelated: false,
  serverId: '',
  channelId: '',
})

const { data: serversData } = useFetch('/api/servers', { key: 'timeline-builder-servers' })
const servers = computed(() => serversData.value?.servers || [])
const channels = ref<any[]>([])
const loadingChannels = ref(false)

watch(() => conditions.serverId, async (id) => {
  conditions.channelId = ''
  channels.value = []
  if (!id) return
  loadingChannels.value = true
  try {
    const data = await $fetch(`/api/servers/${id}`)
    channels.value = (data.channels || []).filter((c: any) => c.type !== 'voice')
  } catch {
    channels.value = []
  } finally {
    loadingChannels.value = false
  }
})

function createFromPreset(preset: typeof TIMELINE_PRESETS[number]) {
  timelines.addTab({
    label: preset.label,
    pinned: true,
    preset: preset.key,
    conditions: { ...preset.conditions },
  } as any)
  emit('close')
}

function createCustom() {
  const name = label.value.trim() || 'カスタム'
  timelines.addTab({
    label: name,
    pinned: true,
    conditions: {
      scope: conditions.scope,
      mediaType: conditions.mediaType || undefined,
      sort: conditions.sort,
      includeRelated: conditions.includeRelated,
      serverId: conditions.serverId || undefined,
      channelId: conditions.channelId || undefined,
      serverName: servers.value.find((s: any) => s.id === conditions.serverId)?.name,
      channelName: channels.value.find((c: any) => c.id === conditions.channelId)?.name,
    },
  } as any)
  emit('close')
}

const scopeOptions = [
  { key: 'global', label: '全体' },
  { key: 'local', label: 'ローカル' },
  { key: 'following', label: 'フォロー中' },
  { key: 'recommended', label: 'オススメ' },
]
const mediaOptions = [
  { key: '', label: 'すべて' },
  { key: 'video', label: '動画' },
  { key: 'image', label: '画像' },
  { key: 'audio', label: '音楽' },
  { key: 'text', label: 'テキスト' },
]
const sortOptions = [
  { key: 'latest', label: '最新' },
  { key: 'popular', label: '人気' },
]
const selectCls = 'w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500'
</script>

<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/70" @click.self="emit('close')">
      <div class="bg-[#151a24] border border-slate-700 rounded-2xl w-full max-w-md max-h-[88vh] overflow-y-auto">
        <div class="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <h3 class="font-bold text-white">カスタムタイムライン</h3>
          <button @click="emit('close')" class="text-slate-500 hover:text-white transition">
            <Icon name="lucide:x" class="w-5 h-5" />
          </button>
        </div>

        <div class="flex p-1.5 m-4 mb-2 rounded-xl bg-slate-800/60">
          <button @click="mode = 'easy'" class="flex-1 py-1.5 rounded-lg text-sm font-bold transition"
            :class="mode === 'easy' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'">かんたん</button>
          <button @click="mode = 'detail'" class="flex-1 py-1.5 rounded-lg text-sm font-bold transition"
            :class="mode === 'detail' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'">詳細</button>
        </div>

        <!-- Easy -->
        <div v-if="mode === 'easy'" class="p-4 pt-2">
          <p class="text-xs text-slate-500 mb-3">よく使う条件から作成（タブにピン留めされます）</p>
          <div class="grid grid-cols-2 gap-2">
            <button
              v-for="p in TIMELINE_PRESETS"
              :key="p.key"
              @click="createFromPreset(p)"
              class="flex items-center gap-2.5 p-3 rounded-xl bg-slate-800/50 border border-slate-800 hover:border-indigo-500/60 hover:bg-slate-800 transition text-left"
            >
              <Icon :name="p.icon" class="w-4 h-4 text-indigo-400 shrink-0" />
              <span class="text-sm text-slate-200">{{ p.label }}</span>
            </button>
          </div>
        </div>

        <!-- Detail -->
        <div v-else class="p-4 pt-2 space-y-4">
          <div>
            <label class="block text-xs font-bold text-slate-400 mb-1.5">名前</label>
            <input v-model="label" :class="selectCls" placeholder="マイタイムライン" maxlength="30" />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-bold text-slate-400 mb-1.5">範囲</label>
              <select v-model="conditions.scope" :class="selectCls">
                <option v-for="o in scopeOptions" :key="o.key" :value="o.key">{{ o.label }}</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-400 mb-1.5">並び順</label>
              <select v-model="conditions.sort" :class="selectCls">
                <option v-for="o in sortOptions" :key="o.key" :value="o.key">{{ o.label }}</option>
              </select>
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-400 mb-1.5">メディア種別</label>
            <div class="flex flex-wrap gap-1.5">
              <button v-for="o in mediaOptions" :key="o.key" type="button"
                @click="conditions.mediaType = o.key as any"
                class="px-3 py-1.5 rounded-lg text-xs font-bold transition"
                :class="conditions.mediaType === o.key ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'">
                {{ o.label }}
              </button>
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-400 mb-1.5">サーバー / チャンネル指定（任意）</label>
            <div class="grid grid-cols-2 gap-3">
              <select v-model="conditions.serverId" :class="selectCls">
                <option value="">すべてのサーバー</option>
                <option v-for="s in servers" :key="s.id" :value="s.id">{{ s.name }}</option>
              </select>
              <select v-model="conditions.channelId" :class="selectCls" :disabled="!conditions.serverId || loadingChannels">
                <option value="">{{ loadingChannels ? '読み込み中...' : 'すべてのチャンネル' }}</option>
                <option v-for="c in channels" :key="c.id" :value="c.id">#{{ c.name }}</option>
              </select>
            </div>
          </div>

          <label class="flex items-center gap-3 p-3 rounded-xl bg-slate-800/40 cursor-pointer">
            <input v-model="conditions.includeRelated" type="checkbox" class="w-4 h-4 rounded border-slate-600 text-indigo-600 focus:ring-indigo-500" />
            <div>
              <p class="text-sm text-white font-medium">関連コンテンツを含める</p>
              <p class="text-xs text-slate-500">いいねした人の投稿など、似た系統の人たちを含めます</p>
            </div>
          </label>

          <button @click="createCustom"
            class="w-full py-2.5 rounded-xl bg-indigo-600 text-sm font-bold text-white hover:bg-indigo-700 transition">
            作成してピン留め
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
