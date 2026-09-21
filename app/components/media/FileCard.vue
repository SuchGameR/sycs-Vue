<script setup lang="ts">
const props = defineProps<{
  url: string
  name?: string
  mime?: string
  size?: number
}>()

const ext = computed(() => {
  const n = props.name || props.url
  const m = n.split('?')[0].match(/\.([a-z0-9]+)$/i)
  return (m ? m[1] : '').toLowerCase()
})

const displayName = computed(() => props.name || props.url.split('/').pop() || 'ファイル')

const meta = computed(() => {
  const e = ext.value
  if (['pdf'].includes(e)) return { icon: 'lucide:file-text', color: 'text-red-400', label: 'PDF' }
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(e)) return { icon: 'lucide:file-archive', color: 'text-amber-400', label: 'アーカイブ' }
  if (['doc', 'docx', 'txt', 'md', 'rtf'].includes(e)) return { icon: 'lucide:file-text', color: 'text-sky-400', label: 'ドキュメント' }
  if (['xls', 'xlsx', 'csv'].includes(e)) return { icon: 'lucide:file-spreadsheet', color: 'text-emerald-400', label: '表計算' }
  if (['ppt', 'pptx'].includes(e)) return { icon: 'lucide:file-presentation', color: 'text-orange-400', label: 'プレゼン' }
  if (['glb', 'gltf', 'obj', 'fbx', 'stl', '3ds'].includes(e)) return { icon: 'lucide:box', color: 'text-fuchsia-400', label: '3Dモデル' }
  if (['mp3', 'wav', 'ogg', 'flac', 'm4a'].includes(e)) return { icon: 'lucide:music', color: 'text-pink-400', label: 'オーディオ' }
  if (['mp4', 'webm', 'mov', 'mkv'].includes(e)) return { icon: 'lucide:video', color: 'text-indigo-400', label: '動画' }
  if (['js', 'ts', 'json', 'html', 'css', 'py', 'rs', 'go'].includes(e)) return { icon: 'lucide:file-code', color: 'text-cyan-400', label: 'コード' }
  return { icon: 'lucide:file', color: 'text-slate-400', label: e ? e.toUpperCase() : 'ファイル' }
})

const sizeLabel = computed(() => {
  const bytes = props.size
  if (!bytes || bytes <= 0) return ''
  const units = ['B', 'KB', 'MB', 'GB']
  let v = bytes
  let i = 0
  while (v >= 1024 && i < units.length - 1) { v /= 1024; i++ }
  return `${v.toFixed(v >= 10 || i === 0 ? 0 : 1)} ${units[i]}`
})

const downloadable = computed(() => props.url.startsWith('/uploads/') || props.url.startsWith('http'))
</script>

<template>
  <div class="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700 hover:border-slate-600 transition">
    <div class="w-11 h-11 rounded-xl bg-slate-900 flex items-center justify-center shrink-0">
      <Icon :name="meta.icon" class="w-5 h-5" :class="meta.color" />
    </div>
    <div class="min-w-0 flex-1">
      <p class="text-sm text-white font-medium truncate" :title="displayName">{{ displayName }}</p>
      <p class="text-[11px] text-slate-500">
        {{ meta.label }}<template v-if="sizeLabel"> · {{ sizeLabel }}</template>
      </p>
    </div>
    <a v-if="downloadable" :href="url" :download="displayName" class="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition shrink-0" title="ダウンロード">
      <Icon name="lucide:download" class="w-4 h-4" />
    </a>
    <a v-if="downloadable" :href="url" target="_blank" rel="noopener noreferrer" class="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition shrink-0" title="新しいタブで開く">
      <Icon name="lucide:external-link" class="w-4 h-4" />
    </a>
  </div>
</template>
