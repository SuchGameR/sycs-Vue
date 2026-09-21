<script setup lang="ts">
import { EMOJI_MAP, EMOJI_LIST, isEmojiText, searchEmoji } from '~/utils/emoji'

const emit = defineEmits<{ select: [emoji: string] }>()

const prefs = useReactionPrefs()
const custom = useCustomEmojis()
const { palette, recent } = prefs

const me = useState<any>('current-user', () => null)

const open = ref(false)
const query = ref('')
const customText = ref('')
const customError = ref('')
const trigger = ref<HTMLElement | null>(null)
const pos = ref({ bottom: 0, left: 0, width: 336 })

const emojiName = ref('')
const emojiFile = ref<File | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)
const uploading = ref(false)
const uploadError = ref('')
const manage = ref(false)

const unicodeResults = computed(() => {
  const q = query.value.trim()
  if (!q) return EMOJI_LIST.slice(0, 100)
  return searchEmoji(q, 100)
})

const customResults = computed(() => {
  const q = query.value.trim().toLowerCase().replace(/^:/, '')
  const list = custom.emojis.value
  if (!q) return list
  return list.filter(e => e.name.includes(q))
})

const owns = (e: { creatorId: string | null }) => e.creatorId && me.value?.id === e.creatorId

async function ensureMe() {
  if (me.value) return
  try {
    me.value = (await $fetch('/api/auth/me')).user
  } catch { /* ignore */ }
}

function toggle() {
  if (open.value) { open.value = false; return }
  const rect = trigger.value?.getBoundingClientRect()
  if (rect) {
    const width = 336
    const left = Math.min(Math.max(8, rect.left), window.innerWidth - width - 8)
    pos.value = { bottom: window.innerHeight - rect.top + 8, left, width }
  }
  open.value = true
  customError.value = ''
  uploadError.value = ''
  custom.ensure()
  ensureMe()
}

function choose(emoji: string) {
  prefs.pushRecent(emoji)
  emit('select', emoji)
  open.value = false
}

function pickCustom(e: { name: string }) {
  choose(':' + e.name + ':')
}

function addToPaletteText() {
  const raw = customText.value.trim()
  if (!raw) return
  let char = raw
  if (raw.startsWith(':') && raw.endsWith(':')) {
    const key = raw.slice(1, -1).toLowerCase()
    if (custom.byName.value[key]) char = ':' + key + ':'
    else { char = EMOJI_MAP[key] || '' }
    if (!char) { customError.value = 'その絵文字名は見つかりません'; return }
  }
  if (!isEmojiText(char) && !char.startsWith(':')) { customError.value = '絵文字を入力してください'; return }
  prefs.addToPalette(char)
  customText.value = ''
  customError.value = ''
  choose(char)
}

function onPickFile(e: Event) {
  const input = e.target as HTMLInputElement
  emojiFile.value = input.files?.[0] || null
  uploadError.value = ''
  if (emojiFile.value && !emojiName.value) {
    emojiName.value = emojiFile.value.name.replace(/\.[^.]+$/, '').toLowerCase().replace(/[^a-z0-9_]/g, '_').slice(0, 32)
  }
}

async function uploadEmoji() {
  const name = emojiName.value.trim().replace(/^:|:$/g, '').toLowerCase()
  if (!/^[a-z0-9_]{2,32}$/.test(name)) { uploadError.value = '名前は英数字と_で2〜32文字'; return }
  if (!emojiFile.value) { uploadError.value = '画像を選択してください'; return }
  uploading.value = true
  uploadError.value = ''
  try {
    const created = await custom.upload(name, emojiFile.value)
    emojiName.value = ''
    emojiFile.value = ''
    if (fileInput.value) fileInput.value.value = ''
    choose(':' + created.name + ':')
  } catch (e: any) {
    uploadError.value = e?.data?.message || 'アップロードに失敗しました'
  } finally {
    uploading.value = false
  }
}

async function removeEmoji(id: string) {
  try { await custom.remove(id) } catch { /* ignore */ }
}
</script>

<template>
  <div class="relative inline-flex">
    <button
      ref="trigger"
      type="button"
      @click="toggle"
      class="flex items-center gap-1 px-2 py-1 rounded-full text-sm border transition"
      :class="open ? 'bg-indigo-600/25 border-indigo-500/50 text-indigo-200' : 'border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-500'"
      title="リアクションを追加"
    >
      <Icon name="lucide:smile-plus" class="w-4 h-4" />
    </button>

    <Teleport to="body">
      <div v-if="open" class="fixed inset-0 z-[298]" @click="open = false" />
      <Transition name="rp-pop">
        <div
          v-if="open"
          class="fixed z-[299] bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-3"
          :style="{ left: pos.left + 'px', bottom: pos.bottom + 'px', width: pos.width + 'px' }"
          @click.stop
        >
          <div v-if="recent.length" class="mb-2">
            <div class="flex items-center justify-between mb-1">
              <span class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">よく使う</span>
            </div>
            <div class="flex flex-wrap gap-1">
              <button
                v-for="e in recent"
                :key="'r-' + e"
                type="button"
                @click="choose(e)"
                class="w-8 h-8 rounded-lg hover:bg-slate-800 text-lg transition flex items-center justify-center"
              ><EmojiIcon :emoji="e" /></button>
            </div>
          </div>

          <div class="mb-2">
            <div class="flex items-center justify-between mb-1">
              <span class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">パレット</span>
              <button
                type="button"
                @click="prefs.resetPalette()"
                class="text-[10px] text-slate-500 hover:text-indigo-400 transition"
              >リセット</button>
            </div>
            <div class="flex flex-wrap gap-1">
              <div v-for="e in palette" :key="'p-' + e" class="relative group">
                <button
                  type="button"
                  @click="choose(e)"
                  class="w-8 h-8 rounded-lg hover:bg-slate-800 text-lg transition flex items-center justify-center"
                ><EmojiIcon :emoji="e" /></button>
                <button
                  type="button"
                  @click.stop="prefs.removeFromPalette(e)"
                  class="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                >
                  <Icon name="lucide:x" class="w-2.5 h-2.5" />
                </button>
              </div>
            </div>
          </div>

          <div class="flex items-center gap-2 mb-2">
            <div class="flex-1 flex items-center gap-1.5 bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 focus-within:border-indigo-500 transition">
              <Icon name="lucide:search" class="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <input
                v-model="query"
                placeholder="検索 (happy, :cat:)"
                class="flex-1 bg-transparent border-none focus:ring-0 text-xs text-white placeholder-slate-500 min-w-0 p-0"
              />
            </div>
          </div>

          <div class="max-h-44 overflow-y-auto">
            <!-- Custom image emojis -->
            <template v-if="customResults.length">
              <div class="flex items-center justify-between mb-1">
                <span class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">カスタム</span>
                <button
                  type="button"
                  @click="manage = !manage"
                  class="text-[10px] text-slate-500 hover:text-indigo-400 transition"
                >{{ manage ? '完了' : '管理' }}</button>
              </div>
              <div class="grid grid-cols-8 gap-0.5 mb-2">
                <div v-for="e in customResults" :key="e.id" class="relative group">
                  <button
                    type="button"
                    @click="manage ? null : pickCustom(e)"
                    class="aspect-square w-full rounded-lg hover:bg-slate-800 transition flex items-center justify-center"
                    :title="':' + e.name + ':'"
                  >
                    <img :src="e.url" :alt="':' + e.name + ':'" class="sycs-emoji sycs-emoji--lg" draggable="false" />
                  </button>
                  <button
                    v-if="manage && owns(e)"
                    type="button"
                    @click.stop="removeEmoji(e.id)"
                    class="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-600 text-white flex items-center justify-center"
                  >
                    <Icon name="lucide:x" class="w-2.5 h-2.5" />
                  </button>
                </div>
              </div>
            </template>

            <!-- Unicode emojis -->
            <div class="grid grid-cols-8 gap-0.5">
              <button
                v-for="e in unicodeResults"
                :key="e.name"
                type="button"
                @click="choose(e.char)"
                class="aspect-square rounded-lg hover:bg-slate-800 text-lg transition flex items-center justify-center"
                :title="':' + e.name + ':'"
              >{{ e.char }}</button>
            </div>
          </div>

          <div class="mt-2 pt-2 border-t border-slate-800 space-y-2">
            <!-- Upload custom image emoji -->
            <div class="flex items-center gap-1.5">
              <input
                v-model="emojiName"
                placeholder="画像絵文字の名前"
                class="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 min-w-0"
                maxlength="32"
              />
              <button
                type="button"
                @click="fileInput?.click()"
                class="px-2 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-300 hover:border-slate-500 transition shrink-0"
                :title="emojiFile ? emojiFile.name : '画像を選択'"
              >
                <Icon name="lucide:image-plus" class="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                @click="uploadEmoji"
                :disabled="uploading"
                class="px-2.5 py-1.5 rounded-lg bg-indigo-600 text-xs font-bold text-white hover:bg-indigo-700 transition shrink-0 disabled:opacity-50"
              >{{ uploading ? '...' : '追加' }}</button>
              <input ref="fileInput" type="file" accept="image/png,image/gif,image/webp,image/jpeg" class="hidden" @change="onPickFile" />
            </div>
            <p v-if="emojiFile" class="text-[10px] text-slate-500 truncate">選択中: {{ emojiFile.name }}（GIF対応）</p>
            <p v-if="uploadError" class="text-[10px] text-red-400">{{ uploadError }}</p>

            <div class="flex items-center gap-1.5">
              <input
                v-model="customText"
                placeholder="パレットに追加 (直接 or :name:)"
                class="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 min-w-0"
                @keydown.enter.prevent="addToPaletteText"
              />
              <button
                type="button"
                @click="addToPaletteText"
                class="px-2.5 py-1.5 rounded-lg bg-slate-700 text-xs font-bold text-white hover:bg-slate-600 transition shrink-0"
              >追加</button>
            </div>
            <p v-if="customError" class="text-[10px] text-red-400">{{ customError }}</p>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.rp-pop-enter-active { transition: opacity 0.15s ease, transform 0.15s ease; }
.rp-pop-leave-active { transition: opacity 0.1s ease; }
.rp-pop-enter-from { opacity: 0; transform: translateY(6px); }
.rp-pop-leave-to { opacity: 0; }
</style>
