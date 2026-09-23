<script setup lang="ts">
import ModelViewer from './media/ModelViewer.vue'

const { map: customEmojiMap } = useCustomEmojis()
const me = useState<any>('current-user', () => null)
const { openSwitcher } = useAccounts()

async function ensureMe() {
  if (!me.value) {
    try { me.value = (await $fetch('/api/auth/me')).user } catch { /* not signed in */ }
  }
}
onMounted(ensureMe)

const props = defineProps<{
  mediaKind?: 'any' | 'video' | 'image' | 'audio' | 'model' | 'file'
  placeholder?: string
  quotedPost?: any
}>()

const emit = defineEmits<{
  submit: [content: string, attachments?: Array<any>, visibility?: string, visibleTo?: string[], quotedPost?: any]
}>()

const content = ref('')
const pendingFiles = ref<Array<{
  file: File; preview: string; url?: string; blurUrl?: string | null
  type: string; mime: string; blur: boolean; watermark: boolean
}>>([])
const uploading = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)
const dragging = ref(false)
const activePreview = ref<number | null>(null)
const showPrivacy = ref(false)

const { trigger: visTrigger, update: updateVisPos, style: visStyle } = useDropdownPosition(200)

function togglePrivacy() {
  showPrivacy.value = !showPrivacy.value
  if (showPrivacy.value) nextTick(() => updateVisPos(260))
}

function repositionVis() { if (showPrivacy.value) updateVisPos(260) }

watch(showPrivacy, (v) => {
  if (!import.meta.client) return
  if (v) {
    window.addEventListener('scroll', repositionVis, true)
    window.addEventListener('resize', repositionVis)
  } else {
    window.removeEventListener('scroll', repositionVis, true)
    window.removeEventListener('resize', repositionVis)
  }
})

onUnmounted(() => {
  if (!import.meta.client) return
  window.removeEventListener('scroll', repositionVis, true)
  window.removeEventListener('resize', repositionVis)
})

const visibility = ref('public')
const visibleTo = ref<string[]>([])

type VisibilityOption = { key: string; label: string; icon: string }
const visibilityOptions: VisibilityOption[] = [
  { key: 'public', label: 'すべての人に公開', icon: 'lucide:globe' },
  { key: 'followers', label: 'フォロワーのみ', icon: 'lucide:users' },
  { key: 'close_friends', label: '親しい友達のみ', icon: 'lucide:heart' },
  { key: 'specific', label: '特定の人', icon: 'lucide:user-check' },
]

const selectedVis = computed(() => visibilityOptions.find(o => o.key === visibility.value))

const MAX_FILES = 8

const KINDS: Record<string, { mimes: string[]; exts: string[] }> = {
  image: { mimes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp'], exts: ['.png', '.jpg', '.jpeg', '.gif', '.webp'] },
  video: { mimes: ['video/webm', 'video/mp4'], exts: ['.webm', '.mp4'] },
  audio: { mimes: ['audio/mpeg', 'audio/ogg', 'audio/wav', 'audio/mp4'], exts: ['.mp3', '.ogg', '.wav', '.m4a'] },
  model: { mimes: ['model/gltf-binary', 'model/gltf+json', 'model/obj'], exts: ['.glb', '.gltf', '.obj', '.fbx', '.stl'] },
  file: { mimes: ['application/pdf', 'application/zip', 'text/plain', 'text/markdown', 'application/json', 'text/csv'], exts: ['.pdf', '.zip', '.txt', '.md', '.json', '.csv'] },
}
const ALL_KINDS = ['image', 'video', 'audio', 'model', 'file']

const allowedKinds = computed(() => {
  const k = String(props.mediaKind || '')
  return KINDS[k] ? [k] : ALL_KINDS
})

const acceptAttr = computed(() => allowedKinds.value.flatMap(k => KINDS[k].exts).join(','))

function fileExt(name: string) {
  const m = name.toLowerCase().match(/\.([a-z0-9]+)$/)
  return m ? '.' + m[1] : ''
}

function kindOfFile(f: File): string | null {
  const ext = fileExt(f.name)
  for (const k of allowedKinds.value) {
    if (KINDS[k].mimes.includes(f.type) || KINDS[k].exts.includes(ext)) return k
  }
  return null
}

function onFileSelect(e: Event) {
  const input = e.target as HTMLInputElement
  if (!input.files?.length) return
  const remaining = MAX_FILES - pendingFiles.value.length
  for (const f of Array.from(input.files).slice(0, remaining)) {
    const kind = kindOfFile(f)
    if (!kind) continue
    pendingFiles.value.push({
      file: f,
      preview: URL.createObjectURL(f),
      type: kind,
      mime: f.type || KINDS[kind].mimes[0],
      blur: false,
      watermark: false,
    })
  }
  input.value = ''
}

function addFiles(files: FileList | File[]) {
  const remaining = MAX_FILES - pendingFiles.value.length
  for (const f of Array.from(files).slice(0, Math.max(0, remaining))) {
    const kind = kindOfFile(f)
    if (!kind) continue
    pendingFiles.value.push({
      file: f,
      preview: URL.createObjectURL(f),
      type: kind,
      mime: f.type || KINDS[kind].mimes[0],
      blur: false,
      watermark: false,
    })
  }
}

function onPaste(e: ClipboardEvent) {
  const files = e.clipboardData?.files
  if (files?.length) { e.preventDefault(); addFiles(files) }
}

function onDrop(e: DragEvent) {
  dragging.value = false
  if (e.dataTransfer?.files?.length) { e.preventDefault(); addFiles(e.dataTransfer.files) }
}

function removeFile(index: number) {
  const f = pendingFiles.value[index]
  if (f.preview) URL.revokeObjectURL(f.preview)
  pendingFiles.value.splice(index, 1)
  if (activePreview.value === index) activePreview.value = null
}

async function handleSubmit() {
  if (!content.value.trim() && !pendingFiles.value.length && !props.quotedPost) return
  uploading.value = true
  try {
    let attachments: Array<any> | undefined
    if (pendingFiles.value.length) {
      const formData = new FormData()
      for (const f of pendingFiles.value) formData.append('files', f.file)
      const res = await $fetch<{ files: Array<{ url: string; blurUrl: string | null; type: string; mime: string }> }>('/api/upload', {
        method: 'POST', body: formData,
      })
      attachments = res.files.map((f, i) => ({
        ...f,
        blur: pendingFiles.value[i]?.blur || false,
        watermark: pendingFiles.value[i]?.watermark || false,
        mime: pendingFiles.value[i]?.mime || f.type || 'image/png',
      }))
    }
    emit('submit', content.value, attachments, visibility.value, visibleTo.value.length ? visibleTo.value : undefined, props.quotedPost)
    content.value = ''
    for (const f of pendingFiles.value) { if (f.preview) URL.revokeObjectURL(f.preview) }
    pendingFiles.value = []
    visibility.value = 'public'
    visibleTo.value = []
  } finally { uploading.value = false }
}

const previewVisible = computed(() => !!content.value.trim() || pendingFiles.value.length > 0)

function activeFile() {
  return activePreview.value !== null ? pendingFiles.value[activePreview.value] : null
}

function fileIcon(mime: string) {
  if (mime.startsWith('image/')) return 'lucide:image'
  if (mime.startsWith('video/')) return 'lucide:video'
  if (mime.startsWith('audio/')) return 'lucide:music'
  if (mime.startsWith('model/')) return 'lucide:box'
  return 'lucide:file'
}
</script>

<template>
  <div
    class="flex gap-3 rounded-2xl transition p-1 -m-1"
    :class="dragging ? 'ring-2 ring-indigo-500 bg-indigo-600/10' : ''"
    @dragover.prevent="dragging = true"
    @dragleave.prevent="dragging = false"
    @drop="onDrop"
    @paste="onPaste"
  >
    <button
      type="button"
      class="w-10 h-10 rounded-full shrink-0 overflow-hidden bg-indigo-600 ring-1 ring-slate-700/60 hover:ring-indigo-500 transition relative group"
      @click="openSwitcher"
      title="アカウント切り替え"
    >
      <img v-if="avatarSrc(me.avatarUrl)" :src="avatarSrc(me.avatarUrl)" class="w-full h-full object-cover" />
      <div v-else class="w-full h-full flex items-center justify-center text-white">
        <Icon name="lucide:user" class="w-5 h-5" />
      </div>
      <span class="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition">
        <Icon name="lucide:user-round-cog" class="w-4 h-4 text-white" />
      </span>
    </button>
    <div class="flex-1 space-y-2">
      <EmojiTextarea v-model="content" :rows="2" auto-resize
        textarea-class="w-full bg-transparent border-none focus:ring-0 text-white placeholder-slate-500 resize-none text-sm leading-5"
        :placeholder="placeholder || 'なにかあった？'" />

      <QuotedPostCard v-if="quotedPost" :post="quotedPost" class="mt-1" />

      <!-- Live post preview while composing -->
      <div v-if="previewVisible" class="mt-2 rounded-xl border border-dashed border-slate-700 bg-slate-900/40 p-3">
        <p class="text-[11px] text-slate-500 mb-2 flex items-center gap-1">
          <Icon name="lucide:eye" class="w-3 h-3" /> プレビュー
        </p>
        <div class="flex gap-3">
          <img v-if="avatarSrc(me.avatarUrl)" :src="avatarSrc(me.avatarUrl)" class="w-9 h-9 rounded-full object-cover shrink-0" />
          <div v-else class="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-xs shrink-0">
            <Icon name="lucide:user" class="w-4 h-4" />
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2">
              <span class="font-bold text-white text-sm truncate">{{ me?.displayName || 'あなた' }}</span>
              <span class="text-slate-500 text-xs shrink-0">@{{ me?.username || '' }} · たった今</span>
            </div>
            <p v-if="content.trim()" class="text-slate-200 text-sm leading-relaxed whitespace-pre-wrap break-words"
              v-html="renderRichText(content, { custom: customEmojiMap })" />
            <div v-if="pendingFiles.length" class="flex flex-wrap gap-1.5 mt-1">
              <img v-for="f in pendingFiles.filter((x: any) => x.type === 'image')" :key="f.preview"
                :src="f.preview" class="w-16 h-16 rounded-lg object-cover" />
              <span v-if="pendingFiles.some((x: any) => x.type !== 'image')" class="flex items-center gap-1 text-xs text-slate-500 px-2 py-1 rounded-lg bg-slate-800/60">
                <Icon :name="fileIcon(pendingFiles.find((x: any) => x.type !== 'image')!.mime)" class="w-3.5 h-3.5" />
                {{ pendingFiles.filter((x: any) => x.type !== 'image').length }} ファイル
              </span>
            </div>
            <QuotedPostCard v-if="quotedPost" :post="quotedPost" class="mt-1" />
          </div>
        </div>
      </div>

      <!-- File previews (clickable) -->
      <div v-if="pendingFiles.length" class="flex flex-wrap gap-2">
        <button v-for="(f, i) in pendingFiles" :key="i"
          @click="activePreview = i"
          class="relative w-16 h-16 rounded-lg overflow-hidden bg-slate-900/70 border border-slate-700 hover:border-indigo-500 transition shrink-0">
          <img v-if="f.type === 'image'" :src="f.preview" class="w-full h-full object-cover" />
          <div v-else class="w-full h-full flex items-center justify-center text-slate-500">
            <Icon :name="fileIcon(f.mime)" class="w-5 h-5" />
          </div>
          <button @click.stop="removeFile(i)" class="absolute top-0.5 right-0.5 p-0.5 rounded-full bg-black/60 text-white hover:bg-black/80">
            <Icon name="lucide:x" class="w-2.5 h-2.5" />
          </button>
        </button>
      </div>

      <!-- Attachment preview modal -->
      <Teleport to="body">
        <div v-if="activePreview !== null && activeFile()" class="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/70"
          @click.self="activePreview = null">
          <div class="bg-[#151a24] border border-slate-700 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            @click.stop>
            <div class="relative bg-black rounded-t-2xl min-h-[200px] flex items-center justify-center">
              <img v-if="activeFile()!.type === 'image'" :src="activeFile()!.preview" class="max-w-full max-h-[50vh] object-contain rounded-t-2xl" />
              <video v-else-if="activeFile()!.type === 'video'" :src="activeFile()!.preview" controls autoplay muted loop
                class="max-w-full max-h-[50vh] rounded-t-2xl" />
              <audio v-else-if="activeFile()!.type === 'audio'" :src="activeFile()!.preview" controls class="w-full m-4" />
              <ModelViewer v-else-if="activeFile()!.type === 'model'" :src="activeFile()!.preview" class="w-full" />
              <div v-else class="text-slate-500 p-8">
                <Icon :name="fileIcon(activeFile()!.mime)" class="w-12 h-12 mx-auto" />
              </div>
              <button @click="activePreview = null" class="absolute top-3 right-3 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80">
                <Icon name="lucide:x" class="w-4 h-4" />
              </button>
            </div>
            <div class="p-4 space-y-3">
              <p class="text-xs text-slate-500 truncate">{{ activeFile()!.file.name }}</p>
              <label v-if="activeFile()!.type === 'image'" class="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition"
                :class="activeFile()!.blur ? 'bg-indigo-600/20' : 'bg-slate-800/30 hover:bg-slate-800/50'">
                <input type="checkbox" :checked="activeFile()!.blur"
                  @change="pendingFiles[activePreview!].blur = !pendingFiles[activePreview!].blur"
                  class="w-4 h-4 rounded border-slate-600 text-indigo-600 focus:ring-indigo-500" />
                <div>
                  <p class="text-sm font-medium text-white">ぼかしをかける</p>
                  <p class="text-xs text-slate-500">閲覧者がクリックで表示できるぼかしを適用</p>
                </div>
              </label>
              <label v-if="activeFile()!.type === 'image'" class="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition"
                :class="activeFile()!.watermark ? 'bg-indigo-600/20' : 'bg-slate-800/30 hover:bg-slate-800/50'">
                <input type="checkbox" :checked="activeFile()!.watermark"
                  @change="pendingFiles[activePreview!].watermark = !pendingFiles[activePreview!].watermark"
                  class="w-4 h-4 rounded border-slate-600 text-indigo-600 focus:ring-indigo-500" />
                <div>
                  <p class="text-sm font-medium text-white">ウォーターマーク</p>
                  <p class="text-xs text-slate-500">画像に@ユーザー名を透かしとして埋め込み</p>
                </div>
              </label>
            </div>
          </div>
        </div>
      </Teleport>

      <div class="flex items-center justify-between flex-wrap gap-2">
        <div class="flex items-center gap-2">
          <button @click="fileInput?.click()" :disabled="pendingFiles.length >= MAX_FILES || uploading"
            class="p-1.5 rounded-full text-slate-500 hover:text-indigo-400 hover:bg-slate-800/50 transition disabled:opacity-30"
            :title="`ファイル添付 (${pendingFiles.length}/${MAX_FILES})`">
            <Icon name="lucide:paperclip" class="w-4 h-4" />
          </button>
          <span v-if="pendingFiles.length" class="text-[11px] text-slate-600">{{ pendingFiles.length }}/{{ MAX_FILES }}</span>

          <button @click="togglePrivacy" ref="visTrigger"
            class="p-1.5 rounded-full text-slate-500 hover:text-indigo-400 hover:bg-slate-800/50 transition text-xs flex items-center gap-1">
            <Icon :name="selectedVis?.icon || 'lucide:globe'" class="w-3.5 h-3.5" />
            <span class="hidden sm:inline">{{ selectedVis?.label || '公開' }}</span>
          </button>
          <Teleport to="body">
            <div v-if="showPrivacy" class="fixed inset-0 z-[298]" @click="showPrivacy = false" />
            <div v-if="showPrivacy"
              class="fixed z-[299] bg-slate-900 border border-slate-800 rounded-xl py-1.5 shadow-xl overflow-y-auto"
              :style="visStyle">
              <button v-for="opt in visibilityOptions" :key="opt.key"
                @click="visibility = opt.key; showPrivacy = false"
                class="w-full text-left px-4 py-2 text-sm flex items-center gap-2 transition"
                :class="visibility === opt.key ? 'text-indigo-400 bg-slate-800/50' : 'text-slate-400 hover:text-white hover:bg-slate-800/30'">
                <Icon :name="opt.icon" class="w-4 h-4" /> {{ opt.label }}
              </button>
            </div>
          </Teleport>
        </div>

        <button @click="handleSubmit"
          :disabled="(!content.trim() && !pendingFiles.length && !quotedPost) || uploading"
          class="px-5 py-1.5 rounded-full bg-indigo-600 text-sm font-bold text-white hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5">
          <Icon v-if="uploading" name="lucide:loader-2" class="w-3.5 h-3.5 animate-spin" />
          {{ uploading ? 'アップロード中...' : 'ポストする' }}
        </button>
      </div>

      <input ref="fileInput" type="file" multiple :accept="acceptAttr" class="hidden" @change="onFileSelect" />
    </div>
  </div>
</template>
