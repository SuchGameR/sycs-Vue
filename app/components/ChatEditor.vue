<script setup lang="ts">
import { useEditor, EditorContent } from '@tiptap/vue-3'
import { Document } from '@tiptap/extension-document'
import { Paragraph } from '@tiptap/extension-paragraph'
import { Text } from '@tiptap/extension-text'
import { HardBreak } from '@tiptap/extension-hard-break'
import { searchEmoji, shouldJumboEmoji } from '~/utils/emoji'
import { EmojiImage, serializeDoc } from '~/utils/richEditor'

const props = defineProps<{ placeholder?: string }>()
const emit = defineEmits<{ submit: [text: string]; update: [text: string] }>()

const custom = useCustomEmojis()
const hasContent = ref(false)
const jumbo = ref(false)
const suggestions = ref<EmojiSuggestion[]>([])
const activeIdx = ref(0)
const emojiOpen = ref(false)
let matchFrom = -1
let matchTo = -1

interface EmojiSuggestion {
  key: string
  name: string
  insert: string
  char?: string
  url?: string
}

function refreshState(ed: any) {
  hasContent.value = !ed.isEmpty
  const text = serializeDoc(ed.state.doc)
  jumbo.value = shouldJumboEmoji(text, custom.map.value)
  if (ed.view?.dom) ed.view.dom.style.fontSize = jumbo.value ? '1.75rem' : ''
  emit('update', text)
}

function detectQuery(editor: any) {
  const from = editor.state.selection.from
  const before = editor.state.doc.textBetween(0, from, '\n')
  const match = before.match(/:([a-z0-9_+-]+)$/i)
  if (!match) { emojiOpen.value = false; return }
  const q = match[1].toLowerCase()
  const customHits: EmojiSuggestion[] = custom.emojis.value
    .filter(e => e.name.includes(q))
    .slice(0, 30)
    .map(e => ({ key: 'c-' + e.id, name: e.name, url: e.url, insert: ':' + e.name + ':' }))
  const unicodeHits: EmojiSuggestion[] = searchEmoji(match[1], 30)
    .map(e => ({ key: 'u-' + e.name, name: e.name, char: e.char, insert: e.char }))
  const list = [...customHits, ...unicodeHits]
  if (!list.length) { emojiOpen.value = false; return }
  matchFrom = from - match[0].length
  matchTo = from
  suggestions.value = list
  activeIdx.value = 0
  emojiOpen.value = true
}

// Turn a manually typed `:name:` (custom emoji) into the inline image as soon
// as the closing colon is typed, Discord-style.
function convertTypedEmoji(ed: any) {
  if (ed.view.composing) return
  const { state } = ed
  if (!state.selection.empty) return
  const from = state.selection.from
  if (from < 3) return
  const start = Math.max(0, from - 40)
  const textBefore = state.doc.textBetween(start, from, '\n', '\0')
  const match = textBefore.match(/:([a-z0-9_+-]+):$/)
  if (!match) return
  const name = match[1].toLowerCase()
  const url = custom.byName.value[name]?.url
  if (!url) return
  const rangeFrom = from - match[0].length
  ed.chain().insertContentAt({ from: rangeFrom, to: from }, { type: 'emojiImage', attrs: { name, src: url } }).run()
}

const editor = useEditor({
  extensions: [Document, Paragraph, Text, HardBreak, EmojiImage],
  editorProps: {
    attributes: {
      class: 'outline-none w-full text-sm text-slate-200 placeholder-slate-500',
    },
    handleKeyDown: (view, event) => {
      if (emojiOpen.value) {
        if (event.key === 'ArrowDown') {
          event.preventDefault()
          activeIdx.value = (activeIdx.value + 1) % suggestions.value.length
          return true
        }
        if (event.key === 'ArrowUp') {
          event.preventDefault()
          activeIdx.value = (activeIdx.value - 1 + suggestions.value.length) % suggestions.value.length
          return true
        }
        if (event.key === 'Enter' || event.key === 'Tab') {
          event.preventDefault()
          applyEmoji(suggestions.value[activeIdx.value])
          return true
        }
        if (event.key === 'Escape') {
          emojiOpen.value = false
          return false
        }
      }
      if (event.key === 'Enter' && !event.shiftKey && !event.isComposing) {
        event.preventDefault()
        const text = serializeDoc(view.state.doc)
        if (text.trim()) emit('submit', text)
        return true
      }
      return false
    },
  },
  onUpdate: ({ editor }) => {
    refreshState(editor)
    convertTypedEmoji(editor)
    detectQuery(editor)
  },
  onSelectionUpdate: ({ editor }) => {
    if (emojiOpen.value) detectQuery(editor)
  },
  onBlur: () => { emojiOpen.value = false },
})

function applyEmoji(entry?: EmojiSuggestion) {
  if (!entry || matchFrom < 0) return
  const chain = editor.value?.chain().focus().deleteRange({ from: matchFrom, to: matchTo })
  if (entry.url) chain?.insertContent({ type: 'emojiImage', attrs: { name: entry.name, src: entry.url } }).run()
  else chain?.insertContent(entry.char || entry.insert).run()
  emojiOpen.value = false
}

function clear() {
  editor.value?.commands.setContent('')
  hasContent.value = false
  jumbo.value = false
  if (editor.value?.view?.dom) editor.value.view.dom.style.fontSize = ''
  emit('update', '')
}

function focus() {
  editor.value?.commands.focus()
}

function getText() {
  return editor.value ? serializeDoc(editor.value.state.doc) : ''
}

defineExpose({ clear, focus, getText })

onMounted(() => custom.ensure())
</script>

<template>
  <div class="relative flex-1 min-w-0">
    <div
      v-if="!hasContent"
      class="absolute inset-0 pointer-events-none text-sm text-slate-500 select-none overflow-hidden whitespace-pre-wrap"
    >
      {{ props.placeholder || '' }}
    </div>
    <EditorContent :editor="editor" class="min-h-0" />

    <Transition name="emoji-pop">
      <div
        v-if="emojiOpen"
        class="absolute bottom-full left-0 mb-1 w-72 max-h-56 overflow-y-auto bg-slate-900 border border-slate-700 rounded-xl shadow-xl z-[150]"
      >
        <div class="px-3 py-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-800 sticky top-0 bg-slate-900">
          絵文字
        </div>
        <button
          v-for="(s, i) in suggestions"
          :key="s.key"
          type="button"
          @mousedown.prevent="applyEmoji(s)"
          @mouseenter="activeIdx = i"
          class="w-full flex items-center gap-2.5 px-3 py-1.5 text-left transition"
          :class="i === activeIdx ? 'bg-indigo-600/30' : 'hover:bg-slate-800'"
        >
          <img v-if="s.url" :src="s.url" :alt="':' + s.name + ':'" class="sycs-emoji sycs-emoji--lg shrink-0" draggable="false" />
          <span v-else class="text-lg leading-none shrink-0">{{ s.char }}</span>
          <span class="text-xs text-slate-400 truncate">:{{ s.name }}:</span>
          <span v-if="s.url" class="ml-auto text-[10px] text-slate-600 shrink-0">カスタム</span>
        </button>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.emoji-pop-enter-active { transition: opacity 0.12s ease, transform 0.12s ease; }
.emoji-pop-leave-active { transition: opacity 0.08s ease; }
.emoji-pop-enter-from { opacity: 0; transform: translateY(4px); }
.emoji-pop-leave-to { opacity: 0; }
</style>
